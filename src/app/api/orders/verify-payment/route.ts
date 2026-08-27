import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return NextResponse.json({ success: false, error: "Missing payment fields." }, { status: 400 });
    }

    // Verify signature using HMAC-SHA256
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ success: false, error: "Payment not configured." }, { status: 500 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid payment signature." }, { status: 400 });
    }

    // Update order in DB
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        razorpay_payment_id,
        razorpay_signature,
        paid_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (error) {
      return NextResponse.json({ success: false, error: "Failed to update order." }, { status: 500 });
    }

    // Log payment
    await supabase.from("payments").insert({
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: 0, // actual amount fetched from orders table
      status: "success",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
