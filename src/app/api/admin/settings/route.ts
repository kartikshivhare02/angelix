import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  if (!(await assertAdmin(supabase))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient.from("settings").select("*").eq("id", 1).single();
  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings: data || null });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  if (!(await assertAdmin(supabase))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const body = await req.json();

  let updatePayload: Record<string, any> = { id: 1, ...body, updated_at: new Date().toISOString() };

  // Loop up to 10 times to strip any missing columns unsupported by the DB schema
  for (let attempt = 0; attempt < 10; attempt++) {
    const { data, error } = await adminClient
      .from("settings")
      .upsert(updatePayload)
      .select()
      .single();

    if (!error) {
      return NextResponse.json({ settings: data });
    }

    if (error.message.includes("could not find the")) {
      const match = error.message.match(/could not find the '([^']+)' column/);
      if (match && match[1]) {
        console.warn(`[Admin Settings] Removing unsupported DB column: '${match[1]}'`);
        delete updatePayload[match[1]];
        continue;
      }
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Failed to update settings after removing invalid columns." }, { status: 500 });
}
