import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const revalidate = 0; // Dynamic data

export async function GET() {
  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }

    const { data, error } = await supabase
      .from("promo_bars")
      .select("id, text, link_url, link_label, display_order, is_active, start_date, end_date")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json({ promos: [] }, { status: 200 });
    }

    // Filter by date validity with timezone tolerance
    const now = Date.now();
    const validPromos = (data || []).filter((p) => {
      if (p.start_date && typeof p.start_date === "string" && p.start_date.trim() !== "") {
        const start = new Date(p.start_date);
        if (!isNaN(start.getTime())) {
          // Allow start dates from today in any timezone (+24h buffer)
          const startLimit = start.getTime() - 24 * 60 * 60 * 1000;
          if (startLimit > now) return false;
        }
      }
      if (p.end_date && typeof p.end_date === "string" && p.end_date.trim() !== "") {
        const end = new Date(p.end_date);
        if (!isNaN(end.getTime())) {
          // End of the day + timezone buffer (+24h buffer)
          const endLimit = end.getTime() + 24 * 60 * 60 * 1000;
          if (endLimit < now) return false;
        }
      }
      return true;
    });

    return NextResponse.json({ promos: validPromos });
  } catch {
    return NextResponse.json({ promos: [] });
  }
}
