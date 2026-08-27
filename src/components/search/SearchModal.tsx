"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("products")
          .select("id, name, slug, main_image_url, original_price, sale_price, volume_ml, concentration, gender")
          .eq("is_published", true)
          .or(`name.ilike.%${query}%,short_description.ilike.%${query}%`)
          .limit(6);
        setResults((data as Product[]) ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="search-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(255,255,255,0.97)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "8rem",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close search"
            style={{ position: "absolute", top: "1.5rem", right: "1.5rem" }}
            className="hover:opacity-50 transition-opacity"
          >
            <X size={22} strokeWidth={1.5} />
          </button>

          {/* Search Input */}
          <div style={{ width: "100%", maxWidth: "600px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "2px solid var(--color-text)", paddingBottom: "0.75rem" }}>
              <SearchIcon size={20} strokeWidth={1.5} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fragrances…"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  fontWeight: 300,
                  color: "var(--color-text)",
                }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="hover:opacity-50 transition-opacity">
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Results */}
            {loading && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "2rem", textAlign: "center" }}>
                Searching…
              </p>
            )}

            {!loading && results.length > 0 && (
              <ul style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0", listStyle: "none" }}>
                {results.map((product) => (
                  <li key={product.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 1fr auto",
                        gap: "1rem",
                        alignItems: "center",
                        padding: "1rem 0",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                      className="hover:opacity-70 transition-opacity"
                    >
                      <div style={{ width: "60px", height: "75px", background: "var(--color-bg-soft)", position: "relative", overflow: "hidden" }}>
                        {product.main_image_url ? (
                          <Image src={product.main_image_url} alt={product.name} fill unoptimized sizes="60px" style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#bbb", fontSize: "0.65rem" }}>ANG</div>
                        )}
                      </div>
                      <div>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 500 }}>{product.name}</p>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          {product.volume_ml}ml · {product.concentration}
                        </p>
                      </div>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", fontWeight: 600 }}>
                        {formatPrice(product.sale_price ?? product.original_price)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {!loading && query.trim() && results.length === 0 && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.9rem", color: "var(--color-text-muted)", marginTop: "2rem", textAlign: "center" }}>
                No fragrances found for &ldquo;{query}&rdquo;
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
