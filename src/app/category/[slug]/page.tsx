import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { ProductGrid } from "@/components/home/ProductGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_MAP: Record<string, { label: string; field: string; value: string }> = {
  men: { label: "Men", field: "gender", value: "Men" },
  women: { label: "Women", field: "gender", value: "Women" },
  unisex: { label: "Unisex", field: "gender", value: "Unisex" },
  "best-sellers": { label: "Best Sellers", field: "is_bestseller", value: "true" },
  "new-arrivals": { label: "New Arrivals", field: "is_new_arrival", value: "true" },
  testers: { label: "Testers", field: "tester_available", value: "true" },
};

async function getCategoryInfoAndProducts(slug: string): Promise<{ label: string; products: Product[] } | null> {
  const standardCat = CATEGORY_MAP[slug];

  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }

    // 1. If standard category (e.g. Men, Women, Unisex)
    if (standardCat) {
      let query = supabase
        .from("products")
        .select("*, images:product_images(*)")
        .eq("is_published", true);

      if (standardCat.field === "gender") query = query.eq("gender", standardCat.value);
      else if (standardCat.field === "is_bestseller") query = query.eq("is_bestseller", true);
      else if (standardCat.field === "is_new_arrival") query = query.eq("is_new_arrival", true);
      else if (standardCat.field === "tester_available") query = query.eq("tester_available", true);

      const { data } = await query.order("created_at", { ascending: false });

      return {
        label: standardCat.label,
        products: (data as Product[]) ?? [],
      };
    }

    // 2. Otherwise check custom database categories
    const { data: dbCat } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", slug)
      .single();

    if (dbCat) {
      const { data } = await supabase
        .from("products")
        .select("*, images:product_images(*)")
        .eq("is_published", true)
        .eq("category_id", dbCat.id)
        .order("created_at", { ascending: false });

      return {
        label: dbCat.name,
        products: (data as Product[]) ?? [],
      };
    }

    return null;
  } catch {
    if (standardCat) {
      return { label: standardCat.label, products: [] };
    }
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getCategoryInfoAndProducts(slug);
  if (!result) return { title: "Category Not Found — ANGLELIX" };
  return {
    title: `${result.label} Fragrances — ANGLELIX by Suraj`,
    description: `Browse all ${result.label.toLowerCase()} fragrances from ANGLELIX by Suraj.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getCategoryInfoAndProducts(slug);

  if (!result) notFound();

  const { label, products } = result;

  return (
    <div className="container-site section-py">
      {/* Breadcrumb */}
      <nav style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem" }}>
        <Link href="/" style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", textDecoration: "none" }}>Home</Link>
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>›</span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem" }}>{label}</span>
      </nav>

      <div style={{ marginBottom: "2.5rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Collection</p>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>{label}</h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
          {products.length} fragrance{products.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Category quick links */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <Link
          href="/shop"
          style={{
            padding: "0.35rem 0.85rem",
            border: "1px solid var(--color-border)",
            background: "transparent",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
            textDecoration: "none",
          }}
        >
          All Fragrances
        </Link>
        {Object.entries(CATEGORY_MAP).map(([s, c]) => (
          <Link
            key={s}
            href={`/category/${s}`}
            style={{
              padding: "0.35rem 0.85rem",
              border: "1px solid",
              borderColor: s === slug ? "var(--color-text)" : "var(--color-border)",
              background: s === slug ? "var(--color-text)" : "transparent",
              color: s === slug ? "var(--color-white)" : "var(--color-text-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              letterSpacing: "0.04em",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", background: "var(--color-bg-soft)", border: "1px solid var(--color-border)" }}>
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontWeight: 300, marginBottom: "0.5rem" }}>
            No fragrances currently listed under {label}
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
            Explore our complete fragrance catalog to discover available scents.
          </p>
          <Link href="/shop" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
            Browse All Fragrances
          </Link>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
