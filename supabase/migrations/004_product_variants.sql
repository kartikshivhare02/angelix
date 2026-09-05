-- ANGELIX — Migration 004: Product Variants (Multi-Size, Capacity & Dynamic Pricing)

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null, -- e.g. "50ml", "100ml", "200ml", "30g"
  volume_ml int,
  sku text,
  original_price numeric(10,2) not null,
  sale_price numeric(10,2),
  stock_quantity int not null default 0,
  is_default boolean default false,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_product_variants_product_id on product_variants(product_id);

-- Enable RLS
alter table product_variants enable row level security;

-- Drop old policies if exist
drop policy if exists "product_variants_public_read" on product_variants;
drop policy if exists "product_variants_admin_all" on product_variants;

-- Public read access
create policy "product_variants_public_read" on product_variants for select using (true);

-- Admin CRUD access
create policy "product_variants_admin_all" on product_variants
  for all using (
    exists (
      select 1 from profiles
      where profiles.auth_user_id = auth.uid()
      and profiles.role in ('admin', 'super_admin')
    )
    or exists (
      select 1 from admins
      where admins.user_id = auth.uid()
    )
  );
