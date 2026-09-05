"use client";

import { ProductVariant } from "@/lib/types";
import { Plus, Trash2, CheckCircle2, Layers } from "lucide-react";

interface Props {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
  baseVolume?: number;
  basePrice?: number;
  isSolid?: boolean;
}

export function VariantsManager({ variants, onChange, baseVolume = 100, basePrice = 3499, isSolid = false }: Props) {
  const unit = isSolid ? "g" : "ml";

  const addPreset = (size: number) => {
    const existing = variants.find((v) => v.volume_ml === size);
    if (existing) return;

    const newVariant: ProductVariant = {
      name: `${size}${unit}`,
      volume_ml: size,
      sku: "",
      original_price: size === 50 ? Math.round(basePrice * 0.65) : size === 200 ? Math.round(basePrice * 1.8) : basePrice,
      sale_price: null,
      stock_quantity: 30,
      is_default: variants.length === 0,
    };

    onChange([...variants, newVariant]);
  };

  const addCustom = () => {
    const newVariant: ProductVariant = {
      name: `50${unit}`,
      volume_ml: 50,
      sku: "",
      original_price: basePrice,
      sale_price: null,
      stock_quantity: 20,
      is_default: variants.length === 0,
    };
    onChange([...variants, newVariant]);
  };

  const updateVariant = (index: number, key: keyof ProductVariant, value: any) => {
    const updated = variants.map((v, i) => {
      if (i === index) {
        return { ...v, [key]: value };
      }
      if (key === "is_default" && value === true) {
        return { ...v, is_default: false };
      }
      return v;
    });
    onChange(updated);
  };

  const removeVariant = (index: number) => {
    const updated = variants.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((v) => v.is_default)) {
      updated[0].is_default = true;
    }
    onChange(updated);
  };

  const PRESETS = isSolid ? [15, 30, 50, 100] : [30, 50, 100, 200];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, color: "#111" }}>
            Bottle Sizes & Custom Capacities
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#777", marginTop: "0.15rem" }}>
            Add multiple sizes (e.g. 50ml, 100ml, 200ml) with individual pricing and stock.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {PRESETS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => addPreset(size)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.35rem 0.65rem",
                background: "#f5f5f5",
                border: "1px solid #e0e0e0",
                borderRadius: "3px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#333",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#999")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
            >
              <Plus size={12} /> {size}{unit}
            </button>
          ))}
          <button
            type="button"
            onClick={addCustom}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.35rem 0.75rem",
              background: "#111",
              border: "1px solid #111",
              borderRadius: "3px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <Plus size={12} /> Add Custom Size
          </button>
        </div>
      </div>

      {variants.length === 0 ? (
        <div
          style={{
            padding: "1.5rem",
            background: "#fafafa",
            border: "1px dashed #ddd",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          <Layers size={24} style={{ color: "#aaa", margin: "0 auto 0.5rem" }} />
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#666" }}>
            No secondary sizes added. The product will use the single default volume ({baseVolume}{unit}) and base price above.
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#999", marginTop: "0.25rem" }}>
            Click any size above (e.g. 50{unit}, 100{unit}) to configure multiple options for customers.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {variants.map((v, idx) => (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 90px 110px 110px 90px auto 40px",
                gap: "0.65rem",
                alignItems: "center",
                padding: "0.85rem 1rem",
                background: v.is_default ? "#fffdf8" : "#fff",
                border: v.is_default ? "1px solid #d4af37" : "1px solid #e8e8e8",
                borderRadius: "4px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              {/* Variant Label */}
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", color: "#888", marginBottom: "0.2rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Size Label
                </label>
                <input
                  type="text"
                  className="input-base"
                  style={{ padding: "0.4rem 0.5rem", fontSize: "0.82rem", fontWeight: 600 }}
                  value={v.name}
                  onChange={(e) => updateVariant(idx, "name", e.target.value)}
                  placeholder="50ml"
                />
              </div>

              {/* Volume (ml/g) */}
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", color: "#888", marginBottom: "0.2rem", textTransform: "uppercase", fontWeight: 600 }}>
                  {isSolid ? "Weight (g)" : "Volume (ml)"}
                </label>
                <input
                  type="number"
                  className="input-base"
                  style={{ padding: "0.4rem 0.5rem", fontSize: "0.82rem" }}
                  value={v.volume_ml ?? ""}
                  onChange={(e) => updateVariant(idx, "volume_ml", Number(e.target.value) || null)}
                  placeholder="50"
                />
              </div>

              {/* Original Price */}
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", color: "#888", marginBottom: "0.2rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Price (₹) *
                </label>
                <input
                  type="number"
                  className="input-base"
                  style={{ padding: "0.4rem 0.5rem", fontSize: "0.82rem", fontWeight: 600 }}
                  value={v.original_price}
                  onChange={(e) => updateVariant(idx, "original_price", Number(e.target.value))}
                  required
                />
              </div>

              {/* Sale Price */}
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", color: "#888", marginBottom: "0.2rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Sale Price (₹)
                </label>
                <input
                  type="number"
                  className="input-base"
                  style={{ padding: "0.4rem 0.5rem", fontSize: "0.82rem" }}
                  value={v.sale_price ?? ""}
                  onChange={(e) => updateVariant(idx, "sale_price", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Optional"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label style={{ display: "block", fontSize: "0.68rem", color: "#888", marginBottom: "0.2rem", textTransform: "uppercase", fontWeight: 600 }}>
                  Stock Qty
                </label>
                <input
                  type="number"
                  className="input-base"
                  style={{ padding: "0.4rem 0.5rem", fontSize: "0.82rem" }}
                  value={v.stock_quantity}
                  onChange={(e) => updateVariant(idx, "stock_quantity", Number(e.target.value))}
                />
              </div>

              {/* Default Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", paddingTop: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", cursor: "pointer", fontSize: "0.74rem", color: "#555", userSelect: "none" }}>
                  <input
                    type="radio"
                    name="default_variant"
                    checked={Boolean(v.is_default)}
                    onChange={() => updateVariant(idx, "is_default", true)}
                  />
                  <span>Default</span>
                </label>
              </div>

              {/* Delete button */}
              <div style={{ paddingTop: "1rem", textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => removeVariant(idx)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#c0392b",
                    cursor: "pointer",
                    padding: "0.3rem",
                    borderRadius: "2px",
                  }}
                  title="Remove variant"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
