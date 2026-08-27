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
  const { data, error } = await adminClient.from("categories").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    revalidatePath("/", "layout");
    revalidatePath("/shop");
  } catch {}

  return NextResponse.json({ category: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminClient = await createAdminClient();
  const { id } = await params;

  // Unlink any products assigned to this category before deleting
  await adminClient.from("products").update({ category_id: null }).eq("category_id", id);

  const { error } = await adminClient.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    revalidatePath("/", "layout");
    revalidatePath("/shop");
  } catch {}

  return NextResponse.json({ success: true });
}
