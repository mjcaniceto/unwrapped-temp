-- ============================================================================
-- Fix: "function gen_salt(unknown) does not exist"
-- ----------------------------------------------------------------------------
-- Supabase installs pgcrypto into an `extensions` schema, not `public`. The
-- functions below were created with `set search_path = public`, so at
-- runtime Postgres couldn't find pgcrypto's crypt()/gen_salt(). This just
-- redefines those two functions with `extensions` added to the search_path.
-- Safe to run multiple times.
-- ============================================================================

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
