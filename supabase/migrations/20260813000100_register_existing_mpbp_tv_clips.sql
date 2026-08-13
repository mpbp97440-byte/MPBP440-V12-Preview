-- Existing public exclusive clips predate the dynamic CMS registry.  Register
-- their stable public IDs so the already-granted public engagement RPCs accept
-- only these clips, without broadening access to arbitrary identifiers.
insert into public.content_registry (content_type, content_id, status)
values
  ('clip', 'clip-karma', 'active'),
  ('clip', 'clip-mon-influence', 'active'),
  ('clip', 'clip-que-restera-t-il-de-moi', 'active')
on conflict (content_type, content_id) do update
  set status = excluded.status,
      updated_at = now();
