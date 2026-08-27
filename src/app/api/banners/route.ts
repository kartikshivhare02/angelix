import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Dynamic

export async function GET() {
  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("banners")
      .select("id, title, subtitle, desktop_image_url, mobile_image_url, cta_label, cta_url, text_alignment, is_active, display_order, start_date, end_date")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json({ banners: [] });
    }

    const validBanners = (data || []).filter((b) => {
      if (b.start_date) {
        const start = new Date(b.start_date);
        start.setHours(0, 0, 0, 0);
        if (start.getTime() > Date.now()) return false;
      }
      if (b.end_date) {
        const end = new Date(b.end_date);
        end.setHours(23, 59, 59, 999);
        if (end.getTime() < Date.now()) return false;
      }
      return true;
    });

    return NextResponse.json({ banners: validBanners });
  } catch {
    return NextResponse.json({ banners: [] });
  }
}
