import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
    }

    // Demo mode — allow a test coupon
    const isPlaceholder =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isPlaceholder) {
      if (code === "WELCOME10") {
        const discount = Math.min(Math.floor(subtotal * 0.1), 500);
        return NextResponse.json({ discount, code: "WELCOME10", type: "percentage" });
      }
      return NextResponse.json({ error: "Coupon code not found." }, { status: 404 });
    }

    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Coupon code not found." }, { status: 404 });
    }

    // Validate active window
    if (coupon.start_date && now < coupon.start_date) {
      return NextResponse.json({ error: "This coupon is not active yet." }, { status: 400 });
    }
    if (coupon.end_date && now > coupon.end_date) {
      return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
    }

    // Minimum order check
    if (coupon.minimum_order_value && subtotal < coupon.minimum_order_value) {
      return NextResponse.json(
        { error: `Minimum order of ₹${coupon.minimum_order_value} required for this coupon.` },
        { status: 400 }
      );
    }

    // Usage limit
    if (coupon.usage_limit) {
      const { count } = await supabase
        .from("coupon_usage")
        .select("id", { count: "exact" })
        .eq("coupon_id", coupon.id);
      if ((count ?? 0) >= coupon.usage_limit) {
        return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
      }
    }

    // Calculate discount server-side
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = Math.floor((subtotal * coupon.discount_value) / 100);
      if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
    } else if (coupon.discount_type === "fixed") {
      discount = Math.min(coupon.discount_value, subtotal);
    }

    return NextResponse.json({
      discount,
      code: coupon.code,
      type: coupon.discount_type,
      coupon_id: coupon.id,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
