-- Legal Intake Suite — initial schema
-- Tables match the data model in PLAN.md section 5.

-- ============================================================
-- profiles — extends auth.users with a role (agent / attorney / admin)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('agent', 'attorney', 'admin')) default 'agent',
  created_at timestamptz not null default now()
);

-- New Supabase Auth signups get a profile row automatically.
-- Role defaults to 'agent' — an admin promotes trusted accounts to
-- 'attorney'/'admin' by hand via SQL until an admin UI exists (see PLAN.md).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper used by RLS policies below to read the caller's role without
-- recursively querying `profiles` through its own policy.
create function public.current_user_role()
returns text
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- leads — one row per submitted case
-- ============================================================
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('pending', 'verified', 'followup', 'rejected')) default 'pending',
  priority text not null check (priority in ('low', 'medium', 'high')) default 'medium',
  case_type text not null,
  occupation text,
  has_attorney text,
  answering_agent text,
  first_name text not null,
  last_name text not null,
  email text,
  phone text not null,
  best_time_to_call text,
  mailing_state text,
  mailing_city text,
  mailing_zip text,
  address text,
  accident_date date,
  accident_time text,
  accident_description text,
  additional_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- injured_people — one or more per lead
-- ============================================================
create table public.injured_people (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  first_name text,
  last_name text,
  injury_description text not null
);

-- ============================================================
-- agent_reviews — one per lead, written by the verifying agent
-- ============================================================
create table public.agent_reviews (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads (id) on delete cascade,
  agent_id uuid references public.profiles (id),
  call_status text,
  call_duration text,
  is_authentic boolean not null default false,
  checklist jsonb not null default '{}'::jsonb,
  agent_message text,
  estimated_viability text,
  reviewed_at timestamptz not null default now()
);

-- ============================================================
-- law_firm_actions — one per lead, written by the attorney/admin
-- v1 is one attorney per case by design — see PLAN.md section 10
-- for the multi-attorney upgrade path if that's ever needed.
-- ============================================================
create table public.law_firm_actions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads (id) on delete cascade,
  status text not null default 'Under Attorney Review',
  assigned_attorney_id uuid references public.profiles (id),
  notes text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- lead_files — uploaded photos / police reports / medical records
-- Actual file bytes live in Supabase Storage; this row is the pointer + metadata.
-- ============================================================
create table public.lead_files (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  uploaded_by uuid references public.profiles (id),
  file_path text not null,
  file_type text check (file_type in ('photo', 'police_report', 'medical_record', 'other')) default 'other',
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.injured_people enable row level security;
alter table public.agent_reviews enable row level security;
alter table public.law_firm_actions enable row level security;
alter table public.lead_files enable row level security;

-- profiles: anyone signed in can see the staff directory (needed for the
-- "assign attorney" dropdown); nobody can edit another person's row.
create policy "profiles are readable by signed-in staff"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- leads: the public intake form can create a lead with no login.
-- Only staff (agent/attorney/admin) can read or update leads afterward.
create policy "anyone can submit a lead"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "staff can read leads"
  on public.leads for select
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));

create policy "staff can update leads"
  on public.leads for update
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));

-- injured_people: same shape as leads — public can insert during
-- submission, only staff can read.
create policy "anyone can submit injured people"
  on public.injured_people for insert
  to anon, authenticated
  with check (true);

create policy "staff can read injured people"
  on public.injured_people for select
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));

-- agent_reviews: only agents (and attorneys/admins, for oversight) can
-- write or read call verification notes.
create policy "agents can write reviews"
  on public.agent_reviews for insert
  to authenticated
  with check (public.current_user_role() in ('agent', 'attorney', 'admin'));

create policy "agents can update reviews"
  on public.agent_reviews for update
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));

create policy "staff can read reviews"
  on public.agent_reviews for select
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));

-- law_firm_actions: only attorneys/admins can retain clients or assign
-- attorneys; agents can still see the outcome.
create policy "attorneys can write firm actions"
  on public.law_firm_actions for insert
  to authenticated
  with check (public.current_user_role() in ('attorney', 'admin'));

create policy "attorneys can update firm actions"
  on public.law_firm_actions for update
  to authenticated
  using (public.current_user_role() in ('attorney', 'admin'));

create policy "staff can read firm actions"
  on public.law_firm_actions for select
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));

-- lead_files: public can attach files during intake submission;
-- only staff can read/list them afterward (privacy of medical records).
create policy "anyone can attach a file to their submission"
  on public.lead_files for insert
  to anon, authenticated
  with check (true);

create policy "staff can read lead files"
  on public.lead_files for select
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));
