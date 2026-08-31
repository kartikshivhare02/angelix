-- ============================================================
-- ANGLELIX — COMPLETE SETUP IN ONE SCRIPT
-- Run this ENTIRE file in Supabase SQL Editor
-- This fixes the "Database error creating new user" issue
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ── Fragrance Families ─────────────────────────────────────
create table if not exists fragrance_families (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  created_at timestamptz default now()
);

-- ── Categories ─────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean default true,
  display_order int default 0,
  created_at timestamptz default now()
);

-- ── Profiles (extends Supabase auth.users) ─────────────────
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade unique not null,
  first_name text,
  last_name text,
  email text,
  phone text,
  whatsapp_number text,
  date_of_birth date,
  marketing_consent boolean default false,
  role text not null default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_profiles_auth_user on profiles(auth_user_id);
create index if not exists idx_profiles_email on profiles(email);

-- ── Admins table ───────────────────────────────────────────
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz default now()
);

-- ── Addresses ──────────────────────────────────────────────
create table if not exists addresses (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  landmark text,
  city text not null,
  state text not null,
  pin_code text not null,
  country text not null default 'India',
  is_default boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_addresses_profile on addresses(profile_id);

-- ── Products ───────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  sku text not null unique,
  short_description text,
  full_description text,
  brand text default 'ANGLELIX',
  category_id uuid references categories(id),
  gender text check (gender in ('Men', 'Women', 'Unisex')),
  concentration text,
  volume_ml int,
  original_price numeric(10,2) not null,
  sale_price numeric(10,2),
  discount_percentage int,
  stock_quantity int not null default 0,
  low_stock_threshold int default 5,
  main_image_url text,
  thumbnail_url text,
  top_notes text[] default '{}',
  middle_notes text[] default '{}',
  base_notes text[] default '{}',
  longevity text,
  projection text,
  season text[] default '{}',
  occasion text[] default '{}',
  ingredients text,
  how_to_apply text,
  delivery_estimate text,
  is_featured boolean default false,
  is_bestseller boolean default false,
  is_new_arrival boolean default false,
  tester_available boolean default false,
  is_published boolean default false,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_published on products(is_published);
create index if not exists idx_products_featured on products(is_featured);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_name_trgm on products using gin(name gin_trgm_ops);

-- ── Product Images ─────────────────────────────────────────
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  image_url text not null,
  alt_text text,
  display_order int default 0
);
create index if not exists idx_product_images_product on product_images(product_id);

-- ── Product Fragrance Families ─────────────────────────────
create table if not exists product_fragrance_families (
  product_id uuid references products(id) on delete cascade,
  fragrance_family_id uuid references fragrance_families(id) on delete cascade,
  primary key (product_id, fragrance_family_id)
);

-- ── Coupons ────────────────────────────────────────────────
create table if not exists coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null,
  min_order_value numeric(10,2) default 0,
  max_discount numeric(10,2),
  usage_limit int,
  usage_limit_per_customer int,
  times_used int default 0,
  start_date timestamptz,
  end_date timestamptz,
  is_first_order_only boolean default false,
  is_active boolean default true,
  applicable_products uuid[] default '{}',
  applicable_categories uuid[] default '{}',
  created_at timestamptz default now()
);

-- ── Coupon Usage ───────────────────────────────────────────
create table if not exists coupon_usage (
  id uuid primary key default uuid_generate_v4(),
  coupon_id uuid references coupons(id) on delete cascade,
  profile_id uuid references profiles(id),
  order_id uuid,
  used_at timestamptz default now()
);

-- ── Orders ─────────────────────────────────────────────────
create sequence if not exists order_number_seq start 1000;

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique default 'ANG-' || extract(year from now())::text || '-' || lpad(nextval('order_number_seq')::text, 6, '0'),
  profile_id uuid references profiles(id),
  guest_email text,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled','refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  payment_method text check (payment_method in ('razorpay', 'cod')),
  subtotal numeric(10,2) not null,
  discount_amount numeric(10,2) default 0,
  shipping_amount numeric(10,2) default 0,
  tax_amount numeric(10,2) default 0,
  total_amount numeric(10,2) not null,
  coupon_id uuid references coupons(id),
  coupon_code text,
  shipping_address jsonb not null,
  whatsapp_number text,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  courier_name text,
  tracking_number text,
  tracking_url text,
  estimated_delivery text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_orders_profile on orders(profile_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_payment_status on orders(payment_status);
create index if not exists idx_orders_razorpay_order_id on orders(razorpay_order_id);
create index if not exists idx_orders_number on orders(order_number);

-- ── Order Items ────────────────────────────────────────────
create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  product_name text not null,
  product_slug text not null,
  image_url text,
  volume_ml int,
  concentration text,
  quantity int not null,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null
);
create index if not exists idx_order_items_order on order_items(order_id);

-- ── Payments ───────────────────────────────────────────────
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade not null,
  razorpay_order_id text,
  razorpay_payment_id text,
  amount numeric(10,2) not null,
  currency text default 'INR',
  status text not null,
  method text,
  webhook_verified boolean default false,
  raw_response jsonb,
  created_at timestamptz default now()
);

-- ── Banners ────────────────────────────────────────────────
create table if not exists banners (
  id uuid primary key default uuid_generate_v4(),
  title text,
  subtitle text,
  desktop_image_url text not null,
  mobile_image_url text,
  cta_label text,
  cta_url text,
  text_alignment text default 'left' check (text_alignment in ('left','center','right')),
  is_active boolean default true,
  display_order int default 0,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz default now()
);

-- ── Promo Bars ─────────────────────────────────────────────
create table if not exists promo_bars (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  link_url text,
  link_label text,
  is_active boolean default true,
  display_order int default 0,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz default now()
);

-- ── Offers ─────────────────────────────────────────────────
create table if not exists offers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  offer_type text not null,
  conditions jsonb,
  discount_type text,
  discount_value numeric(10,2),
  is_active boolean default true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz default now()
);

-- ── Tester Products ────────────────────────────────────────
create table if not exists tester_products (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  size_ml int not null,
  price numeric(10,2) not null,
  stock_quantity int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── Site Settings (singleton) ──────────────────────────────
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  brand_name text default 'ANGLELIX',
  brand_subtitle text default 'by Suraj',
  logo_url text,
  favicon_url text,
  instagram_url text,
  whatsapp_number text,
  support_email text,
  shipping_charge numeric(10,2) default 99,
  free_shipping_min numeric(10,2) default 1499,
  currency text default 'INR',
  business_address text,
  razorpay_enabled boolean default true,
  cod_enabled boolean default false,
  order_confirmation_message text default 'Your order has been successfully placed. We will share your shipment and tracking updates with you on WhatsApp.',
  footer_tagline text,
  seo_title text default 'ANGLELIX by Suraj — Luxury Fragrances',
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Seed settings row
insert into settings (id) values (1) on conflict (id) do nothing;

-- ── Wishlists ──────────────────────────────────────────────
create table if not exists wishlists (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (profile_id, product_id)
);

-- ── Newsletter ─────────────────────────────────────────────
create table if not exists newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  subscribed_at timestamptz default now()
);

-- ── Audit Logs ─────────────────────────────────────────────
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (auth_user_id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-update updated_at timestamps
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products for each row execute procedure update_updated_at();

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at before update on orders for each row execute procedure update_updated_at();

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at before update on profiles for each row execute procedure update_updated_at();

drop trigger if exists settings_updated_at on settings;
create trigger settings_updated_at before update on settings for each row execute procedure update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table wishlists enable row level security;
alter table admins enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table fragrance_families enable row level security;
alter table banners enable row level security;
alter table promo_bars enable row level security;
alter table settings enable row level security;

-- Drop existing policies first to avoid conflicts
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_insert_own" on profiles;
drop policy if exists "addresses_select_own" on addresses;
drop policy if exists "addresses_insert_own" on addresses;
drop policy if exists "addresses_update_own" on addresses;
drop policy if exists "addresses_delete_own" on addresses;
drop policy if exists "orders_select_own" on orders;
drop policy if exists "order_items_select_own" on order_items;
drop policy if exists "wishlists_own" on wishlists;
drop policy if exists "admins_select_own" on admins;
drop policy if exists "products_public_read" on products;
drop policy if exists "categories_public_read" on categories;
drop policy if exists "fragrance_families_public_read" on fragrance_families;
drop policy if exists "banners_public_read" on banners;
drop policy if exists "promo_bars_public_read" on promo_bars;
drop policy if exists "settings_public_read" on settings;

-- Profiles
create policy "profiles_select_own" on profiles for select using (auth.uid() = auth_user_id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = auth_user_id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = auth_user_id);

-- Addresses
create policy "addresses_select_own" on addresses for select using (profile_id in (select id from profiles where auth_user_id = auth.uid()));
create policy "addresses_insert_own" on addresses for insert with check (profile_id in (select id from profiles where auth_user_id = auth.uid()));
create policy "addresses_update_own" on addresses for update using (profile_id in (select id from profiles where auth_user_id = auth.uid()));
create policy "addresses_delete_own" on addresses for delete using (profile_id in (select id from profiles where auth_user_id = auth.uid()));

-- Orders
create policy "orders_select_own" on orders for select using (profile_id in (select id from profiles where auth_user_id = auth.uid()));

-- Order items
create policy "order_items_select_own" on order_items for select using (order_id in (select id from orders where profile_id in (select id from profiles where auth_user_id = auth.uid())));

-- Wishlists
create policy "wishlists_own" on wishlists for all using (profile_id in (select id from profiles where auth_user_id = auth.uid()));

-- Admins: only read your own row
create policy "admins_select_own" on admins for select using (auth.uid() = user_id);

-- Public read policies (storefront)
create policy "products_public_read" on products for select using (is_published = true);
create policy "categories_public_read" on categories for select using (is_active = true);
create policy "fragrance_families_public_read" on fragrance_families for select using (true);
create policy "banners_public_read" on banners for select using (is_active = true);
create policy "promo_bars_public_read" on promo_bars for select using (is_active = true);
create policy "settings_public_read" on settings for select using (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Fragrance families
insert into fragrance_families (name, slug) values
  ('Woody', 'woody'), ('Fresh', 'fresh'), ('Aquatic', 'aquatic'),
  ('Citrus', 'citrus'), ('Floral', 'floral'), ('Fruity', 'fruity'),
  ('Oud', 'oud'), ('Amber', 'amber'), ('Musk', 'musk'),
  ('Spicy', 'spicy'), ('Gourmand', 'gourmand')
on conflict (slug) do nothing;

-- Categories
insert into categories (name, slug, display_order) values
  ('Men', 'men', 1), ('Women', 'women', 2), ('Unisex', 'unisex', 3),
  ('Best Sellers', 'best-sellers', 4), ('New Arrivals', 'new-arrivals', 5), ('Gift Sets', 'gift-sets', 6),
  ('Solid Perfumes', 'solid-perfumes', 7)
on conflict (slug) do nothing;

-- Promo bars
insert into promo_bars (text, link_url, link_label, display_order) values
  ('FREE SHIPPING ON ORDERS ABOVE ₹1,499', '/shop', 'Shop Now', 1),
  ('DISCOVER YOUR SIGNATURE SCENT', '/shop', 'Explore', 2),
  ('BUY 2 GET 10% OFF — USE CODE: DOUBLE10', '/shop', 'Shop Now', 3)
on conflict do nothing;

-- Demo products
with cat as (select id from categories where slug='unisex' limit 1),
     cat_m as (select id from categories where slug='men' limit 1),
     cat_w as (select id from categories where slug='women' limit 1)
insert into products (name, slug, sku, short_description, gender, concentration, volume_ml,
  original_price, sale_price, discount_percentage, stock_quantity, low_stock_threshold,
  main_image_url, top_notes, middle_notes, base_notes, longevity, projection,
  season, occasion, delivery_estimate, is_featured, is_bestseller, is_new_arrival,
  tester_available, is_published, category_id)
values
  ('THRONE', 'throne-100ml', 'THR-001', 'A commanding leather accord with deep oud and saffron.',
   'Unisex', 'Parfum', 100, 4999, null, null, 50, 5,
   'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
   array['Saffron','Bergamot'], array['Leather','Rose'], array['Oud','Amber','Musk'],
   'Long-lasting', 'Moderate', array['Fall','Winter'], array['Evening','Special'],
   '3-5 business days', true, true, false, true, true, (select id from cat)),
  ('NOIR', 'noir-100ml', 'NOR-001', 'Dark woods and smoky vetiver for the bold.',
   'Men', 'EDP', 100, 3499, 2999, 14, 30, 5,
   'https://images.unsplash.com/photo-1588514383294-6b75febb4a88?w=600&q=80',
   array['Black Pepper','Cardamom'], array['Vetiver','Cedar'], array['Smoke','Musk','Amber'],
   'Very long-lasting', 'Strong', array['Fall','Winter'], array['Evening'],
   '3-5 business days', true, false, true, true, true, (select id from cat_m)),
  ('OCEAN VEIL', 'ocean-veil-100ml', 'OCN-001', 'Fresh aquatic breeze over marine woods.',
   'Unisex', 'EDT', 100, 2499, null, null, 45, 5,
   'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80',
   array['Sea Salt','Bergamot'], array['Aquatic','Jasmine'], array['Driftwood','Musk'],
   'Moderate', 'Light', array['Spring','Summer'], array['Daily','Office'],
   '3-5 business days', true, false, false, false, true, (select id from cat)),
  ('EMBER', 'ember-100ml', 'EMB-001', 'Warm amber and tonka with a hint of vanilla.',
   'Women', 'EDP', 100, 3299, null, null, 25, 5,
   'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
   array['Bergamot','Orange'], array['Amber','Rose'], array['Tonka','Vanilla','Musk'],
   'Long-lasting', 'Moderate', array['Fall','Winter'], array['Evening','Date'],
   '3-5 business days', true, true, false, true, true, (select id from cat_w)),
  ('VELVET OUD', 'velvet-oud-100ml', 'VLO-001', 'Rich oud with creamy rose and dark resins.',
   'Unisex', 'Parfum', 100, 5999, null, null, 15, 3,
   'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80',
   array['Rose','Saffron'], array['Oud','Incense'], array['Labdanum','Musk','Sandalwood'],
   'Very long-lasting', 'Strong', array['Fall','Winter'], array['Special','Evening'],
   '3-5 business days', true, false, true, true, true, (select id from cat)),
  ('AURELIA', 'aurelia-100ml', 'AUR-001', 'Floral elegance — peony, magnolia, and musk.',
   'Women', 'EDP', 100, 2999, 2499, 17, 40, 5,
   'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&q=80',
   array['Peony','Lychee'], array['Magnolia','Jasmine'], array['White Musk','Cedarwood'],
   'Moderate', 'Light', array['Spring','Summer'], array['Daily','Office'],
   '3-5 business days', true, true, false, false, true, (select id from cat_w)),
  ('MIDNIGHT', 'midnight-100ml', 'MDN-001', 'Mysterious iris and patchouli for the night.',
   'Unisex', 'EDP', 100, 3799, null, null, 20, 5,
   'https://images.unsplash.com/photo-1547887538-047f814a4ff9?w=600&q=80',
   array['Violet','Black Currant'], array['Iris','Patchouli'], array['Vetiver','Amber','Musk'],
   'Long-lasting', 'Moderate', array['Fall','Winter'], array['Evening','Special'],
   '3-5 business days', true, false, false, true, true, (select id from cat)),
  ('IMPERIUM', 'imperium-100ml', 'IMP-001', 'Regal spices meet opulent woody base.',
   'Men', 'Parfum', 100, 4499, null, null, 18, 5,
   'https://images.unsplash.com/photo-1599778150914-88e98e0c3c3e?w=600&q=80',
   array['Cinnamon','Cardamom'], array['Frankincense','Cedar'], array['Sandalwood','Leather','Benzoin'],
   'Very long-lasting', 'Strong', array['Fall','Winter'], array['Evening','Special'],
   '3-5 business days', true, false, true, false, true, (select id from cat_m))
on conflict (slug) do nothing;

-- ============================================================
-- DONE! All tables, triggers, RLS, and seed data are set up.
-- Now go to Authentication → Users → Add user to create admin.
-- ============================================================
select 'Setup complete! Tables created: ' || count(*)::text as status
from information_schema.tables 
where table_schema = 'public';
