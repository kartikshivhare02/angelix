"use client";

import { useState, useRef } from "react";
import { Upload, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  bucket?: string;
}

const LUXURY_PRESETS = [
  {
    name: "Royal Oud & Gold",
    url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80",
  },
  {
    name: "Velvet Rose & Glass",
    url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&q=80",
  },
  {
    name: "Smoky Noir Flask",
    url: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80",
  },
  {
    name: "Golden Elixir Crystal",
    url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
  },
  {
    name: "Fresh Bergamot & Citrus",
    url: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
  },
  {
    name: "Midnight Leather Edition",
    url: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
  },
];

export function ImageUploadPicker({ value, onChange, label = "Product Image", bucket = "products" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"presets" | "upload" | "url">("presets");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be under 15MB.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        toast.error(`Upload error: ${data.error}`, { id: toastId });
        return;
      }

      onChange(data.url);
      toast.success("Image uploaded successfully!", { id: toastId });
    } catch {
      toast.error("Failed to upload image. Please try again.", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <label
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.72rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#999",
          }}
        >
          {label}
        </label>
        {/* Switcher */}
        <div style={{ display: "flex", gap: "0.25rem", background: "#f5f5f5", padding: "0.2rem", borderRadius: "3px" }}>
          <button
            type="button"
            onClick={() => setTab("presets")}
            style={{
              padding: "0.3rem 0.6rem",
              background: tab === "presets" ? "#fff" : "transparent",
              color: tab === "presets" ? "#111" : "#777",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: tab === "presets" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Luxury Presets
          </button>
          <button
            type="button"
            onClick={() => setTab("upload")}
            style={{
              padding: "0.3rem 0.6rem",
              background: tab === "upload" ? "#fff" : "transparent",
              color: tab === "upload" ? "#111" : "#777",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: tab === "upload" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            style={{
              padding: "0.3rem 0.6rem",
              background: tab === "url" ? "#fff" : "transparent",
              color: tab === "url" ? "#111" : "#777",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: tab === "url" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Paste URL
          </button>
        </div>
      </div>

      {/* ── Preset Grid ── */}
      {tab === "presets" && (
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#888", marginBottom: "0.6rem" }}>
            Click any high-resolution perfume bottle to select it for this product:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "0.75rem" }}>
            {LUXURY_PRESETS.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => onChange(preset.url)}
                  style={{
                    position: "relative",
                    background: "#f9f9f9",
                    border: isSelected ? "2px solid #111" : "1px solid #eee",
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    transition: "transform 0.15s, border-color 0.15s",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", paddingBottom: "115%" }}>
                    <img
                      src={preset.url}
                      alt={preset.name}
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "#111",
                          color: "#fff",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "0.35rem 0.5rem", background: "#fff" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 600, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {preset.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── File Upload with Drag & Drop ── */}
      {tab === "upload" && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: dragOver ? "2px dashed #111" : "2px dashed #ddd",
              background: dragOver ? "#f0f0f0" : "#fafafa",
              padding: "2rem 1.5rem",
              textAlign: "center",
              cursor: uploading ? "wait" : "pointer",
              borderRadius: "4px",
              transition: "border-color 0.2s, background 0.2s",
            }}
          >
            {uploading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <Loader2 size={24} className="animate-spin" color="#111" />
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#555" }}>
                  Uploading image...
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Upload size={20} color="#555" />
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 600, color: "#111" }}>
                    Click or drag image file here
                  </p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#999", marginTop: "0.2rem" }}>
                    Supports JPG, PNG, WebP
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Direct URL ── */}
      {tab === "url" && (
        <div>
          <input
            type="url"
            className="input-base"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... or direct image link"
            style={{ fontFamily: "monospace", fontSize: "0.82rem" }}
          />
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#999", marginTop: "0.3rem" }}>
            Paste a direct link to an image file ending in .jpg, .png, or .webp
          </p>
        </div>
      )}

      {/* ── Active Selection Preview ── */}
      {value && (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#fdfdfd", border: "1px solid #eee", padding: "0.75rem" }}>
          <div style={{ width: "64px", height: "64px", background: "#f5f5f5", overflow: "hidden", border: "1px solid #e5e5e5", flexShrink: 0 }}>
            <img
              src={value}
              alt="Selected Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 600, color: "#27ae60", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Check size={13} strokeWidth={2.5} /> Image Attached
            </p>
            <p style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "0.2rem" }}>
              {value}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              background: "none",
              border: "1px solid #ddd",
              color: "#666",
              padding: "0.3rem 0.6rem",
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
