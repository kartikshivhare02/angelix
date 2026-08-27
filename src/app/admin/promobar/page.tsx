"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface PromoBar {
  id: string;
  text: string;
  link_url: string | null;
  link_label: string | null;
  is_active: boolean;
  display_order: number;
  start_date: string | null;
  end_date: string | null;
}

const EMPTY: Partial<PromoBar> = {
  text: "", link_url: "", link_label: "", is_active: true, display_order: 0,
  start_date: "", end_date: "",
};

export default function AdminPromoBarPage() {
  const [items, setItems] = useState<PromoBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<PromoBar> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/promobar")
      .then((r) => r.json())
      .then((d) => setItems(d.promos ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); };
  const openEdit = (p: PromoBar) => { setEditing({ ...p }); setIsNew(false); };
  const closeForm = () => { setEditing(null); setIsNew(false); };

  const handleChange = (key: string, value: unknown) => {
    setEditing((prev) => prev ? { ...prev, [key]: value } : null);
  };

  const save = async () => {
    if (!editing?.text?.trim()) { toast.error("Text is required."); return; }
    setSaving(true);
    try {
      const method = isNew ? "POST" : "PATCH";
      const url = isNew ? "/api/admin/promobar" : `/api/admin/promobar/${editing.id}`;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      const d = await res.json();
      if (d.error) { toast.error(d.error); return; }
      toast.success(isNew ? "Promo message created." : "Promo message updated.");
      load();
      closeForm();
    } catch { toast.error("Failed to save."); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this promo message?")) return;
    const res = await fetch(`/api/admin/promobar/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.error) { toast.error(d.error); return; }
    toast.success("Deleted.");
    load();
  };

  const toggle = async (p: PromoBar) => {
    await fetch(`/api/admin/promobar/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !p.is_active }),
    });
    load();
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin</p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>Promo Bar</h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#999", marginTop: "0.25rem" }}>Manage the announcement bar shown at the top of the site.</p>
        </div>
        <button onClick={openNew} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Plus size={15} /> Add Message
        </button>
      </div>

      {loading ? (
        <p style={{ fontFamily: "var(--font-sans)", color: "#999" }}>Loading...</p>
      ) : items.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #eee", padding: "4rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem" }}>No promo messages</p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#bbb" }}>Add announcements like "FREE SHIPPING ABOVE ₹1,499" to display at the top of your site.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((p) => (
            <div key={p.id} style={{ background: "#fff", border: "1px solid #eee", display: "flex", gap: "1rem", alignItems: "center", padding: "1rem 1.25rem" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.88rem" }}>{p.text}</p>
                <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.25rem" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: p.is_active ? "#27ae60" : "#e74c3c" }}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                  {p.link_url && <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#999" }}>Link: {p.link_url}</span>}
                  {p.start_date && <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#bbb" }}>From: {p.start_date}</span>}
                  {p.end_date && <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#bbb" }}>To: {p.end_date}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button onClick={() => toggle(p)} style={{ background: "none", border: "none", cursor: "pointer", color: p.is_active ? "#27ae60" : "#ccc", display: "flex" }}>
                  {p.is_active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", display: "flex", padding: "0.3rem" }}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", display: "flex", padding: "0.3rem" }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", width: "min(540px, 96vw)", padding: "2rem" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem" }}>
              {isNew ? "Add Promo Message" : "Edit Promo Message"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Announcement Text *</label>
                <input className="input-base" value={editing.text ?? ""} onChange={(e) => handleChange("text", e.target.value)} placeholder="FREE SHIPPING ON ORDERS ABOVE ₹1,499" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Link Label</label>
                  <input className="input-base" value={editing.link_label ?? ""} onChange={(e) => handleChange("link_label", e.target.value)} placeholder="Shop Now" />
                </div>
                <div>
                  <label style={labelStyle}>Link URL</label>
                  <input className="input-base" value={editing.link_url ?? ""} onChange={(e) => handleChange("link_url", e.target.value || null)} placeholder="/shop" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" className="input-base" value={editing.start_date ?? ""} onChange={(e) => handleChange("start_date", e.target.value || null)} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" className="input-base" value={editing.end_date ?? ""} onChange={(e) => handleChange("end_date", e.target.value || null)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input type="number" className="input-base" value={editing.display_order ?? 0} onChange={(e) => handleChange("display_order", Number(e.target.value))} />
                </div>
                <div>
                  <label style={labelStyle}>Active</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.65rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => handleChange("is_active", e.target.checked)} />
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>Show on site</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
              <button onClick={save} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : isNew ? "Create" : "Save Changes"}
              </button>
              <button onClick={closeForm} style={{ padding: "0.65rem 1.25rem", background: "none", border: "1px solid #ddd", fontFamily: "var(--font-sans)", fontSize: "0.82rem", cursor: "pointer" }}>
                Cancel
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
