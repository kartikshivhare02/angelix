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

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ categories: [] });
    }

    return NextResponse.json({ categories: data || [] });
  } catch {
    return NextResponse.json({ categories: [] });
  }
}
