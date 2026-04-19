-- Jalankan script ini di Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  tech_stack text,
  repo_url text,
  demo_url text,
  cover_image_url text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  hero_eyebrow text,
  hero_name text,
  hero_bio text,
  focus_title text,
  focus_description text,
  about_text text,
  profile_image_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id, hero_eyebrow, hero_name)
values (1, 'Backend Engineer | Full Stack Developer | Siap Magang', 'Anisetus Bambang Manalu')
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.site_settings enable row level security;

-- Public read untuk halaman portfolio
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
on public.projects
for select
using (is_published = true);

drop policy if exists "Public can read project images" on public.project_images;
create policy "Public can read project images"
on public.project_images
for select
using (true);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
using (true);

-- Admin write melalui login Supabase Auth
drop policy if exists "Authenticated can manage projects" on public.projects;
create policy "Authenticated can manage projects"
on public.projects
for all
using (
  auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
)
with check (
  auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
);

drop policy if exists "Authenticated can manage project images" on public.project_images;
create policy "Authenticated can manage project images"
on public.project_images
for all
using (
  auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
)
with check (
  auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
);

drop policy if exists "Authenticated can manage site settings" on public.site_settings;
create policy "Authenticated can manage site settings"
on public.site_settings
for all
using (
  auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
)
with check (
  auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
);

-- Storage bucket untuk gambar proyek
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view project images bucket" on storage.objects;
create policy "Public can view project images bucket"
on storage.objects
for select
using (bucket_id = 'project-images');

drop policy if exists "Authenticated can upload project images" on storage.objects;
create policy "Authenticated can upload project images"
on storage.objects
for insert
with check (
  bucket_id = 'project-images'
  and auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
);

drop policy if exists "Authenticated can update project images" on storage.objects;
create policy "Authenticated can update project images"
on storage.objects
for update
using (
  bucket_id = 'project-images'
  and auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
)
with check (
  bucket_id = 'project-images'
  and auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
);

drop policy if exists "Authenticated can delete project images" on storage.objects;
create policy "Authenticated can delete project images"
on storage.objects
for delete
using (
  bucket_id = 'project-images'
  and auth.role() = 'authenticated'
  and lower(coalesce(auth.jwt() ->> 'email', '')) in ('anisetus@gmail.com', 'anisetusm@gmail.com')
);
