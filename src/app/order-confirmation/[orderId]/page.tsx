"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Truck, Package, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div
      className="container-site section-py"
      style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", maxWidth: "560px", background: "#fff", border: "1px solid #eee", padding: "3rem 2rem" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
        >
          <CheckCircle
            size={68}
            strokeWidth={1.2}
            style={{ color: "#27ae60" }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <p className="label-caps" style={{ color: "#27ae60", fontWeight: 700 }}>✓ Order Confirmed</p>
          <h1 className="heading-editorial" style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)" }}>
            Thank You for Your Order
          </h1>
          <p style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#555", background: "#f8f9fa", padding: "0.5rem 1rem", border: "1px solid #eee", display: "inline-block" }}>
            Order ID: <strong>{orderId}</strong>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            background: "#f9fbf9",
            border: "1px solid #e8f5e9",
            padding: "1.25rem",
            width: "100%",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Truck size={18} color="#2e7d32" />
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "#2e7d32", fontWeight: 600 }}>
              Dispatch in 24–48 Hours
            </p>
          </div>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#555", lineHeight: 1.5 }}>
            Your order has been registered and is being prepared for handcrafting & packaging. You will receive real-time courier tracking updates via Email & WhatsApp.
          </p>
        </motion.div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", width: "100%", marginTop: "0.5rem" }}>
          <Link href="/account/orders" className="btn-primary" style={{ flex: 1, minWidth: "180px", justifyContent: "center", textDecoration: "none" }}>
            View My Orders
          </Link>
          <Link href="/shop" style={{ flex: 1, minWidth: "180px", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.8rem 1.5rem", border: "1px solid #ddd", color: "#111", textDecoration: "none", fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
