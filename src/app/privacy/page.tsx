import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ANGLELIX by Suraj",
  description: "Read the ANGLELIX Privacy Policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-site section-py" style={{ maxWidth: "820px" }}>
      <div style={{ marginBottom: "3rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Legal</p>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", marginBottom: "0.75rem" }}>
          Privacy Policy
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
          Last updated: August 2026
        </p>
      </div>

      <div className="legal-body">
        <h2>1. Introduction</h2>
        <p>
          ANGLELIX by Suraj (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the website anglelix.com. This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you visit our website or make a purchase.
        </p>

        <h2>2. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul>
          <li><strong>Personal Identification:</strong> Name, email address, phone number, WhatsApp number.</li>
          <li><strong>Shipping Information:</strong> Delivery address, city, state, PIN code.</li>
          <li><strong>Order Information:</strong> Products purchased, quantities, payment status, order history.</li>
          <li><strong>Account Information:</strong> Username, password (hashed and stored securely via Supabase Auth), preferences.</li>
          <li><strong>Technical Information:</strong> IP address, browser type, device, pages visited, time spent on pages.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Process and fulfil your orders</li>
          <li>Send order confirmations and shipment updates via WhatsApp</li>
          <li>Respond to customer service requests</li>
          <li>Improve our website and product offerings</li>
          <li>Send promotional communications (only with your consent)</li>
          <li>Detect and prevent fraudulent activity</li>
        </ul>

        <h2>4. Payment Information</h2>
        <p>
          All payments are processed by Razorpay, a PCI-DSS compliant payment gateway. We do not store your card details. Razorpay&apos;s own Privacy Policy governs how they handle your payment information.
        </p>

        <h2>5. Sharing Your Information</h2>
        <p>We do not sell your personal information. We may share your information with:</p>
        <ul>
          <li><strong>Payment processors:</strong> Razorpay, for payment processing.</li>
          <li><strong>Shipping partners:</strong> Courier companies, to fulfil your orders.</li>
          <li><strong>Service providers:</strong> Supabase, for database and authentication services.</li>
          <li><strong>Legal authorities:</strong> When required by law or to protect our rights.</li>
        </ul>

        <h2>6. Cookies</h2>
        <p>
          We use cookies and similar technologies to maintain your session, remember cart contents, and understand how visitors use our site. You can disable cookies in your browser settings, though this may affect website functionality.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We implement industry-standard security measures including SSL encryption, secure authentication (Supabase Auth), and restricted access to personal data. However, no method of transmission over the internet is 100% secure.
        </p>

        <h2>8. Data Retention</h2>
        <p>
          We retain your personal data for as long as necessary to fulfil the purposes described in this policy, comply with legal obligations, and resolve disputes. You may request deletion of your account by contacting us.
        </p>

        <h2>9. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Opt out of marketing communications at any time</li>
        </ul>

        <h2>10. Children&apos;s Privacy</h2>
        <p>
          Our website is not directed at children under 13. We do not knowingly collect personal information from children.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised date. Continued use of our website after changes constitutes acceptance.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          For any privacy-related questions, contact us at <a href="mailto:hello@anglelix.com">hello@anglelix.com</a>.
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
