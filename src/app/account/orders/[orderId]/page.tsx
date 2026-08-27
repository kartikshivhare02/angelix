"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";
import { CheckCircle, Circle, ArrowLeft, ExternalLink } from "lucide-react";
import Image from "next/image";

function StatusTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const terminalStates: OrderStatus[] = ["cancelled", "refunded"];
  const isTerminal = terminalStates.includes(currentStatus);

  if (isTerminal) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.25rem", background: "#FDECEA", border: "1px solid #FFCDD2" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600, color: "#C62828" }}>
          {ORDER_STATUS_LABELS[currentStatus]}
        </span>
      </div>
    );
  }

  const currentIdx = ORDER_STATUS_STEPS.indexOf(currentStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {ORDER_STATUS_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "20px", height: "20px",
                borderRadius: "50%",
                background: done || active ? "var(--color-text)" : "var(--color-bg-soft)",
                border: `2px solid ${done || active ? "var(--color-text)" : "var(--color-border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
                marginTop: "0.2rem",
              }}>
                {done ? <CheckCircle size={12} color="white" fill="white" /> : active ? <Circle size={8} color="white" fill="white" /> : null}
              </div>
              {idx < ORDER_STATUS_STEPS.length - 1 && (
                <div style={{ width: "2px", height: "28px", background: done ? "var(--color-text)" : "var(--color-border)", marginTop: "2px" }} />
              )}
            </div>
            <div style={{ paddingTop: "0.05rem", paddingBottom: "0.75rem" }}>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                fontWeight: active ? 700 : 400,
                color: done || active ? "var(--color-text)" : "var(--color-text-muted)",
              }}>
                {ORDER_STATUS_LABELS[step]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Fetch the specific order
      const { data, error } = await supabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("id", orderId)
        .eq("profile_id", user.id)
        .single();

      if (error || !data) {
        router.push("/account/orders");
        return;
      }
      setOrder(data as Order);
      setLoading(false);
    };
    init();
  }, [orderId, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "80px", width: "100%" }} />)}
      </div>
    );
  }

  if (!order) return null;

  const addr = order.shipping_address as any;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Link href="/account/orders" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
        <ArrowLeft size={14} strokeWidth={1.5} /> Back to Orders
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 className="heading-editorial" style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            {order.order_number}
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
            Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="order-detail-grid">
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Items */}
          <section style={{ border: "1px solid var(--color-border)", padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Items Ordered
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: "60px", height: "72px", background: "var(--color-bg-soft)", border: "1px solid var(--color-border)", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.product_name} fill unoptimized style={{ objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: "0.65rem" }}>ANG</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600 }}>{item.product_name}</p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                      {item.volume_ml}ML · {item.concentration} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, flexShrink: 0 }}>
                    {formatPrice(item.total_price)}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {([
                ["Subtotal", formatPrice(order.subtotal)],
                ...(order.discount_amount > 0 ? [["Discount", `-${formatPrice(order.discount_amount)}`]] : []),
                ["Shipping", order.shipping_amount === 0 ? "Free" : formatPrice(order.shipping_amount)],
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: label === "Discount" ? "#27ae60" : "var(--color-text)" }}>{value}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--color-border)" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 700 }}>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </section>

          {/* Shipping address */}
          <section style={{ border: "1px solid var(--color-border)", padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Shipping Address
            </h3>
            {addr ? (
              <address style={{ fontStyle: "normal", fontFamily: "var(--font-sans)", fontSize: "0.85rem", lineHeight: 1.7, color: "var(--color-text-muted)" }}>
                <strong style={{ color: "var(--color-text)", display: "block", marginBottom: "0.25rem" }}>
                  {addr.first_name} {addr.last_name}
                </strong>
                {addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}<br />
                {addr.landmark ? `${addr.landmark}, ` : ""}
                {addr.city} — {addr.pincode}<br />
                {addr.state}, {addr.country}<br />
                {addr.phone && <><strong>Phone:</strong> {addr.phone}</>}
              </address>
            ) : (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>—</p>
            )}
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Order timeline */}
          <section style={{ border: "1px solid var(--color-border)", padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Order Status
            </h3>
            <StatusTimeline currentStatus={order.status} />
          </section>

          {/* Tracking */}
          {order.tracking_number && (
            <section style={{ border: "1px solid var(--color-border)", padding: "1.5rem" }}>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                Shipment Tracking
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {order.courier_name && (
                  <div>
                    <span className="label-caps" style={{ color: "var(--color-text-muted)" }}>Courier</span>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", marginTop: "0.2rem" }}>{order.courier_name}</p>
                  </div>
                )}
                <div>
                  <span className="label-caps" style={{ color: "var(--color-text-muted)" }}>Tracking ID</span>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, marginTop: "0.2rem" }}>{order.tracking_number}</p>
                </div>
                {order.tracking_url && (
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", padding: "0.6rem 1.25rem", fontSize: "0.72rem" }}>
                    <ExternalLink size={13} /> Track Order
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Payment info */}
          <section style={{ border: "1px solid var(--color-border)", padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Payment
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {([
                ["Method", order.payment_method === "razorpay" ? "Razorpay (Card/UPI/Net Banking)" : "Cash on Delivery"],
                ["Status", order.payment_status.toUpperCase()],
                ...(order.coupon_code ? [["Coupon", order.coupon_code]] : []),
              ] as [string, string][]).map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .order-detail-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .order-detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
