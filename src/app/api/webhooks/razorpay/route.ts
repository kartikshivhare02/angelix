import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

// Razorpay sends a POST to this endpoint with payment event data.
// We verify the webhook signature and update order payment status.

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("[Webhook] RAZORPAY_WEBHOOK_SECRET not configured — skipping.");
    return NextResponse.json({ status: "skipped" });
  }

  // Read raw body for signature verification
  const rawBody = await req.text();
  const razorpaySignature = req.headers.get("x-razorpay-signature");

  if (!razorpaySignature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    console.error("[Webhook] Signature mismatch — potential replay attack.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event: string; payload: { payment: { entity: { id: string; order_id: string; status: string } } } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload?.event;
  const payment = payload?.payload?.payment?.entity;

  if (!payment) {
    return NextResponse.json({ status: "ignored" });
  }

  const supabase = await createClient();

  // Handle payment.captured (successful payment)
  if (event === "payment.captured") {
    const { data: order } = await supabase
      .from("orders")
      .select("id, payment_status")
      .eq("razorpay_order_id", payment.order_id)
      .single();

    if (order && order.payment_status !== "paid") {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          razorpay_payment_id: payment.id,
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      console.log(`[Webhook] Order ${order.id} marked as paid via webhook.`);
    }
  }

  // Handle payment.failed
  if (event === "payment.failed") {
    const { data: order } = await supabase
      .from("orders")
      .select("id")
      .eq("razorpay_order_id", payment.order_id)
      .single();

    if (order) {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      console.log(`[Webhook] Order ${order.id} marked as failed via webhook.`);
    }
  }

  return NextResponse.json({ status: "ok" });
}
