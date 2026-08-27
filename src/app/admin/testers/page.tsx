"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertTriangle, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Tester {
  id: string;
  product_id: string;
  size_ml: number;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  product?: { id: string; name: string; slug: string; main_image_url: string };
}

interface Product {
  id: string;
  name: string;
  main_image_url: string;
}

const EMPTY: Partial<Tester> = {
  product_id: "", size_ml: 2, price: 0, stock_quantity: 0, is_active: true,
};

export default function AdminTestersPage() {
  const [testers, setTesters] = useState<Tester[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<Tester> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [testerToDelete, setTesterToDelete] = useState<Tester | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/testers").then((r) => r.json()),
      fetch("/api/admin/products?limit=200").then((r) => r.json()),
    ])
      .then(([td, pd]) => {
        setTesters(td.testers ?? []);
        setProducts(pd.products ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); };
  const openEdit = (t: Tester) => { setEditing({ ...t }); setIsNew(false); };
  const closeForm = () => { setEditing(null); setIsNew(false); };

  const set = (key: string, value: unknown) => setEditing((prev) => prev ? { ...prev, [key]: value } : null);

  const save = async () => {
    if (!editing?.product_id) { toast.error("Please select a product."); return; }
    if (!editing.price || editing.price <= 0) { toast.error("Price must be greater than 0."); return; }
    setSaving(true);
    const toastId = toast.loading("Saving tester...");
    try {
      const method = isNew ? "POST" : "PATCH";
      const url = isNew ? "/api/admin/testers" : `/api/admin/testers/${editing.id}`;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      const d = await res.json();
      if (d.error) { toast.error(d.error, { id: toastId }); return; }
      toast.success(isNew ? "Tester created." : "Tester updated.", { id: toastId });
      load();
      closeForm();
    } catch { toast.error("Failed to save.", { id: toastId }); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!testerToDelete) return;
    setDeleting(true);
    const toastId = toast.loading("Deleting tester...");
    try {
      const res = await fetch(`/api/admin/testers/${testerToDelete.id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.error) { toast.error(d.error, { id: toastId }); return; }
      toast.success("Tester removed successfully.", { id: toastId });
      setTesterToDelete(null);
      load();
    } catch {
      toast.error("Failed to delete tester.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const toggle = async (t: Tester) => {
    await fetch(`/api/admin/testers/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !t.is_active }),
    });
    load();
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin</p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>Discovery Testers</h1>
        </div>
        <button onClick={openNew} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Plus size={15} /> Add Tester Size
        </button>
      </div>

      {loading ? (
        <p style={{ fontFamily: "var(--font-sans)", color: "#999" }}>Loading...</p>
      ) : testers.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #eee", padding: "4rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem" }}>No tester sizes added yet</p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#bbb" }}>Offer 2ml, 5ml, or 10ml samples to let customers discover your fragrances.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #eee" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                {["Fragrance", "Size", "Price", "Stock", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#999", borderBottom: "1px solid #eee" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {testers.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {t.product?.main_image_url && (
                        <img src={t.product.main_image_url} alt="" style={{ width: "36px", height: "36px", objectFit: "cover" }} />
                      )}
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600 }}>{t.product?.name ?? "Unknown Fragrance"}</p>
                    </div>
                  </td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600 }}>{t.size_ml}ml</td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 700 }}>{formatPrice(t.price)}</td>
                  <td style={{ padding: "0.9rem 1rem", fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}>{t.stock_quantity} units</td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: t.is_active ? "#27ae60" : "#e74c3c" }}>
                      {t.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td style={{ padding: "0.9rem 1rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <button onClick={() => toggle(t)} title="Toggle active" style={{ background: "none", border: "none", cursor: "pointer", color: t.is_active ? "#27ae60" : "#ccc" }}>
                        {t.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                      </button>
                      <button onClick={() => openEdit(t)} title="Edit tester" style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: "0.3rem" }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setTesterToDelete(t)} title="Delete tester" style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", padding: "0.3rem" }}>
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

      {/* ── Edit Modal ── */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", width: "min(460px, 96vw)", padding: "2rem", border: "1px solid #eee", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 700 }}>
                {isNew ? "Add Tester Size" : "Edit Tester Size"}
              </h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Fragrance *</label>
                <select className="input-base" value={editing.product_id ?? ""} onChange={(e) => set("product_id", e.target.value)}>
                  <option value="">Select a fragrance...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Size (ml) *</label>
                  <select className="input-base" value={editing.size_ml ?? 2} onChange={(e) => set("size_ml", Number(e.target.value))}>
                    <option value={2}>2ml (Sample vial)</option>
                    <option value={5}>5ml (Travel spray)</option>
                    <option value={10}>10ml (Pocket spray)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Price (₹) *</label>
                  <input type="number" min={1} className="input-base" value={editing.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Stock Quantity</label>
                  <input type="number" min={0} className="input-base" value={editing.stock_quantity ?? 0} onChange={(e) => set("stock_quantity", Number(e.target.value))} />
                </div>
                <div>
                  <label style={labelStyle}>Active</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.65rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => set("is_active", e.target.checked)} />
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>Available to order</span>
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
      {testerToDelete && (
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
          onClick={() => !deleting && setTesterToDelete(null)}
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
                    Delete Tester Size
                  </h3>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#888" }}>
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <button
                onClick={() => !deleting && setTesterToDelete(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#555", lineHeight: 1.5, marginBottom: "1.75rem" }}>
              Are you sure you want to delete the <strong>{testerToDelete.size_ml}ml</strong> tester for <strong>{testerToDelete.product?.name ?? "this fragrance"}</strong>?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setTesterToDelete(null)}
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
