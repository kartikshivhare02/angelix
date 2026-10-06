import { createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { TesterGrid } from "@/components/testers/TesterGrid";
import Link from "next/link";
import { Sparkles, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/lib/getSiteSettings";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Fragrance Testers & Discovery — ANGELIX by Suraj",
  description:
    "Test handcrafted luxury extraits on your skin. Order tester vials directly via WhatsApp for 1-on-1 assistance with 100% Value Settlement Guarantee.",
};

export interface TesterOption {
  id: string;
  product_id: string;
  size_ml: number;
  price: number;
  stock_quantity?: number;
  is_active?: boolean;
}

async function getTesterData(): Promise<{ products: Product[]; testers: TesterOption[] }> {
  try {
    const supabase = await createClient();
    const [prodRes, testerRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, images:product_images(*), category:categories(*)")
        .eq("is_published", true)
        .eq("tester_available", true)
        .order("name"),
      supabase
        .from("tester_products")
        .select("*")
        .eq("is_active", true),
    ]);
    return {
      products: (prodRes.data as Product[]) ?? [],
      testers: (testerRes.data as TesterOption[]) ?? [],
    };
  } catch {
    return { products: [], testers: [] };
  }
}

export default async function TestersPage() {
  const [{ products, testers }, settings] = await Promise.all([
    getTesterData(),
    getSiteSettings(),
  ]);

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100vh" }}>
      {/* ── Luxury Hero Section ── */}
      <section
        style={{
          background: "linear-gradient(180deg, #141414 0%, #1f1d1a 100%)",
          color: "#fff",
          padding: "clamp(4.5rem, 8vw, 6.5rem) 0 clamp(3.5rem, 6vw, 4.5rem)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Ambient Glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, rgba(0,0,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <div className="container-site" style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(212,175,55,0.12)",
              border: "1px solid rgba(212,175,55,0.3)",
              padding: "0.4rem 1rem",
              borderRadius: "50px",
              marginBottom: "1.5rem",
            }}
          >
            <Sparkles size={13} color="#d4af37" />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#e8c977",
                fontWeight: 600,
              }}
            >
              The Discovery Atelier · Try Before You Invest
            </span>
          </div>

          <h1
            className="heading-editorial"
            style={{
              fontSize: "clamp(2.4rem, 6.5vw, 4.8rem)",
              marginBottom: "1.25rem",
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            Experience Scent On Skin.
          </h1>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              color: "rgba(255,255,255,0.7)",
              maxWidth: "620px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.75,
              fontWeight: 300,
            }}
          >
            Perfume reacts uniquely with individual skin chemistry. Test wear our handcrafted artisanal extraits — order tester vials directly via WhatsApp with <strong style={{ color: "#e8c977", fontWeight: 600 }}>100% 1-on-1 personal assistance &amp; full bottle settlement credit</strong>.
          </p>

          {/* Real Feature Pills */}
          <div
            style={{
              display: "flex",
              gap: "0.875rem",
              justifyContent: "center",
              flexWrap: "wrap",
              maxWidth: "760px",
              margin: "0 auto",
            }}
          >
            {[
              { icon: <MessageCircle size={15} color="#25D366" />, title: "WhatsApp Direct Order", desc: "Connect 1-on-1 with Suraj & team", href: "https://api.whatsapp.com/send?phone=917067697646&text=Hi%20ANGELIX!%20I%20want%20to%20order%20a%20Tester%20Vial." },
              { icon: <ShieldCheck size={15} color="#d4af37" />, title: "100% Settle Credit", desc: "Deducted on full bottle purchase" },
              { icon: <Sparkles size={15} color="#d4af37" />, title: "Real Tester Extraits", desc: "Authentic high-concentration oils" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.href || "#"}
                target={item.href ? "_blank" : undefined}
                rel={item.href ? "noopener noreferrer" : undefined}
                style={{
                  padding: "0.85rem 1.4rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderRadius: "4px",
                  textDecoration: "none",
                  color: "inherit",
                  cursor: item.href ? "pointer" : "default",
                }}
              >
                {item.icon}
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>
                    {item.title}
                  </p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>
                    {item.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 100% Value Settlement Interactive Banner ── */}
      <section
        style={{
          background: "linear-gradient(90deg, #8a6d3b 0%, #a8874a 100%)",
          color: "#fff",
          padding: "1rem 0",
        }}
      >
        <div
          className="container-site"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
            textAlign: "center",
            fontSize: "0.85rem",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <MessageCircle size={16} /> <strong>Direct WhatsApp 1-on-1 Ordering:</strong> Instant personal assistance
          </span>
          <span className="hidden sm:inline" style={{ opacity: 0.5 }}>|</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <ShieldCheck size={16} /> <strong>100% Tester Settle Credit:</strong> Deducted from your full bottle
          </span>
          <span className="hidden sm:inline" style={{ opacity: 0.5 }}>|</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Truck size={16} /> Free Priority Delivery on {formatPrice(settings.free_shipping_min)}+
          </span>
        </div>
      </section>

      {/* ── Main Product Grid with Interactive Sorters & Filters ── */}
      <section className="section-py" style={{ paddingTop: "3.5rem" }}>
        <div className="container-site">
          <TesterGrid products={products} testerOptions={testers} />
        </div>
      </section>

      {/* ── The 4-Step Scent Journey ── */}
      <section
        style={{
          background: "var(--color-bg-soft)",
          borderTop: "1px solid var(--color-border)",
          borderBottom: "1px solid var(--color-border)",
          padding: "5rem 0",
        }}
      >
        <div className="container-site" style={{ textAlign: "center" }}>
          <p className="label-caps" style={{ color: "#8a6d3b", marginBottom: "0.75rem", fontWeight: 700 }}>
            The WhatsApp Settlement Process
          </p>
          <h2
            className="heading-editorial"
            style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", marginBottom: "3rem" }}
          >
            How 1-on-1 WhatsApp Tester Settle Works
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2rem",
              maxWidth: "1050px",
              margin: "0 auto",
              textAlign: "left",
            }}
          >
            {[
              {
                step: "01",
                title: "Select Vials & Tap WhatsApp",
                desc: "Choose your desired tester vial size and click 'Order via WhatsApp' to connect directly with us.",
              },
              {
                step: "02",
                title: "1-on-1 Personal Assistance",
                desc: "We confirm your fragrance choices, answer notes questions, and complete your order details directly on WhatsApp.",
              },
              {
                step: "03",
                title: "Test In Real Life",
                desc: "Wear for 3–5 days in daily routines, evenings, and different temperatures to observe sillage and dry-down on skin.",
              },
              {
                step: "04",
                title: "100% Settle Credit",
                desc: "When ordering your full bottle, 100% of your tester purchase amount is credited and settled directly toward your purchase!",
              },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  background: "#fff",
                  border: "1px solid var(--color-border)",
                  padding: "2rem",
                  borderRadius: "2px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "2.2rem",
                      color: "#8a6d3b",
                      fontWeight: 300,
                      display: "block",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {item.step}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.65,
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Full Bottle Collection CTA ── */}
      <section
        style={{
          padding: "5rem 0",
          textAlign: "center",
          background: "#fff",
        }}
      >
        <div className="container-site" style={{ maxWidth: "680px", margin: "0 auto" }}>
          <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Ready to Explore the House?
          </p>
          <h2 className="heading-editorial" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "1.25rem" }}>
            The Full Perfume Collection
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.8,
              marginBottom: "2.5rem",
            }}
          >
            Discover our full-size signature glass flacons crafted with high-concentration perfume oils.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/shop" className="btn-primary" style={{ padding: "0.9rem 2.2rem" }}>
              Explore Full Bottles
            </Link>
            <Link href="/about" className="btn-outline" style={{ padding: "0.9rem 2.2rem" }}>
              Our Story &amp; Philosophy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
