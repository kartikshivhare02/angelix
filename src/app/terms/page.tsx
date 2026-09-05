import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — ANGELIX by Suraj",
  description: "Read the Terms & Conditions for ANGELIX by Suraj — governing the use of our website and services.",
};

export default function TermsPage() {
  return (
    <div className="container-site section-py" style={{ maxWidth: "820px" }}>
      <div style={{ marginBottom: "3rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Legal</p>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "0.75rem" }}>
          Terms &amp; Conditions
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
          Last updated: August 2026
        </p>
      </div>

      <div className="legal-body">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the ANGELIX website, you agree to be bound by these Terms &amp; Conditions and our Privacy Policy. If you do not agree, please do not use our website.
        </p>

        <h2>2. Products and Descriptions</h2>
        <p>
          We take care to ensure product descriptions, images, and prices are accurate. However, we reserve the right to correct errors at any time. Product images are for illustration purposes — actual products may vary slightly from photographs.
        </p>

        <h2>3. Pricing</h2>
        <p>
          All prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise. Prices are subject to change without notice. The price at the time of order placement is the applicable price.
        </p>

        <h2>4. Orders</h2>
        <p>
          An order confirmation does not constitute acceptance. We reserve the right to cancel any order at our discretion, including if a product is out of stock, payment fails, or we suspect fraud. You will be notified and refunded if an order is cancelled.
        </p>

        <h2>5. Payment</h2>
        <p>
          Payment must be completed at the time of order for prepaid orders. We accept card payments, UPI, and Net Banking via Razorpay. Cash on Delivery (COD) is available where enabled. We do not store card information.
        </p>

        <h2>6. Intellectual Property</h2>
        <p>
          All content on this website — including the ANGELIX name, logo, photographs, copy, and design — is the intellectual property of ANGELIX by Suraj. You may not use, reproduce, or distribute any content without our prior written permission.
        </p>

        <h2>7. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for losses caused by unauthorized access to your account.
        </p>

        <h2>8. Prohibited Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the website for unlawful purposes</li>
          <li>Attempt to circumvent security measures</li>
          <li>Submit fraudulent orders or payment information</li>
          <li>Scrape, reproduce, or commercially exploit website content</li>
          <li>Interfere with the normal operation of the website</li>
        </ul>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, ANGELIX shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our liability is limited to the amount paid for the specific product in question.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in India.
        </p>

        <h2>11. Changes to Terms</h2>
        <p>
          We reserve the right to update these Terms at any time. Continued use of the website after changes constitutes your acceptance of the new Terms.
        </p>

        <h2>12. Contact</h2>
        <p>
          For queries regarding these Terms, contact us at <a href="mailto:Surajxsingh412@gmail.com">Surajxsingh412@gmail.com</a>.
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
