"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice, formatProductSize } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();
  const total = subtotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 96,
              background: "rgba(0,0,0,0.4)",
            }}
          />

          {/* Drawer */}
          <motion.div
            key="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(440px, 100vw)",
              background: "var(--color-bg)",
              zIndex: 97,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.5rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShoppingBag size={18} strokeWidth={1.5} />
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Your Bag ({items.reduce((s, i) => s + i.quantity, 0)})
                </span>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="hover:opacity-50 transition-opacity"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
              {items.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: "1rem",
                    textAlign: "center",
                  }}
                >
                  <ShoppingBag size={48} strokeWidth={1} style={{ color: "var(--color-border)" }} />
                  <p style={{ fontFamily: "var(--font-serif)", fontSize: "1.2rem", fontWeight: 300 }}>
                    Your bag is empty
                  </p>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    Discover your signature scent
                  </p>
                  <Link href="/shop" onClick={closeCart} className="btn-primary" style={{ marginTop: "0.5rem" }}>
                    Shop Now
                  </Link>
                </div>
              ) : (
                <ul style={{ display: "flex", flexDirection: "column", gap: "1.5rem", listStyle: "none" }}>
                  {items.map((item) => {
                    const isTester = [2, 5, 10].includes(item.volume_ml) || item.concentration === "Sample Vial" || item.concentration === "Tester Vial";
                    return (
                      <li
                        key={`${item.product_id}-${item.volume_ml}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "80px 1fr",
                          gap: "1rem",
                          paddingBottom: "1.5rem",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        {/* Image */}
                        <Link href={`/product/${item.slug}`} onClick={closeCart}>
                          <div
                            style={{
                              width: "80px",
                              height: "100px",
                              background: "var(--color-bg-soft)",
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                unoptimized
                                sizes="80px"
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: "0.7rem" }}>ANG</div>
                            )}
                          </div>
                        </Link>

                        {/* Details */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={closeCart}
                              style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.85rem",
                                fontWeight: 500,
                                color: "var(--color-text)",
                                textDecoration: "none",
                              }}
                            >
                              {item.name}
                            </Link>
                            {isTester && (
                              <span style={{ padding: "0.15rem 0.4rem", background: "#8a6d3b", color: "#fff", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.04em", flexShrink: 0 }}>
                                TESTER
                              </span>
                            )}
                          </div>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                            {formatProductSize(item.volume_ml, item)} · {item.concentration}
                          </p>
                          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600 }}>
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity */}
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.volume_ml)}
                              aria-label="Decrease quantity"
                              style={{
                                width: "28px",
                                height: "28px",
                                border: "1px solid var(--color-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                background: "transparent",
                              }}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", minWidth: "20px", textAlign: "center" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.volume_ml)}
                              aria-label="Increase quantity"
                              style={{
                                width: "28px",
                                height: "28px",
                                border: "1px solid var(--color-border)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                background: "transparent",
                              }}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <Plus size={12} />
                            </button>

                            <button
                              onClick={() => removeItem(item.product_id, item.volume_ml)}
                              aria-label="Remove item"
                              style={{
                                marginLeft: "auto",
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.72rem",
                                color: "var(--color-text-muted)",
                                cursor: "pointer",
                                background: "none",
                                border: "none",
                                textDecoration: "underline",
                                padding: 0,
                              }}
                              className="hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  borderTop: "1px solid var(--color-border)",
                  background: "var(--color-bg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {items.some((i) => [2, 5, 10].includes(i.volume_ml)) && (
                  <div style={{ padding: "0.6rem 0.75rem", background: "#fdf8ef", border: "1px solid #e8decb", borderRadius: "2px" }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#6e5d3d", lineHeight: 1.4 }}>
                      ✨ <strong>Tester Guarantee:</strong> Upgrade to full 100ml later and your tester value will be settled & credited!
                    </p>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    Subtotal
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 600 }}>
                    {formatPrice(total)}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  Shipping calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary"
                  style={{ textAlign: "center" }}
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="btn-outline"
                  style={{ textAlign: "center" }}
                >
                  View Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
