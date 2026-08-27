"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = totalPrice();
  const shipping = subtotal >= 1499 ? 0 : 99;
  const total = subtotal - discount + shipping;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon.trim().toUpperCase(), subtotal }),
      });
      const data = await res.json();
      if (data.error) { toast.error(data.error); return; }
      setDiscount(data.discount);
      setCouponApplied(coupon.trim().toUpperCase());
      toast.success(`Coupon applied! You save ${formatPrice(data.discount)}`);
    } catch {
      toast.error("Could not validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponApplied("");
    setCoupon("");
  };

  if (items.length === 0) {
    return (
      <div className="container-site section-py" style={{ textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <ShoppingBag size={48} strokeWidth={1} style={{ color: "var(--color-border)", marginBottom: "1.5rem" }} />
        <h1 className="heading-editorial" style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>Your Bag is Empty</h1>
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-muted)", marginBottom: "2rem" }}>
          Discover our signature fragrance collection.
        </p>
        <Link href="/shop" className="btn-primary">Explore Fragrances</Link>
      </div>
    );
  }

  return (
    <div className="container-site section-py">
      <h1 className="heading-editorial" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "2.5rem" }}>
        Shopping Bag
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 400, color: "var(--color-text-muted)", marginLeft: "0.75rem" }}>
          ({items.length} item{items.length !== 1 ? "s" : ""})
        </span>
      </h1>

      <div className="cart-layout">
        {/* Line items */}
        <div>
          {items.map((item) => (
            <div
              key={`${item.product_id}-${item.volume_ml}`}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: "1rem",
                padding: "1.25rem 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {/* Image */}
              <Link href={`/product/${item.slug}`}>
                <div style={{ position: "relative", paddingBottom: "125%", background: "var(--color-bg-soft)", overflow: "hidden" }}>
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill unoptimized sizes="80px" style={{ objectFit: "cover" }} />
                  ) : (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontSize: "0.7rem" }}>ANG</div>
                  )}
                </div>
              </Link>

              {/* Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Link href={`/product/${item.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                      {item.name}
                    </h3>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      {item.volume_ml}ml · {item.concentration}
                    </p>
                  </Link>
                  <button onClick={() => removeItem(item.product_id, item.volume_ml)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: "4px" }}>
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                  {/* Qty */}
                  <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--color-border)" }}>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.volume_ml)} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
                      <Minus size={12} strokeWidth={1.5} />
                    </button>
                    <span style={{ width: "32px", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.82rem" }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.volume_ml)} style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
                      <Plus size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                  {/* Price */}
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", fontWeight: 700 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <aside>
          <div style={{ border: "1px solid var(--color-border)", padding: "1.75rem", position: "sticky", top: "calc(var(--nav-height) + 1rem)" }}>
            {items.some((i) => [2, 5, 10].includes(i.volume_ml)) && (
              <div style={{ padding: "0.85rem 1rem", background: "#fdf8ef", border: "1px solid #e8decb", borderRadius: "3px", marginBottom: "1.5rem" }}>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, color: "#8a6d3b", marginBottom: "0.2rem" }}>
                  ✨ 100% Tester Settle Guarantee
                </p>
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.74rem", color: "#6e5d3d", lineHeight: 1.45 }}>
                  Upgrade to the full 100ml bottle later and your entire tester value will be credited to your order!
                </p>
              </div>
            )}
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              Order Summary
            </h2>

            {/* Coupon */}
            <div style={{ marginBottom: "1.5rem" }}>
              {couponApplied ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "var(--color-bg-soft)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600 }}>
                    {couponApplied} applied ✓
                  </span>
                  <button onClick={removeCoupon} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)" }}>
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="COUPON CODE"
                    className="input-base"
                    style={{ flex: 1, fontSize: "0.8rem", letterSpacing: "0.06em" }}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="btn-primary"
                    style={{ padding: "0.6rem 1rem", fontSize: "0.72rem" }}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", paddingBottom: "1.25rem", borderBottom: "1px solid var(--color-border)", marginBottom: "1.25rem" }}>
              {([
                ["Subtotal", formatPrice(subtotal)],
                discount > 0 ? ["Discount", `-${formatPrice(discount)}`] : null,
                ["Shipping", shipping === 0 ? "Free" : formatPrice(shipping)],
              ].filter(Boolean) as [string, string][])
                .map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: label === "Discount" ? "#27ae60" : "var(--color-text)" }}>{value}</span>
                  </div>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700 }}>Total</span>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.1rem" }}>{formatPrice(total)}</span>
            </div>

            {subtotal < 1499 && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "1rem", textAlign: "center" }}>
                Add {formatPrice(1499 - subtotal)} more for free shipping
              </p>
            )}

            <Link
              href="/checkout"
              className="btn-primary"
              style={{ width: "100%", textAlign: "center", justifyContent: "center", gap: "0.5rem", display: "flex" }}
            >
              Proceed to Checkout <ArrowRight size={16} strokeWidth={1.5} />
            </Link>

            <Link href="/shop" style={{ display: "block", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: "1rem", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>

      <style>{`
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 3rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .cart-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
