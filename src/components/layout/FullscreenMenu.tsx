"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function FullscreenMenu({ isOpen, onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fragranceFamilies, setFragranceFamilies] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // Fetch dynamic categories from API
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories ?? []);
      })
      .catch(() => {});

    // Fetch fragrance families if available
    const fetchFamilies = async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("fragrance_families")
          .select("name, slug")
          .order("name");
        if (data && data.length > 0) setFragranceFamilies(data);
      } catch { /* silently fail */ }
    };
    fetchFamilies();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 98,
              background: "rgba(0,0,0,0.45)",
            }}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "min(480px, 100vw)",
              background: "var(--color-bg)",
              zIndex: 99,
              overflowY: "auto",
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
                padding: "1.5rem 2rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <Link
                href="/"
                onClick={onClose}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                }}
              >
                ANGLELIX
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="hover:opacity-60 transition-opacity"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "2rem", flex: 1, display: "flex", flexDirection: "column", gap: "2.5rem" }}>

              {/* SHOP */}
              <section>
                <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                  Collection
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.6rem", listStyle: "none", padding: 0, margin: 0 }}>
                  <li>
                    <Link
                      href="/shop"
                      onClick={onClose}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: "var(--color-text)",
                        textDecoration: "none",
                        display: "block",
                        padding: "0.2rem 0",
                        transition: "opacity 0.2s",
                      }}
                      className="hover:opacity-50"
                    >
                      All Fragrances
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/testers"
                      onClick={onClose}
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "1rem",
                        fontWeight: 500,
                        color: "var(--color-text)",
                        textDecoration: "none",
                        display: "block",
                        padding: "0.2rem 0",
                        transition: "opacity 0.2s",
                      }}
                      className="hover:opacity-50"
                    >
                      Discovery Testers
                    </Link>
                  </li>

                  {/* Dynamic Categories from Database */}
                  {categories.map((cat) => (
                    <li key={cat.id || cat.slug}>
                      <Link
                        href={`/category/${cat.slug}`}
                        onClick={onClose}
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "1rem",
                          fontWeight: 400,
                          color: "var(--color-text)",
                          textDecoration: "none",
                          display: "block",
                          padding: "0.2rem 0",
                          transition: "opacity 0.2s",
                        }}
                        className="hover:opacity-50"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              {/* FRAGRANCE FAMILIES (If any) */}
              {fragranceFamilies.length > 0 && (
                <section>
                  <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                    Fragrance Family
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {fragranceFamilies.map((f) => (
                      <Link
                        key={f.slug}
                        href={`/fragrance/${f.slug}`}
                        onClick={onClose}
                        className="tag-pill hover:border-gray-400 transition-colors"
                        style={{ cursor: "pointer", textDecoration: "none" }}
                      >
                        {f.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* LINKS */}
              <section style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { label: "Try Our Tester", href: "/testers" },
                  { label: "About Anglelix", href: "/about" },
                  { label: "Login / My Account", href: "/account" },
                  { label: "Contact Us", href: "/contact" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.9rem",
                      color: "var(--color-text-muted)",
                      textDecoration: "none",
                      padding: "0.2rem 0",
                    }}
                    className="hover:text-black transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </section>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "1.5rem 2rem",
                borderTop: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <p className="label-caps" style={{ color: "var(--color-text-muted)" }}>Follow Us</p>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:opacity-60 transition-opacity"
              >
                <InstagramIcon size={16} />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
