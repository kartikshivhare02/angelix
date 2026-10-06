import { createClient, createAdminClient } from "@/lib/supabase/server";
import { SiteSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  brand_name: "ANGELIX",
  brand_subtitle: "by Suraj",
  logo_url: "/logo.png",
  favicon_url: "/favicon.ico",
  instagram_url: "https://www.instagram.com/angelix.ltd?stkn=MTdmdGdmemFyNW5hcg==",
  whatsapp_number: "+917067697646",
  support_email: "Surajxsingh41@gmail.com",
  shipping_charge: 99,
  free_shipping_min: 1499,
  currency: "INR",
  business_address: "India",
  razorpay_enabled: true,
  cod_enabled: true,
  order_confirmation_message: "Your order has been placed. We will share tracking updates on WhatsApp.",
  footer_tagline: "A sophisticated fragrance house crafting premium scents for the discerning.",
  seo_title: "ANGELIX by Suraj — Premium Luxury Fragrances",
  seo_description: "Discover handcrafted luxury perfumes by ANGELIX by Suraj.",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }
    const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
    if (data) {
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        shipping_charge: data.shipping_charge !== undefined && data.shipping_charge !== null ? Number(data.shipping_charge) : DEFAULT_SETTINGS.shipping_charge,
        free_shipping_min: data.free_shipping_min !== undefined && data.free_shipping_min !== null ? Number(data.free_shipping_min) : DEFAULT_SETTINGS.free_shipping_min,
      };
    }
  } catch (err) {
    console.warn("Failed to fetch settings from DB:", err);
  }
  return DEFAULT_SETTINGS;
}
