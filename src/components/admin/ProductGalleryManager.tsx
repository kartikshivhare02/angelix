"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  Check,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  mainImageUrl: string;
  onMainImageChange: (url: string) => void;
  galleryImages: string[];
  onGalleryImagesChange: (images: string[]) => void;
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
  {
    name: "Amber Noir Crystal",
    url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&q=80",
  },
  {
    name: "Pure White Musk Flacon",
    url: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800&q=80",
  },
];

export function ProductGalleryManager({
  mainImageUrl,
  onMainImageChange,
  galleryImages = [],
  onGalleryImagesChange,
  bucket = "products",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [tab, setTab] = useState<"upload" | "presets" | "url">("upload");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  // Upload single or multiple files in parallel
  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image.`);
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 15MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgressText(`Uploading ${validFiles.length} photo${validFiles.length > 1 ? "s" : ""}...`);
    const toastId = toast.loading(`Uploading ${validFiles.length} image${validFiles.length > 1 ? "s" : ""}...`);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.url) return data.url as string;
        if (data.error) toast.error(`Error uploading ${file.name}: ${data.error}`);
        return null;
      });

      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results.filter((url): url is string => Boolean(url));

      if (uploadedUrls.length > 0) {
        if (!mainImageUrl) {
          // If no cover image yet, first is cover, rest are gallery
          const [first, ...rest] = uploadedUrls;
          onMainImageChange(first);
          if (rest.length > 0) {
            onGalleryImagesChange([...(galleryImages ?? []), ...rest]);
          }
        } else {
          // Add all to gallery
          onGalleryImagesChange([...(galleryImages ?? []), ...uploadedUrls]);
        }
        toast.success(`Successfully uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? "s" : ""}!`, {
          id: toastId,
        });
      } else {
        toast.error("Upload failed. Please check your network or try again.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(`Upload error: ${err.message || "Failed to upload"}`, { id: toastId });
    } finally {
      setUploading(false);
      setUploadProgressText("");
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      toast.error("Please enter a valid URL (http://, https://, or /uploads/...)");
      return;
    }

    if (!mainImageUrl) {
      onMainImageChange(trimmed);
    } else if (!galleryImages.includes(trimmed)) {
      onGalleryImagesChange([...(galleryImages ?? []), trimmed]);
    }
    setUrlInput("");
    toast.success("Photo added to gallery!");
  };

  const handleSelectPreset = (url: string) => {
    if (!mainImageUrl) {
      onMainImageChange(url);
    } else if (!galleryImages.includes(url)) {
      onGalleryImagesChange([...(galleryImages ?? []), url]);
    }
    toast.success("Preset photo added!");
  };

  const handleSetAsCover = (url: string, index?: number) => {
    const oldMain = mainImageUrl;
    onMainImageChange(url);
    if (index !== undefined) {
      const updated = [...galleryImages];
      if (oldMain) {
        updated[index] = oldMain;
      } else {
        updated.splice(index, 1);
      }
      onGalleryImagesChange(updated);
    }
    toast.success("Primary cover photo updated!");
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updated = [...galleryImages];
    updated.splice(index, 1);
    onGalleryImagesChange(updated);
    toast.info("Photo removed from gallery.");
  };

  const handleRemoveMainImage = () => {
    if (galleryImages && galleryImages.length > 0) {
      const [first, ...rest] = galleryImages;
      onMainImageChange(first);
      onGalleryImagesChange(rest);
      toast.info("First gallery image promoted to Cover photo.");
    } else {
      onMainImageChange("");
      toast.info("Cover photo removed.");
    }
  };

  const handleMoveGalleryImage = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= galleryImages.length) return;
    const updated = [...galleryImages];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onGalleryImagesChange(updated);
  };

  const totalPhotosCount = (mainImageUrl ? 1 : 0) + (galleryImages?.length ?? 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Hidden file inputs with instant reset on change */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
          }
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />
      <input
        ref={inlineFileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files);
          }
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />

      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <label
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#111",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>Product Photography Gallery</span>
            <span
              style={{
                fontSize: "0.7rem",
                padding: "0.15rem 0.55rem",
                borderRadius: "100px",
                background: totalPhotosCount > 0 ? "#111" : "#e5e5e5",
                color: totalPhotosCount > 0 ? "#fff" : "#666",
                fontWeight: 600,
              }}
            >
              {totalPhotosCount} {totalPhotosCount === 1 ? "Photo" : "Photos"}
            </span>
          </label>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#777", marginTop: "0.2rem" }}>
            Add multiple photos per product. The first photo is your primary cover; the rest form the gallery.
          </p>
        </div>

        {/* Action Switcher */}
        <div style={{ display: "flex", gap: "0.25rem", background: "#f5f5f5", padding: "0.2rem", borderRadius: "4px" }}>
          <button
            type="button"
            onClick={() => setTab("upload")}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              borderRadius: "3px",
              background: tab === "upload" ? "#fff" : "transparent",
              color: tab === "upload" ? "#111" : "#777",
              boxShadow: tab === "upload" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Upload size={13} />
            <span>Upload</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("presets")}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              borderRadius: "3px",
              background: tab === "presets" ? "#fff" : "transparent",
              color: tab === "presets" ? "#111" : "#777",
              boxShadow: tab === "presets" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Sparkles size={13} />
            <span>Presets</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("url")}
            style={{
              padding: "0.35rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              borderRadius: "3px",
              background: tab === "url" ? "#fff" : "transparent",
              color: tab === "url" ? "#111" : "#777",
              boxShadow: tab === "url" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <LinkIcon size={13} />
            <span>URL</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Main Upload Dropzone */}
      {tab === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: dragOver ? "2px dashed #111" : "2px dashed #d1d5db",
            background: dragOver ? "#f9fafb" : "#fafafa",
            borderRadius: "6px",
            padding: "2rem 1.5rem",
            textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            position: "relative",
          }}
        >
          {uploading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
              <Loader2 size={32} className="animate-spin" style={{ color: "#111" }} />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, color: "#111" }}>
                {uploadProgressText || "Uploading photos..."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.25rem",
                }}
              >
                <ImagePlus size={22} style={{ color: "#111" }} />
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600, color: "#111" }}>
                Click to browse or Drag & Drop multiple photos
              </p>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#888" }}>
                Hold <strong>Ctrl</strong> or <strong>Shift</strong> in the file dialog to select multiple photos at once.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Presets */}
      {tab === "presets" && (
        <div style={{ background: "#fafafa", border: "1px solid #e5e5e5", borderRadius: "6px", padding: "1rem" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#666", marginBottom: "0.75rem" }}>
            Click any photo below to add it to your fragrance product images:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "0.75rem" }}>
            {LUXURY_PRESETS.map((preset) => {
              const isSelected = mainImageUrl === preset.url || galleryImages.includes(preset.url);
              return (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset.url)}
                  style={{
                    border: isSelected ? "2px solid #111" : "1px solid #e2e8f0",
                    borderRadius: "4px",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#fff",
                    padding: 0,
                    textAlign: "left",
                    position: "relative",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "90px" }}>
                    <Image src={preset.url} alt={preset.name} fill unoptimized sizes="130px" style={{ objectFit: "cover" }} />
                    {isSelected && (
                      <div
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "#111",
                          color: "#fff",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check size={11} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "0.4rem 0.5rem" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 600, color: "#333", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {preset.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 3: Direct URL */}
      {tab === "url" && (
        <form onSubmit={handleAddUrl} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            className="input-base"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/... or /uploads/..."
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ padding: "0 1.25rem", whiteSpace: "nowrap" }}>
            <Plus size={14} style={{ marginRight: "0.3rem" }} /> Add Photo
          </button>
        </form>
      )}

      {/* Current Gallery / Active Photos List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* 1. Primary Cover Photo */}
        {mainImageUrl ? (
          <div
            style={{
              border: "2px solid #111",
              borderRadius: "6px",
              padding: "0.85rem",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "90px",
                height: "110px",
                borderRadius: "4px",
                overflow: "hidden",
                background: "#eee",
                flexShrink: 0,
                border: "1px solid #e0e0e0",
              }}
            >
              <Image src={mainImageUrl} alt="Primary Cover" fill unoptimized sizes="90px" style={{ objectFit: "cover" }} />
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    background: "#111",
                    color: "#fff",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "3px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Star size={11} fill="#fff" /> PRIMARY COVER PHOTO (#1)
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#555" }}>
                This is the main photo shown on shop cards, search results, and default product view.
              </p>
              <p style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#888", wordBreak: "break-all" }}>
                {mainImageUrl}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemoveMainImage}
              style={{
                background: "transparent",
                border: "1px solid #e2e8f0",
                borderRadius: "4px",
                padding: "0.5rem 0.75rem",
                cursor: "pointer",
                color: "#e11d48",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                flexShrink: 0,
              }}
            >
              <Trash2 size={13} />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #999",
              borderRadius: "6px",
              padding: "1.5rem",
              textAlign: "center",
              cursor: "pointer",
              background: "#fdfdfd",
            }}
          >
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, color: "#111" }}>
              + Select Primary Cover Photo
            </p>
          </div>
        )}

        {/* 2. Gallery Photos Grid + "+ Add More Photo" card */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#555",
              }}
            >
              Additional Gallery Photos ({galleryImages?.length ?? 0})
            </p>

            <button
              type="button"
              onClick={() => inlineFileInputRef.current?.click()}
              style={{
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                padding: "0.3rem 0.65rem",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "#111",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Plus size={13} /> + Add Another Photo
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "0.85rem",
            }}
          >
            {/* Gallery cards */}
            {galleryImages?.map((imgUrl, index) => (
              <div
                key={`${imgUrl}-${index}`}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: "6px",
                  background: "#fff",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* Thumbnail */}
                <div style={{ position: "relative", width: "100%", height: "135px", background: "#f8f8f8" }}>
                  <Image
                    src={imgUrl}
                    alt={`Gallery photo ${index + 1}`}
                    fill
                    unoptimized
                    sizes="160px"
                    style={{ objectFit: "cover" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      background: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "0.15rem 0.45rem",
                      borderRadius: "3px",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    #{index + 2}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <div style={{ display: "flex", gap: "0.25rem" }}>
                    <button
                      type="button"
                      onClick={() => handleSetAsCover(imgUrl, index)}
                      style={{
                        flex: 1,
                        background: "#f3f4f6",
                        border: "none",
                        borderRadius: "3px",
                        padding: "0.35rem 0.4rem",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#333",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.2rem",
                      }}
                      title="Set as Main Cover Photo"
                    >
                      <Star size={11} />
                      <span>Make Cover</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      style={{
                        background: "#fee2e2",
                        border: "none",
                        borderRadius: "3px",
                        padding: "0.35rem 0.5rem",
                        color: "#b91c1c",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Remove Photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Reordering */}
                  <div style={{ display: "flex", gap: "0.25rem", justifyContent: "space-between" }}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveGalleryImage(index, "left")}
                      style={{
                        flex: 1,
                        background: index === 0 ? "#f9fafb" : "#f1f5f9",
                        border: "none",
                        borderRadius: "3px",
                        padding: "0.25rem",
                        cursor: index === 0 ? "not-allowed" : "pointer",
                        color: index === 0 ? "#ccc" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.68rem",
                        gap: "0.2rem",
                      }}
                    >
                      <ArrowLeft size={11} /> Left
                    </button>

                    <button
                      type="button"
                      disabled={index === galleryImages.length - 1}
                      onClick={() => handleMoveGalleryImage(index, "right")}
                      style={{
                        flex: 1,
                        background: index === galleryImages.length - 1 ? "#f9fafb" : "#f1f5f9",
                        border: "none",
                        borderRadius: "3px",
                        padding: "0.25rem",
                        cursor: index === galleryImages.length - 1 ? "not-allowed" : "pointer",
                        color: index === galleryImages.length - 1 ? "#ccc" : "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.68rem",
                        gap: "0.2rem",
                      }}
                    >
                      Right <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Direct "+ Add Photo" Card in the Grid */}
            <button
              type="button"
              onClick={() => inlineFileInputRef.current?.click()}
              style={{
                height: "210px",
                border: "2px dashed #cbd5e1",
                borderRadius: "6px",
                background: "#fafafa",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                cursor: "pointer",
                color: "#64748b",
                transition: "all 0.2s ease",
              }}
              className="hover:border-black hover:bg-white hover:text-black"
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={18} />
              </div>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 600 }}>
                + Add Another Photo
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "#94a3b8" }}>
                Select 1 or more files
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
