"use client";

import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, ChevronDown, X, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const GENDERS = ["Men", "Women", "Unisex"];
const CONCENTRATIONS = ["Parfum", "EDP", "EDT", "EDC"];
const FAMILIES = ["Woody", "Fresh", "Aquatic", "Citrus", "Floral", "Fruity", "Oud", "Amber", "Musk", "Spicy", "Gourmand"];
const SORTS = [
  { value: "", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

interface Props {
  active: {
    gender?: string;
    category?: string;
    family?: string;
    sort?: string;
  };
  totalCount?: number;
}

export function ShopFilters({ active, totalCount }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) {
          const filtered = d.categories.filter((c: { slug: string }) => c.slug !== "men" && c.slug !== "women");
          setCategories(filtered);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const clearAll = () => {
    router.push("/shop");
    setDropdownOpen(false);
  };

  const activeCount = [active.gender, active.category, active.family, active.sort].filter(Boolean).length;

  return (
    <div ref={containerRef} style={{ position: "relative", marginBottom: "2rem" }}>
      {/* ── Toolbar Row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {/* Single Filter & Sort Dropdown Button */}
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            background: dropdownOpen ? "#111111" : "var(--color-bg)",
            color: dropdownOpen ? "#ffffff" : "var(--color-text)",
            border: "1px solid var(--color-border)",
            padding: "0.6rem 1.15rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
            cursor: "pointer",
            transition: "all 0.2s ease",
            borderRadius: "4px",
            boxShadow: dropdownOpen ? "0 4px 12px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.03)",
          }}
        >
          <SlidersHorizontal size={15} strokeWidth={1.5} />
          <span>Filter & Sort</span>
          {activeCount > 0 && (
            <span
              style={{
                background: dropdownOpen ? "#ffffff" : "var(--color-text)",
                color: dropdownOpen ? "#111111" : "var(--color-white)",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.68rem",
                fontWeight: 700,
              }}
            >
              {activeCount}
            </span>
          )}
          <ChevronDown
            size={15}
            style={{
              transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {/* Active Filter Badges */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", flex: 1 }}>
          {active.category && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.7rem",
                background: "var(--color-bg-soft)",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-sans)",
                borderRadius: "30px",
                fontWeight: 500,
              }}
            >
              Category: {active.category}
              <button
                type="button"
                onClick={() => setFilter("category", active.category!)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {active.gender && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.7rem",
                background: "var(--color-bg-soft)",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-sans)",
                borderRadius: "30px",
                fontWeight: 500,
              }}
            >
              Gender: {active.gender}
              <button
                type="button"
                onClick={() => setFilter("gender", active.gender!)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {active.family && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.7rem",
                background: "var(--color-bg-soft)",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-sans)",
                borderRadius: "30px",
                fontWeight: 500,
              }}
            >
              Family: {active.family}
              <button
                type="button"
                onClick={() => setFilter("family", active.family!)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {active.sort && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.3rem 0.7rem",
                background: "var(--color-bg-soft)",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-sans)",
                borderRadius: "30px",
                fontWeight: 500,
              }}
            >
              Sort: {SORTS.find((s) => s.value === active.sort)?.label || active.sort}
              <button
                type="button"
                onClick={() => setFilter("sort", active.sort!)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <X size={12} />
              </button>
            </span>
          )}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                textDecoration: "underline",
                padding: "0.2rem 0.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <RotateCcw size={12} />
              Reset All
            </button>
          )}
        </div>

        {/* Total Item Count */}
        {typeof totalCount === "number" && (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)", letterSpacing: "0.04em" }}>
            {totalCount} {totalCount === 1 ? "Product" : "Products"}
          </span>
        )}
      </div>

      {/* ── Single Unified Dropdown Menu Panel ── */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              zIndex: 40,
              width: "100%",
              maxWidth: "680px",
              background: "#ffffff",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.5rem" }}>
              {/* Category Filter */}
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Category
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {categories.map((c) => {
                    const isSelected = active.category === c.slug || active.category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFilter("category", c.slug)}
                        style={{
                          textAlign: "left",
                          background: isSelected ? "var(--color-bg-soft)" : "transparent",
                          color: isSelected ? "#111" : "var(--color-text-muted)",
                          border: isSelected ? "1px solid #111" : "1px solid transparent",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "4px",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.8rem",
                          fontWeight: isSelected ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>



              {/* Fragrance Family */}
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Fragrance Notes
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", maxHeight: "160px", overflowY: "auto" }}>
                  {FAMILIES.map((f) => {
                    const isSelected = active.family === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFilter("family", f)}
                        style={{
                          textAlign: "left",
                          background: isSelected ? "var(--color-bg-soft)" : "transparent",
                          color: isSelected ? "#111" : "var(--color-text-muted)",
                          border: isSelected ? "1px solid #111" : "1px solid transparent",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "4px",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.8rem",
                          fontWeight: isSelected ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                    marginBottom: "0.75rem",
                  }}
                >
                  Sort By
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {SORTS.map((s) => {
                    const isSelected = (active.sort ?? "") === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setFilter("sort", s.value)}
                        style={{
                          textAlign: "left",
                          background: isSelected ? "var(--color-bg-soft)" : "transparent",
                          color: isSelected ? "#111" : "var(--color-text-muted)",
                          border: isSelected ? "1px solid #111" : "1px solid transparent",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "4px",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.8rem",
                          fontWeight: isSelected ? 600 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dropdown Footer Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "1.25rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.78rem",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Reset All Filters
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                style={{
                  background: "#111111",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.55rem 1.25rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
