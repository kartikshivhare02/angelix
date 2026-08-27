import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { ProductGrid } from "@/components/home/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";

interface SearchParams {
  gender?: string;
  category?: string;
  family?: string;
  sort?: string;
}

async function getProducts(params: SearchParams): Promise<Product[]> {
  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }
    let query = supabase
      .from("products")
      .select("*, images:product_images(*)")
      .eq("is_published", true);

    if (params.gender) query = query.eq("gender", params.gender);

    if (params.category) {
      if (["Parfum", "EDP", "EDT", "EDC"].includes(params.category)) {
        query = query.eq("concentration", params.category);
      } else {
        // Resolve category slug or ID
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .or(`slug.eq.${params.category},id.eq.${params.category}`)
          .single();

        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }
    }

    switch (params.sort) {
      case "price_asc": query = query.order("original_price", { ascending: true }); break;
      case "price_desc": query = query.order("original_price", { ascending: false }); break;
      case "newest": query = query.order("created_at", { ascending: false }); break;
      default: query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
    }

    const { data } = await query;
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Shop All Fragrances — ANGLELIX by Suraj",
  description: "Browse the complete ANGLELIX fragrance collection — men, women, and unisex luxury perfumes crafted in India.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const products = await getProducts(params);

  return (
    <div className="container-site section-py">
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
          All Fragrances
        </p>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}>
          The Collection
        </h1>
      </div>

      {/* Filter bar + sort — full width above the grid */}
      <ShopFilters active={params} totalCount={products.length} />

      {/* Result count */}
      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
        {products.length} fragrance{products.length !== 1 ? "s" : ""}
      </p>

      {/* Product grid — full width */}
      <ProductGrid products={products} />
    </div>
  );
}
