"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const EMPTY = {
  code: "",
  description: "",
  discount_type: "percentage" as "percentage" | "fixed",
  discount_value: 0,
  min_order_value: 0,
  max_discount: "",
  usage_limit: "",
  usage_limit_per_customer: "",
  start_date: "",
  end_date: "",
  is_first_order_only: false,
  is_active: true,
};

export default function NewCouponPage() {
  const router = useRouter();
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.code.trim()) { toast.error("Coupon code is required."); return; }
    if (form.discount_value <= 0) { toast.error("Discount value must be greater than 0."); return; }
    setSaving(true);
    try {
      const body = {
        ...form,
        code: form.code.toUpperCase().trim(),
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        usage_limit_per_customer: form.usage_limit_per_customer ? Number(form.usage_limit_per_customer) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.error) { toast.error(d.error); return; }
      toast.success("Coupon created successfully.");
      router.push("/admin/coupons");
    } catch { toast.error("Failed to create coupon."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ padding: "2.5rem", maxWidth: "680px" }}>
      <Link href="/admin/coupons" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", textDecoration: "none", marginBottom: "1.5rem" }}>
        <ArrowLeft size={14} /> Back to Coupons
      </Link>

      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.5rem", fontWeight: 700, color: "#111", marginBottom: "2rem" }}>Create Coupon</h1>

      <div style={{ background: "#fff", border: "1px solid #eee", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Basic Info */}
        <section>
          <h2 style={sectionTitle}>Coupon Details</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Coupon Code *</label>
              <input
                className="input-base"
                value={form.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10"
                style={{ textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}
              />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#aaa", marginTop: "0.3rem" }}>Code will be converted to uppercase automatically.</p>
            </div>
            <div>
              <label style={labelStyle}>Description (Internal)</label>
              <input className="input-base" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Welcome offer for new customers" />
            </div>
          </div>
        </section>

        {/* Discount */}
        <section>
          <h2 style={sectionTitle}>Discount</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Discount Type *</label>
              <select className="input-base" value={form.discount_type} onChange={(e) => set("discount_type", e.target.value as "percentage" | "fixed")}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Discount Value *</label>
              <input type="number" min={0} className="input-base" value={form.discount_value} onChange={(e) => set("discount_value", Number(e.target.value))} placeholder={form.discount_type === "percentage" ? "e.g. 10" : "e.g. 200"} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div>
              <label style={labelStyle}>Minimum Order Value (₹)</label>
              <input type="number" min={0} className="input-base" value={form.min_order_value} onChange={(e) => set("min_order_value", Number(e.target.value))} placeholder="0" />
            </div>
            {form.discount_type === "percentage" && (
              <div>
                <label style={labelStyle}>Maximum Discount Cap (₹)</label>
                <input type="number" min={0} className="input-base" value={form.max_discount} onChange={(e) => set("max_discount", e.target.value)} placeholder="Leave blank for no cap" />
              </div>
            )}
          </div>
        </section>

        {/* Usage Limits */}
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
        </section>

        {/* Validity */}
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

        {/* Options */}
        <section>
          <h2 style={sectionTitle}>Options</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_first_order_only} onChange={(e) => set("is_first_order_only", e.target.checked)} />
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 500 }}>First Order Only</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#999" }}>Coupon can only be used by customers placing their first order.</p>
              </div>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 500 }}>Active</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#999" }}>Coupon is live and can be used by customers.</p>
              </div>
            </label>
          </div>
        </section>

        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #eee" }}>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Creating..." : "Create Coupon"}
          </button>
          <Link href="/admin/coupons" style={{ padding: "0.65rem 1.25rem", background: "none", border: "1px solid #ddd", fontFamily: "var(--font-sans)", fontSize: "0.82rem", cursor: "pointer", textDecoration: "none", color: "#333", display: "inline-flex", alignItems: "center" }}>
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.78rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#555",
  marginBottom: "1rem",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid #f0f0f0",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#999",
  marginBottom: "0.4rem",
};
