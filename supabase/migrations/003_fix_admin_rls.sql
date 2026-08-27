-- ============================================================
-- ANGLELIX — Migration 003: Admin RLS Write Policies
-- Run this in Supabase SQL Editor to grant admin write access
-- ============================================================

-- Helper function to check if the current user is an admin
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  ) or exists (
    select 1 from public.profiles where auth_user_id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

-- Products: Admin full access
drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Categories: Admin full access
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- Product images: Admin full access
alter table public.product_images enable row level security;
drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images for select using (true);
drop policy if exists "product_images_admin_all" on public.product_images;
create policy "product_images_admin_all" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- Fragrance families: Admin full access
drop policy if exists "fragrance_families_admin_all" on public.fragrance_families;
create policy "fragrance_families_admin_all" on public.fragrance_families
  for all using (public.is_admin()) with check (public.is_admin());

-- Banners: Admin full access
drop policy if exists "banners_admin_all" on public.banners;
create policy "banners_admin_all" on public.banners
  for all using (public.is_admin()) with check (public.is_admin());

-- Promo bars: Admin full access
drop policy if exists "promo_bars_admin_all" on public.promo_bars;
create policy "promo_bars_admin_all" on public.promo_bars
  for all using (public.is_admin()) with check (public.is_admin());

-- Coupons: Admin full access
alter table public.coupons enable row level security;
drop policy if exists "coupons_public_read" on public.coupons;
create policy "coupons_public_read" on public.coupons for select using (is_active = true);
drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

-- Tester products: Admin full access
alter table public.tester_products enable row level security;
drop policy if exists "tester_products_public_read" on public.tester_products;
create policy "tester_products_public_read" on public.tester_products for select using (is_active = true);
drop policy if exists "tester_products_admin_all" on public.tester_products;
create policy "tester_products_admin_all" on public.tester_products
  for all using (public.is_admin()) with check (public.is_admin());

-- Settings: Admin full access
drop policy if exists "settings_admin_all" on public.settings;
create policy "settings_admin_all" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Orders: Admin full access
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- Order items: Admin full access
drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: Admin full access
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
