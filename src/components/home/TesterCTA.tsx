import Link from "next/link";
import { MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

export function TesterCTA() {
  return (
    <section className="section-py" style={{ background: "var(--color-bg)", borderTop: "1px solid var(--color-border)" }}>
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
                maxWidth: "440px",
              }}
            >
              Experience our handcrafted fragrances in tester vials before investing in a full bottle. Order directly on WhatsApp for 1-on-1 personal assistance — with 100% value credited toward your full bottle purchase.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <Link href="/testers" className="btn-primary" style={{ background: "#25D366", color: "#fff", borderColor: "#25D366", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <MessageCircle size={17} /> Order Testers via WhatsApp
              </Link>
              <Link href="/shop" className="btn-outline">
                Full Collection
              </Link>
            </div>
          </div>

          {/* Clean feature highlights without any images */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              {
                icon: <MessageCircle size={20} color="#25D366" />,
                title: "1-on-1 WhatsApp Order",
                desc: "Chat directly with Suraj & team to choose your scent samples.",
              },
              {
                icon: <ShieldCheck size={20} color="#8a6d3b" />,
                title: "100% Value Settlement",
                desc: "Tester purchase amount is fully credited toward your next full bottle.",
              },
              {
                icon: <Sparkles size={20} color="#8a6d3b" />,
                title: "Handcrafted Extraits",
                desc: "Authentic miniature vials featuring high-concentration perfume oils.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--color-bg-soft)",
                  border: "1px solid var(--color-border)",
                  padding: "1.5rem",
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-start",
                  borderRadius: "2px",
                }}
              >
                <div style={{ flexShrink: 0, marginTop: "0.15rem" }}>{item.icon}</div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                    {item.title}
                  </h4>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
