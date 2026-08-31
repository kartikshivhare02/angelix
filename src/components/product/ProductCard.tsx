"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, computeDiscountedPrice, formatProductSize } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";

import { checkAuthOrRedirect } from "@/lib/auth-check";

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const { price, discountPercent } = computeDiscountedPrice(
    Number(product.original_price) || 0,
    product.sale_price ? Number(product.sale_price) : null
  );

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || product.stock_quantity === 0) return;

    const authed = await checkAuthOrRedirect();
    if (!authed) return;

    setAdding(true);
    addItem({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: product.main_image_url,
      price,
      original_price: product.original_price,
      volume_ml: product.volume_ml,
      concentration: product.concentration,
      quantity: 1,
    });
    setTimeout(() => setAdding(false), 1200);
  };

  const tags = [
    product.concentration,
    product.gender,
  ].filter(Boolean).slice(0, 2);

  const isOOS = product.stock_quantity === 0;
  const secondaryImage = product.images?.find((img) => img.image_url && img.image_url !== product.main_image_url)?.image_url;

  return (
    <Link
      href={`/product/${product.slug}`}
      style={{ textDecoration: "none", color: "inherit", display: "flex" }}
      className="group"
    >
      <article
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {/* ── Image ── */}
        <div
          style={{
            position: "relative",
            paddingBottom: "130%",
            background: "var(--color-bg-soft)",
            overflow: "hidden",
          }}
        >
          {product.main_image_url ? (
            <>
              <Image
                src={product.main_image_url}
                alt={product.name}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                  transition: "transform 0.55s var(--ease-luxury)",
                }}
                className={secondaryImage ? "group-hover:scale-[1.04] group-hover:opacity-0 transition-opacity duration-300" : "group-hover:scale-[1.04]"}
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt={`${product.name} alternate view`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                    transition: "transform 0.55s var(--ease-luxury)",
                  }}
                  className="opacity-0 group-hover:opacity-100 group-hover:scale-[1.04] transition-opacity duration-300 pointer-events-none"
                />
              )}
            </>
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f4f4f4",
                color: "#aaa",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              ANGLELIX
            </div>
          )}

          {/* Badges */}
          <div
            style={{
              position: "absolute",
              top: "0.6rem",
              left: "0.6rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
            }}
          >
            {product.is_new_arrival && (
              <span
                style={{
                  padding: "0.18rem 0.5rem",
                  background: "var(--color-text)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                New
              </span>
            )}
            {discountPercent && (
              <span
                style={{
                  padding: "0.18rem 0.5rem",
                  background: "var(--color-text)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* ── Add to cart button — always visible on mobile, hover on desktop ── */}
          <button
            id={`atc-${product.id}`}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            disabled={adding || isOOS}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "0.7rem 0.5rem",
              background: adding
                ? "var(--color-text-muted)"
                : isOOS
                ? "rgba(0,0,0,0.5)"
                : "var(--color-text)",
              color: "#fff",
              border: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: adding || isOOS ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              transition: "background 0.2s, transform 0.3s var(--ease-luxury)",
              /* On desktop: hidden until hover */
              transform: "translateY(100%)",
            }}
            className="product-add-btn"
          >
            {isOOS ? (
              "Out of Stock"
            ) : adding ? (
              <><Check size={13} strokeWidth={2.5} /> Added</>
            ) : (
              <><Plus size={13} strokeWidth={2.5} /> Add to Bag</>
            )}
          </button>
        </div>

        {/* ── Info ── */}
        <div
          style={{
            padding: "0.75rem 0 0.5rem",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.78rem, 2vw, 0.88rem)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--color-text)",
              lineHeight: 1.2,
            }}
          >
            {product.name}
            {" "}
            <span style={{ fontWeight: 400, opacity: 0.55, fontSize: "0.78em" }}>
              ({formatProductSize(product.volume_ml, product)})
            </span>
          </h3>

          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
              {tags.map((t) => (
                <span key={t} className="tag-pill" style={{ fontSize: "0.6rem" }}>{t}</span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "auto", paddingTop: "0.25rem" }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
                fontWeight: 700,
                color: "var(--color-text)",
              }}
            >
              {formatPrice(price)}
            </span>
            {discountPercent && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  color: "var(--color-text-light)",
                  textDecoration: "line-through",
                }}
              >
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </article>

      <style>{`
        /* Desktop: show add-btn on hover */
        @media (hover: hover) and (pointer: fine) {
          .product-add-btn { transform: translateY(100%); }
          .group:hover .product-add-btn { transform: translateY(0); }
        }
        /* Mobile / touch: always show add-btn */
        @media (hover: none), (pointer: coarse) {
          .product-add-btn { transform: translateY(0) !important; }
        }
      `}</style>
    </Link>
  );
}
