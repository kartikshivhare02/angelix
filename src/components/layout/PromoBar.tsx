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

  // Auto-rotation every 3.2 seconds
  useEffect(() => {
    if (promos.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [promos.length, isPaused]);

  if (dismissed || !loaded || promos.length === 0) return null;

  const current = promos[currentIndex] || promos[0];
  if (!current) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + promos.length) % promos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % promos.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        background: "var(--color-text)",
        color: "var(--color-white)",
        height: "var(--promobar-height)",
        position: "sticky",
        top: 0,
        zIndex: 51,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "0 2.5rem",
        userSelect: "none",
      }}
    >
      {/* Previous button */}
      {promos.length > 1 && (
        <button
          onClick={handlePrev}
          aria-label="Previous announcement"
          style={{
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            padding: "4px",
          }}
          className="hover:text-white transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
      )}

      {/* Message content with animated transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id || currentIndex}
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -7 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(0.65rem, 2.2vw, 0.73rem)",
              fontWeight: 500,
              letterSpacing: "0.07em",
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
                fontSize: "clamp(0.62rem, 2vw, 0.7rem)",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#fff",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                flexShrink: 0,
              }}
            >
              {current.link_label}
            </Link>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      {promos.length > 1 && (
        <button
          onClick={handleNext}
          aria-label="Next announcement"
          style={{
            position: "absolute",
            right: "2.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            padding: "4px",
          }}
          className="hover:text-white transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
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
        }}
        className="hover:text-white transition-colors"
      >
        <X size={13} strokeWidth={2} />
      </button>
    </div>
  );
}
