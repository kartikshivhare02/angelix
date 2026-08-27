"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

const DEFAULTS = {
  brand_name: "ANGLELIX",
  brand_subtitle: "by Suraj",
  logo_url: "",
  favicon_url: "",
  instagram_url: "",
  whatsapp_number: "",
  support_email: "",
  shipping_charge: 99,
  free_shipping_min: 1499,
  currency: "INR",
  business_address: "",
  razorpay_enabled: true,
  cod_enabled: false,
  order_confirmation_message: "Your order has been placed. We will share tracking updates on WhatsApp.",
  footer_tagline: "",
  seo_title: "",
  seo_description: "",
};

type Settings = typeof DEFAULTS;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({ ...DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => { if (d.settings) setSettings({ ...DEFAULTS, ...d.settings }); })
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: unknown) => setSettings((s) => ({ ...s, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const d = await res.json();
      if (d.error) { toast.error(d.error); return; }
      toast.success("Settings saved successfully.");
    } catch { toast.error("Failed to save settings."); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: "3rem", fontFamily: "var(--font-sans)", color: "#999" }}>Loading settings...</div>;

  return (
    <div style={{ padding: "2.5rem", maxWidth: "760px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin</p>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>Settings</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Brand */}
        <Card title="Brand Identity">
          <Row label="Brand Name">
            <input className="input-base" value={settings.brand_name} onChange={(e) => set("brand_name", e.target.value)} />
          </Row>
          <Row label="Brand Subtitle">
            <input className="input-base" value={settings.brand_subtitle} onChange={(e) => set("brand_subtitle", e.target.value)} placeholder="by Suraj" />
          </Row>
          <Row label="Logo URL">
            <input className="input-base" value={settings.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://... (leave blank to use text logo)" />
          </Row>
          <Row label="Favicon URL">
            <input className="input-base" value={settings.favicon_url ?? ""} onChange={(e) => set("favicon_url", e.target.value)} placeholder="https://..." />
          </Row>
        </Card>

        {/* Contact & Social */}
        <Card title="Contact & Social">
          <Row label="Instagram URL">
            <input className="input-base" value={settings.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/anglelix" />
          </Row>
          <Row label="WhatsApp Number">
            <input className="input-base" value={settings.whatsapp_number ?? ""} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="+91 98765 43210" />
          </Row>
          <Row label="Support Email">
            <input type="email" className="input-base" value={settings.support_email ?? ""} onChange={(e) => set("support_email", e.target.value)} placeholder="support@anglelix.com" />
          </Row>
          <Row label="Business Address">
            <textarea className="input-base" value={settings.business_address ?? ""} onChange={(e) => set("business_address", e.target.value)} rows={3} placeholder="Full business address..." style={{ resize: "vertical" }} />
          </Row>
        </Card>

        {/* Shipping */}
        <Card title="Shipping">
          <Row label="Shipping Charge (₹)">
            <input type="number" min={0} className="input-base" value={settings.shipping_charge} onChange={(e) => set("shipping_charge", Number(e.target.value))} />
          </Row>
          <Row label="Free Shipping Above (₹)">
            <input type="number" min={0} className="input-base" value={settings.free_shipping_min} onChange={(e) => set("free_shipping_min", Number(e.target.value))} />
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#aaa", marginTop: "0.25rem" }}>Set to 0 to always charge shipping. Set to a very high number to never offer free shipping.</p>
          </Row>
          <Row label="Currency">
            <select className="input-base" style={{ width: "fit-content" }} value={settings.currency} onChange={(e) => set("currency", e.target.value)}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </Row>
        </Card>

        {/* Payment Methods */}
        <Card title="Payment Methods">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input type="checkbox" checked={settings.razorpay_enabled} onChange={(e) => set("razorpay_enabled", e.target.checked)} style={{ width: "16px", height: "16px" }} />
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600 }}>Razorpay</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#999" }}>Accept online payments via UPI, cards, net banking, and wallets. Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.</p>
              </div>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
              <input type="checkbox" checked={settings.cod_enabled} onChange={(e) => set("cod_enabled", e.target.checked)} style={{ width: "16px", height: "16px" }} />
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600 }}>Cash on Delivery (COD)</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#999" }}>Allow customers to pay on delivery. Operational risk should be considered.</p>
              </div>
            </label>
          </div>
        </Card>

        {/* Order Messages */}
        <Card title="Order & Notifications">
          <Row label="Order Confirmation Message">
            <textarea className="input-base" value={settings.order_confirmation_message} onChange={(e) => set("order_confirmation_message", e.target.value)} rows={3} style={{ resize: "vertical" }} />
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#aaa", marginTop: "0.25rem" }}>Shown on the order confirmation page.</p>
          </Row>
          <Row label="Footer Tagline">
            <input className="input-base" value={settings.footer_tagline ?? ""} onChange={(e) => set("footer_tagline", e.target.value)} placeholder="A sophisticated fragrance house." />
          </Row>
        </Card>

        {/* SEO */}
        <Card title="SEO Defaults">
          <Row label="Default SEO Title">
            <input className="input-base" value={settings.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} placeholder="ANGLELIX by Suraj — Premium Luxury Fragrances" />
          </Row>
          <Row label="Default SEO Description">
            <textarea className="input-base" value={settings.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} rows={3} placeholder="Discover the ANGLELIX fragrance collection..." style={{ resize: "vertical" }} />
          </Row>
        </Card>

        <div>
          <button onClick={save} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", padding: "1.75rem" }}>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#555", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f0f0f0" }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: "0.4rem" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
