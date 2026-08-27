"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { checkAuthOrRedirect } from "@/lib/auth-check";
import { ShoppingBag, Sparkles } from "lucide-react";

interface Props {
  products: Product[];
}

export function TesterGrid({ products }: Props) {
  const { addItem } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  const getSizePrice = (size: number) => {
    if (size === 2) return 99;
    if (size === 5) return 199;
    if (size === 10) return 349;
    return 99;
  };

  const handleAddTester = async (product: Product) => {
    const authed = await checkAuthOrRedirect("/testers");
    if (!authed) return;

    const size = selectedSizes[product.id] || 2;
    const price = getSizePrice(size);
    const itemKey = `${product.id}-${size}`;

    setAddingId(itemKey);
    addItem({
      product_id: product.id,
      name: `${product.name} (${size}ml Tester Vial)`,
      slug: product.slug,
      image_url: product.main_image_url,
      price,
      original_price: price,
      volume_ml: size,
      concentration: "Sample Vial",
      quantity: 1,
    });

    setTimeout(() => setAddingId(null), 800);
  };

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-muted)" }}>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", fontWeight: 300 }}>
          No tester vials available currently
        </p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Check back soon or explore our full fragrance collection.
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/shop" className="btn-outline">
            Browse Full Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Prominent Tester Value Settle Guarantee Banner ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #fdfbf7 0%, #f7f1e5 100%)",
          border: "1px solid #e2d5be",
          borderRadius: "4px",
          padding: "1.5rem 2rem",
          marginBottom: "3rem",
          boxShadow: "0 2px 12px rgba(138, 109, 59, 0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#8a6d3b",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#5c4722",
                marginBottom: "0.4rem",
              }}
            >
              100% Tester Value Settle Guarantee
            </h3>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.9rem",
                color: "#6e5d3d",
                lineHeight: 1.6,
                maxWidth: "780px",
              }}
            >
              Love what you smell? Order any <strong>2ml, 5ml, or 10ml tester</strong> today to try on your skin. When you upgrade to the full-size <strong>100ml bottle</strong> later, <strong>100% of your tester purchase value will be settled & deducted</strong> from your full bottle order!
            </p>
          </div>
        </div>
      </div>

      {/* ── Tester Cards Grid ── */}
      <div className="tester-grid">
        {products.map((product) => {
          const currentSize = selectedSizes[product.id] || 2;
          const currentPrice = getSizePrice(currentSize);
          const itemKey = `${product.id}-${currentSize}`;
          const isAdding = addingId === itemKey;

          return (
            <div
              key={product.id}
              style={{
                background: "#fff",
                border: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              className="hover:shadow-md"
            >
              {/* Product Image */}
              <Link
                href={`/product/${product.slug}`}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "3/4",
                  background: "var(--color-bg-soft)",
                  display: "block",
                  overflow: "hidden",
                }}
              >
                {product.main_image_url ? (
                  <Image
                    src={product.main_image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                    {product.name}
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: "0.75rem",
                    left: "0.75rem",
                    background: "#8a6d3b",
                    color: "#fff",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    padding: "0.25rem 0.55rem",
                    textTransform: "uppercase",
                  }}
                >
                  Tester Vial
                </div>
              </Link>

              {/* Content */}
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <Link href={`/product/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {product.name}
                    </h3>
                  </Link>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.78rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {product.gender} · {product.concentration}
                  </p>
                  {product.short_description && (
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        color: "var(--color-text-muted)",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.short_description}
                    </p>
                  )}
                </div>

                {/* Size Selector Buttons */}
                <div>
                  <p className="label-caps" style={{ color: "var(--color-text-muted)", fontSize: "0.68rem", marginBottom: "0.4rem" }}>
                    Select Sample Size:
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem", marginBottom: "1rem" }}>
                    {[
                      { size: 2, label: "2ml", price: 99 },
                      { size: 5, label: "5ml", price: 199 },
                      { size: 10, label: "10ml", price: 349 },
                    ].map((item) => (
                      <button
                        key={item.size}
                        type="button"
                        onClick={() => setSelectedSizes((prev) => ({ ...prev, [product.id]: item.size }))}
                        style={{
                          padding: "0.45rem 0.25rem",
                          border: currentSize === item.size ? "2px solid var(--color-text)" : "1px solid var(--color-border)",
                          background: currentSize === item.size ? "#fafafa" : "#fff",
                          cursor: "pointer",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700 }}>
                          {item.label}
                        </span>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                          ₹{item.price}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    type="button"
                    onClick={() => handleAddTester(product)}
                    disabled={isAdding}
                    className="btn-primary"
                    style={{
                      width: "100%",
                      padding: "0.7rem 1rem",
                      fontSize: "0.78rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <ShoppingBag size={14} />
                    {isAdding ? "Added to Bag ✓" : `Add ${currentSize}ml — ₹${currentPrice}`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .tester-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1.5rem;
        }
        @media (min-width: 640px) {
          .tester-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        }
        @media (min-width: 1024px) {
          .tester-grid { grid-template-columns: repeat(3, 1fr); gap: 2rem 1.5rem; }
        }
      `}</style>
    </div>
  );
}
