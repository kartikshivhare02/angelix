import { createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { ProductGrid } from "@/components/home/ProductGrid";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Fragrance family display names & descriptions
const FAMILY_META: Record<string, { name: string; description: string; icon: string }> = {
  woody:    { name: "Woody",    description: "Warm, dry, earthy compositions rooted in cedar, sandalwood and vetiver.", icon: "🌲" },
  fresh:    { name: "Fresh",    description: "Clean, invigorating scents that evoke open air, green leaves and citrus.",   icon: "🍃" },
  aquatic:  { name: "Aquatic",  description: "Marine and water-inspired fragrances for a light, airy presence.",            icon: "🌊" },
  citrus:   { name: "Citrus",   description: "Bright, energising top notes of lemon, bergamot, orange and grapefruit.",    icon: "🍋" },
  floral:   { name: "Floral",   description: "Romantic heart notes built around rose, jasmine, peony and lily.",           icon: "🌹" },
  fruity:   { name: "Fruity",   description: "Sweet, playful compositions featuring peach, apple, berry and tropical fruits.", icon: "🍑" },
  oud:      { name: "Oud",      description: "Rich, resinous and intensely complex — the jewel of Middle Eastern perfumery.", icon: "🪵" },
  amber:    { name: "Amber",    description: "Warm, golden accords combining benzoin, labdanum and vanilla.",               icon: "🌅" },
  musk:     { name: "Musk",     description: "Soft, skin-close warmth with an intimate, sensual quality.",                  icon: "🫧" },
  spicy:    { name: "Spicy",    description: "Bold, vibrant compositions featuring cardamom, black pepper and cinnamon.",   icon: "🌶️" },
  gourmand: { name: "Gourmand", description: "Deliciously edible scents inspired by vanilla, caramel, coffee and chocolate.", icon: "☕" },
};

async function getProductsByFamily(slug: string): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(`
        *,
        images:product_images(*),
        fragrance_families!inner(slug)
      `)
      .eq("is_published", true)
      .eq("fragrance_families.slug", slug)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = FAMILY_META[slug];
  if (!meta) return { title: "Fragrances — ANGLELIX" };
  return {
    title: `${meta.name} Fragrances — ANGLELIX by Suraj`,
    description: `Explore ${meta.name.toLowerCase()} fragrances from ANGLELIX. ${meta.description}`,
  };
}

export default async function FragranceFamilyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = FAMILY_META[slug];

  if (!meta) notFound();

  const products = await getProductsByFamily(slug);

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "6rem 0 5rem", background: "var(--color-bg-soft)", borderBottom: "1px solid var(--color-border)", textAlign: "center" }}>
        <div className="container-site">
          <p className="label-caps animate-fade-up" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
            Fragrance Family
          </p>
          <div className="animate-fade-up delay-100" style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>
            {meta.icon}
          </div>
          <h1 className="heading-editorial animate-fade-up delay-200" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", marginBottom: "1.5rem" }}>
            {meta.name}
          </h1>
          <p className="animate-fade-up delay-300" style={{ fontFamily: "var(--font-sans)", fontSize: "0.92rem", color: "var(--color-text-muted)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
            {meta.description}
          </p>
        </div>
      </section>

      {/* Family nav pills */}
      <section style={{ borderBottom: "1px solid var(--color-border)", overflowX: "auto" }}>
        <div className="container-site" style={{ display: "flex", gap: "0", paddingTop: 0, paddingBottom: 0 }}>
          {Object.entries(FAMILY_META).map(([s, m]) => (
            <a
              key={s}
              href={`/fragrance/${s}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.85rem 1.25rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                fontWeight: s === slug ? 700 : 400,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: s === slug ? "var(--color-text)" : "var(--color-text-muted)",
                borderBottom: s === slug ? "2px solid var(--color-text)" : "2px solid transparent",
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {m.icon} {m.name}
            </a>
          ))}
        </div>
      </section>

      {/* Products */}
      <div className="container-site section-py">
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            {products.length} fragrance{products.length !== 1 ? "s" : ""} in {meta.name}
          </p>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", border: "1px solid var(--color-border)" }}>
            <p className="heading-editorial" style={{ fontSize: "2rem", marginBottom: "1rem" }}>Coming Soon</p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "var(--color-text-muted)", marginBottom: "2rem" }}>
              We are working on {meta.name.toLowerCase()} fragrances. Explore our other collections.
            </p>
            <a href="/shop" className="btn-primary">Explore All Fragrances</a>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}
