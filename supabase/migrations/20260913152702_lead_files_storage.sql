-- Storage bucket for uploaded case documents (photos, police reports, medical
-- records). Kept PRIVATE — files are sensitive, so staff view them via
-- short-lived signed URLs (see getSignedFileUrl in the app), never a public URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lead-files',
  'lead-files',
  false,
  15728640, -- 15 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
on conflict (id) do nothing;

-- Mirrors the same public-write / staff-only-read philosophy already used
-- for the leads/injured_people tables: anyone can upload evidence with their
-- submission, but only agents/attorneys/admins can ever read it back.
create policy "anyone can upload to lead-files"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'lead-files');

create policy "staff can read lead-files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'lead-files' and public.current_user_role() in ('agent', 'attorney', 'admin'));
