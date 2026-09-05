-- ANGLELIX — Migration 004: Product Variants (Multi-Size, Capacity & Dynamic Pricing)

create table if not exists product_variants (
  id uuid primary key default uuid_generate_v4(),
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

-- Public read access
create policy "product_variants_public_read" on product_variants for select using (true);

-- Admin CRUD access
create policy "product_variants_admin_all" on product_variants
  for all using (
    exists (
      select 1 from admins
      where admins.auth_user_id = auth.uid()
      and admins.is_active = true
    )
  );
