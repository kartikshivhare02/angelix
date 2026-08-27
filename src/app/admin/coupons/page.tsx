"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  usage_limit: number | null;
  usage_limit_per_customer: number | null;
  times_used: number;
  start_date: string | null;
  end_date: string | null;
  is_first_order_only: boolean;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (c: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    const d = await res.json();
    if (d.error) { toast.error(d.error); return; }
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.error) { toast.error(d.error); return; }
    toast.success("Coupon deleted.");
    load();
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin</p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>Coupons</h1>
        </div>
        <Link href="/admin/coupons/new" className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
          <Plus size={15} /> Create Coupon
        </Link>
      </div>

      <div style={{ background: "#fff", border: "1px solid #eee", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", fontFamily: "var(--font-sans)", color: "#999" }}>Loading...</div>
        ) : coupons.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem" }}>No coupons yet</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#bbb" }}>Create discount coupons for your customers.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                {["Code", "Discount", "Min Order", "Usage", "Valid Period", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#999", borderBottom: "1px solid #eee", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.04em" }}>{c.code}</p>
                    {c.description && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#999" }}>{c.description}</p>}
                    {c.is_first_order_only && <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "#8e44ad", fontWeight: 600 }}>First order only</span>}
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600 }}>
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : formatPrice(c.discount_value)}
                    {c.max_discount && <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#999", display: "block" }}>Max {formatPrice(c.max_discount)}</span>}
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#555" }}>
                    {formatPrice(c.min_order_value)}
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>
                    {c.times_used}
                    {c.usage_limit && <span style={{ color: "#999" }}> / {c.usage_limit}</span>}
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#777" }}>
                    {c.start_date ? new Date(c.start_date).toLocaleDateString("en-IN") : "—"}
                    {" → "}
                    {c.end_date ? new Date(c.end_date).toLocaleDateString("en-IN") : "∞"}
                  </td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: c.is_active ? "#27ae60" : "#e74c3c" }}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <button onClick={() => toggle(c)} style={{ background: "none", border: "none", cursor: "pointer", color: c.is_active ? "#27ae60" : "#ccc" }}>
                        {c.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      <Link href={`/admin/coupons/${c.id}`} style={{ color: "#555", display: "flex", padding: "0.3rem" }}>
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => remove(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", display: "flex", padding: "0.3rem" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
