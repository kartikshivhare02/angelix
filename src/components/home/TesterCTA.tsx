import Link from "next/link";
import Image from "next/image";

export function TesterCTA() {
  return (
    <section className="section-py" style={{ background: "var(--color-bg)" }}>
      <div className="container-site">
        <div
          className="tester-two-col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div>
            <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Not Sure Yet?
            </p>
            <h2 className="heading-editorial" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", marginBottom: "1.5rem" }}>
              Try Before You Commit
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                marginBottom: "2rem",
                maxWidth: "400px",
              }}
            >
              Experience our fragrances in intimate 2ml, 5ml, or 10ml sizes. 
              Find your signature before investing in the full bottle.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/testers" className="btn-primary">
                Explore Testers
              </Link>
              <Link href="/shop" className="btn-outline">
                Full Collection
              </Link>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {["2ml", "5ml", "10ml", "Discovery Set"].map((size, i) => (
              <div
                key={size}
                style={{
                  background: "var(--color-bg-soft)",
                  border: "1px solid var(--color-border)",
                  padding: "2rem 1.5rem",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  gridColumn: size === "Discovery Set" ? "span 2" : "span 1",
                }}
              >
                <span className="label-caps" style={{ color: "var(--color-text-muted)" }}>
                  {size}
                </span>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 300 }}>
                  {size === "Discovery Set" ? "Choose Any 3" : "Tester Vial"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
