import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 30);
  const search = searchParams.get("q") ?? "";
  const from = (page - 1) * limit;

  let query = adminClient
    .from("products")
    .select("id, name, slug, sku, gender, concentration, volume_ml, original_price, sale_price, stock_quantity, is_published, is_featured, is_bestseller, main_image_url, created_at, variants:product_variants(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (search) query = query.ilike("name", `%${search}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data, total: count });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const body = await req.json();
  const { gallery_images, images, variants, ...productData } = body;

  const { error, data } = await adminClient.from("products").insert(productData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Gallery Images
  const imagesToInsert: string[] = Array.isArray(gallery_images)
    ? gallery_images
    : Array.isArray(images)
    ? images.map((i: any) => (typeof i === "string" ? i : i.image_url)).filter(Boolean)
    : [];

  if (imagesToInsert.length > 0 && data?.id) {
    const rows = imagesToInsert.map((url, idx) => ({
      product_id: data.id,
      image_url: url,
      display_order: idx + 1,
    }));
    await adminClient.from("product_images").insert(rows);
  }

  // Size Variants
  if (Array.isArray(variants) && variants.length > 0 && data?.id) {
    const variantRows = variants.map((v: any, idx: number) => ({
      product_id: data.id,
      name: v.name || `${v.volume_ml || 100}ml`,
      volume_ml: v.volume_ml ? Number(v.volume_ml) : null,
      sku: v.sku || `${data.sku}-${v.volume_ml || idx + 1}`,
      original_price: Number(v.original_price) || Number(productData.original_price),
      sale_price: v.sale_price ? Number(v.sale_price) : null,
      stock_quantity: Number(v.stock_quantity ?? productData.stock_quantity ?? 0),
      is_default: Boolean(v.is_default),
      display_order: idx + 1,
    }));
    await adminClient.from("product_variants").insert(variantRows);
  }

  // Revalidate public storefront caches
  try {
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    revalidatePath("/product/[slug]", "page");
    if (data?.slug) {
      revalidatePath(`/product/${data.slug}`);
    }
  } catch {}

  return NextResponse.json({ product: data }, { status: 201 });
}
