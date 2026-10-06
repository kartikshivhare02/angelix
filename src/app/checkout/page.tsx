"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { formatPrice, formatProductSize } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  Tag,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.76rem",
  fontWeight: 600,
  color: "#475569",
  marginBottom: "0.4rem",
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Mobile Order Summary Accordion State
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Address Form State
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    whatsapp_same: true,
    whatsapp: "",
    pincode: "",
    city: "",
    state: "",
    address1: "",
    address2: "",
    landmark: "",
    country: "India",
  });

  // Pincode Lookup State
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  // Coupon State
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Tester Credit State
  const [testerCreditQuery, setTesterCreditQuery] = useState("");
  const [testerDiscount, setTesterDiscount] = useState(0);
  const [testerAppliedOrder, setTesterAppliedOrder] = useState("");
  const [testerLoading, setTesterLoading] = useState(false);
  const [testerMessage, setTesterMessage] = useState("");

  // Placing State
  const [placing, setPlacing] = useState(false);

  // 1. Verify User Login on mount & pre-fill address
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setForm((prev) => ({
          ...prev,
          email: user.email || prev.email,
          first_name: user.user_metadata?.first_name || prev.first_name,
          last_name: user.user_metadata?.last_name || prev.last_name,
          phone: user.user_metadata?.phone || prev.phone,
        }));

        if (user.email) {
          fetch("/api/testers/validate-credit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: user.email,
              cart_items: items,
              subtotal: totalPrice(),
            }),
          })
            .then((r) => r.json())
            .then((res) => {
              if (res.valid && res.credit_amount > 0) {
                setTesterDiscount(res.credit_amount);
                setTesterAppliedOrder(res.order_number || user.email || "");
                setTesterMessage(res.message);
                toast.success(`🎉 Tester Credit Detected: -${formatPrice(res.credit_amount)}`);
              }
            })
            .catch(() => {});
        }
      }
      setAuthChecking(false);
    });
  }, [items]);

  // 2. Indian Postal Pincode Lookup API
  const handlePincodeChange = async (pin: string) => {
    const cleanPin = pin.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: cleanPin }));

    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      setPincodeStatus("Looking up location...");
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const data = await res.json();

        if (Array.isArray(data) && data[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const detectedCity = po.District || po.Name || "";
          const detectedState = po.State || "";

          setForm((prev) => ({
            ...prev,
            city: detectedCity,
            state: detectedState,
          }));

          setPincodeStatus(`✓ Serviceable: ${detectedCity}, ${detectedState}`);
          toast.success(`Location detected: ${detectedCity}, ${detectedState}`);
        } else {
          setPincodeStatus("⚠️ Invalid Indian PIN Code.");
          toast.error("Please enter a valid 6-digit Indian PIN code.");
        }
      } catch {
        setPincodeStatus(null);
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeStatus(null);
    }
  };

  const [settings, setSettings] = useState<{ free_shipping_min: number; shipping_charge: number }>({
    free_shipping_min: 1499,
    shipping_charge: 99,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const s = data?.settings || data;
        if (s) {
          setSettings({
            free_shipping_min: s.free_shipping_min ?? 1499,
            shipping_charge: s.shipping_charge ?? 99,
          });
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = totalPrice();
  const freeMin = settings.free_shipping_min;
  const shipCharge = settings.shipping_charge;
  const shippingCost = freeMin > 0 && subtotal >= freeMin ? 0 : (freeMin === 0 ? 0 : shipCharge);
  const total = Math.max(0, subtotal - discount - testerDiscount + shippingCost);

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
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setDiscount(data.discount);
      setCouponApplied(data.code);
      toast.success(`Coupon applied! Saved ${formatPrice(data.discount)}`);
    } catch {
      toast.error("Unable to validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  const applyTesterCredit = async (queryVal?: string) => {
    const q = (queryVal || testerCreditQuery).trim();
    if (!q) {
      toast.error("Please enter your Tester Order #, Phone, or Email.");
      return;
    }
    setTesterLoading(true);
    try {
      const res = await fetch("/api/testers/validate-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          cart_items: items,
          subtotal,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setTesterDiscount(data.credit_amount);
      setTesterAppliedOrder(data.order_number || q);
      setTesterMessage(data.message || `₹${data.credit_amount} Tester Value Settle Applied`);
      toast.success(`🎉 Tester Credit Applied: -${formatPrice(data.credit_amount)}`);
    } catch {
      toast.error("Unable to validate tester credit.");
    } finally {
      setTesterLoading(false);
    }
  };

  const removeTesterCredit = () => {
    setTesterDiscount(0);
    setTesterAppliedOrder("");
    setTesterMessage("");
    toast.info("Tester credit removed.");
  };

  // Form Validation
  const validateForm = () => {
    if (!form.first_name.trim()) { toast.error("Please enter your first name."); return false; }
    if (!form.last_name.trim()) { toast.error("Please enter your last name."); return false; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return false;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!form.pincode || form.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return false;
    }
    if (!form.address1.trim() || form.address1.trim().length < 4) {
      toast.error("Please enter complete house/flat no. and street address.");
      return false;
    }
    if (!form.city.trim() || !form.state.trim()) {
      toast.error("City and State are required.");
      return false;
    }
    return true;
  };

  // Place Order Handler
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (items.length === 0) {
      toast.error("Your shopping bag is empty.");
      return;
    }

    setPlacing(true);
    const toastId = toast.loading(
      paymentMethod === "cod" ? "Placing your COD order..." : "Connecting to secure payment gateway..."
    );

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity, volume_ml: i.volume_ml })),
          shipping_address: form,
          coupon_code: couponApplied || undefined,
          tester_credit_query: testerAppliedOrder || undefined,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error, { id: toastId });
        setPlacing(false);
        return;
      }

      // COD Order Confirmation
      if (data.payment_method === "cod" || !data.razorpay_order_id) {
        clearCart();
        toast.success("Order confirmed successfully!", { id: toastId });
        router.push(`/order-confirmation/${data.order_id}`);
        return;
      }

      // Razorpay Online Gateway
      toast.dismiss(toastId);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: data.razorpay_key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: "INR",
          name: "ANGELIX by Suraj",
          description: `Order #${data.order_number}`,
          order_id: data.razorpay_order_id,
          prefill: {
            name: `${form.first_name} ${form.last_name}`,
            email: form.email,
            contact: form.phone,
          },
          theme: {
            color: "#111111",
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/orders/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  order_id: data.order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              clearCart();
              if (verifyData.success) {
                toast.success("Payment verified! Order placed.");
              }
              router.push(`/order-confirmation/${data.order_id}`);
            } catch {
              clearCart();
              router.push(`/order-confirmation/${data.order_id}`);
            }
          },
          modal: {
            ondismiss: function () {
              setPlacing(false);
              toast.info("Payment cancelled. You can retry or select Cash on Delivery.");
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        toast.error("Failed to load gateway. Order recorded.");
        clearCart();
        router.push(`/order-confirmation/${data.order_id}`);
      };
      document.body.appendChild(script);
    } catch {
      toast.error("Something went wrong. Please try again.", { id: toastId });
      setPlacing(false);
    }
  };

  if (authChecking) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#111" }} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-site section-py" style={{ textAlign: "center", padding: "6rem 1rem" }}>
        <ShoppingBag size={48} strokeWidth={1} style={{ margin: "0 auto 1rem", color: "#ccc" }} />
        <h1 className="heading-editorial" style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
          Your Bag is Empty
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", color: "#888", marginBottom: "2rem" }}>
          Explore our signature fragrances and discovery testers to begin your order.
        </p>
        <Link href="/shop" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
          Explore Fragrances
        </Link>
      </div>
    );
  }

  return (
    <div className="container-site section-py" style={{ maxWidth: "1080px", paddingBottom: "7rem" }}>
      {/* ── Top Header ── */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
            <ShieldCheck size={16} color="#27ae60" />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#27ae60" }}>
              256-Bit SSL Encrypted Express Checkout
            </span>
          </div>
          <h1 className="heading-editorial" style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", lineHeight: 1.15 }}>
            Checkout
          </h1>
        </div>

        {!user && (
          <button
            type="button"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=/checkout`,
                },
              });
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#fff",
              border: "1px solid #ccc",
              padding: "0.5rem 0.9rem",
              borderRadius: "4px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              color: "#111",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>1-Click Google Autofill</span>
          </button>
        )}
      </div>

      {/* ── Mobile Expandable Order Summary ── */}
      <div className="checkout-mobile-summary-card">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fdfdfd",
            border: "1px solid #e0e0e0",
            padding: "0.85rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={16} color="#111" />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, color: "#111" }}>
              {mobileSummaryOpen ? "Hide" : "Show"} Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
            {mobileSummaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 700, color: "#111" }}>
            {formatPrice(total)}
          </span>
        </button>

        {mobileSummaryOpen && (
          <div style={{ background: "#fafafa", border: "1px solid #e5e5e5", padding: "1.25rem", borderRadius: "6px", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.25rem" }}>
              {items.map((item) => (
                <div key={item.product_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "42px", height: "52px", background: "#fff", border: "1px solid #ddd", flexShrink: 0, overflow: "hidden", position: "relative", borderRadius: "3px" }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>ANG</div>
                    )}
                    <span style={{ position: "absolute", top: -2, right: -2, background: "#111", color: "#fff", fontSize: "0.6rem", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {item.quantity}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#666" }}>
                      {formatProductSize(item.volume_ml, item)} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", fontWeight: 700 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #e0e0e0", paddingTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#27ae60", fontWeight: 600 }}>
                  <span>Discount ({couponApplied})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              {testerDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#8a6d3b", fontWeight: 700 }}>
                  <span>Tester Settle ({testerAppliedOrder})</span>
                  <span>-{formatPrice(testerDiscount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <strong style={{ color: "#27ae60" }}>FREE</strong> : formatPrice(shippingCost)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.05rem", color: "#111", borderTop: "1px solid #ddd", paddingTop: "0.6rem", marginTop: "0.25rem" }}>
                <span>Total to Pay</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Layout Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "flex-start" }} className="checkout-main-grid">
        
        {/* ── Left Column: Form & Payment Selection ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Card 1: Delivery Details */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "clamp(1.25rem, 3vw, 2rem)", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                1
              </span>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a" }}>
                Shipping Address & Contact
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {/* Name Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }} className="checkout-mobile-stack">
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input
                    type="text"
                    className="checkout-input-field"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="e.g. Rahul"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input
                    type="text"
                    className="checkout-input-field"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="e.g. Sharma"
                    required
                  />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }} className="checkout-mobile-stack">
                <div>
                  <label style={labelStyle}>Email (for order invoice & tracking) *</label>
                  <input
                    type="email"
                    className="checkout-input-field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="rahul@gmail.com"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone (10-Digit Mobile Number) *</label>
                  <div style={{ display: "flex" }}>
                    <span style={{ padding: "0.7rem 0.65rem", background: "#f8fafc", border: "1px solid #cbd5e1", borderRight: "none", borderRadius: "6px 0 0 6px", fontSize: "0.88rem", fontWeight: 600, color: "#64748b" }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      className="checkout-input-field"
                      style={{ borderRadius: "0 6px 6px 0" }}
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      placeholder="9876543210"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Alert Checkbox */}
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", background: "#f0fdf4", padding: "0.65rem 0.85rem", border: "1px solid #bbf7d0", borderRadius: "6px" }}>
                <input
                  type="checkbox"
                  checked={form.whatsapp_same}
                  onChange={(e) => setForm({ ...form, whatsapp_same: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#166534" }}
                />
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#166534", fontWeight: 500 }}>
                  Send dispatch alerts & live WhatsApp tracking to this number
                </span>
              </label>

              {/* PIN Code & Auto-Location Box */}
              <div style={{ background: "#f8fafc", padding: "1.1rem", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 1fr", gap: "0.85rem" }} className="checkout-pincode-grid">
                  <div>
                    <label style={labelStyle}>PIN Code *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="checkout-input-field"
                      value={form.pincode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="110001"
                      maxLength={6}
                      required
                      style={{ fontWeight: 700, letterSpacing: "0.08em" }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>City / District *</label>
                    <input
                      type="text"
                      className="checkout-input-field"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>State *</label>
                    <input
                      type="text"
                      className="checkout-input-field"
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                {pincodeStatus && (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      marginTop: "0.55rem",
                      color: pincodeStatus.startsWith("✓") ? "#15803d" : pincodeStatus.startsWith("⚠️") ? "#dc2626" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    {pincodeLoading && <Loader2 size={13} className="animate-spin" />}
                    {pincodeStatus}
                  </p>
                )}
              </div>

              {/* Street Address */}
              <div>
                <label style={labelStyle}>House / Flat No., Building, Street Address *</label>
                <input
                  type="text"
                  className="checkout-input-field"
                  value={form.address1}
                  onChange={(e) => setForm({ ...form, address1: e.target.value })}
                  placeholder="e.g. Flat 302, Green Avenue, MG Road"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }} className="checkout-mobile-stack">
                <div>
                  <label style={labelStyle}>Area / Colony (Optional)</label>
                  <input
                    type="text"
                    className="checkout-input-field"
                    value={form.address2}
                    onChange={(e) => setForm({ ...form, address2: e.target.value })}
                    placeholder="e.g. Sector 14"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Landmark (Optional)</label>
                  <input
                    type="text"
                    className="checkout-input-field"
                    value={form.landmark}
                    onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                    placeholder="e.g. Near HDFC Bank"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Payment Method */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "clamp(1.25rem, 3vw, 2rem)", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                2
              </span>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0f172a" }}>
                Payment Method
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              {/* Option A: Online Payment */}
              <label
                onClick={() => setPaymentMethod("razorpay")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.85rem",
                  padding: "1.1rem",
                  border: paymentMethod === "razorpay" ? "2px solid #111" : "1px solid #cbd5e1",
                  background: paymentMethod === "razorpay" ? "#fafafa" : "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="radio"
                  name="payment_method_choice"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  style={{ marginTop: "0.2rem", width: "16px", height: "16px", accentColor: "#111" }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                      ⚡ Online Payment (UPI, GPay, PhonePe, Cards, NetBanking)
                    </span>
                    <span style={{ padding: "0.15rem 0.45rem", background: "#dcfce7", color: "#15803d", fontSize: "0.65rem", fontWeight: 700, borderRadius: "3px" }}>
                      Instant Confirmation
                    </span>
                  </div>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#64748b", marginTop: "0.3rem", lineHeight: 1.45 }}>
                    Pay securely using Google Pay, PhonePe, Paytm, BHIM UPI, Debit/Credit Cards, or NetBanking.
                  </p>
                </div>
              </label>

              {/* Option B: COD */}
              <label
                onClick={() => setPaymentMethod("cod")}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.85rem",
                  padding: "1.1rem",
                  border: paymentMethod === "cod" ? "2px solid #111" : "1px solid #cbd5e1",
                  background: paymentMethod === "cod" ? "#fafafa" : "#fff",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="radio"
                  name="payment_method_choice"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  style={{ marginTop: "0.2rem", width: "16px", height: "16px", accentColor: "#111" }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                    💵 Cash on Delivery (COD)
                  </span>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#64748b", marginTop: "0.3rem", lineHeight: 1.45 }}>
                    Pay cash or UPI directly to the courier delivery agent when your order arrives.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Card 3: Single High-Converting Place Order Button */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "clamp(1.25rem, 3vw, 2rem)", borderRadius: "8px" }}>
            <button
              type="button"
              disabled={placing}
              onClick={handlePlaceOrder}
              style={{
                width: "100%",
                padding: "1.1rem",
                background: "#111111",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontFamily: "var(--font-sans)",
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                cursor: placing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "opacity 0.2s",
                opacity: placing ? 0.75 : 1,
              }}
            >
              {placing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing Your Order...</span>
                </>
              ) : paymentMethod === "cod" ? (
                <>
                  <span>Place Order (Pay {formatPrice(total)} on Delivery)</span>
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  <span>Pay {formatPrice(total)} Securely via UPI / Cards</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", color: "#64748b" }}>
              <Lock size={13} />
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 500 }}>
                Guaranteed Safe &amp; Secure 256-Bit Encrypted Transaction
              </span>
            </div>
          </div>

        </div>

        {/* ── Right Column: Desktop Sidebar Summary ── */}
        <div className="checkout-desktop-summary" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", padding: "1.5rem", borderRadius: "8px" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0f172a", marginBottom: "1.1rem" }}>
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h3>

            {/* Products List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.25rem" }}>
              {items.map((item) => (
                <div key={item.product_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "42px", height: "52px", background: "#f8fafc", border: "1px solid #e2e8f0", flexShrink: 0, overflow: "hidden", borderRadius: "4px" }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "#94a3b8" }}>ANG</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#64748b" }}>
                      Qty: {item.quantity} · {formatPrice(item.price)}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", marginBottom: "1rem" }}>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b", marginBottom: "0.45rem" }}>
                Promo / Coupon Code
              </p>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  type="text"
                  placeholder="ENTER CODE"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    padding: "0.55rem 0.65rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                  }}
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  style={{
                    padding: "0.55rem 0.9rem",
                    background: "#111",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponApplied && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#15803d", marginTop: "0.35rem", fontWeight: 600 }}>
                  ✓ Code {couponApplied} applied (-{formatPrice(discount)})
                </p>
              )}
            </div>

            {/* Tester 100% Value Settlement Card */}
            <div style={{ background: "#fbf8f2", border: "1px solid #ebdcc5", padding: "0.85rem", borderRadius: "6px", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, color: "#8a6d3b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  🧪 100% Tester Value Settle
                </span>
                {testerDiscount > 0 && (
                  <button type="button" onClick={removeTesterCredit} style={{ background: "none", border: "none", color: "#dc2626", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer" }}>
                    Remove
                  </button>
                )}
              </div>
              {testerDiscount > 0 ? (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#15803d", fontWeight: 600 }}>
                  ✓ {testerMessage || `Tester value of ${formatPrice(testerDiscount)} deducted!`}
                </p>
              ) : (
                <>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#8a6d3b", marginBottom: "0.45rem", lineHeight: 1.4 }}>
                    Bought a tester earlier? Enter your tester order # or email to deduct 100% of the cost.
                  </p>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <input
                      type="text"
                      placeholder="ANG-2026-XXXXXX / Email"
                      value={testerCreditQuery}
                      onChange={(e) => setTesterCreditQuery(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "0.5rem 0.65rem",
                        border: "1px solid #ebdcc5",
                        borderRadius: "4px",
                        fontSize: "0.76rem",
                        background: "#fff",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => applyTesterCredit()}
                      disabled={testerLoading}
                      style={{
                        padding: "0.5rem 0.85rem",
                        background: "#8a6d3b",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {testerLoading ? "..." : "Settle"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Price breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.9rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#15803d", fontWeight: 600 }}>
                  <span>Discount ({couponApplied})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              {testerDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", color: "#8a6d3b", fontWeight: 700 }}>
                  <span>Tester Settle ({testerAppliedOrder})</span>
                  <span>-{formatPrice(testerDiscount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <strong style={{ color: "#15803d" }}>FREE</strong> : formatPrice(shippingCost)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem", color: "#0f172a", borderTop: "1px solid #e2e8f0", paddingTop: "0.65rem", marginTop: "0.3rem" }}>
                <span>Total to Pay</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Scoped Form Inputs CSS ── */}
      <style jsx global>{`
        .checkout-input-field {
          width: 100%;
          padding: 0.75rem 0.85rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-family: var(--font-sans);
          font-size: 16px !important; /* Prevents mobile Safari auto-zoom on input focus */
          color: #0f172a;
          background: #ffffff;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .checkout-input-field:focus {
          border-color: #111111;
          box-shadow: 0 0 0 2px rgba(17, 17, 17, 0.1);
        }
        @media (max-width: 900px) {
          .checkout-main-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-desktop-summary {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .checkout-mobile-stack {
            grid-template-columns: 1fr !important;
          }
          .checkout-pincode-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 901px) {
          .checkout-mobile-summary-card {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
