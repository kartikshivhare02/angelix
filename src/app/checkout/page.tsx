"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  MapPin,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Lock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Edit2,
  Check,
  Tag
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Multi-step state: 1 = Address, 2 = Payment Method, 3 = Review & Place
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Mobile Order Summary Drawer Toggle
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

  // Placing State
  const [placing, setPlacing] = useState(false);

  // 1. Verify User Login on mount
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
      }
      setAuthChecking(false);
    });
  }, []);

  // 2. Indian Postal Pincode API Integration
  const handlePincodeChange = async (pin: string) => {
    const cleanPin = pin.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: cleanPin }));

    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      setPincodeStatus("Looking up pincode...");
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

          setPincodeStatus(`✓ Delivery available in ${detectedCity}, ${detectedState}`);
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

  const subtotal = totalPrice();
  const shipping = subtotal >= 1499 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + shipping);

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

  // Step 1 Validation
  const validateStep1 = () => {
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
      toast.error("Please enter complete street address / building name.");
      return false;
    }
    if (!form.city.trim() || !form.state.trim()) {
      toast.error("City and state are required.");
      return false;
    }
    return true;
  };

  const goToStep2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToStep3 = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty.");
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
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error, { id: toastId });
        setPlacing(false);
        return;
      }

      // COD Order or Direct Creation
      if (data.payment_method === "cod" || !data.razorpay_order_id) {
        clearCart();
        toast.success("Order confirmed successfully!", { id: toastId });
        router.push(`/order-confirmation/${data.order_id}`);
        return;
      }

      // Razorpay Online Payment Gateway
      toast.dismiss(toastId);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const options = {
          key: data.razorpay_key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: "INR",
          name: "ANGLELIX by Suraj",
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
              if (verifyData.success) {
                clearCart();
                toast.success("Payment verified! Order placed.");
                router.push(`/order-confirmation/${data.order_id}`);
              } else {
                clearCart();
                router.push(`/order-confirmation/${data.order_id}`);
              }
            } catch {
              clearCart();
              router.push(`/order-confirmation/${data.order_id}`);
            }
          },
          modal: {
            ondismiss: function () {
              setPlacing(false);
              toast.info("Payment cancelled. You can retry or choose COD.");
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        toast.error("Failed to load gateway. Order placed as COD.");
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
        <div style={{ textAlign: "center" }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: "0 auto 1rem", color: "#111" }} />
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "#888" }}>
            Preparing checkout...
          </p>
        </div>
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
    <div className="container-site section-py checkout-page-root" style={{ maxWidth: "1100px", paddingBottom: "6rem" }}>
      {/* ── Mobile Order Summary Accordion (Shopify Style) ── */}
      <div className="checkout-mobile-summary-card">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fcfcfc",
            border: "1px solid #e5e5e5",
            padding: "0.85rem 1rem",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={16} color="#111" />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600, color: "#111" }}>
              {mobileSummaryOpen ? "Hide" : "Show"} Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
            {mobileSummaryOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", fontWeight: 700, color: "#111" }}>
            {formatPrice(total)}
          </span>
        </button>

        {mobileSummaryOpen && (
          <div style={{ background: "#fafafa", border: "1px solid #eee", padding: "1.25rem", marginBottom: "1.5rem", borderRadius: "2px" }}>
            {/* Products */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}>
              {items.map((item) => (
                <div key={item.product_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "42px", height: "52px", background: "#fff", border: "1px solid #ddd", flexShrink: 0, overflow: "hidden", position: "relative" }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>ANG</div>
                    )}
                    <span style={{ position: "absolute", top: -2, right: -2, background: "#111", color: "#fff", fontSize: "0.6rem", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.quantity}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#888" }}>
                      {item.volume_ml}ml · Qty: {item.quantity}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 700 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon input */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Discount code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                style={{ flex: 1, padding: "0.55rem 0.75rem", border: "1px solid #ccc", fontSize: "0.8rem", textTransform: "uppercase" }}
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={couponLoading}
                className="btn-primary"
                style={{ padding: "0.55rem 1rem", fontSize: "0.75rem" }}
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            </div>

            {/* Price lines */}
            <div style={{ borderTop: "1px solid #eee", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", color: "#666" }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <strong style={{ color: "#27ae60" }}>FREE</strong> : formatPrice(shipping)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", color: "#111", borderTop: "1px solid #eee", paddingTop: "0.5rem" }}>
                <span>Total to Pay</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Checkout Progress Header ── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
          <ShieldCheck size={16} color="#27ae60" />
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#27ae60" }}>
            256-Bit SSL Encrypted Checkout
          </p>
        </div>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(1.7rem, 4vw, 2.3rem)", lineHeight: 1.15 }}>
          Delivery & Payment
        </h1>

        {/* Step Progress Pill Indicator */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem", marginTop: "1.25rem" }}>
          {[
            { num: 1, label: "Address", icon: MapPin },
            { num: 2, label: "Payment", icon: CreditCard },
            { num: 3, label: "Review", icon: CheckCircle2 },
          ].map((s) => {
            const isCurrent = step === s.num;
            const isDone = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => isDone && setStep(s.num as any)}
                style={{
                  padding: "0.65rem 0.5rem",
                  background: isCurrent ? "#111" : isDone ? "#f0fdf4" : "#fafafa",
                  color: isCurrent ? "#fff" : isDone ? "#166534" : "#888",
                  border: isCurrent ? "1px solid #111" : isDone ? "1px solid #bbf7d0" : "1px solid #eee",
                  borderRadius: "3px",
                  cursor: isDone ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  textAlign: "center",
                }}
              >
                <s.icon size={14} color={isCurrent ? "#fff" : isDone ? "#166534" : "#888"} />
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: isCurrent ? 700 : 600 }}>
                  {s.num}. {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "flex-start" }} className="checkout-main-grid">
        {/* ── Left Column: Step-by-Step Flow ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* ════════════ STEP 1: Indian Address ════════════ */}
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "clamp(1.25rem, 3vw, 2rem)", borderRadius: "2px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.6rem", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: step === 1 ? "#111" : "#166534", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
                  {step > 1 ? "✓" : "1"}
                </span>
                <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Delivery Address & Contact
                </h2>
              </div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: "none", border: "none", color: "#111", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>

            {step === 1 ? (
              <form onSubmit={goToStep2} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* ── Guest Quick Google Sign In Banner ── */}
                {!user && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #FAF9F7 0%, #F4F0E8 100%)",
                      border: "1px solid #E8E5DF",
                      padding: "0.85rem 1rem",
                      borderRadius: "3px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Sparkles size={16} color="#111" />
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#333", fontWeight: 500 }}>
                        Have an account or want 1-click autofill?
                      </p>
                    </div>
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
                        gap: "0.45rem",
                        background: "#fff",
                        border: "1px solid #ddd",
                        padding: "0.45rem 0.85rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        borderRadius: "2px",
                        color: "#111",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                )}
                {/* Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={labelStyle}>First Name *</label>
                    <input
                      className="input-base"
                      value={form.first_name}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      placeholder="e.g. Rahul"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name *</label>
                    <input
                      className="input-base"
                      value={form.last_name}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      placeholder="e.g. Sharma"
                      required
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }} className="checkout-two-input-grid">
                  <div>
                    <label style={labelStyle}>Email (for order & invoice) *</label>
                    <input
                      type="email"
                      className="input-base"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="rahul@gmail.com"
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone (10-Digit Mobile) *</label>
                    <div style={{ display: "flex" }}>
                      <span style={{ padding: "0.65rem 0.6rem", background: "#f5f5f5", border: "1px solid #ccc", borderRight: "none", fontSize: "0.82rem", fontWeight: 600, color: "#666" }}>
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        className="input-base"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Opt-in */}
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", background: "#f0fdf4", padding: "0.6rem 0.75rem", border: "1px solid #bbf7d0", borderRadius: "2px" }}>
                  <input
                    type="checkbox"
                    checked={form.whatsapp_same}
                    onChange={(e) => setForm({ ...form, whatsapp_same: e.target.checked })}
                  />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#166534", fontWeight: 500 }}>
                    Send shipping tracking & dispatch alerts to this WhatsApp number
                  </span>
                </label>

                {/* PIN Code Lookup with Indian Postal API */}
                <div style={{ background: "#fafafa", padding: "1rem", border: "1px solid #eee", borderRadius: "2px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 1fr", gap: "0.75rem" }} className="checkout-pincode-grid">
                    <div>
                      <label style={labelStyle}>PIN Code *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="input-base"
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
                        className="input-base"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>State *</label>
                      <input
                        className="input-base"
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
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        marginTop: "0.5rem",
                        color: pincodeStatus.startsWith("✓") ? "#166534" : pincodeStatus.startsWith("⚠️") ? "#c0392b" : "#666",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      {pincodeLoading && <Loader2 size={12} className="animate-spin" />}
                      {pincodeStatus}
                    </p>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label style={labelStyle}>House / Flat No., Building, Street Address *</label>
                  <input
                    className="input-base"
                    value={form.address1}
                    onChange={(e) => setForm({ ...form, address1: e.target.value })}
                    placeholder="e.g. Flat 302, Green Avenue, MG Road"
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={labelStyle}>Area / Colony</label>
                    <input
                      className="input-base"
                      value={form.address2}
                      onChange={(e) => setForm({ ...form, address2: e.target.value })}
                      placeholder="e.g. Sector 14"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Landmark (Optional)</label>
                    <input
                      className="input-base"
                      value={form.landmark}
                      onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                      placeholder="e.g. Near HDFC Bank"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.9rem", marginTop: "0.4rem", fontSize: "0.88rem" }}
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div style={{ fontSize: "0.82rem", color: "#555", lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, color: "#111" }}>{form.first_name} {form.last_name}</p>
                <p>{form.address1}{form.address2 ? `, ${form.address2}` : ""}{form.landmark ? ` (Landmark: ${form.landmark})` : ""}</p>
                <p>{form.city}, {form.state} — <strong>{form.pincode}</strong></p>
                <p style={{ color: "#888", fontSize: "0.75rem" }}>Phone: +91 {form.phone} · Email: {form.email}</p>
              </div>
            )}
          </div>

          {/* ════════════ STEP 2: Payment Method ════════════ */}
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "clamp(1.25rem, 3vw, 2rem)", borderRadius: "2px", opacity: step < 2 ? 0.6 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.6rem", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: step === 2 ? "#111" : step > 2 ? "#166534" : "#eee", color: step === 2 || step > 2 ? "#fff" : "#999", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
                  {step > 2 ? "✓" : "2"}
                </span>
                <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Select Payment Method
                </h2>
              </div>
              {step > 2 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ background: "none", border: "none", color: "#111", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                  <Edit2 size={12} /> Change
                </button>
              )}
            </div>

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {/* Razorpay Online */}
                <label
                  onClick={() => setPaymentMethod("razorpay")}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.85rem",
                    padding: "1.1rem",
                    border: paymentMethod === "razorpay" ? "2px solid #111" : "1px solid #ddd",
                    background: paymentMethod === "razorpay" ? "#fbfbfb" : "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    style={{ marginTop: "0.25rem" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.92rem", color: "#111" }}>
                        ⚡ Online Payment (UPI, GPay, PhonePe, Cards)
                      </span>
                      <span style={{ padding: "0.15rem 0.4rem", background: "#e8f5e9", color: "#2e7d32", fontSize: "0.65rem", fontWeight: 700, borderRadius: "2px" }}>
                        Fastest Dispatch
                      </span>
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#666", marginTop: "0.3rem", lineHeight: 1.4 }}>
                      Instant secure payment via UPI, Google Pay, PhonePe, Paytm, Debit/Credit Cards & NetBanking.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.85rem",
                    padding: "1.1rem",
                    border: paymentMethod === "cod" ? "2px solid #111" : "1px solid #ddd",
                    background: paymentMethod === "cod" ? "#fbfbfb" : "#fff",
                    borderRadius: "4px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    style={{ marginTop: "0.25rem" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.92rem", color: "#111" }}>
                        💵 Cash on Delivery (COD)
                      </span>
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#666", marginTop: "0.3rem", lineHeight: 1.4 }}>
                      Pay with cash or UPI directly to the courier agent when your package arrives.
                    </p>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={goToStep3}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.9rem", marginTop: "0.5rem", fontSize: "0.88rem" }}
                >
                  <span>Review & Finalize Order</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step > 2 && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "#222", fontWeight: 600 }}>
                {paymentMethod === "razorpay" ? "⚡ Online Payment (UPI, Cards, NetBanking)" : "💵 Cash on Delivery (COD)"}
              </p>
            )}
          </div>

          {/* ════════════ STEP 3: Final Review & Confirmation ════════════ */}
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "clamp(1.25rem, 3vw, 2rem)", borderRadius: "2px", opacity: step < 3 ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem", paddingBottom: "0.6rem", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: step === 3 ? "#111" : "#eee", color: step === 3 ? "#fff" : "#999", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>
                3
              </span>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Review & Confirm Dispatch
              </h2>
            </div>

            {step === 3 && (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.5rem" }}>
                  {items.map((item) => (
                    <div key={item.product_id} style={{ display: "flex", alignItems: "center", gap: "0.85rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ width: "46px", height: "56px", background: "#f5f5f5", overflow: "hidden", border: "1px solid #eee", flexShrink: 0 }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: "0.6rem" }}>ANG</div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.85rem" }}>{item.name}</p>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#888" }}>
                          {item.volume_ml}ml · Qty: {item.quantity}
                        </p>
                      </div>
                      <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.88rem" }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Final Button */}
                <button
                  type="button"
                  disabled={placing}
                  onClick={handlePlaceOrder}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "1rem",
                    fontSize: "0.92rem",
                    background: "#111",
                    color: "#fff",
                    letterSpacing: "0.06em",
                  }}
                >
                  {placing ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Loader2 size={18} className="animate-spin" /> Placing Order...
                    </span>
                  ) : paymentMethod === "cod" ? (
                    `Place Order (Pay ${formatPrice(total)} on Delivery)`
                  ) : (
                    `Pay ${formatPrice(total)} Securely via UPI / Cards`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Desktop Order Summary & Coupon ── */}
        <div className="checkout-desktop-summary" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ background: "#fff", border: "1px solid #e5e5e5", padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1rem" }}>
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h3>

            {/* Desktop Products */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {items.map((item) => (
                <div key={item.product_id} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: "40px", height: "48px", background: "#f5f5f5", border: "1px solid #eee", flexShrink: 0, overflow: "hidden" }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>ANG</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {item.name}
                    </p>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.7rem", color: "#888" }}>
                      Qty: {item.quantity} · {formatPrice(item.price)}
                    </p>
                  </div>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700 }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <div style={{ marginBottom: "1.25rem", borderTop: "1px solid #f0f0f0", paddingTop: "1rem" }}>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    padding: "0.55rem 0.65rem",
                    border: "1px solid #ddd",
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  style={{
                    padding: "0.55rem 0.85rem",
                    background: "#111",
                    color: "#fff",
                    border: "none",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponApplied && (
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#166534", marginTop: "0.35rem", fontWeight: 600 }}>
                  ✓ Code {couponApplied} applied
                </p>
              )}
            </div>

            {/* Price lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", borderTop: "1px solid #f0f0f0", paddingTop: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#666" }}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#166534", fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "#666" }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <strong style={{ color: "#166534" }}>FREE</strong> : formatPrice(shipping)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 700, color: "#111", borderTop: "1px solid #eee", paddingTop: "0.85rem", marginTop: "0.2rem" }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div style={{ background: "#fafafa", border: "1px solid #eee", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Truck size={15} color="#555" />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#555" }}>
                Dispatched via Bluedart / Delhivery in 24–48 hrs
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldCheck size={15} color="#555" />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#555" }}>
                100% Authentic Handcrafted Luxury Fragrances
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <RotateCcw size={15} color="#555" />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#555" }}>
                7-Day Hassle-Free Replacement for sealed bottles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      <div className="checkout-mobile-sticky-bar">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", maxWidth: "500px", margin: "0 auto", width: "100%" }}>
          <div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Amount
            </p>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>
              {formatPrice(total)}
            </p>
          </div>

          {step === 1 ? (
            <button
              type="button"
              onClick={() => goToStep2()}
              className="btn-primary"
              style={{ flex: 1, justifyContent: "center", padding: "0.85rem 1rem", fontSize: "0.82rem" }}
            >
              <span>Continue →</span>
            </button>
          ) : step === 2 ? (
            <button
              type="button"
              onClick={goToStep3}
              className="btn-primary"
              style={{ flex: 1, justifyContent: "center", padding: "0.85rem 1rem", fontSize: "0.82rem" }}
            >
              <span>Review Order →</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={placing}
              onClick={handlePlaceOrder}
              className="btn-primary"
              style={{ flex: 1, justifyContent: "center", padding: "0.85rem 1rem", fontSize: "0.82rem" }}
            >
              {placing ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </span>
              ) : paymentMethod === "cod" ? (
                "Place Order (COD)"
              ) : (
                "Pay via UPI/Card"
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-main-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-desktop-summary {
            display: none !important;
          }
          .checkout-mobile-summary-card {
            display: block !important;
          }
          .checkout-mobile-sticky-bar {
            display: block !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.98);
            border-top: 1px solid #e5e5e5;
            padding: 0.75rem 1rem;
            padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
            z-index: 90;
            box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
            backdrop-filter: blur(8px);
          }
          .checkout-pincode-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-two-input-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (min-width: 769px) {
          .checkout-mobile-summary-card {
            display: none !important;
          }
          .checkout-mobile-sticky-bar {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.7rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#777",
  marginBottom: "0.3rem",
};
