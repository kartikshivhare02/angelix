import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

export async function GET() {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient.from("promo_bars").select("*").order("display_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ promos: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const body = await req.json();

  if (!body.text || !body.text.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const cleanData = {
    text: body.text.trim(),
    link_url: body.link_url && typeof body.link_url === "string" && body.link_url.trim() !== "" ? body.link_url.trim() : null,
    link_label: body.link_label && typeof body.link_label === "string" && body.link_label.trim() !== "" ? body.link_label.trim() : null,
    is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    display_order: Number(body.display_order) || 0,
    start_date: body.start_date && typeof body.start_date === "string" && body.start_date.trim() !== "" ? body.start_date.trim() : null,
    end_date: body.end_date && typeof body.end_date === "string" && body.end_date.trim() !== "" ? body.end_date.trim() : null,
  };

  const { data, error } = await adminClient.from("promo_bars").insert(cleanData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    revalidatePath("/", "layout");
  } catch {}

  return NextResponse.json({ promo: data });
}
