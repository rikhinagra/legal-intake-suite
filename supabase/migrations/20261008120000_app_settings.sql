-- System-level settings that are not tied to any one person's account.
-- First use: "agent_notification_cc", extra addresses that receive every
-- agent notification (new-case emails) in addition to whoever currently
-- holds the agent role, so the extra recipient survives the agent changing.
--
-- Only the server reads this, through the secret-key admin client. RLS is on
-- with no policies, so website visitors and signed-in staff can neither read
-- nor change it.

create table public.app_settings (
  key text primary key,
  value jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

revoke all on public.app_settings from anon, authenticated;

insert into public.app_settings (key, value)
values ('agent_notification_cc', '[]'::jsonb);
