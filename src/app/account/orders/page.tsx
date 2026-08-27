"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { Package, ChevronRight } from "lucide-react";

function StatusBadge({ status }: { status: Order["status"] }) {
  const colors: Record<string, string> = {
    pending:          "background:#FFF8E1;color:#F59E0B",
    confirmed:        "background:#E8F5E9;color:#27AE60",
    processing:       "background:#E3F2FD;color:#2196F3",
    packed:           "background:#F3E5F5;color:#9C27B0",
    shipped:          "background:#E0F2F1;color:#009688",
    out_for_delivery: "background:#FFF3E0;color:#FF9800",
    delivered:        "background:#E8F5E9;color:#27AE60",
    cancelled:        "background:#FDECEA;color:#E53935",
    refunded:         "background:#FFF3E0;color:#FF9800",
  };

  const styleStr = colors[status] || "background:var(--color-bg-soft);color:var(--color-text-muted)";
  const styleObj: React.CSSProperties = {};
  styleStr.split(";").forEach((pair) => {
    const [prop, val] = pair.split(":");
    if (prop && val) (styleObj as any)[prop.trim().replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())] = val.trim();
  });

  return (
    <span style={{
      ...styleObj,
      fontFamily: "var(--font-sans)",
      fontSize: "0.7rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      padding: "0.25rem 0.65rem",
      borderRadius: "2px",
    }}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const res = await fetch("/api/account/orders");
      if (res.ok) {
        const { orders: data } = await res.json();
        setOrders(data);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "100px", width: "100%" }} />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "4rem 2rem", border: "1px solid var(--color-border)", textAlign: "center", gap: "1.5rem",
      }}>
        <Package size={48} strokeWidth={0.75} style={{ color: "var(--color-border)" }} />
        <div>
          <h2 className="heading-editorial" style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>No orders yet</h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Your order history will appear here once you make a purchase.
          </p>
        </div>
        <Link href="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
        Order History ({orders.length})
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "var(--color-border)" }}>
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "1rem",
              alignItems: "center",
              padding: "1.25rem 1.5rem",
              background: "var(--color-bg)",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-bg-soft)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-bg)")}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.04em" }}>
                  {order.order_number}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {" · "}
                {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                {" · "}
                {formatPrice(order.total_amount)}
              </p>
              {order.items && order.items.length > 0 && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                  {order.items.map((i) => i.product_name).join(", ")}
                </p>
              )}
            </div>
            <ChevronRight size={16} strokeWidth={1.5} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
