"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";
import { useCart } from "@/lib/cart-store";
import { checkAuthOrRedirect } from "@/lib/auth-check";
import { ShoppingBag, Sparkles, Check, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Props {
  products: Product[];
}

export function TesterGrid({ products }: Props) {
  const { addItem, toggleCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getSizePrice = (size: number) => {
    if (size === 2) return 99;
    if (size === 5) return 199;
    if (size === 10) return 349;
    return 99;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchGender = genderFilter === "all" || (p.gender && p.gender.toLowerCase() === genderFilter.toLowerCase());
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.short_description && p.short_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.top_notes && p.top_notes.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (p.base_notes && p.base_notes.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchGender && matchSearch;
    });
  }, [products, genderFilter, searchQuery]);

  const handleAddTester = async (product: Product, sizeOverride?: number) => {
    const authed = await checkAuthOrRedirect("/testers");
    if (!authed) return;

    const size = sizeOverride || selectedSizes[product.id] || 2;
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

    setTimeout(() => {
      setAddingId(null);
      toggleCart();
    }, 600);
  };

  if (products.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-text-muted)" }}>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", fontWeight: 300 }}>
          No tester vials available currently
        </p>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
          Check back soon or explore our full fragrance collection.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/shop" className="btn-primary">
            Browse Full Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Filter & Search Toolbar ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2.5rem",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {/* Gender Filter Pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Fragrances" },
            { key: "unisex", label: "Unisex" },
            { key: "men", label: "Men" },
            { key: "women", label: "Women" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setGenderFilter(item.key)}
              style={{
                padding: "0.5rem 1.1rem",
                borderRadius: "30px",
                border: genderFilter === item.key ? "1px solid #111" : "1px solid var(--color-border)",
                background: genderFilter === item.key ? "#111" : "transparent",
                color: genderFilter === item.key ? "#fff" : "var(--color-text)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Counter & Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <input
            type="text"
            placeholder="Search notes (e.g. Oud, Rose, Amber)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "0.45rem 0.9rem",
              border: "1px solid var(--color-border)",
              borderRadius: "4px",
              fontFamily: "var(--font-sans)",
              fontSize: "0.8rem",
              background: "#fff",
              minWidth: "220px",
              outline: "none",
            }}
          />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--color-text-muted)" }}>
            {filteredProducts.length} Fragrance{filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Tester Cards Grid ── */}
      <div className="tester-grid">
        {filteredProducts.map((product) => {
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
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                position: "relative",
              }}
              className="tester-card-hover"
            >
              {/* Product Image */}
              <Link
                href={`/product/${product.slug}`}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4/5",
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
                    style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
                    className="hover:scale-105"
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc" }}>
                    {product.name}
                  </div>
                )}

                {/* Badges */}
                <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div
                    style={{
                      background: "linear-gradient(135deg, #111 0%, #222 100%)",
                      color: "#e8c977",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "0.25rem 0.6rem",
                      textTransform: "uppercase",
                      border: "1px solid rgba(212,175,55,0.4)",
                      borderRadius: "2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <Sparkles size={11} color="#d4af37" />
                    Tester Vial
                  </div>
                  {product.is_bestseller && (
                    <div
                      style={{
                        background: "#8a6d3b",
                        color: "#fff",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        padding: "0.2rem 0.5rem",
                        textTransform: "uppercase",
                        borderRadius: "2px",
                      }}
                    >
                      Bestseller
                    </div>
                  )}
                </div>

                {/* 100% Settle Cashback Tag */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0.65rem",
                    right: "0.65rem",
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2d5be",
                    padding: "0.25rem 0.55rem",
                    borderRadius: "2px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "#8a6d3b",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                  }}
                >
                  100% Settle Credit
                </div>
              </Link>

              {/* Content Details */}
              <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
                    <Link href={`/product/${product.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <h3
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "1.25rem",
                          fontWeight: 600,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.76rem",
                      color: "var(--color-text-muted)",
                      marginBottom: "0.65rem",
                    }}
                  >
                    {product.gender} · {product.concentration || "Extrait de Parfum"}
                  </p>

                  {/* Notes Breakdown */}
                  {(product.top_notes?.length > 0 || product.base_notes?.length > 0) && (
                    <div style={{ marginBottom: "0.75rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                      {[
                        ...(product.top_notes || []).slice(0, 2).map((n) => `Top: ${n}`),
                        ...(product.base_notes || []).slice(0, 1).map((n) => `Base: ${n}`),
                      ].map((note, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.68rem",
                            background: "var(--color-bg-soft)",
                            color: "var(--color-text-muted)",
                            padding: "0.18rem 0.45rem",
                            borderRadius: "2px",
                            border: "1px solid var(--color-border)",
                          }}
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  )}

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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <p className="label-caps" style={{ color: "var(--color-text-muted)", fontSize: "0.66rem" }}>
                      Select Sample Size:
                    </p>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "#8a6d3b", fontWeight: 600 }}>
                      100% Refundable on Bottle
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem", marginBottom: "0.85rem" }}>
                    {[
                      { size: 2, label: "2ml", price: 99, tag: "Vial" },
                      { size: 5, label: "5ml", price: 199, tag: "Travel" },
                      { size: 10, label: "10ml", price: 349, tag: "Pocket" },
                    ].map((item) => (
                      <button
                        key={item.size}
                        type="button"
                        onClick={() => setSelectedSizes((prev) => ({ ...prev, [product.id]: item.size }))}
                        style={{
                          padding: "0.5rem 0.25rem",
                          border: currentSize === item.size ? "2px solid #111" : "1px solid var(--color-border)",
                          background: currentSize === item.size ? "#fafafa" : "#fff",
                          cursor: "pointer",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          borderRadius: "2px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700 }}>
                          {item.label}
                        </span>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: currentSize === item.size ? "#111" : "var(--color-text-muted)", fontWeight: 600 }}>
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
                      padding: "0.8rem 1rem",
                      fontSize: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.45rem",
                      background: isAdding ? "#166534" : "#111",
                    }}
                  >
                    {isAdding ? (
                      <>
                        <Check size={15} /> Added to Bag
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={15} /> Add {currentSize}ml Tester — ₹{currentPrice}
                      </>
                    )}
                  </button>

                  <div style={{ marginTop: "0.6rem", textAlign: "center" }}>
                    <Link
                      href={`/product/${product.slug}`}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.72rem",
                        color: "var(--color-text-muted)",
                        textDecoration: "underline",
                      }}
                      className="hover:text-black"
                    >
                      View 100ml Full Bottle Details →
                    </Link>
                  </div>
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
        @media (min-width: 600px) {
          .tester-grid { grid-template-columns: repeat(2, 1fr); gap: 1.75rem; }
        }
        @media (min-width: 1024px) {
          .tester-grid { grid-template-columns: repeat(3, 1fr); gap: 2.25rem 1.75rem; }
        }
        .tester-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}

