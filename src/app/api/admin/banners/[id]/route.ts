import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminClient = await createAdminClient();
  const { id } = await params;
  const body = await req.json();

  // Pick only valid columns
  const allowedKeys = [
    "title", "subtitle", "desktop_image_url", "mobile_image_url",
    "cta_label", "cta_url", "text_alignment", "is_active", "display_order",
    "start_date", "end_date"
  ];

  const updateData: Record<string, any> = {};
  for (const key of allowedKeys) {
    if (body[key] !== undefined) {
      updateData[key] = key === "display_order" ? Number(body[key]) : body[key];
    }
  }

  const { data, error } = await adminClient.from("banners").update(updateData).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banner: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminClient = await createAdminClient();
  const { id } = await params;
  const { error } = await adminClient.from("banners").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
