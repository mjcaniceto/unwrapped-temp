# Unwrapped 🎁

A collaborative birthday scrapbook. Creators build a surprise, invite friends
and family with a link (no account needed), review what comes in, then
publish a reveal link for the celebrant — a full-screen, themed, scrolling
scrapbook that ends in confetti.

## Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4 + React Router,
  framer-motion for animation, canvas-confetti for the finale, lucide-react
  for icons.
- **Backend:** Supabase (Postgres + Storage + RLS). No Supabase Auth, no
  server framework — see [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql)
  for the full schema, RLS policies, and the handful of Postgres RPC
  functions that stand in for a backend.

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and grab
your **Project URL** and **anon public key** from *Project Settings → API*.

## 2. Run the database migrations

In the Supabase dashboard, open **SQL Editor** and run, in order:

1. `supabase/migrations/0001_init.sql` — tables, RLS policies, storage
   bucket, and RPC functions.
2. `supabase/migrations/0002_seed_demo.sql` — seeds the `demo-alex` surprise
   so `/surprise/demo-alex` works immediately (dashboard code `DEMOAL`,
   password `demo1234`, both safe to explore).

(If you use the Supabase CLI instead: `supabase db push` after linking the
project, since these files already live under `supabase/migrations`.)

## 3. Configure the app

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## 4. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. Try `/surprise/demo-alex` right away, or
`/create` to build your own.

## How authentication works (important)

There is **no Supabase Auth** in this app, by design. A creator's identity
is a **Surprise ID + password pair scoped to one surprise**, not a platform
account:

- `create_surprise(...)` (a Postgres RPC) hashes the password with
  `pgcrypto`'s bcrypt (`crypt()` / `gen_salt('bf')`) and stores only the
  hash. It also mints a short-lived opaque **session token**, stored in a
  `dashboard_sessions` table.
- The browser keeps that session token in `localStorage` and sends it back
  as an `x-session-token` header on every request via a small wrapper
  around the Supabase client (`src/lib/supabase.ts`).
- RLS policies use a `current_session_surprise_id()` helper that reads that
  header and resolves it to a surprise id — every dashboard read/write is
  scoped to `id = current_session_surprise_id()`, so a creator can never
  touch another surprise by guessing a UUID in the URL.
- `verify_dashboard_password(...)` checks the bcrypt hash **inside
  Postgres**, so the hash itself is never sent to the browser, and issues a
  fresh session token on success. Failure is intentionally
  indistinguishable between "wrong ID" and "wrong password".
- Quiz scoring happens the same way: `submit_quiz_contribution(...)` looks
  up the correct answers server-side and stores only the resulting score —
  a contributor's browser never receives the answer key. (Contributors
  taking the quiz get a sanitized copy of the surprise's sections with
  `correctIndex` stripped out, via `get_surprise_by_invite_token`.)

This is intentionally isolated behind `src/lib/dashboardAuth.ts` and the
RPC layer in `src/lib/queries.ts`, so migrating creators to real Supabase
Auth later shouldn't require touching the public contributor or celebrant
experiences at all.

## Project structure

```
src/
  components/
    primitives/   PaperCard, Polaroid, Sticker, SectionHeader, Corkboard, ...
    uploads/      FileUpload, MediaUpload, MultiImageUpload
    quiz/         QuizEditor (creator), QuizForm (contributor), QuizResponseViewer (dashboard)
    sections/     Celebrant-facing displays: NoteWall, GiftVoucher, MemoryLane, Scrapbook, Quiz, Wish, FinalReveal, Finale
    invite/       Contributor-facing forms per section type
    dashboard/    ContributionRow (moderation)
  lib/            supabase client, dashboardAuth, queries (data access), upload, confetti, utils
  pages/          Landing, Create (wizard), Dashboard, Invite, Surprise
  types/          shared TypeScript types
supabase/
  migrations/     0001_init.sql (schema + RLS + RPCs), 0002_seed_demo.sql (demo data)
```

## Notes & possible future hardening

- Dashboard sessions expire after 7 days (`dashboard_sessions.expires_at`);
  expired sessions are swept opportunistically on each successful login.
- Storage uploads are only accepted into a folder named after a real
  surprise id, and there's no update/delete policy for anon — nobody can
  overwrite or remove another surprise's media (or, for now, their own).
- Approved contribution `content` (e.g. a quiz contributor's raw answer
  array) is visible to anyone who can already view a published surprise's
  contributions; nothing sensitive lives there, but a future pass could
  strip fields the UI doesn't use.
- `created_by` / `creator_id` columns are reserved, unused placeholders so a
  future migration to real Supabase Auth accounts doesn't require a schema
  change.
