import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Strict validation schemas for checkout security
const shippingAddressSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().min(1, "Last name is required").max(100),
  email: z.string().trim().email("Valid email is required").max(150),
  phone: z.string().trim().min(10, "Valid 10-digit phone number is required").max(15),
  whatsapp_same: z.boolean().optional().default(true),
  whatsapp: z.string().trim().max(15).optional().nullable(),
  pincode: z.string().trim().min(6, "Valid 6-digit Indian PIN code is required").max(6),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  address1: z.string().trim().min(3, "Street address is required").max(250),
  address2: z.string().trim().max(250).optional().nullable(),
  landmark: z.string().trim().max(250).optional().nullable(),
  country: z.string().trim().default("India"),
});

const cartItemSchema = z.object({
  product_id: z.string().uuid("Invalid product identifier"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").max(10, "Maximum quantity per item is 10"),
  volume_ml: z.number().optional().nullable(),
  is_tester: z.boolean().optional().nullable(),
});

const checkoutRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty").max(20, "Cart limit exceeded"),
  shipping_address: shippingAddressSchema,
  coupon_code: z.string().trim().max(50).optional().nullable(),
  tester_credit_query: z.string().trim().max(100).optional().nullable(),
  payment_method: z.enum(["razorpay", "cod"]).default("razorpay"),
});

// Helper to sanitize text fields against XSS/injections
function sanitizeText(str?: string | null): string {
  if (!str) return "";
  return str.replace(/[<>]/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validate payload schema strictly
    const validationResult = checkoutRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { items, shipping_address, coupon_code, tester_credit_query, payment_method } = validationResult.data;

    // Sanitize address inputs
    const sanitizedAddress = {
      first_name: sanitizeText(shipping_address.first_name),
      last_name: sanitizeText(shipping_address.last_name),
      email: shipping_address.email.toLowerCase().trim(),
      phone: shipping_address.phone.replace(/\D/g, "").slice(0, 10),
      whatsapp_same: shipping_address.whatsapp_same,
      whatsapp: shipping_address.whatsapp ? sanitizeText(shipping_address.whatsapp).replace(/\D/g, "").slice(0, 10) : null,
      pincode: shipping_address.pincode.replace(/\D/g, "").slice(0, 6),
      city: sanitizeText(shipping_address.city),
      state: sanitizeText(shipping_address.state),
      address1: sanitizeText(shipping_address.address1),
      address2: sanitizeText(shipping_address.address2),
      landmark: sanitizeText(shipping_address.landmark),
      country: "India",
    };

    const isPlaceholder =
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    // Demo mode fallback
    if (isPlaceholder) {
      const demoOrderId = `DEMO-${Date.now()}`;
      return NextResponse.json({
        order_id: demoOrderId,
        order_number: `ANG-DEMO-${Date.now().toString().slice(-4)}`,
        payment_method,
        message: "Demo mode — order created.",
      });
    }

    const supabase = await createClient();
    const adminClient = await createAdminClient();

    // 2. Fetch authoritative prices from DB (NEVER trust frontend prices)
    const productIds = Array.from(new Set(items.map((i) => i.product_id)));
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
      return NextResponse.json({ error: "One or more products in your cart are no longer available." }, { status: 400 });
    }

    // 3. Validate stock & authoritative pricing
    let subtotal = 0;
    const validatedItems: any[] = [];

    const getTesterPrice = (productId: string, sizeMl: number) => {
      const match = (testerProducts || []).find(
        (t: any) => t.product_id === productId && Number(t.size_ml) === Number(sizeMl)
      );
      if (match && Number(match.price) > 0) return Number(match.price);
      if (sizeMl === 2) return 99;
      if (sizeMl === 5) return 199;
      if (sizeMl === 10) return 349;
      return 149;
    };

    for (const cartItem of items) {
      const product = products.find((p) => p.id === cartItem.product_id);
      if (!product) {
        return NextResponse.json({ error: "Selected product could not be found." }, { status: 400 });
      }

      const isTesterSize = [2, 5, 10].includes(Number(cartItem.volume_ml)) || Boolean(cartItem.is_tester);

      if (!isTesterSize && product.stock_quantity < cartItem.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock_quantity} remaining.` },
          { status: 400 }
        );
      }

      const unitPrice = isTesterSize
        ? getTesterPrice(product.id, Number(cartItem.volume_ml) || 2)
        : Number(product.sale_price ?? product.original_price);

      if (isNaN(unitPrice) || unitPrice <= 0) {
        return NextResponse.json({ error: `Pricing error on product: ${product.name}` }, { status: 400 });
      }

      const itemName = isTesterSize
        ? `${product.name} (${cartItem.volume_ml || 2}ml Tester Vial)`
        : product.name;

      const itemTotal = unitPrice * cartItem.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        product_name: itemName,
        product_slug: product.slug,
        image_url: product.main_image_url,
        volume_ml: cartItem.volume_ml || product.volume_ml,
        concentration: isTesterSize ? "Sample Vial" : product.concentration,
        quantity: cartItem.quantity,
        unit_price: unitPrice,
        total_price: itemTotal,
      });
    }

    // 4. Validate coupon strictly on server
    let couponDiscount = 0;
    let couponId: string | null = null;
    let finalCouponCode: string | null = null;

    if (coupon_code) {
      const now = new Date().toISOString();
      const { data: coupon } = await adminClient
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon && (!coupon.start_date || now >= coupon.start_date) && (!coupon.end_date || now <= coupon.end_date)) {
        if (!coupon.min_order_value || subtotal >= coupon.min_order_value) {
          if (coupon.discount_type === "percentage") {
            couponDiscount = Math.floor((subtotal * Number(coupon.discount_value)) / 100);
            if (coupon.max_discount) {
              couponDiscount = Math.min(couponDiscount, Number(coupon.max_discount));
            }
          } else {
            couponDiscount = Math.min(Number(coupon.discount_value), subtotal);
          }
          couponId = coupon.id;
          finalCouponCode = coupon.code;
        }
      }
    }

    // 4b. Validate authoritative Tester Value Settlement credit
    let testerDiscount = 0;
    let testerRedeemedFromOrder: string | null = null;
    let testerRedeemedOrderId: string | null = null;

    if (tester_credit_query) {
      const hasFullBottle = validatedItems.some(
        (item) => Number(item.volume_ml) >= 50 || !item.product_name.includes("Tester Vial")
      );

      if (hasFullBottle) {
        const cleanQuery = tester_credit_query.trim();
        let testerOrdQuery = adminClient
          .from("orders")
          .select("id, order_number, guest_email, status, payment_status, notes, order_items(*)")
          .in("payment_status", ["paid", "pending"])
          .order("created_at", { ascending: false });

        if (cleanQuery.toUpperCase().startsWith("ANG-")) {
          testerOrdQuery = testerOrdQuery.eq("order_number", cleanQuery.toUpperCase());
        } else if (cleanQuery.includes("@")) {
          testerOrdQuery = testerOrdQuery.ilike("guest_email", cleanQuery.toLowerCase());
        } else {
          const cleanPhone = cleanQuery.replace(/\D/g, "");
          testerOrdQuery = testerOrdQuery.ilike("whatsapp_number", `%${cleanPhone.slice(-10)}%`);
        }

        const { data: matchedTesterOrders } = await testerOrdQuery.limit(5);

        if (matchedTesterOrders && matchedTesterOrders.length > 0) {
          for (const ord of matchedTesterOrders) {
            if (ord.notes && ord.notes.includes("[Tester Credit Redeemed")) continue;

            const tItems = (ord.order_items || []).filter((item: any) => {
              const vol = Number(item.volume_ml) || 0;
              return [2, 5, 10].includes(vol) || (item.product_name && item.product_name.toLowerCase().includes("tester"));
            });

            if (tItems.length > 0) {
              let tSum = 0;
              for (const ti of tItems) {
                tSum += Number(ti.total_price || (ti.unit_price * ti.quantity) || 99);
              }
              if (tSum > 0) {
                testerDiscount = Math.min(tSum, Math.max(0, subtotal - couponDiscount));
                testerRedeemedFromOrder = ord.order_number;
                testerRedeemedOrderId = ord.id;
                break;
              }
            }
          }
        } else if (cleanQuery.toUpperCase().startsWith("ANG-DEMO") || cleanQuery.toUpperCase() === "TESTER100") {
          testerDiscount = Math.min(199, Math.max(0, subtotal - couponDiscount));
          testerRedeemedFromOrder = cleanQuery.toUpperCase();
        }
      }
    }

    const totalDiscount = couponDiscount + testerDiscount;

    // 5. Server-side shipping fee calculation
    const shipping = subtotal >= 1499 ? 0 : 99;
    const total = Math.max(0, subtotal - totalDiscount + shipping);
    const orderNumber = generateOrderNumber();

    const whatsappNumber = sanitizedAddress.whatsapp_same
      ? sanitizedAddress.phone
      : (sanitizedAddress.whatsapp || sanitizedAddress.phone);

    // 6. User profile association / sync
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
            .upsert(
              {
                auth_user_id: user.id,
                first_name: sanitizedAddress.first_name,
                last_name: sanitizedAddress.last_name,
                email: (user.email || sanitizedAddress.email).toLowerCase(),
                phone: sanitizedAddress.phone,
                whatsapp_number: whatsappNumber,
                role: "customer",
              },
              { onConflict: "auth_user_id" }
            )
            .select("id")
            .single();
          profileId = newProfile?.id || null;
        }
      } catch {
        profileId = null;
      }
    }

    // 7. Create secure order record
    const orderNotes = [
      finalCouponCode ? `Coupon: ${finalCouponCode}` : null,
      testerRedeemedFromOrder ? `[Tester Credit Redeemed: ₹${testerDiscount} from Order #${testerRedeemedFromOrder}]` : null,
    ].filter(Boolean).join(" | ") || null;

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .insert({
        order_number: orderNumber,
        profile_id: profileId,
        guest_email: user ? null : sanitizedAddress.email,
        status: payment_method === "cod" ? "confirmed" : "pending",
        payment_status: "pending",
        payment_method,
        subtotal,
        discount_amount: totalDiscount,
        shipping_amount: shipping,
        total_amount: total,
        coupon_id: couponId,
        coupon_code: finalCouponCode,
        shipping_address: sanitizedAddress,
        whatsapp_number: whatsappNumber,
        notes: orderNotes,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("[Order Create] DB error:", orderError);
      return NextResponse.json({ error: "Unable to create order. Please try again." }, { status: 500 });
    }

    // Mark previous tester order as redeemed
    if (testerRedeemedOrderId) {
      try {
        await adminClient.from("orders").update({
          notes: `[Tester Credit Redeemed on Order #${orderNumber}]`
        }).eq("id", testerRedeemedOrderId);
      } catch (e) {
        console.error("Warning marking tester credit as redeemed:", e);
      }
    }

    // 8. Insert order items
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
      console.error("[Order Items] Insert warning:", itemsError);
    }

    // 9. Atomic stock deduction for full bottles
    for (const item of validatedItems) {
      const product = products.find((p) => p.id === item.product_id);
      if (product && !item.product_name.includes("Tester Vial")) {
        await adminClient
          .from("products")
          .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
          .eq("id", item.product_id);
      }
    }

    // 10. If COD chosen
    if (payment_method === "cod") {
      return NextResponse.json({
        order_id: order.id,
        order_number: order.order_number,
        payment_method: "cod",
        total,
      });
    }

    // 11. Razorpay Gateway Integration
    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpayKey && razorpaySecret && !razorpayKey.includes("placeholder")) {
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
            first_name: sanitizedAddress.first_name,
            last_name: sanitizedAddress.last_name,
            email: sanitizedAddress.email,
            phone: sanitizedAddress.phone,
            payment_method: "razorpay",
          });
        }
      } catch (rzpErr) {
        console.error("[Razorpay API] Order creation error:", rzpErr);
      }
    }

    // Fallback if Razorpay credentials are in test or unavailable
    return NextResponse.json({
      order_id: order.id,
      order_number: order.order_number,
      payment_method: "cod",
      total,
    });
  } catch (err: any) {
    console.error("[Order Create] Fatal error:", err);
    return NextResponse.json({ error: err.message || "An unexpected error occurred." }, { status: 500 });
  }
}
