-- ============================================================
-- ANGLELIX STORAGE BUCKETS & POLICIES SETUP
-- Run this in your Supabase SQL Editor to enable permanent cloud storage
-- ============================================================

-- 1. Create public buckets for products, banners, and brand assets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
values 
  ('products', 'products', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('banners', 'banners', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('brand-assets', 'brand-assets', true, 15728640, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
on conflict (id) do update set public = true;

-- 2. Allow Public Read Access for all 3 buckets
drop policy if exists "Public Access for Products" on storage.objects;
create policy "Public Access for Products" on storage.objects
  for select using (bucket_id in ('products', 'banners', 'brand-assets'));

-- 3. Allow Admin / Service Role Full Access to upload and delete files
drop policy if exists "Admin Storage Upload Access" on storage.objects;
create policy "Admin Storage Upload Access" on storage.objects
  for insert with check (bucket_id in ('products', 'banners', 'brand-assets'));

drop policy if exists "Admin Storage Update Access" on storage.objects;
create policy "Admin Storage Update Access" on storage.objects
  for update using (bucket_id in ('products', 'banners', 'brand-assets'));

drop policy if exists "Admin Storage Delete Access" on storage.objects;
create policy "Admin Storage Delete Access" on storage.objects
  for delete using (bucket_id in ('products', 'banners', 'brand-assets'));
