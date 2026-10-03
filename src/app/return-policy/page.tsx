import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Return & Exchange Policy — ANGELIX by Suraj",
  description: "Read the ANGELIX Return and Exchange Policy — our terms for returns, refunds, and exchanges.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="container-site section-py" style={{ maxWidth: "820px" }}>
      <div style={{ marginBottom: "3rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Legal</p>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "0.75rem" }}>
          Return &amp; Exchange Policy
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
          Last updated: August 2026
        </p>
      </div>

      {/* Notice box */}
      <div style={{ background: "var(--color-cream)", border: "1px solid var(--color-border)", padding: "1.5rem 2rem", marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text)", lineHeight: 1.8 }}>
          <strong>Notice:</strong> Due to the personal and artisanal nature of fine fragrance products and strict hygiene standards, <strong>all sales are final</strong>. We do not accept general returns, refunds, or exchanges. Any return, replacement, or refund requests are strictly subject to review and approval at the sole discretion of the owner / brand management.
        </p>
      </div>

      <div className="legal-body">
        <h2>1. Strict No-Return Policy</h2>
        <p>
          At ANGELIX by Suraj, every bottle is crafted, inspected, and sealed under strict quality controls. For health, safety, and hygiene reasons:
        </p>
        <ul>
          <li>We do <strong>not</strong> accept returns for change of mind or personal scent preference.</li>
          <li>Opened, sprayed, or unsealed fragrance bottles cannot be returned under any circumstances.</li>
          <li>Discovery testers (2ml, 5ml, 10ml) and promotional items are strictly non-returnable.</li>
        </ul>

        <h2>2. Owner Discretion &amp; Damaged Items</h2>
        <p>
          Returns, replacements, or refunds are <strong>strictly held at the discretion of the owner</strong> and brand management. Consideration is granted solely for:
        </p>
        <ul>
          <li>Severe transit damage (broken bottle or damaged atomizer)</li>
          <li>Wrong product delivered due to fulfillment error</li>
        </ul>

        <h2>3. Request Process (Transit Damage or Incorrect Item)</h2>
        <p>If you believe your order qualifies for an owner-discretion evaluation:</p>
        <ul>
          <li>Contact us at <a href="mailto:Surajxsingh41@gmail.com">Surajxsingh41@gmail.com</a> or via WhatsApp at <a href="https://wa.me/917067697646">+91 70676 97646</a> immediately upon delivery.</li>
          <li>Provide your order number, clear unboxing photographs, and uncut video footage demonstrating the issue.</li>
          <li>Our management team will evaluate your case individually and decide whether a replacement or credit is granted.</li>
        </ul>

        <h2>4. Cancellations</h2>
        <p>
          Orders can be cancelled before they enter processing and dispatch. Once an order is dispatched from our fulfillment facility, it cannot be cancelled or returned.
        </p>

        <h2>5. Contact</h2>
        <p>
          For any questions regarding your order or our policies, please contact us at <a href="mailto:Surajxsingh41@gmail.com">Surajxsingh41@gmail.com</a> or reach out to us via <Link href="/contact">our contact page</Link>.
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
      `}</style>
    </div>
  );
}
