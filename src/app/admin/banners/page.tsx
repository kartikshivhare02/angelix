"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, AlertTriangle, X } from "lucide-react";
import { ImageUploadPicker } from "@/components/admin/ImageUploadPicker";

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  desktop_image_url: string;
  mobile_image_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  text_alignment: "left" | "center" | "right";
  is_active: boolean;
  display_order: number;
}

const EMPTY: Partial<Banner> = {
  title: "",
  subtitle: "",
  desktop_image_url: "",
  mobile_image_url: "",
  cta_label: "Explore Collection",
  cta_url: "/shop",
  text_alignment: "center",
  is_active: true,
  display_order: 0,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then((d) => setBanners(d.banners ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); };
  const openEdit = (b: Banner) => { setEditing({ ...b }); setIsNew(false); };
  const closeForm = () => { setEditing(null); setIsNew(false); };

  const set = (key: string, value: unknown) => {
    setEditing((prev) => prev ? { ...prev, [key]: value } : null);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.desktop_image_url) { toast.error("Desktop image is required."); return; }
    setSaving(true);
    const toastId = toast.loading("Saving banner...");
    try {
      const method = isNew ? "POST" : "PATCH";
      const url = isNew ? "/api/admin/banners" : `/api/admin/banners/${editing.id}`;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      const d = await res.json();
      if (d.error) { toast.error(d.error, { id: toastId }); return; }
      toast.success(isNew ? "Banner created." : "Banner updated.", { id: toastId });
      load();
      closeForm();
    } catch { toast.error("Failed to save banner.", { id: toastId }); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    setDeleting(true);
    const toastId = toast.loading("Deleting banner...");
    try {
      const res = await fetch(`/api/admin/banners/${bannerToDelete.id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.error) { toast.error(d.error, { id: toastId }); return; }
      toast.success("Banner deleted successfully.", { id: toastId });
      setBannerToDelete(null);
      load();
    } catch {
      toast.error("Failed to delete banner.", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const toggle = async (banner: Banner) => {
    const res = await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !banner.is_active }),
    });
    const d = await res.json();
    if (d.error) { toast.error(d.error); return; }
    load();
  };

  return (
    <div style={{ padding: "2.5rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#999", letterSpacing: "0.06em", textTransform: "uppercase" }}>Admin</p>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.75rem", fontWeight: 700, color: "#111", marginTop: "0.25rem" }}>Hero Banners</h1>
        </div>
        <button onClick={openNew} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Plus size={15} /> Add Banner
        </button>
      </div>

      {loading ? (
        <p style={{ fontFamily: "var(--font-sans)", color: "#999" }}>Loading...</p>
      ) : banners.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #eee", padding: "4rem", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "#ccc", marginBottom: "0.5rem" }}>No banners yet</p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#bbb" }}>Create your first homepage hero banner.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {banners.map((b) => (
            <div key={b.id} style={{ background: "#fff", border: "1px solid #eee", overflow: "hidden" }}>
              <div style={{ position: "relative", height: "180px", background: "#f5f5f5" }}>
                <img src={b.desktop_image_url} alt={b.title ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "1rem" }}>
                  <p style={{ color: "#fff", fontFamily: "var(--font-serif)", fontSize: "1.1rem", lineHeight: 1.2 }}>{b.title}</p>
                  {b.subtitle && <p style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-sans)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{b.subtitle}</p>}
                </div>
              </div>
              <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600, color: b.is_active ? "#27ae60" : "#e74c3c" }}>
                  {b.is_active ? "Active" : "Inactive"} · Order #{b.display_order}
                </span>
                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                  <button onClick={() => toggle(b)} title="Toggle active" style={{ background: "none", border: "none", cursor: "pointer", color: b.is_active ? "#27ae60" : "#ccc" }}>
                    {b.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => openEdit(b)} title="Edit banner" style={{ background: "none", border: "none", cursor: "pointer", color: "#555", padding: "0.3rem" }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setBannerToDelete(b)} title="Delete banner" style={{ background: "none", border: "none", cursor: "pointer", color: "#e74c3c", padding: "0.3rem" }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Banner Modal ── */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#fff", width: "min(600px, 96vw)", maxHeight: "90vh", overflowY: "auto", padding: "2rem", border: "1px solid #eee", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 700 }}>
                {isNew ? "Add Hero Banner" : "Edit Hero Banner"}
              </h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={labelStyle}>Headline Title</label>
                <input className="input-base" value={editing.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Scents of Distinction" />
              </div>
              <div>
                <label style={labelStyle}>Subtitle / Description</label>
                <input className="input-base" value={editing.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="e.g. Handcrafted Extrait de Parfum" />
              </div>
              {/* Dual image uploaders */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <ImageUploadPicker
                    value={editing.desktop_image_url ?? ""}
                    onChange={(url) => set("desktop_image_url", url)}
                    label="🖥️ Desktop Banner Image (16:9)*"
                    bucket="banners"
                  />
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#888", marginTop: "0.3rem" }}>
                    Recommended: 1920×700 or 1600×700 (Landscape)
                  </p>
                </div>
                <div>
                  <ImageUploadPicker
                    value={editing.mobile_image_url ?? ""}
                    onChange={(url) => set("mobile_image_url", url || null)}
                    label="📱 Mobile Phone Banner Image"
                    bucket="banners"
                  />
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#888", marginTop: "0.3rem" }}>
                    Recommended: 800×1000 or 1080×1350 (Portrait). Optional.
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              {(editing.desktop_image_url || editing.mobile_image_url) && (
                <div style={{ border: "1px solid #eee", padding: "1rem", background: "#fafafa" }}>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#888", marginBottom: "0.5rem" }}>
                    Live Preview Simulation
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                    {/* Desktop preview */}
                    <div>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "#999", display: "block", marginBottom: "0.2rem" }}>Desktop (Wide 16:9)</span>
                      <div style={{ position: "relative", height: "130px", background: "#111", overflow: "hidden", border: "1px solid #ddd" }}>
                        <img
                          src={editing.desktop_image_url || editing.mobile_image_url || ""}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0.6rem" }}>
                          <p style={{ color: "#fff", fontFamily: "var(--font-serif)", fontSize: "0.85rem", fontWeight: 600 }}>{editing.title || "Headline Title"}</p>
                          <p style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-sans)", fontSize: "0.65rem" }}>{editing.subtitle || "Subtitle text"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile preview */}
                    <div>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "#999", display: "block", marginBottom: "0.2rem" }}>Phone (Portrait)</span>
                      <div style={{ position: "relative", height: "130px", width: "95px", margin: "0 auto", background: "#111", overflow: "hidden", border: "1px solid #ddd", borderRadius: "3px" }}>
                        <img
                          src={editing.mobile_image_url || editing.desktop_image_url || ""}
                          alt=""
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0.4rem" }}>
                          <p style={{ color: "#fff", fontFamily: "var(--font-serif)", fontSize: "0.68rem", fontWeight: 600, lineHeight: 1.1 }}>{editing.title || "Title"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Button Label</label>
                  <input className="input-base" value={editing.cta_label ?? ""} onChange={(e) => set("cta_label", e.target.value)} placeholder="Explore Collection" />
                </div>
                <div>
                  <label style={labelStyle}>Button Link URL</label>
                  <input className="input-base" value={editing.cta_url ?? ""} onChange={(e) => set("cta_url", e.target.value)} placeholder="/shop" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Text Alignment</label>
                  <select className="input-base" value={editing.text_alignment ?? "center"} onChange={(e) => set("text_alignment", e.target.value)}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Display Order</label>
                  <input type="number" min={0} className="input-base" value={editing.display_order ?? 0} onChange={(e) => set("display_order", Number(e.target.value))} />
                </div>
                <div>
                  <label style={labelStyle}>Active</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.65rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => set("is_active", e.target.checked)} />
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>Live on store</span>
                  </label>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button onClick={closeForm} style={{ padding: "0.65rem 1.25rem", background: "none", border: "1px solid #ddd", fontFamily: "var(--font-sans)", fontSize: "0.82rem", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="btn-primary" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : isNew ? "Create Banner" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Delete Confirmation Modal ── */}
      {bannerToDelete && (
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
          onClick={() => !deleting && setBannerToDelete(null)}
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
                    Delete Hero Banner
                  </h3>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#888" }}>
                    This banner will be removed from homepage.
                  </p>
                </div>
              </div>
              <button
                onClick={() => !deleting && setBannerToDelete(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#555", lineHeight: 1.5, marginBottom: "1.75rem" }}>
              Are you sure you want to permanently delete this hero banner {bannerToDelete.title ? `"${bannerToDelete.title}"` : ""}?
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setBannerToDelete(null)}
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
