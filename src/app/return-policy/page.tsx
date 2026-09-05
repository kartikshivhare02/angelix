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
          <strong>Please Note:</strong> Due to the nature of fragrance products and hygiene standards, we do not accept returns of opened or used perfumes unless the product is defective or damaged. Please read this policy carefully before placing an order.
        </p>
      </div>

      <div className="legal-body">
        <h2>1. Return Eligibility</h2>
        <p>We accept returns only in the following cases:</p>
        <ul>
          <li>The product received is <strong>defective, damaged, or broken</strong></li>
          <li>The product received is <strong>different from what was ordered</strong> (wrong product shipped)</li>
          <li>The product is <strong>unopened, unused, and in original packaging</strong> within 7 days of delivery</li>
        </ul>

        <h2>2. Non-Returnable Items</h2>
        <p>The following items are not eligible for return:</p>
        <ul>
          <li>Opened or used perfume bottles</li>
          <li>Products without original packaging</li>
          <li>Sale items or items purchased with a coupon (unless defective)</li>
          <li>Tester products (2ml, 5ml, 10ml)</li>
          <li>Products that show signs of tampering</li>
        </ul>

        <h2>3. How to Initiate a Return</h2>
        <p>To initiate a return, follow these steps:</p>
        <ul>
          <li>Contact us at <a href="mailto:Surajxsingh412@gmail.com">Surajxsingh412@gmail.com</a> within <strong>48 hours</strong> of receiving your order</li>
          <li>Include your order number, reason for return, and clear photographs of the product and packaging</li>
          <li>Our team will review your request within 2 business days</li>
          <li>If approved, we will provide a return shipping address and instructions</li>
        </ul>

        <h2>4. Return Shipping</h2>
        <p>
          If the return is due to our error (wrong product, defective item), we will cover the return shipping cost. For other eligible returns, return shipping charges are the responsibility of the customer.
        </p>

        <h2>5. Refunds</h2>
        <p>
          Once we receive and inspect the returned product, we will process your refund within <strong>5–7 business days</strong>. Refunds will be credited to your original payment method.
        </p>
        <ul>
          <li><strong>Razorpay Payments:</strong> Refunded to the original card/UPI/bank account (2–5 business days)</li>
          <li><strong>COD Orders:</strong> Refunded via bank transfer — please provide your bank details when contacting us</li>
        </ul>

        <h2>6. Exchange Policy</h2>
        <p>
          We currently do not offer direct product exchanges. If you wish to exchange a product, please initiate a return (subject to eligibility) and place a new order for the desired product.
        </p>

        <h2>7. Damaged Products</h2>
        <p>
          If your order arrives damaged, please photograph the packaging and product immediately upon receipt and contact us within <strong>48 hours</strong>. We will arrange a replacement or refund at no additional cost to you.
        </p>

        <h2>8. Cancellations</h2>
        <p>
          Orders can be cancelled only before they are dispatched. To cancel an order, contact us immediately at <a href="mailto:Surajxsingh412@gmail.com">Surajxsingh412@gmail.com</a>. Once dispatched, the order cannot be cancelled and must follow the return process.
        </p>

        <h2>9. Contact</h2>
        <p>
          For all return and refund queries, contact us at <a href="mailto:Surajxsingh412@gmail.com">Surajxsingh412@gmail.com</a> or reach us via <Link href="/contact">our contact page</Link>.
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
