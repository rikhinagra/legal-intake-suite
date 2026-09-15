# Legal Intake Suite

A case-intake pipeline for a personal injury law firm. A claimant submits a case through a public
form, an intake agent phone-verifies it, and an attorney reviews the verified case and decides on
representation.

## How it works

1. **Claimant** fills out the public intake form (case details, contact info, accident narrative,
   injuries, supporting documents) — no login required.
2. **Agent** signs in to the Agent Portal, calls the claimant, runs a fraud/authenticity checklist,
   and marks the case as genuine, needing follow-up, or rejected.
3. **Attorney** signs in to the Attorney Dashboard, reviews verified cases, assigns a lead attorney,
   and sets the case status (including marking a client Retained).

Email notifications go out at each of these steps via Resend.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript), [Tailwind CSS v4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — Postgres, Auth, Storage, Row Level Security
- [Resend](https://resend.com/) + [`@react-email/components`](https://react.email/) for transactional email
- [Framer Motion](https://www.framer.com/motion/), [next-intl](https://next-intl.dev/) (English/Spanish), [lucide-react](https://lucide.dev/)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_DB_URL=
RESEND_API_KEY=
```

- The Supabase values come from your Supabase project's API settings.
- `SUPABASE_DB_URL` is your project's direct Postgres connection string (used for running
  migrations).
- `RESEND_API_KEY` comes from your Resend account. Note: on Resend's free tier ("sandbox mode"),
  email can only be delivered to the address on your own Resend account until a sending domain is
  verified — see `src/lib/resend.ts`.

### 3. Set up the database

Push the migrations in `supabase/migrations/` to your Supabase project using the
[Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

### 4. Create staff accounts

There's no public sign-up — agent, attorney, and admin accounts are provisioned directly:

```bash
node scripts/create-staff-account.mjs <email> <password> "<full name>" <agent|attorney|admin>
```

### 5. Run the dev server

```bash
npm run dev
```

- Public intake form: `http://localhost:3000`
- Staff sign-in: `http://localhost:3000/login`

## Project structure

```
src/
  app/                  Routes (App Router) and server actions
  components/
    wizard/             Public multi-step intake form
    agent/              Agent Portal
    attorney/           Attorney Dashboard
    staff/              Shared staff nav, logo
    shared/             Components shared across staff views (e.g. file attachments)
    ui/                 Small reusable UI primitives (e.g. the custom Dropdown)
  emails/               React Email templates + shared email components
  lib/                  Supabase clients, Resend client, site config, types
supabase/migrations/    Database schema + Row Level Security policies
scripts/                One-off admin scripts (staff account creation)
messages/               next-intl translation files (en/es)
```

## Access control

Row Level Security is applied consistently: the public can only ever `INSERT` (submit a lead,
upload a file) — reading and updating existing records requires an authenticated staff session,
scoped by role (`agent`, `attorney`, `admin`).
