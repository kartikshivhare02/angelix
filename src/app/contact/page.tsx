"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle, AtSign } from "lucide-react";

export default function ContactPage() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // Simulate — in production, wire this to your email or WhatsApp API
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    toast.success("Message sent! We'll get back to you shortly.");
    setSending(false);
  };

  return (
    <div>
      {/* Header */}
      <section style={{ padding: "6rem 0 5rem", background: "var(--color-bg-soft)", borderBottom: "1px solid var(--color-border)", textAlign: "center" }}>
        <div className="container-site">
          <p className="label-caps animate-fade-up" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>Get in Touch</p>
          <h1 className="heading-editorial animate-fade-up delay-100" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Contact Us
          </h1>
          <p className="animate-fade-up delay-200" style={{ fontFamily: "var(--font-sans)", fontSize: "0.92rem", color: "var(--color-text-muted)", maxWidth: "440px", margin: "1.5rem auto 0", lineHeight: 1.8 }}>
            Have a question about your order, a fragrance, or anything else? We are here to help.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container-site section-py">
        <div className="contact-grid">

          {/* Form */}
          <div>
            {sent ? (
              <div style={{ border: "1px solid var(--color-border)", padding: "3rem", textAlign: "center" }}>
                <h2 className="heading-editorial" style={{ fontSize: "2rem", marginBottom: "1rem" }}>Thank You</h2>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.8 }}>
                  Your message has been received. We typically respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label htmlFor="name" className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Name</label>
                    <input id="name" name="name" required className="input-base" placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="email_c" className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Email</label>
                    <input id="email_c" name="email" type="email" required className="input-base" placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="order_no" className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Order Number (Optional)</label>
                  <input id="order_no" name="order_no" className="input-base" placeholder="ANG-2026-XXXXXX" />
                </div>
                <div>
                  <label htmlFor="subject" className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Subject</label>
                  <select id="subject" name="subject" required className="input-base" style={{ cursor: "pointer" }}>
                    <option value="">Select a topic</option>
                    <option>Order Status / Tracking</option>
                    <option>Return / Exchange</option>
                    <option>Product Inquiry</option>
                    <option>Payment Issue</option>
                    <option>General Query</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="label-caps" style={{ color: "var(--color-text-muted)", display: "block", marginBottom: "0.4rem" }}>Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="input-base"
                    placeholder="Write your message here..."
                    style={{ resize: "vertical" }}
                  />
                </div>
                <button type="submit" disabled={sending} className="btn-primary" style={{ alignSelf: "flex-start", minWidth: "160px", justifyContent: "center" }}>
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Info panel */}
          <aside>
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

              <div style={{ border: "1px solid var(--color-border)", padding: "2rem" }}>
                <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
                  Reach Us Directly
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <a
                    href="mailto:Surajxsingh412@gmail.com"
                    style={{ display: "flex", alignItems: "center", gap: "0.875rem", textDecoration: "none", color: "var(--color-text)" }}
                  >
                    <div style={{ width: "40px", height: "40px", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Mail size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>Email</p>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>Surajxsingh412@gmail.com</p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/917067697646"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "0.875rem", textDecoration: "none", color: "var(--color-text)" }}
                  >
                    <div style={{ width: "40px", height: "40px", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MessageCircle size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>WhatsApp</p>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>+91 70676 97646</p>
                    </div>
                  </a>

                  <a
                    href="https://instagram.com/angelix"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "0.875rem", textDecoration: "none", color: "var(--color-text)" }}
                  >
                    <div style={{ width: "40px", height: "40px", border: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <AtSign size={16} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.2rem" }}>Instagram</p>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>@angelix</p>
                    </div>
                  </a>
                </div>
              </div>

              <div style={{ border: "1px solid var(--color-border)", padding: "2rem", background: "var(--color-bg-soft)" }}>
                <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  Response Time
                </h2>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.75 }}>
                  We aim to respond to all inquiries within <strong style={{ color: "var(--color-text)" }}>24 hours</strong> on business days.
                  For urgent order issues, WhatsApp is the fastest way to reach us.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <style>{`
          .contact-grid {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 3rem;
            align-items: start;
          }
          @media (max-width: 900px) {
            .contact-grid { grid-template-columns: 1fr; }
          }
          @media (max-width: 640px) {
            .contact-grid form > div:first-child {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>
    </div>
  );
}
