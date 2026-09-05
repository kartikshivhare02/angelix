import { notFound } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getProduct(slug: string): Promise<Product | null> {
  try {
    let supabase;
    try {
      supabase = await createAdminClient();
    } catch {
      supabase = await createClient();
    }
    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*), category:categories(name,slug)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();
    return (data as Product) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seo_title ?? `${product.name} ${product.volume_ml}ml — ANGELIX`,
    description: product.seo_description ?? product.short_description ?? "",
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
