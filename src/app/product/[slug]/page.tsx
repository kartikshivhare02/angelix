import { notFound } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Product } from "@/lib/types";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://angelix.com";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  const title = product.seo_title || `${product.name} ${product.volume_ml}ml — ANGELIX by Suraj`;
  const description =
    product.seo_description ||
    product.short_description ||
    `Experience ${product.name} by ANGELIX. Premium handcrafted luxury fragrance featuring notes of ${(product.top_notes || []).join(", ")}.`;
  const imageUrl = product.main_image_url || `${SITE_URL}/logo.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}/product/${product.slug}`,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const price = product.sale_price ?? product.original_price;
  const imageUrl = product.main_image_url || `${SITE_URL}/logo.png`;

  const jsonLdProduct = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${SITE_URL}/product/${product.slug}/#product`,
        name: `${product.name} ${product.volume_ml}ml`,
        description: product.full_description || product.short_description || product.name,
        image: [imageUrl, ...(product.images?.map((img) => img.image_url) || [])],
        sku: product.sku,
        brand: {
          "@type": "Brand",
          name: "ANGELIX by Suraj",
        },
        offers: {
          "@type": "Offer",
          price: price,
          priceCurrency: "INR",
          availability:
            product.stock_quantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/product/${product.slug}`,
          seller: {
            "@type": "Organization",
            name: "ANGELIX by Suraj",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Fragrances",
            item: `${SITE_URL}/shop`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: `${SITE_URL}/product/${product.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
