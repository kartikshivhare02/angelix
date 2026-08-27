import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminClient = await createAdminClient();
  const { id } = await params;
  const body = await req.json();

  const cleanData: Record<string, any> = {};
  if (body.text !== undefined) cleanData.text = body.text ? body.text.trim() : "";
  if (body.link_url !== undefined) cleanData.link_url = body.link_url && typeof body.link_url === "string" && body.link_url.trim() !== "" ? body.link_url.trim() : null;
  if (body.link_label !== undefined) cleanData.link_label = body.link_label && typeof body.link_label === "string" && body.link_label.trim() !== "" ? body.link_label.trim() : null;
  if (body.is_active !== undefined) cleanData.is_active = Boolean(body.is_active);
  if (body.display_order !== undefined) cleanData.display_order = Number(body.display_order) || 0;
  if (body.start_date !== undefined) cleanData.start_date = body.start_date && typeof body.start_date === "string" && body.start_date.trim() !== "" ? body.start_date.trim() : null;
  if (body.end_date !== undefined) cleanData.end_date = body.end_date && typeof body.end_date === "string" && body.end_date.trim() !== "" ? body.end_date.trim() : null;

  const { data, error } = await adminClient.from("promo_bars").update(cleanData).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    revalidatePath("/", "layout");
  } catch {}

  return NextResponse.json({ promo: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminClient = await createAdminClient();
  const { id } = await params;
  const { error } = await adminClient.from("promo_bars").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    revalidatePath("/", "layout");
  } catch {}

  return NextResponse.json({ success: true });
}
