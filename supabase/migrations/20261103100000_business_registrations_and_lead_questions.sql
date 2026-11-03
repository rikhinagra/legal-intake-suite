-- Landing page redesign:
--   1. business_registrations: the new "Business / transport" form on the
--      public page, handled by agents the same way accident leads are.
--   2. business_attorney_decisions: the attorney's decision on a registration
--      (one per registration, same shape as law_firm_actions).
--   3. Three optional questions added to the accident form, stored on leads.

-- ============================================================
-- business_registrations: one row per submitted business form
-- The agent's call outcome and notes live on this row (agents already
-- update the shared row, as with leads.status). The attorney's decision is
-- kept in its own table below so only attorneys/admins can write it.
-- ============================================================
create table public.business_registrations (
  id uuid primary key default gen_random_uuid(),
  registration_number text unique,
  status text not null check (status in ('new', 'contacted', 'not_a_fit', 'ready_for_attorney')) default 'new',

  -- Required on the public form
  company_name text not null,
  contact_name text not null,
  phone text not null,
  email text not null,
  fleet_size text not null,
  need text not null,

  -- Optional "Add more details" section
  company_type text,
  contact_role text,
  dot_mc_number text,
  driver_count integer check (driver_count is null or driver_count >= 0),
  states_of_operation text,
  insurance_carrier text,
  has_counsel text,
  preferred_contact text,
  message text,

  consent boolean not null default false,
  language text,

  -- Written by agents after the call
  call_outcome text,
  agent_notes text,
  agent_id uuid references public.profiles (id),
  agent_updated_at timestamptz,

  created_at timestamptz not null default now()
);

create index business_registrations_status_idx on public.business_registrations (status);
create index business_registrations_created_at_idx on public.business_registrations (created_at desc);

-- ============================================================
-- business_attorney_decisions: one per registration, attorney/admin only
-- ============================================================
create table public.business_attorney_decisions (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.business_registrations (id) on delete cascade,
  decision text not null check (decision in ('under_review', 'approved', 'declined')) default 'under_review',
  notes text,
  decided_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security (same philosophy as leads / law_firm_actions)
-- ============================================================
alter table public.business_registrations enable row level security;
alter table public.business_attorney_decisions enable row level security;

-- The public form can add a registration with no login, but only as a brand
-- new one: it cannot pre-set a status or fill in the agent's fields. It
-- cannot read anything back; only staff can.
create policy "anyone can submit a business registration"
  on public.business_registrations for insert
  to anon, authenticated
  with check (
    status = 'new'
    and call_outcome is null
    and agent_notes is null
    and agent_id is null
    and agent_updated_at is null
  );

create policy "staff can read business registrations"
  on public.business_registrations for select
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));

create policy "staff can update business registrations"
  on public.business_registrations for update
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));

-- Only attorneys/admins can record a decision; agents can still see it.
create policy "attorneys can write business decisions"
  on public.business_attorney_decisions for insert
  to authenticated
  with check (public.current_user_role() in ('attorney', 'admin'));

create policy "attorneys can update business decisions"
  on public.business_attorney_decisions for update
  to authenticated
  using (public.current_user_role() in ('attorney', 'admin'));

create policy "staff can read business decisions"
  on public.business_attorney_decisions for select
  to authenticated
  using (public.current_user_role() in ('agent', 'attorney', 'admin'));

-- ============================================================
-- Three optional questions on the accident form
-- Existing cases simply have these as empty.
-- ============================================================
alter table public.leads
  add column insurance_contacted text,
  add column medical_treatment text,
  add column missed_work text;
