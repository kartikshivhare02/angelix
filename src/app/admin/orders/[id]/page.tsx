"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { formatPrice, formatProductSize } from "@/lib/utils";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const TIMELINE = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "processing", label: "Processing", icon: Package },
  { status: "packed", label: "Packed", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_INDEX: Record<string, number> = Object.fromEntries(
  TIMELINE.map((t, i) => [t.status, i])
);

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:          { bg: "#fef3cd", color: "#856404" },
  confirmed:        { bg: "#cff4fc", color: "#087990" },
  processing:       { bg: "#d4edff", color: "#1565c0" },
  packed:           { bg: "#e8d5f5", color: "#6f2da8" },
  shipped:          { bg: "#d1ecf1", color: "#0c5460" },
  out_for_delivery: { bg: "#fff3cd", color: "#664d03" },
  delivered:        { bg: "#d4edda", color: "#155724" },
  cancelled:        { bg: "#f8d7da", color: "#721c24" },
  refunded:         { bg: "#e2e3e5", color: "#383d41" },
};

const FIELD = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.3rem" }}>{label}</p>
    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#111" }}>{children}</div>
  </div>
);

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [shipping, setShipping] = useState({ courier_name: "", tracking_number: "", tracking_url: "", estimated_delivery: "" });

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.order) {
          setOrder(d.order);
          setNewStatus(d.order.status);
          setShipping({
            courier_name: d.order.courier_name ?? "",
            tracking_number: d.order.tracking_number ?? "",
            tracking_url: d.order.tracking_url ?? "",
            estimated_delivery: d.order.estimated_delivery ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const saveStatus = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = { status: newStatus };
      if (newStatus === "shipped" || newStatus === "out_for_delivery") {
        Object.assign(body, shipping);
      }
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.error) { toast.error(d.error); return; }
      setOrder(d.order);
      toast.success("Order updated successfully.");
    } catch { toast.error("Failed to update order."); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", fontFamily: "var(--font-sans)", color: "#999" }}>Loading order...</div>;
  }

  if (!order) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-sans)", color: "#999" }}>Order not found.</p>
        <Link href="/admin/orders" style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#111", textDecoration: "underline" }}>← Back to Orders</Link>
      </div>
    );
  }

  const addr = order.shipping_address ?? {};
  const profile = order.profile;
  const currentIdx = STATUS_INDEX[order.status] ?? -1;
  const sc = STATUS_COLORS[order.status] ?? { bg: "#eee", color: "#333" };

  return (
    <div style={{ padding: "2.5rem", maxWidth: "1000px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/admin/orders" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", textDecoration: "none", marginBottom: "1rem" }}>
          <ArrowLeft size={14} /> Back to Orders
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.5rem", fontWeight: 700, color: "#111" }}>Order #{order.order_number}</h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#999", marginTop: "0.25rem" }}>
              Placed on {new Date(order.created_at).toLocaleString("en-IN")}
            </p>
          </div>
          <span style={{ padding: "0.3rem 0.85rem", background: sc.bg, color: sc.color, fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {order.status?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", alignItems: "start" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Order Items */}
          <section style={{ background: "#fff", border: "1px solid #eee", padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Order Items</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(order.items ?? []).map((item: any) => (
                <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "center", paddingBottom: "1rem", borderBottom: "1px solid #f5f5f5" }}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name} style={{ width: "60px", height: "60px", objectFit: "cover", flexShrink: 0, background: "#f5f5f5" }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600 }}>{item.product_name}</p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999" }}>{formatProductSize(item.volume_ml, item)} · {item.concentration}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600 }}>{formatPrice(item.total_price)}</p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999" }}>Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {([ 
                ["Subtotal", formatPrice(order.subtotal)],
                order.discount_amount > 0 ? ["Discount", `-${formatPrice(order.discount_amount)}`] : null,
                ["Shipping", formatPrice(order.shipping_amount)],
                order.tax_amount > 0 ? ["Tax", formatPrice(order.tax_amount)] : null,
              ].filter(Boolean) as string[][]).map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#999" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: label === "Discount" ? "#27ae60" : "#333" }}>{value}</span>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem", borderTop: "1px solid #eee" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1rem" }}>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </section>

          {/* Order Timeline */}
          {order.status !== "cancelled" && order.status !== "refunded" && (
            <section style={{ background: "#fff", border: "1px solid #eee", padding: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Order Timeline</h2>
              <div style={{ display: "flex", gap: "0", position: "relative" }}>
                {TIMELINE.map((step, i) => {
                  const done = i <= currentIdx;
                  const current = i === currentIdx;
                  const Icon = step.icon;
                  return (
                    <div key={step.status} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {i < TIMELINE.length - 1 && (
                        <div style={{ position: "absolute", top: "14px", left: "50%", right: "-50%", height: "2px", background: done && i < currentIdx ? "#111" : "#eee", zIndex: 0 }} />
                      )}
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: done ? "#111" : "#eee", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, border: current ? "2px solid #111" : "none" }}>
                        <Icon size={13} color={done ? "#fff" : "#ccc"} />
                      </div>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: done ? "#111" : "#ccc", textAlign: "center", marginTop: "0.4rem", maxWidth: "60px" }}>{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Update Status */}
          <section style={{ background: "#fff", border: "1px solid #eee", padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Update Order</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-base"
                  style={{ width: "100%" }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {(newStatus === "shipped" || newStatus === "out_for_delivery") && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Courier Name</label>
                    <input className="input-base" placeholder="e.g. Delhivery" value={shipping.courier_name} onChange={(e) => setShipping(s => ({ ...s, courier_name: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Tracking Number</label>
                    <input className="input-base" placeholder="AWB Number" value={shipping.tracking_number} onChange={(e) => setShipping(s => ({ ...s, tracking_number: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Tracking URL</label>
                    <input className="input-base" placeholder="https://..." value={shipping.tracking_url} onChange={(e) => setShipping(s => ({ ...s, tracking_url: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: "#999", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.4rem" }}>Estimated Delivery</label>
                    <input type="date" className="input-base" value={shipping.estimated_delivery} onChange={(e) => setShipping(s => ({ ...s, estimated_delivery: e.target.value }))} />
                  </div>
                </div>
              )}

              <button onClick={saveStatus} disabled={saving} className="btn-primary" style={{ width: "fit-content", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Customer */}
          <section style={{ background: "#fff", border: "1px solid #eee", padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Customer</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <FIELD label="Name">{addr.first_name} {addr.last_name}</FIELD>
              <FIELD label="Email">{profile?.email ?? order.guest_email ?? "—"}</FIELD>
              <FIELD label="Phone">{addr.phone ?? "—"}</FIELD>
              {order.whatsapp_number && <FIELD label="WhatsApp">{order.whatsapp_number}</FIELD>}
            </div>
          </section>

          {/* Shipping Address */}
          <section style={{ background: "#fff", border: "1px solid #eee", padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Shipping Address</h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", lineHeight: 1.7, color: "#333" }}>
              {addr.first_name} {addr.last_name}<br />
              {addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}<br />
              {addr.landmark && <>{addr.landmark}<br /></>}
              {addr.city}, {addr.state} — {addr.pincode}<br />
              {addr.country}
            </p>
          </section>

          {/* Payment */}
          <section style={{ background: "#fff", border: "1px solid #eee", padding: "1.5rem" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Payment</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <FIELD label="Method">{order.payment_method?.toUpperCase()}</FIELD>
              <FIELD label="Status">
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", color: order.payment_status === "paid" ? "#27ae60" : "#e74c3c" }}>
                  {order.payment_status}
                </span>
              </FIELD>
              {order.razorpay_order_id && <FIELD label="Razorpay Order ID"><span style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>{order.razorpay_order_id}</span></FIELD>}
              {order.razorpay_payment_id && <FIELD label="Payment ID"><span style={{ fontSize: "0.75rem", wordBreak: "break-all" }}>{order.razorpay_payment_id}</span></FIELD>}
              {order.coupon_code && <FIELD label="Coupon">{order.coupon_code}</FIELD>}
            </div>
          </section>

          {/* Shipping Info (if shipped) */}
          {order.courier_name && (
            <section style={{ background: "#fff", border: "1px solid #eee", padding: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>Tracking</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                <FIELD label="Courier">{order.courier_name}</FIELD>
                <FIELD label="Tracking No.">{order.tracking_number}</FIELD>
                {order.tracking_url && (
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#111", textDecoration: "underline" }}>
                    Track Package →
                  </a>
                )}
                {order.estimated_delivery && <FIELD label="Est. Delivery">{new Date(order.estimated_delivery).toLocaleDateString("en-IN")}</FIELD>}
              </div>
            </section>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .order-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
