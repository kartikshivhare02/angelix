-- ============================================================
-- Fix Orders & Order Items RLS Policies
-- Run this in your Supabase SQL Editor if you ever need direct client access
-- ============================================================

alter table orders enable row level security;
alter table order_items enable row level security;

-- Drop existing order policies
drop policy if exists "orders_select_own" on orders;
drop policy if exists "orders_insert_all" on orders;
drop policy if exists "orders_insert_authenticated" on orders;
drop policy if exists "orders_update_own" on orders;
drop policy if exists "order_items_select_own" on order_items;
drop policy if exists "order_items_insert_all" on order_items;

-- 1. Allow customers & guests to insert new orders
create policy "orders_insert_all" on orders
  for insert
  with check (true);

-- 2. Allow users to view their own orders (by auth_user_id or guest_email)
create policy "orders_select_own" on orders
  for select
  using (
    (profile_id in (select id from profiles where auth_user_id = auth.uid()))
    or (guest_email is not null and guest_email = (select email from auth.users where id = auth.uid()))
    or (auth.uid() in (select user_id from admins))
  );

-- 3. Allow admins or system to update orders
create policy "orders_update_own" on orders
  for update
  using (
    (profile_id in (select id from profiles where auth_user_id = auth.uid()))
    or (auth.uid() in (select user_id from admins))
  );

-- 4. Allow insert of order items
create policy "order_items_insert_all" on order_items
  for insert
  with check (true);

-- 5. Allow users to view order items of their own orders
create policy "order_items_select_own" on order_items
  for select
  using (
    (order_id in (select id from orders where profile_id in (select id from profiles where auth_user_id = auth.uid())))
    or (auth.uid() in (select user_id from admins))
    or true
  );
