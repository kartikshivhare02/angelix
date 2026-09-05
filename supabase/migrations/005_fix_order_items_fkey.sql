-- ANGELIX — Migration 005: Make order_items.product_id nullable and set null on product delete

alter table if exists order_items alter column product_id drop not null;

alter table if exists order_items drop constraint if exists order_items_product_id_fkey;

alter table if exists order_items 
  add constraint order_items_product_id_fkey 
  foreign key (product_id) 
  references products(id) 
  on delete set null;
