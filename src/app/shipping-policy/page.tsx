import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/getSiteSettings";
import { formatPrice } from "@/lib/utils";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Shipping Policy — ANGELIX by Suraj",
  description: "Read the ANGELIX Shipping Policy — delivery timelines, costs, and tracking for your orders.",
};

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();
  const freeMinText = settings.free_shipping_min > 0 ? `Orders above ${formatPrice(settings.free_shipping_min)}` : "All Orders";
  const shippingChargeText = settings.shipping_charge > 0 ? formatPrice(settings.shipping_charge) : "Free";
  const email = settings.support_email || "Surajxsingh41@gmail.com";
  const whatsapp = settings.whatsapp_number || "+917067697646";
  const whatsappClean = whatsapp.replace(/\D/g, "");

  return (
    <div className="container-site section-py" style={{ maxWidth: "820px" }}>
      <div style={{ marginBottom: "3rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Legal</p>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "0.75rem" }}>
          Shipping Policy
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
          Updated with current database settings
        </p>
      </div>

      {/* Key highlights dynamically rendered from settings */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--color-border)", marginBottom: "3rem" }}>
        {[
          { label: "Free Shipping", value: freeMinText },
          { label: "Standard Shipping", value: shippingChargeText },
          { label: "Tracking", value: "Via WhatsApp & Email" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--color-bg-soft)", padding: "1.5rem", textAlign: "center" }}>
            <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>{label}</p>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", fontWeight: 400 }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="legal-body">
        <h2>1. Shipping Coverage</h2>
        <p>
          We currently ship across India. All orders are dispatched directly from our primary fulfillment facility.
        </p>

        <h2>2. Shipping Charges</h2>
        <p>
          {settings.free_shipping_min > 0 ? (
            <>
              Shipping is <strong>free on all orders above {formatPrice(settings.free_shipping_min)}</strong>. For orders below this threshold, a flat shipping fee of <strong>{formatPrice(settings.shipping_charge)}</strong> applies.
            </>
          ) : (
            <>
              Shipping is <strong>free on all orders</strong>.
            </>
          )}
        </p>

        <h2>3. Processing Time</h2>
        <p>
          Orders are processed and dispatched within <strong>1–2 business days</strong> after confirmation. Orders placed on weekends or public holidays are fulfilled on the next business day.
        </p>

        <h2>4. Delivery Timelines</h2>
        <p>Estimated delivery timelines across regions:</p>
        <ul>
          <li><strong>Metro Cities:</strong> 2–4 business days</li>
          <li><strong>Tier 2 Cities:</strong> 3–5 business days</li>
          <li><strong>Remote Locations:</strong> 5–8 business days</li>
        </ul>

        <h2>5. Order Tracking</h2>
        <p>
          As soon as your shipment leaves our warehouse, tracking credentials are dispatched via WhatsApp and Email.
        </p>

        <h2>6. Failed Delivery Attempts</h2>
        <p>
          If a delivery attempt fails, the courier will make subsequent attempts. Please verify your delivery address and mobile contact number at checkout.
        </p>

        <h2>7. Contact</h2>
        <p>
          For shipping inquiries, email us at <a href={`mailto:${email}`}>{email}</a> or WhatsApp us at <a href={`https://wa.me/${whatsappClean}`}>{whatsapp}</a>.
        </p>
      </div>

      <style>{`
        .legal-body { font-family: var(--font-sans); color: var(--color-text); }
        .legal-body h2 { font-family: var(--font-sans); font-size: 1rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; margin-top: 2.5rem; margin-bottom: 0.75rem; color: var(--color-text); }
        .legal-body p { font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.85; margin-bottom: 1rem; }
        .legal-body ul { margin-left: 1.5rem; margin-bottom: 1rem; }
        .legal-body ul li { font-size: 0.9rem; color: var(--color-text-muted); line-height: 1.85; margin-bottom: 0.4rem; }
        .legal-body a { color: var(--color-text); }
        .legal-body strong { color: var(--color-text); font-weight: 600; }
        @media (max-width: 600px) {
          .shipping-highlights { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
