-- ============================================================
-- ANGLELIX — Product Multiple Photos & Storage Setup
-- Run this in Supabase SQL Editor if you need to ensure full table
-- and public permissions for multiple product images.
-- ============================================================

-- 1. Ensure product_images table exists
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  image_url text not null,
  alt_text text,
  display_order int default 0
);

-- Index for fast lookups by product
create index if not exists idx_product_images_product on public.product_images(product_id);

-- 2. Enable Row Level Security (RLS)
alter table public.product_images enable row level security;

-- 3. Public storefront can view all product images
drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images for select using (true);

-- 4. Service role / Admin full access
drop policy if exists "product_images_admin_all" on public.product_images;
create policy "product_images_admin_all" on public.product_images for all using (true) with check (true);

-- 5. Grant access to anon and authenticated roles
grant all on public.product_images to anon, authenticated, service_role;
