"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order?: number;
}

export function CategoryNav({ initialCategories }: { initialCategories?: CategoryItem[] }) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories ?? []);
  const [loaded, setLoaded] = useState(initialCategories !== undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories ?? []);
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 280);
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  // Only show when categories exist in database
  if (!loaded || categories.length === 0) return null;

  return (
    <section
      style={{
        padding: "3.5rem 0 3rem",
        background: "var(--color-bg-soft)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        position: "relative",
      }}
    >
      <div className="container-site">
        {/* Header with Title & Left/Right controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "1.75rem",
          }}
        >
          <div>
            <p
              className="label-caps"
              style={{
                color: "var(--color-text-muted)",
                marginBottom: "0.4rem",
                letterSpacing: "0.15em",
              }}
            >
              Curated Olfactory Worlds
            </p>
            <h2
              className="heading-editorial"
              style={{
                fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                lineHeight: 1.15,
              }}
            >
              Explore Collections
            </h2>
          </div>

          {/* Navigation arrow buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollLeft ? "pointer" : "default",
                opacity: canScrollLeft ? 1 : 0.35,
                color: "var(--color-text)",
                transition: "all 0.2s var(--ease-luxury)",
                boxShadow: canScrollLeft ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
              }}
              className={canScrollLeft ? "hover:border-black" : ""}
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canScrollRight ? "pointer" : "default",
                opacity: canScrollRight ? 1 : 0.35,
                color: "var(--color-text)",
                transition: "all 0.2s var(--ease-luxury)",
                boxShadow: canScrollRight ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
              }}
              className={canScrollRight ? "hover:border-black" : ""}
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Horizontally scrolling row */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="hide-scrollbar"
          style={{
            display: "flex",
            gap: "1.25rem",
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "0.5rem",
            paddingTop: "0.25rem",
          }}
        >
          {categories.map((cat) => {
            const href = cat.slug === "testers" ? "/testers" : `/category/${cat.slug}`;

            return (
              <Link
                key={cat.id || cat.slug}
                href={href}
                className="group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  width: "clamp(160px, 20vw, 210px)",
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                }}
              >
                {/* Image card with luxury zoom and gradient */}
                <div
                  style={{
                    width: "100%",
                    height: "clamp(210px, 26vw, 270px)",
                    position: "relative",
                    background: "var(--color-cream)",
                    borderRadius: "3px",
                    overflow: "hidden",
                    border: "1px solid var(--color-border)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                  }}
                  className="group-hover:border-black/40 group-hover:shadow-md"
                >
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 170px, 220px"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                        transition: "transform 0.7s var(--ease-luxury)",
                      }}
                      className="group-hover:scale-105"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(145deg, #f7f3ed 0%, #ebe2d3 100%)",
                        color: "var(--color-text)",
                        padding: "1rem",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "2.5rem",
                          fontWeight: 300,
                          opacity: 0.45,
                          fontStyle: "italic",
                        }}
                      >
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Subtle luxury dark gradient overlay at bottom */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Corner icon on hover */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(4px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text)",
                      opacity: 0,
                      transform: "translateY(-4px)",
                      transition: "all 0.3s ease",
                    }}
                    className="group-hover:opacity-100 group-hover:translate-y-0"
                  >
                    <ArrowUpRight size={14} strokeWidth={2} />
                  </div>

                  {/* Text inside the bottom of card */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "1rem 0.85rem",
                      zIndex: 2,
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "clamp(1rem, 1.3vw, 1.25rem)",
                        fontWeight: 600,
                        color: "#ffffff",
                        letterSpacing: "0.02em",
                        lineHeight: 1.2,
                        textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    >
                      {cat.name}
                    </p>
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.68rem",
                        color: "rgba(255, 255, 255, 0.85)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.2rem",
                        marginTop: "0.2rem",
                        fontWeight: 500,
                      }}
                    >
                      Explore Collection
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
