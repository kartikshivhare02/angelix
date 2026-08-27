import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

export async function GET() {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient.from("banners").select("*").order("display_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banners: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const body = await req.json();

  // Sanitize to only valid database columns
  const cleanData = {
    title: body.title ?? null,
    subtitle: body.subtitle ?? null,
    desktop_image_url: body.desktop_image_url,
    mobile_image_url: body.mobile_image_url ?? null,
    cta_label: body.cta_label ?? null,
    cta_url: body.cta_url ?? null,
    text_alignment: body.text_alignment || "left",
    is_active: body.is_active ?? true,
    display_order: Number(body.display_order) || 0,
    start_date: body.start_date || null,
    end_date: body.end_date || null,
  };

  const { data, error } = await adminClient.from("banners").insert(cleanData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banner: data });
}

