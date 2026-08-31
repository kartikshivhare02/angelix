-- ============================================================
-- ANGLELIX — SEED DATA
-- Run after the migration SQL
-- ============================================================

-- Settings (singleton row)
insert into settings (id, brand_name, brand_subtitle, instagram_url, whatsapp_number, support_email,
  shipping_charge, free_shipping_min, order_confirmation_message)
values (1, 'ANGLELIX', 'by Suraj', 'https://instagram.com/anglelix', '+91-9999999999', 'hello@anglelix.com',
  99, 1499, 'Your order has been successfully placed. We will share your shipment and tracking updates with you on WhatsApp.')
on conflict (id) do nothing;

-- Fragrance families
insert into fragrance_families (name, slug) values
  ('Woody', 'woody'), ('Fresh', 'fresh'), ('Aquatic', 'aquatic'),
  ('Citrus', 'citrus'), ('Floral', 'floral'), ('Fruity', 'fruity'),
  ('Oud', 'oud'), ('Amber', 'amber'), ('Musk', 'musk'),
  ('Spicy', 'spicy'), ('Gourmand', 'gourmand')
on conflict (slug) do nothing;

-- Categories
insert into categories (name, slug, display_order) values
  ('Men', 'men', 1),
  ('Women', 'women', 2),
  ('Unisex', 'unisex', 3),
  ('Best Sellers', 'best-sellers', 4),
  ('New Arrivals', 'new-arrivals', 5),
  ('Gift Sets', 'gift-sets', 6)
on conflict (slug) do nothing;

-- Promo bars
insert into promo_bars (text, link_url, link_label, display_order) values
  ('FREE SHIPPING ON ORDERS ABOVE ₹1,499', '/shop', 'Shop Now', 1),
  ('DISCOVER YOUR SIGNATURE SCENT', '/shop', 'Explore', 2),
  ('BUY 2 GET 10% OFF — USE CODE: DOUBLE10', '/shop', 'Shop Now', 3)
on conflict do nothing;

-- Demo Products
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
