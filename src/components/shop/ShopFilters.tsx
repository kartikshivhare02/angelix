"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.categories) setCategories(d.categories);
      })
      .catch(() => {});
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
    setIsOpen(false);
  };

  const activeCount = [active.gender, active.category, active.family].filter(Boolean).length;

  return (
    <>
      {/* Trigger bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "transparent",
            border: "1px solid var(--color-border)",
            padding: "0.5rem 1rem",
            fontFamily: "var(--font-sans)",
            fontSize: "0.8rem",
            letterSpacing: "0.06em",
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          className="hover:border-black"
        >
          <SlidersHorizontal size={14} strokeWidth={1.5} />
          <span>Filters</span>
          {activeCount > 0 && (
            <span
              style={{
                background: "var(--color-text)",
                color: "var(--color-white)",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.65rem",
                fontWeight: 700,
              }}
            >
              {activeCount}
            </span>
          )}
        </button>

        {/* Active filter chips inline */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", flex: 1, margin: "0 1rem" }}>
          {active.gender && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.25rem 0.6rem",
                background: "var(--color-bg-soft)",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              {active.gender}
              <button onClick={() => setFilter("gender", active.gender!)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <X size={12} />
              </button>
            </span>
          )}
          {active.category && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.25rem 0.6rem",
                background: "var(--color-bg-soft)",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              {active.category}
              <button onClick={() => setFilter("category", active.category!)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <X size={12} />
              </button>
            </span>
          )}
          {active.family && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.25rem 0.6rem",
                background: "var(--color-bg-soft)",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-sans)",
              }}
            >
              {active.family}
              <button onClick={() => setFilter("family", active.family!)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <X size={12} />
              </button>
            </span>
          )}
          {activeCount > 0 && (
            <button
              onClick={clearAll}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                textDecoration: "underline",
                padding: "0.25rem 0.4rem",
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
            Sort:
          </span>
          <select
            value={active.sort ?? ""}
            onChange={(e) => setFilter("sort", e.target.value)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.78rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              padding: "0.45rem 0.75rem",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 90,
                background: "rgba(0,0,0,0.35)",
              }}
            />

            {/* Drawer */}
            <motion.div
              key="filter-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "min(340px, 90vw)",
                background: "var(--color-bg)",
                zIndex: 91,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
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
                  position: "sticky",
                  top: 0,
                  background: "var(--color-bg)",
                  zIndex: 1,
                }}
              >
                <span className="label-caps">Filters</span>
                <button onClick={() => setIsOpen(false)} className="hover:opacity-50 transition-opacity">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Filter Groups */}
              <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Dynamic Categories from DB */}
                {categories.length > 0 && (
                  <FilterGroup title="Categories">
                    {categories.map((c) => (
                      <FilterChip key={c.id} label={c.name} active={active.category === c.slug || active.category === c.id} onClick={() => setFilter("category", c.slug)} />
                    ))}
                  </FilterGroup>
                )}

                <FilterGroup title="Gender">
                  {GENDERS.map((g) => (
                    <FilterChip key={g} label={g} active={active.gender === g} onClick={() => setFilter("gender", g)} />
                  ))}
                </FilterGroup>

                <FilterGroup title="Fragrance Family">
                  {FAMILIES.map((f) => (
                    <FilterChip key={f} label={f} active={active.family === f} onClick={() => setFilter("family", f)} />
                  ))}
                </FilterGroup>

                <FilterGroup title="Concentration">
                  {CONCENTRATIONS.map((c) => (
                    <FilterChip key={c} label={c} active={active.category === c} onClick={() => setFilter("category", c)} />
                  ))}
                </FilterGroup>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: "1.5rem",
                  borderTop: "1px solid var(--color-border)",
                  display: "flex",
                  gap: "0.75rem",
                  position: "sticky",
                  bottom: 0,
                  background: "var(--color-bg)",
                }}
              >
                <button
                  onClick={clearAll}
                  className="btn-outline"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-primary"
                  style={{ flex: 1, textAlign: "center" }}
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>{title}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>{children}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "0.35rem 0.85rem",
        border: "1px solid",
        borderColor: active ? "var(--color-text)" : "var(--color-border)",
        background: active ? "var(--color-text)" : "transparent",
        color: active ? "var(--color-white)" : "var(--color-text-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "0.75rem",
        letterSpacing: "0.04em",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}
