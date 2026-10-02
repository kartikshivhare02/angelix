"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PromoItem {
  id: string;
  text: string;
  link_url?: string | null;
  link_label?: string | null;
}

export function PromoBar() {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = forward (right-to-left), -1 = backward
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/promobar")
      .then((r) => r.json())
      .then((d) => {
        if (isMounted) {
          setPromos(d.promos ?? []);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setPromos([]);
          setLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Continuous auto-sliding flow every 3.2s
  useEffect(() => {
    if (promos.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [promos.length, isPaused]);

  if (dismissed || !loaded || promos.length === 0) return null;

  const current = promos[currentIndex] || promos[0];
  if (!current) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % promos.length);
  };

  // Horizontal flow motion variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "80%" : "-80%",
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-80%" : "80%",
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        background: "var(--color-text, #111111)",
        color: "var(--color-white, #ffffff)",
        height: "var(--promobar-height, 40px)",
        position: "sticky",
        top: 0,
        zIndex: 51,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "0 3rem",
        userSelect: "none",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Previous button */}
      {promos.length > 1 && (
        <button
          onClick={handlePrev}
          aria-label="Previous promo"
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.75)",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            zIndex: 2,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Flowing animated promo container */}
      <div style={{ position: "relative", width: "100%", maxWidth: "700px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current.id || currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 350, damping: 30 },
              opacity: { duration: 0.25 },
            }}
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
              textAlign: "center",
              width: "100%",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(0.68rem, 2.2vw, 0.78rem)",
                fontWeight: 500,
                letterSpacing: "0.06em",
                color: "rgba(255,255,255,0.95)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "min(600px, 75vw)",
              }}
            >
              {current.text}
            </span>
            {current.link_url && current.link_label && (
              <Link
                href={current.link_url}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(0.65rem, 2vw, 0.75rem)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#ffffff",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  flexShrink: 0,
                  transition: "opacity 0.2s ease",
                }}
              >
                {current.link_label}
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next button */}
      {promos.length > 1 && (
        <button
          onClick={handleNext}
          aria-label="Next promo"
          style={{
            position: "absolute",
            right: "2.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.75)",
            display: "flex",
            alignItems: "center",
            padding: "4px",
            zIndex: 2,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss promo bar"
        style={{
          position: "absolute",
          right: "0.75rem",
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          padding: "4px",
          zIndex: 2,
          transition: "color 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
