import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 30);
  const query = searchParams.get("query") ?? "";
  const from = (page - 1) * limit;

  let dbQuery = adminClient
    .from("profiles")
    .select("id, first_name, last_name, email, phone, whatsapp_number, created_at, role, orders(id, total_amount)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (query) {
    dbQuery = dbQuery.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);
  }

  const { data, count, error } = await dbQuery.range(from, from + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const customers = data.map((profile) => ({
    ...profile,
    order_count: profile.orders?.length ?? 0,
    lifetime_spend: profile.orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ?? 0,
  }));

  return NextResponse.json({ customers, total: count });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const adminClient = await createAdminClient();
    const body = await req.json();
    const { email, password, first_name, last_name, phone, whatsapp_number } = body;

    if (!email || !first_name) {
      return NextResponse.json({ error: "First name and email are required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password?.trim() || `User@${Math.random().toString(36).slice(-8)}`;

    // Create auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: {
        first_name: first_name.trim(),
        last_name: (last_name || "").trim(),
        phone: (phone || "").trim(),
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Failed to create customer user." }, { status: 400 });
    }

    // Upsert profile
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          auth_user_id: authData.user.id,
          first_name: first_name.trim(),
          last_name: (last_name || "").trim(),
          email: cleanEmail,
          phone: (phone || "").trim(),
          whatsapp_number: (whatsapp_number || "").trim() || null,
          role: "customer",
        },
        { onConflict: "auth_user_id" }
      )
      .select()
      .single();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ customer: profile, message: "Customer created successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error." }, { status: 500 });
  }
}

