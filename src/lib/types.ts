// ============================================================
// ANGELIX — Core TypeScript Types
// ============================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  full_description: string;
  brand: string;
  category_id: string;
  gender: "Men" | "Women" | "Unisex";
  concentration: string; // EDP, EDT, Parfum, etc.
  volume_ml: number;
  original_price: number;
  sale_price: number | null;
  discount_percentage: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  main_image_url: string;
  thumbnail_url: string | null;
  top_notes: string[];
  middle_notes: string[];
  base_notes: string[];
  longevity: string | null;
  projection: string | null;
  season: string[];
  occasion: string[];
  ingredients: string | null;
  how_to_apply: string | null;
  delivery_estimate: string | null;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  tester_available: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  fragrance_families?: FragranceFamily[];
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  name: string; // e.g. "50ml", "100ml", "200ml", "30g"
  volume_ml?: number | null;
  sku?: string | null;
  original_price: number;
  sale_price?: number | null;
  stock_quantity: number;
  is_default?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product_id: string;
  variant_id?: string | null;
  name: string;
  slug: string;
  image_url: string;
  price: number;
  original_price: number;
  volume_ml: number;
  concentration: string;
  quantity: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

export interface FragranceFamily {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export interface Profile {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  whatsapp_number: string | null;
  date_of_birth: string | null;
  marketing_consent: boolean;
  role: "customer" | "admin" | "super_admin";
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  profile_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pin_code: string;
  country: string;
  is_default: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  profile_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: "razorpay" | "cod";
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  coupon_id: string | null;
  coupon_code: string | null;
  shipping_address: Address;
  whatsapp_number: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  items?: OrderItem[];
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  image_url: string;
  volume_ml: number;
  concentration: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_limit_per_customer: number | null;
  times_used: number;
  start_date: string | null;
  end_date: string | null;
  is_first_order_only: boolean;
  is_active: boolean;
  applicable_products: string[];
  applicable_categories: string[];
}

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  desktop_image_url: string;
  mobile_image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  text_alignment: "left" | "center" | "right";
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
}

export interface PromoBar {
  id: string;
  text: string;
  link_url: string | null;
  link_label: string | null;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
}

export interface SiteSettings {
  brand_name: string;
  brand_subtitle: string;
  logo_url: string | null;
  favicon_url: string | null;
  instagram_url: string | null;
  whatsapp_number: string | null;
  support_email: string | null;
  shipping_charge: number;
  free_shipping_min: number;
  currency: string;
  business_address: string | null;
  razorpay_enabled: boolean;
  cod_enabled: boolean;
  order_confirmation_message: string;
  footer_tagline: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface TesterProduct {
  id: string;
  product_id: string;
  size_ml: number;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  product?: Product;
}
