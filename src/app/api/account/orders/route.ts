import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    // 1. Get all profile IDs associated with this user
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id")
      .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`);

    const profileIds = (profiles || []).map((p) => p.id);
    profileIds.push(user.id);

    // 2. Query orders by profile_id list OR by guest_email matching user's email
    let query = adminClient
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `);

    if (user.email) {
      query = query.or(
        `profile_id.in.(${profileIds.join(",")}),guest_email.eq.${user.email.toLowerCase()}`
      );
    } else {
      query = query.in("profile_id", profileIds);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch account orders error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data ?? [] });
  } catch (err: any) {
    console.error("Account orders fatal error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
