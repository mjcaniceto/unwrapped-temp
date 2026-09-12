-- ============================================================================
-- UNWRAPPED — schema, RLS, and RPC functions
-- ============================================================================
-- Design notes:
--  * There is no Supabase Auth here. Every request from the browser uses the
--    anon key. "Ownership" of a surprise is proven by an opaque session
--    token issued by verify_dashboard_password() and sent back on the
--    `x-session-token` request header on every later request.
--  * The `surprises` table has NO direct SELECT/INSERT policy for anon at
--    all — every read/write that needs to hide or check sensitive data
--    (password hash, email, "does this row exist") goes through a small
--    set of SECURITY DEFINER RPC functions. This is the "minimal
--    server-side verification" the brief allows, kept as small as possible;
--    everything else (browsing/moderating contributions, publishing,
--    reordering) is plain client-side Postgrest calls governed by RLS.
--  * `contributions` is governed by RLS directly (no RPC needed) except for
--    quiz submissions, which are scored server-side so the correct answers
--    are never shipped to the person taking the quiz.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table if not exists surprises (
  id uuid primary key default gen_random_uuid(),
  surprise_code text unique not null,
  created_by uuid, -- reserved for a future Supabase-Auth migration; unused today
  creator_email text not null,
  creator_password_hash text not null,
  slug text unique not null,
  invite_token text unique not null,
  celebrant_name text not null,
  celebrant_photo_url text,
  birthday date,
  age int,
  description text,
  theme text not null default 'warm' check (theme in ('warm', 'fun', 'nostalgic')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  sections jsonb not null default '[]'::jsonb,
  final_reveal jsonb,
  created_at timestamptz not null default now()
);

create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  surprise_id uuid not null references surprises (id) on delete cascade,
  creator_id uuid, -- reserved for a future Supabase-Auth migration; unused today
  section_type text not null check (
    section_type in ('note_wall', 'gift_voucher', 'memory_lane', 'scrapbook', 'quiz', 'wish')
  ),
  contributor_name text not null,
  contributor_relationship text,
  content jsonb not null default '{}'::jsonb,
  media_url text,
  media_type text not null default '' check (media_type in ('image', 'video', '')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  position int not null default 0,
  score int,
  created_at timestamptz not null default now()
);

create table if not exists dashboard_sessions (
  session_token uuid primary key default gen_random_uuid(),
  surprise_id uuid not null references surprises (id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists contributions_surprise_idx on contributions (surprise_id);
create index if not exists contributions_surprise_status_idx on contributions (surprise_id, status, position);
create index if not exists dashboard_sessions_surprise_idx on dashboard_sessions (surprise_id);
create index if not exists dashboard_sessions_expires_idx on dashboard_sessions (expires_at);

alter table surprises enable row level security;
alter table contributions enable row level security;
alter table dashboard_sessions enable row level security;

-- Lock every table down by default; anon gets nothing until granted below.
revoke all on surprises from anon, authenticated;
revoke all on contributions from anon, authenticated;
revoke all on dashboard_sessions from anon, authenticated;

-- ----------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER — owned by the table owner, so they
-- bypass RLS internally. Each does exactly one narrow, safe check.)
-- ----------------------------------------------------------------------------

-- Resolves the surprise_id owned by the caller's current session header, if any.
create or replace function current_session_surprise_id()
returns uuid
language sql
stable
security definer
set search_path = public, extensions
as $$
  select ds.surprise_id
  from dashboard_sessions ds
  where ds.session_token = nullif(
    (current_setting('request.headers', true)::json ->> 'x-session-token'),
    ''
  )::uuid
  and ds.expires_at > now()
  limit 1
$$;

grant execute on function current_session_surprise_id() to anon, authenticated;

create or replace function is_surprise_published(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (select 1 from surprises where id = p_id and status = 'published');
$$;

grant execute on function is_surprise_published(uuid) to anon, authenticated;

create or replace function surprise_exists(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (select 1 from surprises where id = p_id);
$$;

grant execute on function surprise_exists(uuid) to anon, authenticated;

-- Random human-friendly code, e.g. "B7K2QF" (no ambiguous chars).
create or replace function random_code(p_len int)
returns text
language plpgsql
volatile
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  out_text text := '';
  i int;
begin
  for i in 1..p_len loop
    out_text := out_text || substr(chars, (floor(random() * length(chars)) + 1)::int, 1);
  end loop;
  return out_text;
end;
$$;

create or replace function slugify(p_text text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(p_text, 'surprise')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function unique_surprise_code()
returns text
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  candidate text;
begin
  loop
    candidate := random_code(6);
    exit when not exists (select 1 from surprises where surprise_code = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function unique_slug(p_base text)
returns text
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  base text := slugify(p_base);
  candidate text;
begin
  loop
    candidate := base || '-' || lower(random_code(5));
    exit when not exists (select 1 from surprises where slug = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function unique_invite_token()
returns text
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  candidate text;
begin
  loop
    candidate := lower(random_code(10)) || lower(random_code(10));
    exit when not exists (select 1 from surprises where invite_token = candidate);
  end loop;
  return candidate;
end;
$$;

-- Strips quiz answer keys out of a sections array (used when a contributor
-- is about to take the quiz — they must not see the correct answers).
create or replace function strip_quiz_answers(p_sections jsonb)
returns jsonb
language sql
immutable
as $$
  select coalesce(
    jsonb_agg(
      case
        when (sec ->> 'type') = 'quiz' and sec ? 'questions' then
          sec || jsonb_build_object(
            'questions',
            (
              select coalesce(jsonb_agg(q - 'correctIndex'), '[]'::jsonb)
              from jsonb_array_elements(sec -> 'questions') q
            )
          )
        else sec
      end
      order by ord
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(coalesce(p_sections, '[]'::jsonb)) with ordinality as t(sec, ord)
$$;

-- The public-safe projection of a surprise row (no email, no password hash).
create or replace function public_surprise_json(s surprises)
returns jsonb
language sql
immutable
as $$
  select jsonb_build_object(
    'id', s.id,
    'surprise_code', s.surprise_code,
    'slug', s.slug,
    'invite_token', s.invite_token,
    'celebrant_name', s.celebrant_name,
    'celebrant_photo_url', s.celebrant_photo_url,
    'birthday', s.birthday,
    'age', s.age,
    'description', s.description,
    'theme', s.theme,
    'status', s.status,
    'published_at', s.published_at,
    'sections', s.sections,
    'final_reveal', s.final_reveal,
    'created_at', s.created_at
  );
$$;

-- ----------------------------------------------------------------------------
-- RPC: create_surprise
-- ----------------------------------------------------------------------------
create or replace function create_surprise(
  p_creator_email text,
  p_creator_password text,
  p_celebrant_name text,
  p_birthday date,
  p_age int,
  p_description text,
  p_theme text,
  p_sections jsonb,
  p_final_reveal jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_row surprises;
  v_session uuid;
begin
  if p_creator_email is null or trim(p_creator_email) = '' then
    raise exception 'An email address is required.';
  end if;
  if p_creator_password is null or length(p_creator_password) < 6 then
    raise exception 'Password must be at least 6 characters.';
  end if;
  if p_celebrant_name is null or trim(p_celebrant_name) = '' then
    raise exception 'A celebrant name is required.';
  end if;
  if p_theme not in ('warm', 'fun', 'nostalgic') then
    p_theme := 'warm';
  end if;

  insert into surprises (
    surprise_code, creator_email, creator_password_hash, slug, invite_token,
    celebrant_name, birthday, age, description, theme, sections, final_reveal
  ) values (
    unique_surprise_code(),
    lower(trim(p_creator_email)),
    crypt(p_creator_password, gen_salt('bf')),
    unique_slug(p_celebrant_name),
    unique_invite_token(),
    trim(p_celebrant_name),
    p_birthday,
    p_age,
    p_description,
    p_theme,
    coalesce(p_sections, '[]'::jsonb),
    p_final_reveal
  )
  returning * into v_row;

  insert into dashboard_sessions (surprise_id) values (v_row.id) returning session_token into v_session;

  return jsonb_build_object(
    'surprise', public_surprise_json(v_row),
    'session_token', v_session
  );
end;
$$;

grant execute on function create_surprise(text, text, text, date, int, text, text, jsonb, jsonb) to anon;

-- ----------------------------------------------------------------------------
-- RPC: verify_dashboard_password
-- ----------------------------------------------------------------------------
create or replace function verify_dashboard_password(p_surprise_code text, p_password text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_row surprises;
  v_session uuid;
begin
  select * into v_row from surprises where surprise_code = upper(trim(p_surprise_code));

  if not found then
    -- Constant-shape failure so callers can't tell "bad id" from "bad password".
    perform crypt(coalesce(p_password, ''), gen_salt('bf'));
    return null;
  end if;

  if crypt(coalesce(p_password, ''), v_row.creator_password_hash) <> v_row.creator_password_hash then
    return null;
  end if;

  delete from dashboard_sessions where expires_at < now();

  insert into dashboard_sessions (surprise_id) values (v_row.id) returning session_token into v_session;

  return jsonb_build_object('session_token', v_session, 'surprise_id', v_row.id);
end;
$$;

grant execute on function verify_dashboard_password(text, text) to anon;

create or replace function revoke_dashboard_session(p_session_token uuid)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  delete from dashboard_sessions where session_token = p_session_token;
$$;

grant execute on function revoke_dashboard_session(uuid) to anon;

-- ----------------------------------------------------------------------------
-- RPC: read functions
-- ----------------------------------------------------------------------------

-- Celebrant / landing lookup by slug. Published surprises are visible to
-- everyone; a draft is only visible to its verified owner (dashboard preview).
create or replace function get_surprise_by_slug(p_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_row surprises;
begin
  select * into v_row from surprises where slug = p_slug;
  if not found then
    return null;
  end if;
  if v_row.status <> 'published' and v_row.id <> current_session_surprise_id() then
    return null;
  end if;
  return public_surprise_json(v_row);
end;
$$;

grant execute on function get_surprise_by_slug(text) to anon;

-- Contributor invite lookup by token. Works for draft or published surprises
-- (contribution happens before publish), but strips quiz answer keys.
create or replace function get_surprise_by_invite_token(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_row surprises;
  v_json jsonb;
begin
  select * into v_row from surprises where invite_token = p_token;
  if not found then
    return null;
  end if;
  v_json := public_surprise_json(v_row);
  v_json := v_json || jsonb_build_object('sections', strip_quiz_answers(v_row.sections));
  return v_json;
end;
$$;

grant execute on function get_surprise_by_invite_token(text) to anon;

-- Full dashboard read (includes creator_email, never the password hash),
-- only for the verified owner of that exact surprise.
create or replace function get_dashboard_surprise(p_surprise_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  v_row surprises;
begin
  if p_surprise_id is null or p_surprise_id <> current_session_surprise_id() then
    return null;
  end if;
  select * into v_row from surprises where id = p_surprise_id;
  if not found then
    return null;
  end if;
  return public_surprise_json(v_row) || jsonb_build_object('creator_email', v_row.creator_email);
end;
$$;

grant execute on function get_dashboard_surprise(uuid) to anon;

-- ----------------------------------------------------------------------------
-- RPC: submit_quiz_contribution — scores server-side so correct answers
-- never reach the browser of someone taking the quiz.
-- ----------------------------------------------------------------------------
create or replace function submit_quiz_contribution(
  p_invite_token text,
  p_contributor_name text,
  p_contributor_relationship text,
  p_answers int[],
  p_question_for_celebrant text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_surprise surprises;
  v_section jsonb;
  v_questions jsonb;
  v_score int := 0;
  v_correct int;
  i int;
  v_contribution contributions;
begin
  select * into v_surprise from surprises where invite_token = p_invite_token;
  if not found then
    raise exception 'This invite link is no longer valid.';
  end if;
  if p_contributor_name is null or trim(p_contributor_name) = '' then
    raise exception 'A name is required.';
  end if;

  select sec into v_section
  from jsonb_array_elements(v_surprise.sections) sec
  where sec ->> 'type' = 'quiz'
  limit 1;

  if v_section is null then
    raise exception 'This surprise does not have a quiz.';
  end if;

  v_questions := coalesce(v_section -> 'questions', '[]'::jsonb);

  for i in 1..coalesce(array_length(p_answers, 1), 0) loop
    v_correct := (v_questions -> (i - 1) ->> 'correctIndex')::int;
    if v_correct is not null and v_correct = p_answers[i] then
      v_score := v_score + 1;
    end if;
  end loop;

  insert into contributions (
    surprise_id, section_type, contributor_name, contributor_relationship,
    content, status, score
  ) values (
    v_surprise.id,
    'quiz',
    trim(p_contributor_name),
    nullif(trim(coalesce(p_contributor_relationship, '')), ''),
    jsonb_build_object(
      'answers', to_jsonb(p_answers),
      'questionForCelebrant', nullif(trim(coalesce(p_question_for_celebrant, '')), '')
    ),
    'pending',
    v_score
  )
  returning * into v_contribution;

  return jsonb_build_object('id', v_contribution.id, 'score', v_score, 'total', coalesce(jsonb_array_length(v_questions), 0));
end;
$$;

grant execute on function submit_quiz_contribution(text, text, text, int[], text) to anon;

-- ----------------------------------------------------------------------------
-- RLS policies: surprises
-- ----------------------------------------------------------------------------
-- Intentionally NO select/insert policy for anon — all reads/writes of
-- sensitive or existence-revealing data go through the RPCs above.

create policy "owner can update their surprise"
on surprises for update
to anon
using (id = current_session_surprise_id())
with check (id = current_session_surprise_id());

-- Only safe, non-identity columns are updatable — even by the owner. Email,
-- password hash, id, codes, and slugs can never be changed from the client.
revoke update on surprises from anon;
grant update (
  celebrant_name, celebrant_photo_url, birthday, age, description,
  theme, status, published_at, sections, final_reveal
) on surprises to anon;

-- ----------------------------------------------------------------------------
-- RLS policies: contributions
-- ----------------------------------------------------------------------------

create policy "approved contributions on published surprises are public"
on contributions for select
to anon
using (
  (status = 'approved' and is_surprise_published(surprise_id))
  or surprise_id = current_session_surprise_id()
);

create policy "anonymous contributors can submit non-quiz contributions"
on contributions for insert
to anon
with check (
  status = 'pending'
  and section_type <> 'quiz'
  and surprise_exists(surprise_id)
);

create policy "owner can moderate their contributions"
on contributions for update
to anon
using (surprise_id = current_session_surprise_id())
with check (surprise_id = current_session_surprise_id());

create policy "owner can delete their contributions"
on contributions for delete
to anon
using (surprise_id = current_session_surprise_id());

grant select, insert on contributions to anon;
revoke update on contributions from anon;
grant update (status, position) on contributions to anon;
grant delete on contributions to anon;

-- dashboard_sessions: no policies at all for anon — only reachable through
-- the SECURITY DEFINER functions above.

-- ----------------------------------------------------------------------------
-- Storage bucket
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('surprise-media', 'surprise-media', true)
on conflict (id) do nothing;

-- Uploads are only accepted into a folder named after a real surprise id,
-- e.g. `surprise-media/<surprise_id>/photo.jpg`. Reads are public via the
-- bucket's public URLs, which bypass RLS entirely. No update/delete policy
-- is granted, so nobody can overwrite or remove another surprise's media
-- (or their own, from the client — deletions aren't a feature yet).
create policy "uploads go into a real surprise's own folder"
on storage.objects for insert
to anon
with check (
  bucket_id = 'surprise-media'
  and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  and surprise_exists(((storage.foldername(name))[1])::uuid)
);

create policy "media is publicly readable"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'surprise-media');
