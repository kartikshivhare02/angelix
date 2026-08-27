import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy — ANGLELIX by Suraj",
  description: "Read the ANGLELIX Shipping Policy — delivery timelines, costs, and tracking for your orders.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="container-site section-py" style={{ maxWidth: "820px" }}>
      <div style={{ marginBottom: "3rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Legal</p>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "0.75rem" }}>
          Shipping Policy
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
          Last updated: August 2026
        </p>
      </div>

      {/* Key highlights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "var(--color-border)", marginBottom: "3rem" }}>
        {[
          { label: "Free Shipping", value: "Orders above ₹1,499" },
          { label: "Standard Delivery", value: "3–7 Business Days" },
          { label: "Tracking", value: "Via WhatsApp & SMS" },
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
          We currently ship across India. We do not offer international shipping at this time. All orders are dispatched from our fulfillment centre.
        </p>

        <h2>2. Shipping Charges</h2>
        <p>
          Shipping is <strong>free on all orders above ₹1,499</strong>. For orders below this amount, a flat shipping charge of ₹99 applies.
        </p>

        <h2>3. Processing Time</h2>
        <p>
          Orders are typically processed and dispatched within <strong>1–2 business days</strong> of payment confirmation. Orders placed on weekends or public holidays are processed on the next business day.
        </p>

        <h2>4. Delivery Timelines</h2>
        <p>Once dispatched, estimated delivery times are:</p>
        <ul>
          <li><strong>Metro Cities:</strong> 2–4 business days</li>
          <li><strong>Tier 2 Cities:</strong> 3–5 business days</li>
          <li><strong>Remote Locations:</strong> 5–8 business days</li>
        </ul>
        <p>
          Delivery timelines are estimates and may vary due to courier delays, weather conditions, or local disruptions. ANGLELIX is not responsible for delays caused by third-party couriers.
        </p>

        <h2>5. Order Tracking</h2>
        <p>
          Once your order is shipped, you will receive tracking information via WhatsApp and/or email. You can use the tracking number on the courier&apos;s website to monitor your shipment.
        </p>

        <h2>6. Packaging</h2>
        <p>
          All ANGLELIX orders are carefully packed to ensure the products arrive in perfect condition. Fragrances are wrapped and cushioned to prevent breakage during transit.
        </p>

        <h2>7. Failed Delivery Attempts</h2>
        <p>
          If a delivery attempt fails, the courier will typically attempt delivery again. If multiple attempts fail, the package may be returned to us. You will be responsible for re-shipping charges in such cases. Please ensure your shipping address and contact number are accurate.
        </p>

        <h2>8. Damaged or Lost Shipments</h2>
        <p>
          If your order arrives damaged or is lost in transit, please contact us within <strong>48 hours</strong> of the expected delivery date at <a href="mailto:hello@anglelix.com">hello@anglelix.com</a> with your order number and photographs of the damaged packaging. We will investigate and resolve promptly.
        </p>

        <h2>9. Contact</h2>
        <p>
          For shipping queries, contact us at <a href="mailto:hello@anglelix.com">hello@anglelix.com</a> or via WhatsApp.
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
