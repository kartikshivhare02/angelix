import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

async function autoVerifyRazorpayPayment(order: any, adminClient: any) {
  if (
    order &&
    order.razorpay_order_id &&
    order.payment_status !== "paid"
  ) {
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (key && secret && !key.includes("placeholder")) {
      try {
        const authHeader = `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`;
        const rzpRes = await fetch(
          `https://api.razorpay.com/v1/orders/${order.razorpay_order_id}/payments`,
          {
            headers: { Authorization: authHeader },
            cache: "no-store",
          }
        );

        if (rzpRes.ok) {
          const rzpData = await rzpRes.json();
          const items = rzpData.items || [];
          const successfulPayment = items.find(
            (p: any) => p.status === "captured" || p.status === "authorized"
          );

          if (successfulPayment) {
            const { data: updated } = await adminClient
              .from("orders")
              .update({
                payment_status: "paid",
                status: order.status === "pending" ? "confirmed" : order.status,
                razorpay_payment_id: successfulPayment.id,
                updated_at: new Date().toISOString(),
              })
              .eq("id", order.id)
              .select("*, items:order_items(*), profile:profiles(*)")
              .single();

            if (updated) return updated;
          }
        }
      } catch (err) {
        console.warn("[Razorpay Auto-Verify] Could not query Razorpay API:", err);
      }
    }
  }
  return order;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const { id } = await params;
  let { data, error } = await adminClient
    .from("orders")
    .select("*, items:order_items(*), profile:profiles(*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  // Automatically query Razorpay REST API to identify live payment status
  data = await autoVerifyRazorpayPayment(data, adminClient);

  return NextResponse.json({ order: data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const { id } = await params;
  const body = await req.json();
  const { data, error } = await adminClient.from("orders").update({ ...body, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    revalidatePath("/account/orders");
    revalidatePath(`/account/orders/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
  } catch {}

  return NextResponse.json({ order: data });
}
