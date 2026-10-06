import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }
    const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single();
    if (data && !error) {
      return NextResponse.json({
        settings: {
          ...data,
          shipping_charge: data.shipping_charge !== undefined && data.shipping_charge !== null ? Number(data.shipping_charge) : 99,
          free_shipping_min: data.free_shipping_min !== undefined && data.free_shipping_min !== null ? Number(data.free_shipping_min) : 1499,
        },
      });
    }
  } catch (err) {
    console.error("[api/settings] Error fetching settings:", err);
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
