import Link from "next/link";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryNav } from "@/components/home/CategoryNav";
import { ProductGrid } from "@/components/home/ProductGrid";
import { FeaturedFragrance } from "@/components/home/FeaturedFragrance";
import { TesterCTA } from "@/components/home/TesterCTA";
import { ImageOnlyCTA } from "@/components/home/ImageOnlyCTA";
import { BrandStory } from "@/components/home/BrandStory";
import { Newsletter } from "@/components/home/Newsletter";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { BannerItem } from "@/components/home/HeroBanner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getBanners(): Promise<BannerItem[]> {
  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }
    const now = new Date().toISOString();
    const { data } = await supabase
      .from("banners")
      .select("id, title, subtitle, desktop_image_url, mobile_image_url, cta_label, cta_url, text_alignment, is_active, display_order, start_date, end_date")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    return (data || []).filter((b: any) => {
      if (b.start_date) {
        const start = new Date(b.start_date);
        start.setHours(0, 0, 0, 0);
        if (start.getTime() > Date.now()) return false;
      }
      if (b.end_date) {
        const end = new Date(b.end_date);
        end.setHours(23, 59, 59, 999);
        if (end.getTime() < Date.now()) return false;
      }
      return true;
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    return data ?? [];
  } catch {
    return [];
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*)")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8);
    if (data && data.length > 0) return data as Product[];
    return [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [banners, categories, products] = await Promise.all([
    getBanners(),
    getCategories(),
    getFeaturedProducts(),
  ]);
  const featuredProduct = products.find((p) => p.is_featured) || products[0] || null;

  return (
    <>
      <HeroBanner initialBanners={banners} />
      <CategoryNav initialCategories={categories} />
      {products.length > 0 && (
        <section className="section-py">
          <div className="container-site">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                Curated for You
              </p>
              <h2
                className="heading-editorial"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
              >
                Our Signatures
              </h2>
            </div>
            <ProductGrid products={products} />
            <div style={{ textAlign: "center", marginTop: "3rem" }}>
              <Link href="/shop" className="btn-outline">
                View All Fragrances
              </Link>
            </div>
          </div>
        </section>
      )}
      <FeaturedFragrance product={featuredProduct} />
      <TesterCTA />
      <ImageOnlyCTA />
      <BrandStory />
      <Newsletter />
    </>
  );
}


