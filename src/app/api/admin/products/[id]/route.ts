import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const { id } = await params;
  const { data, error } = await adminClient
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const { id } = await params;
  const body = await req.json();
  const { gallery_images, images, variants, ...productData } = body;

  const { data, error } = await adminClient
    .from("products")
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If gallery_images or images was provided, sync product_images
  const rawImages = gallery_images !== undefined ? gallery_images : images;
  if (rawImages !== undefined) {
    const imagesToInsert: string[] = Array.isArray(rawImages)
      ? rawImages.map((i: any) => (typeof i === "string" ? i : i?.image_url)).filter(Boolean)
      : [];

    await adminClient.from("product_images").delete().eq("product_id", id);

    if (imagesToInsert.length > 0) {
      const rows = imagesToInsert.map((url, idx) => ({
        product_id: id,
        image_url: url,
        display_order: idx + 1,
      }));
      await adminClient.from("product_images").insert(rows);
    }
  }

  // If variants was provided, sync product_variants
  if (variants !== undefined && Array.isArray(variants)) {
    await adminClient.from("product_variants").delete().eq("product_id", id);

    if (variants.length > 0) {
      const variantRows = variants.map((v: any, idx: number) => ({
        product_id: id,
        name: v.name || `${v.volume_ml || 100}ml`,
        volume_ml: v.volume_ml ? Number(v.volume_ml) : null,
        sku: v.sku || `${data.sku}-${v.volume_ml || idx + 1}`,
        original_price: Number(v.original_price) || Number(productData.original_price || data.original_price),
        sale_price: v.sale_price ? Number(v.sale_price) : null,
        stock_quantity: Number(v.stock_quantity ?? 0),
        is_default: Boolean(v.is_default),
        display_order: idx + 1,
      }));
      await adminClient.from("product_variants").insert(variantRows);
    }
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

  return NextResponse.json({ product: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminClient = await createAdminClient();
  const { id } = await params;

  // Clean up dependent child rows
  await adminClient.from("product_images").delete().eq("product_id", id);
  await adminClient.from("product_variants").delete().eq("product_id", id);
  await adminClient.from("product_fragrance_families").delete().eq("product_id", id);
  await adminClient.from("tester_products").delete().eq("product_id", id);
  await adminClient.from("wishlists").delete().eq("product_id", id);
  
  // Detach from order history (preserve order items with snapshot data)
  await adminClient.from("order_items").update({ product_id: null }).eq("product_id", id);

  const { error } = await adminClient.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
