"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[ANGLELIX Error]", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "4rem 2rem",
      }}
    >
      <AlertTriangle
        size={56}
        strokeWidth={0.75}
        style={{ color: "var(--color-border)", marginBottom: "2rem" }}
      />

      <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
        Something went wrong
      </p>
      <h2
        className="heading-editorial"
        style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", marginBottom: "1.25rem" }}
      >
        An unexpected error occurred
      </h2>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.88rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.8,
          maxWidth: "420px",
          margin: "0 auto 2.5rem",
        }}
      >
        We apologise for the inconvenience. Please try again or return to the homepage.
        If this issue persists, contact us at{" "}
        <a href="mailto:hello@anglelix.com" style={{ color: "var(--color-text)" }}>
          hello@anglelix.com
        </a>.
      </p>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
        <Link href="/" className="btn-outline">
          Go Home
        </Link>
      </div>
    </div>
  );
}
