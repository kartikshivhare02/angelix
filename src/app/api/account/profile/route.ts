import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check profile by auth_user_id or id
  let { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!data) {
    const fallback = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    data = fallback.data;
  }

  // Check if user is in admins table
  const { data: adminData } = await supabase
    .from("admins")
    .select("id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  const isAdmin = !!adminData || data?.role === "admin" || data?.role === "super_admin";

  return NextResponse.json({ 
    profile: data ? { ...data, email: data.email || user.email } : { email: user.email, role: isAdmin ? "admin" : "customer" },
    isAdmin 
  });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const allowed = ["first_name", "last_name", "phone", "whatsapp_number", "date_of_birth", "marketing_consent"];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  let { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("auth_user_id", user.id)
    .select()
    .maybeSingle();

  if (!data) {
    const fallback = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .maybeSingle();
    data = fallback.data;
    error = fallback.error;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
