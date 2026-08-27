"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertTriangle, X } from "lucide-react";
import { ImageUploadPicker } from "@/components/admin/ImageUploadPicker";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

const EMPTY: Partial<Category> = {
  name: "", slug: "", description: "", image_url: "", is_active: true, display_order: 0,
};

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); };
  const openEdit = (c: Category) => { setEditing({ ...c }); setIsNew(false); };
  const closeForm = () => { setEditing(null); setIsNew(false); };

  const set = (key: string, value: unknown) => setEditing((prev) => prev ? { ...prev, [key]: value } : null);

  const handleNameChange = (name: string) => {
    setEditing((prev) => prev ? { ...prev, name, slug: isNew ? toSlug(name) : prev.slug } : null);
  };

  const save = async () => {
    if (!editing?.name?.trim()) { toast.error("Name is required."); return; }
    setSaving(true);
    const toastId = toast.loading("Saving category...");
    try {
      const method = isNew ? "POST" : "PATCH";
      const url = isNew ? "/api/admin/categories" : `/api/admin/categories/${editing.id}`;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      const d = await res.json();
      if (d.error) { toast.error(d.error, { id: toastId }); return; }
      toast.success(isNew ? "Category created." : "Category updated.", { id: toastId });
      load();
      closeForm();
    } catch { toast.error("Failed to save.", { id: toastId }); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    const toastId = toast.loading(`Deleting ${categoryToDelete.name}...`);
    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.error) { toast.error(d.error, { id: toastId }); return; }
      toast.success("Category deleted successfully.", { id: toastId });
      setCategoryToDelete(null);
      load();
    } catch {
      toast.error("Failed to delete category.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const toggle = async (c: Category) => {
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    load();
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin</p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>Categories</h1>
        </div>
        <button onClick={openNew} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Plus size={15} /> Add Category
        </button>
      </div>

      {loading ? (
        <p style={{ fontFamily: "var(--font-sans)", color: "#999" }}>Loading...</p>
      ) : categories.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #eee", padding: "4rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem" }}>No categories yet</p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#bbb" }}>Create categories like Men, Women, Unisex, Gift Sets to organize your products.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #eee" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                {["Category", "Slug", "Order", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#999", borderBottom: "1px solid #eee" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {c.image_url && <img src={c.image_url} alt={c.name} style={{ width: "40px", height: "40px", objectFit: "cover", background: "#f5f5f5" }} />}
                      <div>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600 }}>{c.name}</p>
                        {c.description && <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#999" }}>{c.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "monospace", fontSize: "0.78rem", color: "#777" }}>{c.slug}</td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.85rem", textAlign: "center" }}>{c.display_order}</td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: c.is_active ? "#27ae60" : "#e74c3c" }}>
                      {c.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <button onClick={() => toggle(c)} title="Toggle active status" style={{ background: "none", border: "none", cursor: "pointer", color: c.is_active ? "#27ae60" : "#ccc" }}>
                        {c.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      <button onClick={() => openEdit(c)} title="Edit category" style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: "0.3rem" }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setCategoryToDelete(c)} title="Delete category" style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", padding: "0.3rem" }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Category Edit / Add Modal ── */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", width: "min(520px, 96vw)", maxHeight: "90vh", overflowY: "auto", padding: "2rem", border: "1px solid #eee", boxShadow: "0 12px 48px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 700 }}>
                {isNew ? "Add Category" : "Edit Category"}
              </h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Category Name *</label>
                <input className="input-base" value={editing.name ?? ""} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Men, Women, Gift Sets" />
              </div>
              <div>
                <label style={labelStyle}>Slug *</label>
                <input className="input-base" value={editing.slug ?? ""} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated from name" style={{ fontFamily: "monospace", fontSize: "0.82rem" }} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input className="input-base" value={editing.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Short description (optional)" />
              </div>
              <div>
                <ImageUploadPicker
                  value={editing.image_url ?? ""}
                  onChange={(url) => set("image_url", url || null)}
                  label="Category Cover Image"
                  bucket="brand-assets"
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input type="number" min={0} className="input-base" value={editing.display_order ?? 0} onChange={(e) => set("display_order", Number(e.target.value))} />
                </div>
                <div>
                  <label style={labelStyle}>Active</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.65rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => set("is_active", e.target.checked)} />
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>Show in navigation</span>
                  </label>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button onClick={closeForm} style={{ padding: "0.65rem 1.25rem", background: "none", border: "1px solid #ddd", fontFamily: "var(--font-sans)", fontSize: "0.82rem", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : isNew ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Delete Confirmation Modal ── */}
      {categoryToDelete && (
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
          onClick={() => !deleting && setCategoryToDelete(null)}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "440px",
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
                    Delete Category
                  </h3>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#888" }}>
                    Products in this category will be unassigned.
                  </p>
                </div>
              </div>
              <button
                onClick={() => !deleting && setCategoryToDelete(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#555", lineHeight: 1.5, marginBottom: "1.75rem" }}>
              Are you sure you want to permanently delete category <strong>{categoryToDelete.name}</strong>?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setCategoryToDelete(null)}
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

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "var(--font-sans)", fontSize: "0.72rem",
  fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#999", marginBottom: "0.4rem",
};
