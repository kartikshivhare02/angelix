import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { items, shipping_address, coupon_code, payment_method = "razorpay" } = await req.json();

    if (!items?.length) return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    if (!shipping_address) return NextResponse.json({ error: "Shipping address required." }, { status: 400 });

    const isPlaceholder =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    // ── Demo mode ──────────────────────────────────────────────────────────
    if (isPlaceholder) {
      const demoOrderId = `DEMO-${Date.now()}`;
      return NextResponse.json({
        order_id: demoOrderId,
        order_number: `ANG-DEMO-${Date.now().toString().slice(-4)}`,
        payment_method,
        message: "Demo mode — order created.",
      });
    }

    // ── Production mode ────────────────────────────────────────────────────
    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 1. Fetch authoritative prices from DB (NEVER trust frontend prices)
    const productIds = items.map((i: any) => i.product_id);
    const [{ data: products, error: productError }, { data: testerProducts }] = await Promise.all([
      adminClient
        .from("products")
        .select("id, name, slug, main_image_url, volume_ml, concentration, original_price, sale_price, stock_quantity, is_published, tester_available")
        .in("id", productIds)
        .eq("is_published", true),
      adminClient
        .from("tester_products")
        .select("*")
        .in("product_id", productIds)
        .eq("is_active", true),
    ]);

    if (productError || !products?.length) {
      return NextResponse.json({ error: "Some products are unavailable." }, { status: 400 });
    }

    // 2. Validate stock + calculate subtotal
    let subtotal = 0;
    const validatedItems: any[] = [];

    const getTesterPrice = (productId: string, sizeMl: number) => {
      const match = (testerProducts || []).find(
        (t: any) => t.product_id === productId && Number(t.size_ml) === Number(sizeMl)
      );
      if (match && match.price > 0) return Number(match.price);
      if (sizeMl === 2) return 99;
      if (sizeMl === 5) return 199;
      if (sizeMl === 10) return 349;
      return 149;
    };

    for (const cartItem of items) {
      const product = products.find((p) => p.id === cartItem.product_id);
      if (!product) return NextResponse.json({ error: "Product not found." }, { status: 400 });

      const isTesterSize = [2, 5, 10].includes(Number(cartItem.volume_ml)) || cartItem.is_tester;

      if (!isTesterSize && product.stock_quantity < cartItem.quantity) {
        return NextResponse.json({ error: `${product.name} is out of stock.` }, { status: 400 });
      }

      const unitPrice = isTesterSize
        ? getTesterPrice(product.id, Number(cartItem.volume_ml) || 2)
        : (product.sale_price ?? product.original_price);

      const itemName = isTesterSize
        ? `${product.name} (${cartItem.volume_ml || 2}ml Tester Vial)`
        : product.name;

      subtotal += unitPrice * cartItem.quantity;
      validatedItems.push({
        product_id: product.id,
        product_name: itemName,
        product_slug: product.slug,
        image_url: product.main_image_url,
        volume_ml: cartItem.volume_ml || product.volume_ml,
        concentration: isTesterSize ? "Sample Vial" : product.concentration,
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * cartItem.quantity,
      });
    }

    // 3. Validate coupon server-side
    let discount = 0;
    let couponId: string | null = null;
    let finalCouponCode: string | null = null;

    if (coupon_code) {
      const now = new Date().toISOString();
      const { data: coupon } = await adminClient
        .from("coupons")
        .select("*")
        .eq("code", coupon_code)
        .eq("is_active", true)
        .single();

      if (coupon && (!coupon.end_date || now <= coupon.end_date)) {
        if (!coupon.minimum_order_value || subtotal >= coupon.minimum_order_value) {
          if (coupon.discount_type === "percentage") {
            discount = Math.floor((subtotal * coupon.discount_value) / 100);
            if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
          } else {
            discount = Math.min(coupon.discount_value, subtotal);
          }
          couponId = coupon.id;
          finalCouponCode = coupon.code;
        }
      }
    }

    // 4. Calculate final total
    const shipping = subtotal >= 1499 ? 0 : 99;
    const total = Math.max(0, subtotal - discount + shipping);
    const orderNumber = generateOrderNumber();

    const whatsappNumber = shipping_address.whatsapp_same
      ? shipping_address.phone
      : (shipping_address.whatsapp || shipping_address.phone);

    // 5. Get current user profile (or create if missing)
    const { data: { user } } = await supabase.auth.getUser();
    let profileId: string | null = null;

    if (user) {
      try {
        const { data: profile } = await adminClient
          .from("profiles")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (profile?.id) {
          profileId = profile.id;
        } else {
          const { data: newProfile } = await adminClient
            .from("profiles")
            .upsert({
              auth_user_id: user.id,
              first_name: shipping_address.first_name || user.user_metadata?.first_name || "",
              last_name: shipping_address.last_name || user.user_metadata?.last_name || "",
              email: (user.email || shipping_address.email || "").toLowerCase(),
              phone: shipping_address.phone || "",
              whatsapp_number: whatsappNumber,
              role: "customer",
            }, { onConflict: "auth_user_id" })
            .select("id")
            .single();
          profileId = newProfile?.id || null;
        }
      } catch {
        profileId = null;
      }
    }

    // 6. Create order in DB using adminClient
    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .insert({
        order_number: orderNumber,
        profile_id: profileId,
        guest_email: user ? null : shipping_address.email,
        status: payment_method === "cod" ? "confirmed" : "pending",
        payment_status: "pending",
        payment_method,
        subtotal,
        discount_amount: discount,
        shipping_amount: shipping,
        total_amount: total,
        coupon_id: couponId,
        coupon_code: finalCouponCode,
        shipping_address: shipping_address,
        whatsapp_number: whatsappNumber,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("Order creation db error:", orderError);
      return NextResponse.json({ error: "Failed to create order: " + (orderError?.message || "DB error") }, { status: 500 });
    }

    // 7. Insert order items matching exact schema
    const { error: itemsError } = await adminClient.from("order_items").insert(
      validatedItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_slug: item.product_slug,
        image_url: item.image_url,
        volume_ml: item.volume_ml,
        concentration: item.concentration,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))
    );

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
    }

    // 8. Deduct stock
    for (const item of validatedItems) {
      const product = products.find((p) => p.id === item.product_id);
      if (product) {
        await adminClient
          .from("products")
          .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
          .eq("id", item.product_id);
      }
    }

    // 9. If COD chosen, return order immediately
    if (payment_method === "cod") {
      return NextResponse.json({
        order_id: order.id,
        order_number: order.order_number,
        payment_method: "cod",
        total,
      });
    }

    // 10. If Razorpay chosen, create Razorpay order if keys exist
    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpayKey && razorpaySecret) {
      try {
        const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString("base64")}`,
          },
          body: JSON.stringify({
            amount: Math.round(total * 100), // in paise
            currency: "INR",
            receipt: order.order_number,
            notes: { order_id: order.id },
          }),
        });

        if (rzpRes.ok) {
          const rzpOrder = await rzpRes.json();
          await adminClient.from("orders").update({ razorpay_order_id: rzpOrder.id }).eq("id", order.id);
          return NextResponse.json({
            order_id: order.id,
            order_number: order.order_number,
            razorpay_order_id: rzpOrder.id,
            razorpay_key: razorpayKey,
            amount: Math.round(total * 100),
            first_name: shipping_address.first_name,
            last_name: shipping_address.last_name,
            email: shipping_address.email,
            phone: shipping_address.phone,
            payment_method: "razorpay",
          });
        }
      } catch (rzpErr) {
        console.error("Razorpay order creation failed:", rzpErr);
      }
    }

    // Fallback if Razorpay credentials not active
    return NextResponse.json({
      order_id: order.id,
      order_number: order.order_number,
      payment_method: "cod",
      total,
    });
  } catch (err: any) {
    console.error("Order creation fatal error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
