-- MPBP440 Back Office V2: secured CMS drafts, publication history and dynamic
-- content registry.  The public site only receives data after the Edge Function
-- creates one atomic Git commit; drafts never alter public JSON files.

create table if not exists public.cms_drafts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  check (pg_column_size(payload) <= 5242880)
);

create table if not exists public.cms_publications (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id),
  commit_sha text not null check (commit_sha ~ '^[0-9a-f]{40}$'),
  files jsonb not null default '[]'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.content_registry (
  content_type text not null check (content_type in ('clip')),
  content_id text not null check (content_id ~ '^[a-z0-9][a-z0-9-]{1,118}$'),
  status text not null default 'active' check (status in ('active', 'hidden', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (content_type, content_id)
);

insert into public.content_registry (content_type, content_id)
values ('clip','l-argent'), ('clip','clip-je-sais-que-tu-sais'), ('clip','clip-j-existe'), ('clip','clip-dois-je-me-taire')
on conflict (content_type, content_id) do nothing;

alter table public.cms_drafts enable row level security;
alter table public.cms_publications enable row level security;
alter table public.content_registry enable row level security;

create policy "admins manage their own cms draft" on public.cms_drafts
  for all to authenticated using (user_id = auth.uid() and public.is_active_admin())
  with check (user_id = auth.uid() and public.is_active_admin());
create policy "admins read publication history" on public.cms_publications
  for select to authenticated using (public.is_active_admin());
create policy "admins read content registry" on public.content_registry
  for select to authenticated using (public.is_active_admin());

create or replace function public.cms_save_draft(p_payload jsonb)
returns timestamptz language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_active_admin();
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' or pg_column_size(p_payload) > 5242880 then
    raise exception 'invalid cms draft';
  end if;
  insert into public.cms_drafts(user_id, payload, updated_at)
  values(auth.uid(), p_payload, now())
  on conflict (user_id) do update set payload = excluded.payload, updated_at = excluded.updated_at;
  return now();
end;
$$;

create or replace function public.cms_get_draft()
returns jsonb language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_active_admin();
  return coalesce((select payload from public.cms_drafts where user_id = auth.uid()), '{}'::jsonb);
end;
$$;

create or replace function public.cms_list_publications()
returns table(commit_sha text, files jsonb, summary jsonb, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
begin
  perform public.require_active_admin();
  return query select p.commit_sha, p.files, p.summary, p.created_at from public.cms_publications p order by p.created_at desc limit 30;
end;
$$;

-- New clips are registered by the trusted publishing function.  Public RPCs
-- accept only active registry entries, rather than a hard-coded release list.
create or replace function public.is_active_clip(p_video_id text)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.content_registry where content_type = 'clip' and content_id = p_video_id and status = 'active'); $$;

alter table public.comments drop constraint if exists comments_content_id_check;
create or replace function public.submit_comment(p_content_type text, p_content_id text, p_display_name text, p_message text, p_visitor uuid)
returns uuid language plpgsql security definer set search_path = public
as $$
declare clean_name text := btrim(p_display_name); clean_message text := btrim(p_message); new_id uuid;
begin
  if p_content_type <> 'clip' or not public.is_active_clip(p_content_id) then raise exception 'invalid comment target'; end if;
  if p_visitor is null or char_length(clean_name) not between 2 and 60 or char_length(clean_message) not between 1 and 1000 then raise exception 'invalid comment'; end if;
  if exists(select 1 from public.comments where visitor_id=p_visitor and created_at > now() - interval '30 seconds') then raise exception 'please wait before sending another comment'; end if;
  if (select count(*) from public.comments where visitor_id=p_visitor and created_at > now() - interval '1 hour') >= 5 then raise exception 'comment limit reached'; end if;
  insert into public.comments(content_type,content_id,display_name,message,visitor_id) values('clip',p_content_id,clean_name,clean_message,p_visitor) returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.increment_video_view(p_session uuid, p_visitor uuid, p_video_id text)
returns boolean language plpgsql security definer set search_path = public
as $$
declare inserted boolean;
begin
  if not public.is_active_clip(p_video_id) then raise exception 'invalid video id'; end if;
  perform public.mpbp_session(p_session, p_visitor);
  insert into public.video_views (session_id, video_id) values (p_session, p_video_id)
  on conflict (video_id, session_id) do nothing returning true into inserted;
  if coalesce(inserted, false) then
    insert into public.analytics_daily (day, video_views) values (current_date, 1)
    on conflict (day) do update set video_views = public.analytics_daily.video_views + 1, updated_at = now();
  end if;
  return coalesce(inserted, false);
end;
$$;

create or replace function public.toggle_video_like(p_session uuid, p_visitor uuid, p_video_id text)
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_active_clip(p_video_id) then raise exception 'invalid video id'; end if;
  perform public.mpbp_session(p_session, p_visitor);
  if exists (select 1 from public.video_likes where visitor_id = p_visitor and video_id = p_video_id) then
    delete from public.video_likes where visitor_id = p_visitor and video_id = p_video_id;
    return false;
  end if;
  insert into public.video_likes (session_id, visitor_id, video_id) values (p_session, p_visitor, p_video_id);
  insert into public.analytics_daily (day, video_likes) values (current_date, 1)
  on conflict (day) do update set video_likes = public.analytics_daily.video_likes + 1, updated_at = now();
  return true;
end;
$$;

create or replace function public.get_video_engagement(p_video_id text, p_visitor uuid default null)
returns table (views bigint, likes bigint, liked boolean)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_active_clip(p_video_id) then raise exception 'invalid video id'; end if;
  return query select
    (select count(*) from public.video_views where video_id = p_video_id),
    (select count(*) from public.video_likes where video_id = p_video_id),
    coalesce((select exists(select 1 from public.video_likes where video_id = p_video_id and visitor_id = p_visitor)), false);
end;
$$;

create or replace function public.get_admin_clip_stats()
returns table(video_id text, views bigint, likes bigint)
language plpgsql security definer set search_path = public
as $$ begin
  perform public.require_active_admin();
  return query select r.content_id, count(distinct v.id), count(distinct l.id)
  from public.content_registry r
  left join public.video_views v on v.video_id = r.content_id
  left join public.video_likes l on l.video_id = r.content_id
  where r.content_type = 'clip'
  group by r.content_id order by count(distinct v.id) desc, count(distinct l.id) desc;
end; $$;

revoke all on function public.cms_save_draft(jsonb), public.cms_get_draft(), public.cms_list_publications(), public.is_active_clip(text) from public, anon, authenticated;
grant execute on function public.cms_save_draft(jsonb), public.cms_get_draft(), public.cms_list_publications() to authenticated;
grant execute on function public.submit_comment(text,text,text,text,uuid), public.get_approved_comments(text,text), public.increment_video_view(uuid,uuid,text), public.toggle_video_like(uuid,uuid,text), public.get_video_engagement(text,uuid) to anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mpbp440-media', 'mpbp440-media', true, 524288000, array['image/png','image/jpeg','image/webp','video/mp4'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public read mpbp440 media" on storage.objects for select to public using (bucket_id = 'mpbp440-media');
create policy "active admins upload mpbp440 media" on storage.objects for insert to authenticated with check (bucket_id = 'mpbp440-media' and public.is_active_admin());
create policy "active admins update mpbp440 media" on storage.objects for update to authenticated using (bucket_id = 'mpbp440-media' and public.is_active_admin()) with check (bucket_id = 'mpbp440-media' and public.is_active_admin());
create policy "active admins delete mpbp440 media" on storage.objects for delete to authenticated using (bucket_id = 'mpbp440-media' and public.is_active_admin());
