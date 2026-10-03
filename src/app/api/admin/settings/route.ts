import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

export async function GET() {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient.from("settings").select("*").eq("id", 1).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const body = await req.json();

  let updatePayload: Record<string, any> = { ...body, updated_at: new Date().toISOString() };

  let { data, error } = await adminClient
    .from("settings")
    .update(updatePayload)
    .eq("id", 1)
    .select()
    .single();

  // Handle missing column in Supabase schema gracefully
  if (error && error.message.includes("could not find the")) {
    console.warn("[Admin Settings] Missing column in DB schema:", error.message);
    const match = error.message.match(/could not find the '([^']+)' column/);
    if (match && match[1]) {
      const missingCol = match[1];
      delete updatePayload[missingCol];

      const retryRes = await adminClient
        .from("settings")
        .update(updatePayload)
        .eq("id", 1)
        .select()
        .single();

      if (!retryRes.error) {
        return NextResponse.json({ settings: retryRes.data });
      }
    }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
