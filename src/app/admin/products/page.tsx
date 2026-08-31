"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, ToggleLeft, ToggleRight, Eye, Sparkles, Flame, Package, AlertTriangle, X } from "lucide-react";
import { formatPrice, formatProductSize } from "@/lib/utils";
import { toast } from "sonner";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  gender: string | null;
  concentration: string | null;
  volume_ml: number | null;
  original_price: number;
  sale_price: number | null;
  stock_quantity: number;
  is_published: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  main_image_url: string | null;
  created_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "low_stock">("all");
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const q = search ? `?q=${encodeURIComponent(search)}&limit=100` : "?limit=100";
      const res = await fetch(`/api/admin/products${q}`);
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const toggleStatus = async (id: string, field: "is_published" | "is_featured" | "is_bestseller", currentVal: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentVal }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: !currentVal } : p))
      );
      toast.success("Product updated");
    } catch {
      toast.error("Failed to update product");
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    const toastId = toast.loading(`Deleting ${productToDelete.name}...`);

    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error, { id: toastId });
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success(`"${productToDelete.name}" deleted successfully`, { id: toastId });
      setProductToDelete(null);
    } catch {
      toast.error("Failed to delete product", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === "published") return p.is_published;
    if (filter === "draft") return !p.is_published;
    if (filter === "low_stock") return p.stock_quantity <= 5;
    return true;
  });

  return (
    <div style={{ padding: "2.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Inventory Management
          </p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>
            Products
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", background: "#fff", padding: "0.3rem", border: "1px solid #eee" }}>
          {[
            { key: "all", label: "All Products" },
            { key: "published", label: "Published" },
            { key: "draft", label: "Drafts" },
            { key: "low_stock", label: "Low Stock (≤5)" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key as any)}
              style={{
                background: filter === t.key ? "#111" : "transparent",
                color: filter === t.key ? "#fff" : "#666",
                border: "none",
                padding: "0.45rem 0.9rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                fontWeight: filter === t.key ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #eee", padding: "0 0.75rem", width: "260px" }}>
          <Search size={15} color="#999" />
          <input
            type="text"
            placeholder="Search perfumes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              padding: "0.6rem 0.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              width: "100%",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #eee", overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", fontFamily: "var(--font-sans)", color: "#999" }}>
            Loading catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <Package size={36} strokeWidth={1} color="#ccc" style={{ margin: "0 auto 0.75rem" }} />
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#666", fontWeight: 600 }}>
              No products found
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#999", marginTop: "0.25rem", marginBottom: "1.25rem" }}>
              {search ? "No products matching your search criteria." : "Start building your catalog by adding your first fragrance."}
            </p>
            <Link href="/admin/products/new" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
              <Plus size={15} style={{ marginRight: "0.4rem" }} /> Create Fragrance
            </Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #eee" }}>
                {["Product", "Gender / Specs", "Price", "Stock", "Badges", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.85rem 1rem",
                      textAlign: "left",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#999",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f2f2f2", transition: "background 0.15s" }}>
                  {/* Product Info */}
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          background: "#f4f4f4",
                          flexShrink: 0,
                          overflow: "hidden",
                          border: "1px solid #eee",
                        }}
                      >
                        {p.main_image_url ? (
                          <img
                            src={p.main_image_url}
                            alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: "0.7rem" }}>
                            No Img
                          </div>
                        )}
                      </div>
                      <div>
                        <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.9rem", color: "#111" }}>
                          {p.name}
                        </p>
                        <p style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#999", marginTop: "0.15rem" }}>
                          SKU: {p.sku} · /{p.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Specs */}
                  <td style={{ padding: "1rem", fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "#555" }}>
                    <p>{p.gender ?? "Unisex"}</p>
                    <p style={{ fontSize: "0.72rem", color: "#999" }}>
                      {p.concentration ?? "EDP"} {p.volume_ml ? `· ${formatProductSize(p.volume_ml, p)}` : ""}
                    </p>
                  </td>

                  {/* Price */}
                  <td style={{ padding: "1rem" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.88rem", color: "#111" }}>
                      {formatPrice(p.sale_price || p.original_price)}
                    </p>
                    {p.sale_price && (
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#999", textDecoration: "line-through" }}>
                        {formatPrice(p.original_price)}
                      </p>
                    )}
                  </td>

                  {/* Stock */}
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: p.stock_quantity <= 5 ? "#c0392b" : "#27ae60",
                      }}
                    >
                      {p.stock_quantity} units
                    </span>
                    {p.stock_quantity <= 5 && (
                      <span style={{ display: "block", fontSize: "0.68rem", color: "#c0392b" }}>Low stock</span>
                    )}
                  </td>

                  {/* Badges */}
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        title="Toggle Featured"
                        onClick={() => toggleStatus(p.id, "is_featured", p.is_featured)}
                        style={{
                          background: p.is_featured ? "#fff3cd" : "#f5f5f5",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.3rem 0.5rem",
                          borderRadius: "3px",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: p.is_featured ? "#856404" : "#999",
                        }}
                      >
                        <Sparkles size={12} />
                        Featured
                      </button>
                      <button
                        title="Toggle Best Seller"
                        onClick={() => toggleStatus(p.id, "is_bestseller", p.is_bestseller)}
                        style={{
                          background: p.is_bestseller ? "#f8d7da" : "#f5f5f5",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.3rem 0.5rem",
                          borderRadius: "3px",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: p.is_bestseller ? "#721c24" : "#999",
                        }}
                      >
                        <Flame size={12} />
                        Best Seller
                      </button>
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "1rem" }}>
                    <button
                      onClick={() => toggleStatus(p.id, "is_published", p.is_published)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: p.is_published ? "#27ae60" : "#999",
                      }}
                    >
                      {p.is_published ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      <span>{p.is_published ? "Live" : "Draft"}</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        title="Preview on Store"
                        style={{ padding: "0.4rem", color: "#666", display: "inline-flex" }}
                      >
                        <Eye size={15} />
                      </Link>
                      <Link
                        href={`/admin/products/${p.id}`}
                        title="Edit Product"
                        style={{ padding: "0.4rem", color: "#111", display: "inline-flex" }}
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => setProductToDelete(p)}
                        title="Delete Product"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.4rem",
                          color: "#c0392b",
                          display: "inline-flex",
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Custom Delete Confirmation Modal ── */}
      {productToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => !deleting && setProductToDelete(null)}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "460px",
              padding: "2rem",
              boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
              border: "1px solid #eee",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#fde8e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertTriangle size={20} color="#e02424" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>
                    Delete Product
                  </h3>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#888" }}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={() => !deleting && setProductToDelete(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: "#f9f9f9", padding: "1rem", marginBottom: "1.5rem", border: "1px solid #eee", display: "flex", alignItems: "center", gap: "1rem" }}>
              {productToDelete.main_image_url && (
                <img
                  src={productToDelete.main_image_url}
                  alt={productToDelete.name}
                  style={{ width: "48px", height: "48px", objectFit: "cover" }}
                />
              )}
              <div>
                <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.95rem", color: "#111" }}>
                  {productToDelete.name}
                </p>
                <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#888" }}>
                  SKU: {productToDelete.sku} · {formatPrice(productToDelete.sale_price || productToDelete.original_price)}
                </p>
              </div>
            </div>

            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#555", lineHeight: 1.5, marginBottom: "1.75rem" }}>
              Are you sure you want to permanently remove <strong>{productToDelete.name}</strong> from your fragrance catalog and store?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setProductToDelete(null)}
                disabled={deleting}
                style={{
                  padding: "0.65rem 1.25rem",
                  background: "#fff",
                  border: "1px solid #ddd",
                  color: "#333",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                style={{
                  padding: "0.65rem 1.4rem",
                  background: "#c0392b",
                  border: "none",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: deleting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Trash2 size={14} />
                <span>{deleting ? "Deleting..." : "Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
