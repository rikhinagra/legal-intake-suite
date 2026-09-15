-- The claim-intake wizard collects a few fields the original mockup-based
-- schema didn't account for. Aligning the tables to match the real form.

alter table public.leads
  add column case_number text unique,
  add column alt_phone text,
  add column language text,
  add column police_arrived text,
  add column consent boolean not null default false;

-- The wizard's injury entries use a single "name" field (not split first/last)
-- and carry a few extra fields the mockup's version didn't have.
alter table public.injured_people
  drop column first_name,
  drop column last_name,
  add column name text not null default '',
  add column relationship text,
  add column seen_doctor text,
  add column willing_to_see text,
  alter column injury_description drop not null;
