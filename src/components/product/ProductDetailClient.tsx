"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, Zap, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice, computeDiscountedPrice, formatProductSize, isSolidProduct } from "@/lib/utils";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { checkAuthOrRedirect } from "@/lib/auth-check";

interface Props {
  product: Product;
}

export function ProductDetailClient({ product }: Props) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(product.main_image_url);
  const [addingToCart, setAddingToCart] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("notes");
  const defaultVolume = Number(product.volume_ml) || 100;
  const [selectedSize, setSelectedSize] = useState<number>(defaultVolume);

  const { price: fullBottlePrice, discountPercent } = computeDiscountedPrice(
    Number(product.original_price) || 0,
    product.sale_price ? Number(product.sale_price) : null
  );

  const isTesterSelected = selectedSize !== defaultVolume;

  const getActivePrice = () => {
    if (!isTesterSelected) return fullBottlePrice;
    if (selectedSize === 2) return 99;
    if (selectedSize === 5) return 199;
    if (selectedSize === 10) return 349;
    return 99;
  };

  const activePrice = getActivePrice();

  const images = [
    product.main_image_url,
    ...(product.images?.map((i) => i.image_url).filter((u) => u !== product.main_image_url) ?? []),
  ].filter(Boolean);

  const handleAddToCart = async () => {
    if (!isTesterSelected && product.stock_quantity === 0) return;
    const authed = await checkAuthOrRedirect(`/product/${product.slug}`);
    if (!authed) return;

    setAddingToCart(true);
    addItem({
      product_id: product.id,
      name: isTesterSelected ? `${product.name} (${selectedSize}ml Tester Vial)` : product.name,
      slug: product.slug,
      image_url: product.main_image_url,
      price: activePrice,
      original_price: isTesterSelected ? activePrice : product.original_price,
      volume_ml: selectedSize,
      concentration: isTesterSelected ? "Tester Vial" : product.concentration,
      quantity: qty,
    });
    setTimeout(() => setAddingToCart(false), 800);
  };

  const handleBuyNow = async () => {
    const authed = await checkAuthOrRedirect(`/product/${product.slug}`);
    if (!authed) return;

    await handleAddToCart();
    setTimeout(() => window.location.href = "/checkout", 400);
  };

  const toggleSection = (key: string) =>
    setOpenSection((prev) => (prev === key ? null : key));

  const ACCORDION = [
    {
      key: "notes",
      label: "Fragrance Notes",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", paddingTop: "1rem" }}>
          {[
            { label: "Top Notes", notes: product.top_notes },
            { label: "Heart Notes", notes: product.middle_notes },
            { label: "Base Notes", notes: product.base_notes },
          ].map(({ label, notes }) => (
            <div key={label} style={{ background: "var(--color-bg-soft)", padding: "1.25rem 1rem", textAlign: "center" }}>
              <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>{label}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {(notes ?? []).map((n: string) => (
                  <span key={n} style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", fontWeight: 300 }}>{n}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "details",
      label: "Details & Profile",
      content: (
        <div style={{ paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {[
            ["Concentration", product.concentration],
            [isSolidProduct(product) ? "Net Weight" : "Volume", formatProductSize(product.volume_ml, product)],
            ["Longevity", product.longevity],
            ["Projection", product.projection],
            ["Gender", product.gender],
            ["Season", product.season?.join(", ")],
            ["Occasion", product.occasion?.join(", ")],
          ]
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.6rem 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <span className="label-caps" style={{ color: "var(--color-text-muted)" }}>{label}</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>{value}</span>
              </div>
            ))}
        </div>
      ),
    },
    {
      key: "apply",
      label: "How to Apply",
      content: (
        <div style={{ paddingTop: "1rem" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.8 }}>
            {product.how_to_apply ||
              "Spray on pulse points — wrists, neck, behind ears, and inner elbows — from 10–15 cm away. Avoid rubbing after application. Apply to moisturized skin for longer wear."}
          </p>
        </div>
      ),
    },
    {
      key: "shipping",
      label: "Shipping & Returns",
      content: (
        <div style={{ paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            📦 Estimated delivery: <strong>{product.delivery_estimate ?? "3–5 business days"}</strong>
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            🚚 Free shipping on orders above ₹1,499
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
            ↩️ Returns accepted within 7 days for unopened, sealed products.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="container-site section-py">
      {/* Breadcrumb */}
      <nav style={{ marginBottom: "2rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <Link href="/" style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", textDecoration: "none" }}>Home</Link>
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>›</span>
        <Link href="/shop" style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", textDecoration: "none" }}>Shop</Link>
        <span style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>›</span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text)" }}>{product.name}</span>
      </nav>

      {/* Main two-column layout */}
      <div className="product-detail-grid">
        {/* LEFT — Gallery */}
        <div>
          {/* Main image */}
          <div
            style={{
              position: "relative",
              paddingBottom: "120%",
              background: "var(--color-bg-soft)",
              overflow: "hidden",
              marginBottom: "0.75rem",
              borderRadius: "2px",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ position: "absolute", inset: 0 }}
              >
                <Image
                  src={activeImg}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows if multiple images */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const curIdx = images.indexOf(activeImg);
                    const prevIdx = curIdx > 0 ? curIdx - 1 : images.length - 1;
                    setActiveImg(images[prevIdx]);
                  }}
                  aria-label="Previous image"
                  style={{
                    position: "absolute",
                    left: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    color: "var(--color-text)",
                    transition: "all 0.2s ease",
                    zIndex: 10,
                  }}
                  className="hover:scale-105"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const curIdx = images.indexOf(activeImg);
                    const nextIdx = curIdx < images.length - 1 ? curIdx + 1 : 0;
                    setActiveImg(images[nextIdx]);
                  }}
                  aria-label="Next image"
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    color: "var(--color-text)",
                    transition: "all 0.2s ease",
                    zIndex: 10,
                  }}
                  className="hover:scale-105"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Counter Pill */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0.75rem",
                    right: "0.75rem",
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(4px)",
                    color: "#fff",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "100px",
                    zIndex: 10,
                  }}
                >
                  {images.indexOf(activeImg) + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(img)}
                  style={{
                    width: "72px",
                    height: "90px",
                    position: "relative",
                    border: activeImg === img ? "2px solid var(--color-text)" : "1px solid var(--color-border)",
                    borderRadius: "2px",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "var(--color-bg-soft)",
                    padding: 0,
                    transition: "all 0.2s ease",
                    opacity: activeImg === img ? 1 : 0.7,
                  }}
                  className="hover:opacity-100"
                >
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill sizes="72px" style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Name & tags */}
          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 600,
                letterSpacing: "0.02em",
                lineHeight: 1.05,
                marginBottom: "0.5rem",
              }}
            >
              {product.name}
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              {formatProductSize(product.volume_ml, product)} · {product.concentration} · {product.gender}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {[...(product.top_notes ?? []), ...(product.middle_notes ?? [])].slice(0, 5).map((n) => (
                <span key={n} className="tag-pill">{n}</span>
              ))}
            </div>
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "1.6rem", fontWeight: 700 }}>
              {formatPrice(activePrice)}
            </span>
            {!isTesterSelected && discountPercent && (
              <>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", color: "var(--color-text-muted)", textDecoration: "line-through" }}>
                  {formatPrice(product.original_price)}
                </span>
                <span style={{ padding: "0.2rem 0.5rem", background: "var(--color-text)", color: "#fff", fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700 }}>
                  -{discountPercent}% OFF
                </span>
              </>
            )}
            {isTesterSelected && (
              <span style={{ padding: "0.2rem 0.5rem", background: "#8a6d3b", color: "#fff", fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" }}>
                TESTER VIAL
              </span>
            )}
          </div>

          {/* Size Selector */}
          <div>
            <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.6rem" }}>
              Select Size & Format
            </p>
            <div style={{ display: "grid", gridTemplateColumns: product.tester_available ? "repeat(auto-fit, minmax(110px, 1fr))" : "1fr", gap: "0.6rem" }}>
              {/* Full bottle */}
              <button
                type="button"
                onClick={() => setSelectedSize(product.volume_ml || 100)}
                style={{
                  padding: "0.75rem 0.85rem",
                  border: selectedSize === (product.volume_ml || 100) ? "2px solid var(--color-text)" : "1px solid var(--color-border)",
                  background: selectedSize === (product.volume_ml || 100) ? "#fcfcfc" : "var(--color-bg)",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700 }}>
                  {formatProductSize(product.volume_ml || 100, product)} Full
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  {formatPrice(fullBottlePrice)}
                </span>
              </button>

              {/* Testers if available */}
              {product.tester_available && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedSize(2)}
                    style={{
                      padding: "0.75rem 0.85rem",
                      border: selectedSize === 2 ? "2px solid var(--color-text)" : "1px solid var(--color-border)",
                      background: selectedSize === 2 ? "#fcfcfc" : "var(--color-bg)",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.2rem",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700 }}>
                      2ml Sample
                    </span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      ₹99
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSize(5)}
                    style={{
                      padding: "0.75rem 0.85rem",
                      border: selectedSize === 5 ? "2px solid var(--color-text)" : "1px solid var(--color-border)",
                      background: selectedSize === 5 ? "#fcfcfc" : "var(--color-bg)",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.2rem",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700 }}>
                      5ml Travel
                    </span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      ₹199
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSize(10)}
                    style={{
                      padding: "0.75rem 0.85rem",
                      border: selectedSize === 10 ? "2px solid var(--color-text)" : "1px solid var(--color-border)",
                      background: selectedSize === 10 ? "#fcfcfc" : "var(--color-bg)",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.2rem",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700 }}>
                      10ml Pocket
                    </span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      ₹349
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tester Settle Value Guarantee Highlight */}
          {isTesterSelected ? (
            <div style={{ padding: "1.1rem 1.25rem", background: "#fcf8f2", border: "1px solid #e8decb", borderRadius: "3px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>✨</span>
                <div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.84rem", fontWeight: 700, color: "#8a6d3b", marginBottom: "0.25rem" }}>
                    100% Tester Value Settle Guarantee
                  </p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#6e5d3d", lineHeight: 1.55 }}>
                    Love this fragrance? When you later order the <strong>100ml full bottle</strong>, your entire <strong>₹{activePrice}</strong> tester order value will be automatically settled & deducted from your full bottle purchase!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            product.tester_available && (
              <div style={{ padding: "0.85rem 1rem", background: "var(--color-bg-soft)", border: "1px solid var(--color-border)" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", lineHeight: 1.55 }}>
                  💡 <em>Want to try first? Select <strong>2ml, 5ml, or 10ml Tester</strong> above. If you love it, your tester amount is 100% credited toward your full bottle order!</em>
                </p>
              </div>
            )
          )}

          {/* Short description */}
          {product.short_description && (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
              {product.short_description}
            </p>
          )}

          {/* Quantity */}
          <div>
            <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Quantity</p>
            <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--color-border)" }}>
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ width: "40px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}
              >
                <Minus size={14} strokeWidth={1.5} />
              </button>
              <span style={{ width: "44px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 500 }}>{qty}</span>
              <button
                onClick={() => setQty(Math.min(!isTesterSelected ? product.stock_quantity : 20, qty + 1))}
                style={{ width: "40px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}
              >
                <Plus size={14} strokeWidth={1.5} />
              </button>
            </div>
            {!isTesterSelected && product.stock_quantity <= (product.low_stock_threshold ?? 5) && product.stock_quantity > 0 && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#c0392b", marginTop: "0.4rem" }}>
                Only {product.stock_quantity} left in stock
              </p>
            )}
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              id="pdp-add-to-cart"
              onClick={handleAddToCart}
              disabled={(!isTesterSelected && product.stock_quantity === 0) || addingToCart}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", gap: "0.5rem", opacity: (!isTesterSelected && product.stock_quantity === 0) ? 0.5 : 1 }}
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {!isTesterSelected && product.stock_quantity === 0
                ? "Out of Stock"
                : addingToCart
                ? "Added to Bag ✓"
                : isTesterSelected
                ? `Add ${selectedSize}ml Tester to Bag — ₹${activePrice * qty}`
                : "Add to Bag"}
            </button>
            {(!isTesterSelected ? product.stock_quantity > 0 : true) && (
              <button
                id="pdp-buy-now"
                onClick={handleBuyNow}
                className="btn-outline"
                style={{ width: "100%", justifyContent: "center", gap: "0.5rem" }}
              >
                <Zap size={16} strokeWidth={1.5} />
                {isTesterSelected ? `Buy ${selectedSize}ml Tester Now` : "Buy Now"}
              </button>
            )}
          </div>

          {/* Trust signals */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", paddingTop: "0.5rem" }}>
            {["🚚 Free ship ₹1499+", "🔒 Secure payment", "🧪 Try testers"].map((t) => (
              <span key={t} style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Accordion sections */}
      <div style={{ marginTop: "3rem", borderTop: "1px solid var(--color-border)" }}>
        {ACCORDION.map(({ key, label, content }) => (
          <div key={key} style={{ borderBottom: "1px solid var(--color-border)" }}>
            <button
              onClick={() => toggleSection(key)}
              style={{
                width: "100%",
                padding: "1.25rem 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {label}
              </span>
              {openSection === key ? <ChevronUp size={16} strokeWidth={1.5} /> : <ChevronDown size={16} strokeWidth={1.5} />}
            </button>
            <AnimatePresence>
              {openSection === key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ paddingBottom: "1.5rem" }}>{content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <style>{`
        .product-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
