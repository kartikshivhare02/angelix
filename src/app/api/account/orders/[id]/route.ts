import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const adminClient = await createAdminClient();

    // 1. Get all profile IDs for this user
    const { data: profiles } = await adminClient
      .from("profiles")
      .select("id")
      .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`);

    const profileIds = (profiles || []).map((p) => p.id);
    profileIds.push(user.id);

    // 2. Fetch order by id matching user's profile IDs or user email
    const { data: order, error } = await adminClient
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    const isOwner =
      profileIds.includes(order.profile_id) ||
      (order.guest_email && user.email && order.guest_email.toLowerCase() === user.email.toLowerCase());

    if (!isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
