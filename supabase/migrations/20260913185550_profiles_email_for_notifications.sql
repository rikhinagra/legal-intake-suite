-- Email notifications need to know staff members' addresses, but the app
-- never reads auth.users directly (it's not exposed via the Data API to
-- anon/authenticated roles) — so we mirror the email onto `profiles`,
-- kept in sync at signup, and read only via the server-only admin client
-- (see src/lib/supabase/admin-client.ts) when sending notifications.

alter table public.profiles add column email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email), new.email);
  return new;
end;
$$;
