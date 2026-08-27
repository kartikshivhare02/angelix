import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — ANGLELIX by Suraj",
};

export default function NotFound() {
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
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(6rem, 20vw, 14rem)",
          fontWeight: 300,
          lineHeight: 1,
          color: "var(--color-border)",
          letterSpacing: "-0.04em",
          marginBottom: "0",
          userSelect: "none",
        }}
      >
        404
      </p>

      <div style={{ marginTop: "0rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
          Page Not Found
        </p>
        <h1
          className="heading-editorial"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)", marginBottom: "1.25rem" }}
        >
          Lost in the mist?
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.8,
            maxWidth: "420px",
            margin: "0 auto 2.5rem",
          }}
        >
          The page you are looking for does not exist or may have been moved.
          Let us guide you back to the collection.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/shop" className="btn-outline">
            Shop Fragrances
          </Link>
        </div>
      </div>
    </div>
  );
}
