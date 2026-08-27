"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditCouponPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch coupons list and find the one with this id
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((d) => {
        const coupon = (d.coupons ?? []).find((c: any) => c.id === id);
        if (coupon) {
          setForm({
            ...coupon,
            max_discount: coupon.max_discount ?? "",
            usage_limit: coupon.usage_limit ?? "",
            usage_limit_per_customer: coupon.usage_limit_per_customer ?? "",
            start_date: coupon.start_date ?? "",
            end_date: coupon.end_date ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (key: string, value: unknown) => setForm((f: any) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.code?.trim()) { toast.error("Coupon code is required."); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        code: form.code.toUpperCase().trim(),
        max_discount: form.max_discount !== "" ? Number(form.max_discount) : null,
        usage_limit: form.usage_limit !== "" ? Number(form.usage_limit) : null,
        usage_limit_per_customer: form.usage_limit_per_customer !== "" ? Number(form.usage_limit_per_customer) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.error) { toast.error(d.error); return; }
      toast.success("Coupon updated.");
      router.push("/admin/coupons");
    } catch { toast.error("Failed to update coupon."); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: "3rem", fontFamily: "var(--font-sans)", color: "#999" }}>Loading...</div>;
  if (!form) return <div style={{ padding: "3rem", fontFamily: "var(--font-sans)", color: "#999" }}>Coupon not found. <Link href="/admin/coupons">Back</Link></div>;

  return (
    <div style={{ padding: "2.5rem", maxWidth: "680px" }}>
      <Link href="/admin/coupons" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", textDecoration: "none", marginBottom: "1.5rem" }}>
        <ArrowLeft size={14} /> Back to Coupons
      </Link>

      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.5rem", fontWeight: 700, color: "#111", marginBottom: "2rem" }}>Edit Coupon: {form.code}</h1>

      <div style={{ background: "#fff", border: "1px solid #eee", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <section>
          <h2 style={sectionTitle}>Coupon Details</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Coupon Code *</label>
              <input className="input-base" value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} style={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <input className="input-base" value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>
        </section>

        <section>
          <h2 style={sectionTitle}>Discount</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Discount Type</label>
              <select className="input-base" value={form.discount_type} onChange={(e) => set("discount_type", e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Discount Value</label>
              <input type="number" min={0} className="input-base" value={form.discount_value} onChange={(e) => set("discount_value", Number(e.target.value))} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={labelStyle}>Minimum Order Value (₹)</label>
              <input type="number" min={0} className="input-base" value={form.min_order_value} onChange={(e) => set("min_order_value", Number(e.target.value))} />
            </div>
            {form.discount_type === "percentage" && (
              <div>
                <label style={labelStyle}>Maximum Discount Cap (₹)</label>
                <input type="number" min={0} className="input-base" value={form.max_discount} onChange={(e) => set("max_discount", e.target.value)} placeholder="No cap" />
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 style={sectionTitle}>Usage Limits</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Total Usage Limit</label>
              <input type="number" min={0} className="input-base" value={form.usage_limit} onChange={(e) => set("usage_limit", e.target.value)} placeholder="Unlimited" />
            </div>
            <div>
              <label style={labelStyle}>Per Customer Limit</label>
              <input type="number" min={0} className="input-base" value={form.usage_limit_per_customer} onChange={(e) => set("usage_limit_per_customer", e.target.value)} placeholder="Unlimited" />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", marginTop: "0.75rem" }}>Times used: <strong>{form.times_used ?? 0}</strong></p>
        </section>

        <section>
          <h2 style={sectionTitle}>Validity Period</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="date" className="input-base" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Expiry Date</label>
              <input type="date" className="input-base" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
            </div>
          </div>
        </section>

        <section>
          <h2 style={sectionTitle}>Options</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_first_order_only} onChange={(e) => set("is_first_order_only", e.target.checked)} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>First Order Only</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>Active</span>
            </label>
          </div>
        </section>

        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #eee" }}>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/coupons" style={{ padding: "0.65rem 1.25rem", background: "none", border: "1px solid #ddd", fontFamily: "var(--font-sans)", fontSize: "0.82rem", textDecoration: "none", color: "#333", display: "inline-flex", alignItems: "center" }}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700,
  letterSpacing: "0.08em", textTransform: "uppercase", color: "#555",
  marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid #f0f0f0",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-sans)", fontSize: "0.72rem",
  fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: "0.4rem",
};
