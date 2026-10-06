import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }
    const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
    if (data) {
      return NextResponse.json({ settings: data });
    }
  } catch {
    // Fallback if DB fetch fails
  }
  return NextResponse.json({
    settings: {
      shipping_charge: 99,
      free_shipping_min: 1499,
      whatsapp_number: "+917067697646",
      support_email: "Surajxsingh41@gmail.com",
    },
  });
}
