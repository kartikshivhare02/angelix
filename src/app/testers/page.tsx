import { createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { TesterGrid } from "@/components/testers/TesterGrid";
import Link from "next/link";

export const metadata = {
  title: "Fragrance Testers — ANGLELIX by Suraj",
  description: "Try before you commit. ANGLELIX tester vials available in 2ml, 5ml and 10ml sizes.",
};

async function getTesterProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*)")
      .eq("is_published", true)
      .eq("tester_available", true)
      .order("name");
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

export default async function TestersPage() {
  const products = await getTesterProducts();

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: "var(--color-bg-soft)",
          padding: "5rem 0 4rem",
          textAlign: "center",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="container-site">
          <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Try Before You Commit
          </p>
          <h1 className="heading-editorial" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", marginBottom: "1.25rem" }}>
            Fragrance Testers
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--color-text-muted)",
              maxWidth: "540px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.7,
            }}
          >
            Experience each fragrance on your skin before investing in a full bottle. Miniature vials available in 2ml, 5ml, and 10ml travel formats.
          </p>

          {/* Tester sizes */}
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {["2ml Sample — ₹99", "5ml Travel — ₹199", "10ml Pocket — ₹349"].map((size) => (
              <div
                key={size}
                style={{
                  padding: "0.8rem 1.5rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                {size}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discovery Set CTA */}
      <section style={{ background: "var(--color-text)", padding: "2.5rem 0" }}>
        <div
          className="container-site"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}
        >
          <div>
            <p className="label-caps" style={{ color: "rgba(255,255,255,0.6)", marginBottom: "0.35rem" }}>
              Can't Decide?
            </p>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", color: "#fff", fontWeight: 400 }}>
              Discovery Set — Choose Any 3 Fragrances
            </p>
          </div>
          <Link
            href="/shop"
            style={{
              padding: "0.8rem 2rem",
              background: "var(--color-white)",
              color: "var(--color-text)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Products */}
      <section className="section-py">
        <div className="container-site">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {products.length} fragrance{products.length !== 1 ? "s" : ""} available as testers
            </p>
          </div>
          <TesterGrid products={products} />
        </div>
      </section>

      {/* How testers work */}
      <section style={{ background: "var(--color-bg-soft)", padding: "4rem 0" }}>
        <div className="container-site" style={{ textAlign: "center" }}>
          <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>How It Works</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", maxWidth: "800px", margin: "0 auto" }}>
            {[
              { step: "01", text: "Choose your fragrances and tester size" },
              { step: "02", text: "Receive miniature vials within 3–5 days" },
              { step: "03", text: "Wear for a few days to truly experience the scent" },
              { step: "04", text: "Order your full bottle with confidence" },
            ].map(({ step, text }) => (
              <div key={step}>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", color: "var(--color-border)", fontWeight: 300, marginBottom: "0.75rem" }}>{step}</p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
