"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const STATUSES = [
  { value: "", label: "All Orders" },
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

const PAYMENT_COLORS: Record<string, string> = {
  paid: "#27ae60",
  pending: "#f39c12",
  failed: "#e74c3c",
  refunded: "#7f8c8d",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders ?? []); setTotal(d.total ?? 0); })
      .finally(() => setLoading(false));
  }, [status, page]);

  const totalPages = Math.ceil(total / limit);

  const handleStatusChange = (s: string) => {
    setStatus(s);
    setPage(1);
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin</p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>Orders</h1>
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#666" }}>{total} total orders</p>
      </div>

      {/* Status tabs */}
      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginBottom: "1.5rem", borderBottom: "1px solid #eee", paddingBottom: "0" }}>
        {STATUSES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleStatusChange(value)}
            style={{
              padding: "0.55rem 1rem",
              background: "none",
              border: "none",
              borderBottom: status === value ? "2px solid #111" : "2px solid transparent",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: status === value ? 600 : 400,
              color: status === value ? "#111" : "#999",
              cursor: "pointer",
              marginBottom: "-1px",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #eee", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#999" }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem" }}>No orders found</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#bbb" }}>Orders will appear here once customers make purchases.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                {["Order", "Customer", "Phone", "Amount", "Payment", "Status", "Date", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#999", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const addr = order.shipping_address ?? {};
                const sc = STATUS_COLORS[order.status] ?? { bg: "#eee", color: "#333" };
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f5f5f5" }} className="hover:bg-gray-50">
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <Link href={`/admin/orders/${order.id}`} style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600, color: "#111", textDecoration: "none" }}>
                        #{order.order_number}
                      </Link>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}>
                      {addr.first_name} {addr.last_name}
                      {addr.city && <span style={{ color: "#999", fontSize: "0.72rem", display: "block" }}>{addr.city}</span>}
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#555" }}>
                      {addr.phone ?? "—"}
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600 }}>
                      {formatPrice(order.total_amount)}
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: PAYMENT_COLORS[order.payment_status] ?? "#333", textTransform: "uppercase" }}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <span style={{ padding: "0.2rem 0.65rem", background: sc.bg, color: sc.color, fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderRadius: "2px" }}>
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", whiteSpace: "nowrap" }}>
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "0.9rem 1rem" }}>
                      <Link href={`/admin/orders/${order.id}`} style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#111", textDecoration: "underline" }}>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: "0.5rem 1rem", background: page === 1 ? "#f5f5f5" : "#111", color: page === 1 ? "#ccc" : "#fff", border: "none", fontFamily: "var(--font-sans)", fontSize: "0.78rem", cursor: page === 1 ? "not-allowed" : "pointer" }}>
            Prev
          </button>
          <span style={{ padding: "0.5rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#666" }}>
            Page {page} of {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: "0.5rem 1rem", background: page === totalPages ? "#f5f5f5" : "#111", color: page === totalPages ? "#ccc" : "#fff", border: "none", fontFamily: "var(--font-sans)", fontSize: "0.78rem", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
