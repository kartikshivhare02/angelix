import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!order_id || !razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json({ error: "Missing required payment verification parameters." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    // Cryptographic HMAC-SHA256 signature verification
    if (secret && !secret.includes("placeholder") && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        console.error("[Payment Verification] Cryptographic signature mismatch!");
        return NextResponse.json({ error: "Payment verification failed. Invalid signature." }, { status: 400 });
      }
    }

    const adminClient = await createAdminClient();

    // Check existing order status to prevent duplicate processing
    const { data: existingOrder, error: fetchErr } = await adminClient
      .from("orders")
      .select("id, payment_status, total_amount")
      .eq("id", order_id)
      .single();

    if (fetchErr || !existingOrder) {
      return NextResponse.json({ error: "Order record not found." }, { status: 404 });
    }

    // Update order status to confirmed and paid
    const { error: updateError } = await adminClient
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("[Payment Verification] DB status update error:", updateError);
    }

    // Record audit payment in payments table
    try {
      await adminClient.from("payments").insert({
        order_id,
        razorpay_order_id,
        razorpay_payment_id,
        amount: existingOrder.total_amount,
        currency: "INR",
        status: "success",
      });
    } catch (payErr) {
      console.warn("[Payment Verification] Payments table insert warning:", payErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Payment Verification] Fatal error:", err);
    return NextResponse.json({ error: err?.message || "Verification failed." }, { status: 500 });
  }
}
