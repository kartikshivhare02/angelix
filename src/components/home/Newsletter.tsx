"use client";

import { useState } from "react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Could not subscribe. Please try again.");
        return;
      }
      setDone(true);
      toast.success("You're on the list.", { description: "We'll be in touch with exclusive launches." });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      style={{
        background: "var(--color-text)",
        padding: "5rem 0",
      }}
    >
      <div className="container-site" style={{ textAlign: "center" }}>
        <p className="label-caps" style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1rem" }}>
          Stay Close
        </p>
        <h2
          className="heading-editorial"
          style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", color: "#fff", marginBottom: "1rem" }}
        >
          First access. Always.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.95rem",
            color: "rgba(255,255,255,0.6)",
            marginBottom: "2.5rem",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          New launches, exclusive offers, and fragrance stories — delivered first to those who matter.
        </p>

        {done ? (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#fff" }}>
            ✓ You&apos;re subscribed.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              maxWidth: "440px",
              margin: "0 auto",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              style={{
                flex: 1,
                padding: "0.875rem 1.25rem",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontFamily: "var(--font-sans)",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.875rem 1.5rem",
                background: "#fff",
                color: "var(--color-text)",
                border: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: submitting ? "wait" : "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {submitting ? "…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
