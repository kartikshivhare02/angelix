import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/getSiteSettings";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Return & Exchange Policy — ANGELIX by Suraj",
  description: "Read the ANGELIX Return and Exchange Policy — our terms for returns, refunds, and exchanges.",
};

export default async function ReturnPolicyPage() {
  const settings = await getSiteSettings();
  const email = settings.support_email || "Surajxsingh41@gmail.com";
  const whatsapp = settings.whatsapp_number || "+917067697646";
  const whatsappClean = whatsapp.replace(/\D/g, "");

  return (
    <div className="container-site section-py" style={{ maxWidth: "820px" }}>
      <div style={{ marginBottom: "3rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Legal</p>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "0.75rem" }}>
          Return &amp; Exchange Policy
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
          Strictly Admin &amp; Management Controlled
        </p>
      </div>

      {/* Notice box */}
      <div style={{ background: "var(--color-cream)", border: "1px solid var(--color-border)", padding: "1.5rem 2rem", marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text)", lineHeight: 1.8 }}>
          <strong>Notice:</strong> Due to the personal and artisanal nature of fine fragrance products and strict hygiene standards, <strong>all sales are final</strong>. We do not accept general returns, refunds, or exchanges. Any return, replacement, or refund requests are strictly subject to review and approval at the sole discretion of the brand management/admin.
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

        <h2>2. Owner &amp; Admin Discretion</h2>
        <p>
          Returns, replacements, or refunds are <strong>strictly held at the discretion of the admin</strong> and brand management. Consideration is granted solely for:
        </p>
        <ul>
          <li>Severe transit damage (broken bottle or damaged atomizer)</li>
          <li>Wrong product delivered due to fulfillment error</li>
        </ul>

        <h2>3. Request Process</h2>
        <p>If you believe your order qualifies for an owner/admin evaluation:</p>
        <ul>
          <li>Contact us at <a href={`mailto:${email}`}>{email}</a> or via WhatsApp at <a href={`https://wa.me/${whatsappClean}`}>{whatsapp}</a> immediately upon delivery.</li>
          <li>Provide your order number, clear unboxing photographs, and video footage demonstrating the issue.</li>
          <li>Our management team will evaluate your request and issue approval if eligible.</li>
        </ul>

        <h2>4. Contact</h2>
        <p>
          For any questions regarding your order or our policies, please contact us at <a href={`mailto:${email}`}>{email}</a> or reach out via <Link href="/contact">our contact page</Link>.
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
