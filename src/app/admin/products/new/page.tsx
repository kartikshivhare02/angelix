"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save, Sparkles, Eye } from "lucide-react";
import { isSolidProduct } from "@/lib/utils";
import { ImageUploadPicker } from "@/components/admin/ImageUploadPicker";
import { ProductGalleryManager } from "@/components/admin/ProductGalleryManager";

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  const handleQuickAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    setCreatingCat(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      toast.success(`Category "${data.category.name}" created.`);
      setCategories((prev) => [...prev, data.category]);
      set("category_id", data.category.id);
      setNewCatName("");
      setNewCatOpen(false);
    } catch {
      toast.error("Failed to create category.");
    } finally {
      setCreatingCat(false);
    }
  };

  // Form State
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    gender: "Unisex",
    concentration: "EDP",
    volume_ml: 100,
    category_id: "",
    original_price: 3499,
    sale_price: "",
    stock_quantity: 50,
    low_stock_threshold: 5,
    main_image_url: "",
    gallery_images: [] as string[],
    short_description: "",
    full_description: "",
    top_notes: "Bergamot, Saffron",
    middle_notes: "Leather, Amber, Rose",
    base_notes: "Oud, Musk, Cedarwood",
    longevity: "Long-lasting (8-10 hrs)",
    projection: "Strong",
    season: ["Fall", "Winter"],
    occasion: ["Evening", "Special Events"],
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool.",
    how_to_apply: "Spray on pulse points: wrists, neck, and behind the ears. Do not rub.",
    delivery_estimate: "3-5 business days across India",
    is_published: true,
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: true,
    tester_available: true,
    seo_title: "",
    seo_description: "",
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  const set = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-") + "-100ml";
    
    const sku = name
      ? name.substring(0, 3).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900)
      : "";

    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug === "" || prev.slug.endsWith("-100ml") ? slug : prev.slug,
      sku: prev.sku === "" ? sku : prev.sku,
      seo_title: `${name} — Luxury Fragrance | ANGLELIX`,
    }));
  };

  const parseArray = (val: string) => {
    return val
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e?.preventDefault) e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (!form.original_price || Number(form.original_price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim() || `ANG-${Date.now().toString().slice(-4)}`,
        gender: form.gender,
        concentration: form.concentration,
        volume_ml: Number(form.volume_ml) || 100,
        category_id: form.category_id || null,
        original_price: Number(form.original_price),
        sale_price: form.sale_price ? Number(form.sale_price) : null,
        stock_quantity: Number(form.stock_quantity) || 0,
        low_stock_threshold: Number(form.low_stock_threshold) || 5,
        main_image_url: form.main_image_url.trim() || null,
        gallery_images: form.gallery_images,
        short_description: form.short_description.trim() || null,
        full_description: form.full_description.trim() || null,
        top_notes: parseArray(form.top_notes),
        middle_notes: parseArray(form.middle_notes),
        base_notes: parseArray(form.base_notes),
        longevity: form.longevity,
        projection: form.projection,
        season: form.season,
        occasion: form.occasion,
        ingredients: form.ingredients.trim() || null,
        how_to_apply: form.how_to_apply.trim() || null,
        delivery_estimate: form.delivery_estimate.trim() || null,
        is_published: form.is_published,
        is_featured: form.is_featured,
        is_bestseller: form.is_bestseller,
        is_new_arrival: form.is_new_arrival,
        tester_available: form.tester_available,
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Product created successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const SEASONS = ["Spring", "Summer", "Fall", "Winter", "All Seasons"];
  const OCCASIONS = ["Daily / Office", "Evening", "Date Night", "Special Events", "Signature"];

  return (
    <div style={{ padding: "2.5rem", maxWidth: "900px" }}>
      {/* Top navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <Link
          href="/admin/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.78rem",
            color: "#666",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <button
          type="submit"
          form="product-form"
          disabled={saving}
          className="btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Save size={15} />
          <span>{saving ? "Creating..." : "Save Fragrance"}</span>
        </button>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Catalog Entry
        </p>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>
          Add New Product
        </h1>
      </div>

      <form id="product-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Section 1: Basic Details */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>1. Fragrance Identity & Specifications</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input
                className="input-base"
                placeholder="e.g. THRONE, VELVET OUD, NOIR"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                style={{ fontWeight: 600, fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>URL Slug *</label>
                <input
                  className="input-base"
                  placeholder="e.g. throne-100ml"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  required
                  style={{ fontFamily: "monospace", fontSize: "0.82rem" }}
                />
              </div>
              <div>
                <label style={labelStyle}>SKU Code</label>
                <input
                  className="input-base"
                  placeholder="e.g. THR-001"
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: "0.82rem" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Category</label>
                  <button
                    type="button"
                    onClick={() => setNewCatOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#111",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    + Add New
                  </button>
                </div>
                <select
                  className="input-base"
                  value={form.category_id}
                  onChange={(e) => set("category_id", e.target.value)}
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Gender</label>
                <select
                  className="input-base"
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                >
                  <option value="Unisex">Unisex</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Concentration</label>
                <select
                  className="input-base"
                  value={form.concentration}
                  onChange={(e) => set("concentration", e.target.value)}
                >
                  <option value="Parfum">Parfum (Extrait)</option>
                  <option value="EDP">Eau de Parfum (EDP)</option>
                  <option value="EDT">Eau de Toilette (EDT)</option>
                  <option value="EDC">Eau de Cologne (EDC)</option>
                  <option value="Solid Perfume">Solid Perfume (Wax / Balm)</option>
                  <option value="Attar">Pure Attar / Oil</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>
                  {isSolidProduct({
                    category: categories.find((c) => c.id === form.category_id)?.name,
                    concentration: form.concentration,
                    name: form.name,
                  })
                    ? "Net Weight (g)"
                    : "Volume (ml)"}
                </label>
                <input
                  type="number"
                  className="input-base"
                  value={form.volume_ml}
                  onChange={(e) => set("volume_ml", e.target.value)}
                  placeholder={
                    isSolidProduct({
                      category: categories.find((c) => c.id === form.category_id)?.name,
                      concentration: form.concentration,
                      name: form.name,
                    })
                      ? "e.g. 50 or 100"
                      : "100"
                  }
                />
              </div>
              <div>
                <label style={labelStyle}>Estimated Delivery</label>
                <input
                  className="input-base"
                  value={form.delivery_estimate}
                  onChange={(e) => set("delivery_estimate", e.target.value)}
                  placeholder="3-5 business days across India"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Pricing & Stock */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>2. Pricing & Inventory</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Original Price (₹) *</label>
              <input
                type="number"
                min="0"
                className="input-base"
                value={form.original_price}
                onChange={(e) => set("original_price", e.target.value)}
                required
                style={{ fontWeight: 600 }}
              />
            </div>
            <div>
              <label style={labelStyle}>Sale Price (₹) (Optional discount price)</label>
              <input
                type="number"
                min="0"
                className="input-base"
                value={form.sale_price}
                onChange={(e) => set("sale_price", e.target.value)}
                placeholder="Leave blank for regular price"
              />
            </div>
            <div>
              <label style={labelStyle}>Stock Quantity</label>
              <input
                type="number"
                min="0"
                className="input-base"
                value={form.stock_quantity}
                onChange={(e) => set("stock_quantity", e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Low Stock Alert Threshold</label>
              <input
                type="number"
                min="0"
                className="input-base"
                value={form.low_stock_threshold}
                onChange={(e) => set("low_stock_threshold", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Olfactory Notes & Experience */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>3. Olfactory Notes & Performance</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label style={labelStyle}>Top Notes (comma-separated)</label>
              <input
                className="input-base"
                value={form.top_notes}
                onChange={(e) => set("top_notes", e.target.value)}
                placeholder="e.g. Saffron, Bergamot, Pink Pepper"
              />
              <p style={hintStyle}>The opening impression, lasts 15-30 minutes.</p>
            </div>

            <div>
              <label style={labelStyle}>Middle / Heart Notes (comma-separated)</label>
              <input
                className="input-base"
                value={form.middle_notes}
                onChange={(e) => set("middle_notes", e.target.value)}
                placeholder="e.g. Leather, Rose, Cedarwood"
              />
              <p style={hintStyle}>The core character, emerges after 30 minutes.</p>
            </div>

            <div>
              <label style={labelStyle}>Base Notes (comma-separated)</label>
              <input
                className="input-base"
                value={form.base_notes}
                onChange={(e) => set("base_notes", e.target.value)}
                placeholder="e.g. Oud, Amber, White Musk, Patchouli"
              />
              <p style={hintStyle}>The lingering foundation, lasts 6-12 hours.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Longevity</label>
                <select
                  className="input-base"
                  value={form.longevity}
                  onChange={(e) => set("longevity", e.target.value)}
                >
                  <option value="Long-lasting (8-10 hrs)">Long-lasting (8-10 hrs)</option>
                  <option value="Very Long-lasting (12+ hrs)">Very Long-lasting (12+ hrs)</option>
                  <option value="Moderate (5-7 hrs)">Moderate (5-7 hrs)</option>
                  <option value="Intimate (3-4 hrs)">Intimate (3-4 hrs)</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Projection / Sillage</label>
                <select
                  className="input-base"
                  value={form.projection}
                  onChange={(e) => set("projection", e.target.value)}
                >
                  <option value="Strong">Strong (Fills a room)</option>
                  <option value="Moderate">Moderate (Arm's length)</option>
                  <option value="Intimate">Intimate (Close to skin)</option>
                  <option value="Enormous">Enormous</option>
                </select>
              </div>
            </div>

            {/* Seasons */}
            <div>
              <label style={labelStyle}>Best Seasons</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.4rem" }}>
                {SEASONS.map((season) => {
                  const selected = form.season.includes(season);
                  return (
                    <button
                      type="button"
                      key={season}
                      onClick={() => {
                        set(
                          "season",
                          selected ? form.season.filter((s) => s !== season) : [...form.season, season]
                        );
                      }}
                      style={{
                        padding: "0.4rem 0.8rem",
                        border: selected ? "1px solid #111" : "1px solid #ddd",
                        background: selected ? "#111" : "#fff",
                        color: selected ? "#fff" : "#555",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        borderRadius: "2px",
                      }}
                    >
                      {season}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Occasions */}
            <div>
              <label style={labelStyle}>Ideal Occasions</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.4rem" }}>
                {OCCASIONS.map((occ) => {
                  const selected = form.occasion.includes(occ);
                  return (
                    <button
                      type="button"
                      key={occ}
                      onClick={() => {
                        set(
                          "occasion",
                          selected ? form.occasion.filter((o) => o !== occ) : [...form.occasion, occ]
                        );
                      }}
                      style={{
                        padding: "0.4rem 0.8rem",
                        border: selected ? "1px solid #111" : "1px solid #ddd",
                        background: selected ? "#111" : "#fff",
                        color: selected ? "#fff" : "#555",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        borderRadius: "2px",
                      }}
                    >
                      {occ}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Imagery & Description */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>4. Editorial Imagery & Storytelling</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <ProductGalleryManager
                mainImageUrl={form.main_image_url}
                onMainImageChange={(url) => set("main_image_url", url)}
                galleryImages={form.gallery_images}
                onGalleryImagesChange={(images) => set("gallery_images", images)}
                bucket="products"
              />
            </div>

            <div>
              <label style={labelStyle}>Short Description (Shown on cards)</label>
              <input
                className="input-base"
                value={form.short_description}
                onChange={(e) => set("short_description", e.target.value)}
                placeholder="A commanding leather accord with deep oud and saffron."
              />
            </div>

            <div>
              <label style={labelStyle}>Full Editorial Story / Description</label>
              <textarea
                className="input-base"
                rows={4}
                value={form.full_description}
                onChange={(e) => set("full_description", e.target.value)}
                placeholder="Describe the inspiration, emotional feeling, and signature character of this fragrance..."
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>How to Apply</label>
                <textarea
                  className="input-base"
                  rows={2}
                  value={form.how_to_apply}
                  onChange={(e) => set("how_to_apply", e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Ingredients (INCI List)</label>
                <textarea
                  className="input-base"
                  rows={2}
                  value={form.ingredients}
                  onChange={(e) => set("ingredients", e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Badges & Storefront Visibility */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>5. Badges & Storefront Visibility</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <label style={checkboxContainer}>
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
              />
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>Published (Live on site)</p>
                <p style={{ fontSize: "0.72rem", color: "#888" }}>Visible in catalog and search</p>
              </div>
            </label>

            <label style={checkboxContainer}>
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => set("is_featured", e.target.checked)}
              />
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>Featured Fragrance</p>
                <p style={{ fontSize: "0.72rem", color: "#888" }}>Prominently displayed on homepage</p>
              </div>
            </label>

            <label style={checkboxContainer}>
              <input
                type="checkbox"
                checked={form.is_bestseller}
                onChange={(e) => set("is_bestseller", e.target.checked)}
              />
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>Best Seller Badge</p>
                <p style={{ fontSize: "0.72rem", color: "#888" }}>Marks fragrance as customer favorite</p>
              </div>
            </label>

            <label style={checkboxContainer}>
              <input
                type="checkbox"
                checked={form.is_new_arrival}
                onChange={(e) => set("is_new_arrival", e.target.checked)}
              />
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>New Arrival</p>
                <p style={{ fontSize: "0.72rem", color: "#888" }}>Shows in new releases section</p>
              </div>
            </label>

            <label style={checkboxContainer}>
              <input
                type="checkbox"
                checked={form.tester_available}
                onChange={(e) => set("tester_available", e.target.checked)}
              />
              <div>
                <p style={{ fontWeight: 600, fontSize: "0.85rem" }}>Tester Available</p>
                <p style={{ fontSize: "0.72rem", color: "#888" }}>Enables discovery sample option</p>
              </div>
            </label>
          </div>
        </section>

        {/* Section 6: SEO Metadata */}
        <section style={cardStyle}>
          <h2 style={sectionTitle}>6. SEO & Meta Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>SEO Title</label>
              <input
                className="input-base"
                value={form.seo_title}
                onChange={(e) => set("seo_title", e.target.value)}
                placeholder="Product Name — Luxury Fragrance | ANGLELIX"
              />
            </div>
            <div>
              <label style={labelStyle}>SEO Meta Description</label>
              <textarea
                className="input-base"
                rows={2}
                value={form.seo_description}
                onChange={(e) => set("seo_description", e.target.value)}
                placeholder="Discover this fragrance by ANGLELIX. Handcrafted luxury perfumery."
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </section>

        {/* Submit Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
          <Link
            href="/admin/products"
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              border: "1px solid #ddd",
              color: "#333",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ minWidth: "160px", justifyContent: "center" }}
          >
            {saving ? "Saving..." : "Create Product"}
          </button>
        </div>
      </form>

      {/* Quick Add Category Modal */}
      {newCatOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => !creatingCat && setNewCatOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "460px",
              padding: "2rem",
              boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
              border: "1px solid #eee",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>
                Add New Category
              </h3>
              <button
                type="button"
                onClick={() => setNewCatOpen(false)}
                disabled={creatingCat}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddCategory} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Category Name *</label>
                <input
                  required
                  autoFocus
                  className="input-base"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Amber & Spices, Luxury Attar, Ouds"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setNewCatOpen(false)}
                  disabled={creatingCat}
                  style={{
                    padding: "0.65rem 1.25rem",
                    background: "none",
                    border: "1px solid #ddd",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCat}
                  className="btn-primary"
                  style={{ opacity: creatingCat ? 0.7 : 1 }}
                >
                  {creatingCat ? "Creating..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #eee",
  padding: "2rem",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.82rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#555",
  marginBottom: "1.5rem",
  paddingBottom: "0.75rem",
  borderBottom: "1px solid #f0f0f0",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#999",
  marginBottom: "0.4rem",
};

const hintStyle: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "0.72rem",
  color: "#aaa",
  marginTop: "0.25rem",
};

const checkboxContainer: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.65rem",
  padding: "0.75rem",
  background: "#fafafa",
  border: "1px solid #eee",
  cursor: "pointer",
};
