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
  Loader2,
  Edit2
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
      if (!user) {
        router.push("/login?redirect=/checkout");
        return;
      }
      setUser(user);
      // Pre-fill email and user metadata if available
      setForm((prev) => ({
        ...prev,
        email: user.email || prev.email,
        first_name: user.user_metadata?.first_name || prev.first_name,
        last_name: user.user_metadata?.last_name || prev.last_name,
      }));
      setAuthChecking(false);
    });
  }, [router]);

  // 2. Indian Postal Pincode API Integration
  const handlePincodeChange = async (pin: string) => {
    const cleanPin = pin.replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({ ...prev, pincode: cleanPin }));

    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      setPincodeStatus("Looking up postal location...");
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

          setPincodeStatus(`✓ Delivery available to ${detectedCity}, ${detectedState}`);
          toast.success(`Location detected: ${detectedCity}, ${detectedState}`);
        } else {
          setPincodeStatus("⚠️ Invalid Indian PIN Code. Please check.");
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
      toast.success(`Coupon applied! You saved ${formatPrice(data.discount)}`);
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
    if (!form.pincode || form.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit Indian PIN code.");
      return false;
    }
    if (!form.address1.trim() || form.address1.trim().length < 5) {
      toast.error("Please enter your complete street address / flat no.");
      return false;
    }
    if (!form.city.trim() || !form.state.trim()) {
      toast.error("City and state are required.");
      return false;
    }
    return true;
  };

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
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
      paymentMethod === "cod" ? "Confirming your COD order..." : "Initiating secure payment gateway..."
    );

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
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
            name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            contact: data.phone,
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
                toast.success("Payment verified! Your order is placed.");
                router.push(`/order-confirmation/${data.order_id}`);
              } else {
                toast.error("Payment verification failed. Please contact support.");
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
        toast.error("Failed to load Razorpay. Falling back to COD order.");
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
            Verifying account access...
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
    <div className="container-site section-py" style={{ maxWidth: "1140px" }}>
      {/* ── Checkout Progress Header ── */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <ShieldCheck size={16} color="#27ae60" />
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#27ae60" }}>
            256-Bit Encrypted Secure Checkout
          </p>
        </div>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
          Checkout & Dispatch
        </h1>

        {/* Step Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginTop: "1.5rem" }}>
          {[
            { num: 1, label: "1. Delivery Address", icon: MapPin },
            { num: 2, label: "2. Payment Method", icon: CreditCard },
            { num: 3, label: "3. Review & Place", icon: CheckCircle2 },
          ].map((s) => {
            const isCurrent = step === s.num;
            const isDone = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => isDone && setStep(s.num as any)}
                style={{
                  padding: "0.75rem",
                  background: isCurrent ? "#111" : isDone ? "#f5f5f5" : "#fafafa",
                  color: isCurrent ? "#fff" : isDone ? "#111" : "#aaa",
                  border: isCurrent ? "1px solid #111" : "1px solid #eee",
                  borderRadius: "2px",
                  cursor: isDone ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s",
                }}
              >
                <s.icon size={15} color={isCurrent ? "#fff" : isDone ? "#27ae60" : "#aaa"} />
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: isCurrent ? 700 : 600 }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2.5rem", alignItems: "flex-start" }} className="checkout-two-col">
        {/* ── Left Column: Step-by-Step Flow ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* ════════════ STEP 1: Indian Address ════════════ */}
          <div style={{ background: "#fff", border: "1px solid #eee", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: step === 1 ? "#111" : "#27ae60", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                  {step > 1 ? "✓" : "1"}
                </span>
                <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Delivery Address & Contact
                </h2>
              </div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ background: "none", border: "none", color: "#111", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <Edit2 size={12} /> Edit
                </button>
              )}
            </div>

            {step === 1 ? (
              <form onSubmit={goToStep2} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Name */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Email Address (For Invoice & Tracking) *</label>
                    <input
                      type="email"
                      className="input-base"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number (10-digit Mobile) *</label>
                    <div style={{ display: "flex" }}>
                      <span style={{ padding: "0.65rem 0.75rem", background: "#f5f5f5", border: "1px solid #ccc", borderRight: "none", fontSize: "0.85rem", fontWeight: 600, color: "#666" }}>
                        +91
                      </span>
                      <input
                        type="tel"
                        className="input-base"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="9876543210"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* WhatsApp Checkbox */}
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", background: "#f9fbf9", padding: "0.6rem 0.75rem", border: "1px solid #e8f5e9" }}>
                  <input
                    type="checkbox"
                    checked={form.whatsapp_same}
                    onChange={(e) => setForm({ ...form, whatsapp_same: e.target.checked })}
                  />
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#2e7d32" }}>
                    Send shipping updates & courier tracking via WhatsApp to this number
                  </span>
                </label>

                {/* PIN Code Lookup with Indian Postal API */}
                <div style={{ background: "#fafafa", padding: "1.25rem", border: "1px solid #eee" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>6-Digit PIN Code *</label>
                      <input
                        type="text"
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
                        placeholder="Auto-detected"
                        required
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>State *</label>
                      <input
                        className="input-base"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        placeholder="Auto-detected"
                        required
                      />
                    </div>
                  </div>

                  {pincodeStatus && (
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        marginTop: "0.6rem",
                        color: pincodeStatus.startsWith("✓") ? "#27ae60" : pincodeStatus.startsWith("⚠️") ? "#c0392b" : "#666",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      {pincodeLoading && <Loader2 size={12} className="animate-spin" />}
                      {pincodeStatus}
                    </p>
                  )}
                </div>

                {/* Street Address */}
                <div>
                  <label style={labelStyle}>Flat, House No., Building, Apartment *</label>
                  <input
                    className="input-base"
                    value={form.address1}
                    onChange={(e) => setForm({ ...form, address1: e.target.value })}
                    placeholder="e.g. Flat 402, Royal Residency, 12th Main Road"
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Area, Sector, Colony</label>
                    <input
                      className="input-base"
                      value={form.address2}
                      onChange={(e) => setForm({ ...form, address2: e.target.value })}
                      placeholder="e.g. Indiranagar"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Landmark (Optional)</label>
                    <input
                      className="input-base"
                      value={form.landmark}
                      onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                      placeholder="e.g. Near Metro Station"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.9rem", marginTop: "0.5rem" }}
                >
                  <span>Continue to Payment Method</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <div style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.6 }}>
                <p style={{ fontWeight: 700, color: "#111" }}>{form.first_name} {form.last_name}</p>
                <p>{form.address1}{form.address2 ? `, ${form.address2}` : ""}{form.landmark ? ` (Landmark: ${form.landmark})` : ""}</p>
                <p>{form.city}, {form.state} — <strong>{form.pincode}</strong></p>
                <p style={{ color: "#888", fontSize: "0.78rem" }}>Phone: +91 {form.phone} · Email: {form.email}</p>
              </div>
            )}
          </div>

          {/* ════════════ STEP 2: Payment Method ════════════ */}
          <div style={{ background: "#fff", border: "1px solid #eee", padding: "2rem", opacity: step < 2 ? 0.6 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: step === 2 ? "#111" : step > 2 ? "#27ae60" : "#eee", color: step === 2 || step > 2 ? "#fff" : "#999", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                  {step > 2 ? "✓" : "2"}
                </span>
                <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Payment Method
                </h2>
              </div>
              {step > 2 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ background: "none", border: "none", color: "#111", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <Edit2 size={12} /> Change
                </button>
              )}
            </div>

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Razorpay Online */}
                <label
                  onClick={() => setPaymentMethod("razorpay")}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.25rem",
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
                    style={{ marginTop: "0.2rem" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.95rem" }}>
                        Online Payment (UPI, Google Pay, PhonePe, Cards, NetBanking)
                      </span>
                      <span style={{ padding: "0.15rem 0.4rem", background: "#e8f5e9", color: "#2e7d32", fontSize: "0.65rem", fontWeight: 700, borderRadius: "2px" }}>
                        Recommended · Fast Dispatch
                      </span>
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#666", marginTop: "0.35rem", lineHeight: 1.4 }}>
                      Pay securely via UPI (GPay, PhonePe, Paytm, CRED), Credit/Debit Cards, or NetBanking powered by Razorpay.
                    </p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.25rem",
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
                    style={{ marginTop: "0.2rem" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.95rem" }}>
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#666", marginTop: "0.35rem", lineHeight: 1.4 }}>
                      Pay cash or UPI directly to the courier agent upon receiving your fragrance package.
                    </p>
                  </div>
                </label>

                <button
                  type="button"
                  onClick={goToStep3}
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.9rem", marginTop: "0.75rem" }}
                >
                  <span>Proceed to Review & Confirm</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {step > 2 && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#333", fontWeight: 600 }}>
                {paymentMethod === "razorpay" ? "⚡ Online Payment (UPI, Cards, NetBanking)" : "💵 Cash on Delivery (COD)"}
              </p>
            )}
          </div>

          {/* ════════════ STEP 3: Final Review & Confirmation ════════════ */}
          <div style={{ background: "#fff", border: "1px solid #eee", padding: "2rem", opacity: step < 3 ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem", paddingBottom: "0.75rem", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: step === 3 ? "#111" : "#eee", color: step === 3 ? "#fff" : "#999", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700 }}>
                3
              </span>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Review Order & Dispatch Confirmation
              </h2>
            </div>

            {step === 3 && (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
                  {items.map((item) => (
                    <div key={item.product_id} style={{ display: "flex", alignItems: "center", gap: "1rem", paddingBottom: "1rem", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ width: "52px", height: "64px", background: "#f5f5f5", overflow: "hidden", border: "1px solid #eee", flexShrink: 0 }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: "0.65rem" }}>ANG</div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.88rem" }}>{item.name}</p>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#888" }}>
                          {item.volume_ml}ml · {item.concentration} · Qty: {item.quantity}
                        </p>
                      </div>
                      <p style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.9rem" }}>
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
                    fontSize: "0.95rem",
                    background: "#111",
                    color: "#fff",
                    letterSpacing: "0.08em",
                  }}
                >
                  {placing ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Loader2 size={18} className="animate-spin" /> Processing Order...
                    </span>
                  ) : paymentMethod === "cod" ? (
                    `Place Order (Pay ${formatPrice(total)} on Delivery)`
                  ) : (
                    `Pay ${formatPrice(total)} Securely via Razorpay`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Order Summary & Coupon ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "#fff", border: "1px solid #eee", padding: "1.75rem" }}>
            <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h3>

            {/* Coupon Box */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    padding: "0.6rem 0.75rem",
                    border: "1px solid #ddd",
                    fontFamily: "monospace",
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  style={{
                    padding: "0.6rem 1rem",
                    background: "#111",
                    color: "#fff",
                    border: "none",
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
                <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#27ae60", marginTop: "0.4rem", fontWeight: 600 }}>
                  ✓ Code {couponApplied} applied
                </p>
              )}
            </div>

            {/* Price lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid #f0f0f0", paddingTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666" }}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#27ae60", fontWeight: 600 }}>
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666" }}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <strong style={{ color: "#27ae60" }}>FREE</strong> : formatPrice(shipping)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700, color: "#111", borderTop: "1px solid #eee", paddingTop: "1rem", marginTop: "0.25rem" }}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div style={{ background: "#fafafa", border: "1px solid #eee", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Truck size={16} color="#555" />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#555" }}>
                Dispatched via Bluedart / Delhivery in 24–48 hrs
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <ShieldCheck size={16} color="#555" />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#555" }}>
                100% Authentic Handcrafted Luxury Fragrances
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <RotateCcw size={16} color="#555" />
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "#555" }}>
                7-Day Hassle-Free Returns on sealed items
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-sans)",
  fontSize: "0.72rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "#888",
  marginBottom: "0.35rem",
};
