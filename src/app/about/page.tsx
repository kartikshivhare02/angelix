import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — ANGLELIX by Suraj",
  description: "Discover the story of ANGLELIX — a fragrance house built on the philosophy that scent is identity. Premium perfumes crafted with intention.",
};

const PILLARS = [
  {
    title: "Our Philosophy",
    body: "We believe fragrance is more than a product — it is an extension of identity. Every ANGLELIX scent is designed to leave an impression that lingers long after you have left the room.",
  },
  {
    title: "Our Approach",
    body: "We source the finest raw ingredients and work with focused precision to create compositions that are bold yet elegant. Each bottle represents months of refinement and an uncompromising standard.",
  },
  {
    title: "Craftsmanship",
    body: "Fragrance formulation at ANGLELIX is a deliberate, patient process. We layer notes with intention — opening with intrigue, evolving through depth, and settling into a signature that stays.",
  },
  {
    title: "Quality",
    body: "From ingredient selection to bottle design, we apply the same rigorous standard at every step. ANGLELIX fragrances are concentrated, long-lasting, and built to perform from morning through night.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: "var(--color-bg-soft)",
          borderBottom: "1px solid var(--color-border)",
          padding: "7rem 0 6rem",
          textAlign: "center",
        }}
      >
        <div className="container-site">
          <p className="label-caps animate-fade-up" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Know Anglelix
          </p>
          <h1
            className="heading-editorial animate-fade-up delay-100"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)", maxWidth: "820px", margin: "0 auto 2rem" }}
          >
            Scent is identity.
          </h1>
          <p
            className="animate-fade-up delay-200"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "var(--color-text-muted)",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            ANGLELIX by Suraj is a fragrance house born from a singular belief — that the right scent defines who you are before you speak.
          </p>
        </div>
      </section>

      {/* Brand name section */}
      <section style={{ padding: "6rem 0", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container-site">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
                The Brand
              </p>
              <h2
                className="heading-editorial"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", marginBottom: "2rem", lineHeight: 1.1 }}
              >
                ANGLELIX<br />
                <span style={{ fontWeight: 300, fontSize: "0.6em", color: "var(--color-text-muted)" }}>by Suraj</span>
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.92rem", color: "var(--color-text-muted)", lineHeight: 1.85, maxWidth: "480px" }}>
                ANGLELIX was founded on the conviction that premium fragrance should not be a privilege reserved for the few.
                We create perfumes that are accessible in reach but uncompromising in quality — offering the same olfactive
                experience as the world&apos;s finest fragrance houses.
              </p>
            </div>
            <div
              style={{
                background: "var(--color-cream)",
                border: "1px solid var(--color-border)",
                aspectRatio: "4/5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "3rem", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1 }}>
                  ANGLELIX
                </p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text-muted)", marginTop: "0.75rem" }}>
                  by Suraj
                </p>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .about-two-col { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* Pillars */}
      <section style={{ padding: "6rem 0", background: "var(--color-bg-soft)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container-site">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
              What We Stand For
            </p>
            <h2 className="heading-editorial" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
              The ANGLELIX Standard
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1px", background: "var(--color-border)" }}>
            {PILLARS.map((pillar, i) => (
              <div
                key={i}
                style={{
                  background: "var(--color-bg)",
                  padding: "3rem",
                }}
              >
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "2.5rem", fontWeight: 300, color: "var(--color-border)", display: "block", marginBottom: "1.5rem" }}>
                  0{i + 1}
                </span>
                <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: 400, marginBottom: "1rem" }}>
                  {pillar.title}
                </h3>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text-muted)", lineHeight: 1.85 }}>
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>

          <style>{`
            @media (max-width: 640px) {
              .about-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </section>

      {/* Why ANGLELIX */}
      <section style={{ padding: "6rem 0", borderBottom: "1px solid var(--color-border)" }}>
        <div className="container-site" style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto" }}>
          <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Why ANGLELIX
          </p>
          <h2 className="heading-editorial" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", marginBottom: "2rem" }}>
            Your Signature Starts Here
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.92rem", color: "var(--color-text-muted)", lineHeight: 1.9, marginBottom: "3rem" }}>
            Every ANGLELIX fragrance is built around a narrative — a mood, a memory, a feeling.
            We do not create generic crowd-pleasers. We create scents for people who know exactly the impression they want to make.
            Whether you are drawn to the warmth of oud and amber, the clarity of fresh aquatics, or the boldness of leather and spice —
            there is an ANGLELIX made for you.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/shop" className="btn-primary">
              Explore Fragrances
            </Link>
            <Link href="/testers" className="btn-outline">
              Try a Tester
            </Link>
          </div>
        </div>
      </section>

      {/* Quote / editorial */}
      <section style={{ padding: "7rem 0", background: "var(--color-text)", color: "var(--color-white)" }}>
        <div className="container-site" style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 4vw, 2.75rem)", fontWeight: 300, letterSpacing: "-0.01em", lineHeight: 1.5, maxWidth: "720px", margin: "0 auto" }}>
            &ldquo;A great fragrance does not announce itself.<br />It reveals itself — slowly, and unforgettably.&rdquo;
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginTop: "2rem" }}>
            — ANGLELIX by Suraj
          </p>
        </div>
      </section>
    </div>
  );
}
