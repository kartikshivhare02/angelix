import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();

    if (!order_id || !razorpay_payment_id || !razorpay_order_id) {
      return NextResponse.json({ error: "Missing verification parameters." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (secret && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json({ error: "Payment verification signature mismatch." }, { status: 400 });
      }
    }

    const adminClient = await createAdminClient();

    // Update order to confirmed and paid
    const { error } = await adminClient
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (error) {
      console.error("Order verification status update error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: err.message || "Verification failed." }, { status: 500 });
  }
}
