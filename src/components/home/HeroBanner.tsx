"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BannerItem {
  id: string;
  title: string | null;
  subtitle: string | null;
  desktop_image_url: string;
  mobile_image_url?: string | null;
  cta_label: string | null;
  cta_url: string | null;
  text_alignment?: "left" | "center" | "right";
}

interface HeroBannerProps {
  initialBanners?: BannerItem[];
}

export function HeroBanner({ initialBanners = [] }: HeroBannerProps) {
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.banners && Array.isArray(data.banners)) {
          setBanners(data.banners);
          if (data.banners.length > 0) setCurrent(0);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [autoPlay, banners.length]);

  const go = (dir: number) => {
    setAutoPlay(false);
    setCurrent((c) => (c + dir + banners.length) % banners.length);
  };

  const banner = banners[current] || banners[0];
  if (!banner) return null;

  const alignment = banner.text_alignment || "center";

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "min(90vh, 700px)",
        minHeight: "420px",
        overflow: "hidden",
        background: "#111",
      }}
    >
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* Desktop Banner Image */}
          <div className="banner-desktop-media" style={{ position: "absolute", inset: 0 }}>
            <Image
              src={banner.desktop_image_url}
              alt={banner.title ?? "ANGLELIX"}
              fill
              priority
              unoptimized
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center center" }}
            />
          </div>

          {/* Mobile Banner Image */}
          <div className="banner-mobile-media" style={{ position: "absolute", inset: 0 }}>
            <Image
              src={banner.mobile_image_url || banner.desktop_image_url}
              alt={banner.title ?? "ANGLELIX"}
              fill
              priority
              unoptimized
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "center center" }}
            />
          </div>

          {/* Subtle luxury gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Text Content */}
      <div
        className="container-site"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          paddingBottom: "clamp(2rem, 6vw, 4rem)",
          textAlign: alignment,
          alignItems:
            alignment === "center" ? "center" :
            alignment === "right" ? "flex-end" : "flex-start",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id + "-text"}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "inherit", gap: "1rem" }}
          >
            {banner.title && (
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 600,
                  fontSize: "clamp(2rem, 7vw, 4.5rem)",
                  color: "#fff",
                  lineHeight: 1.05,
                  letterSpacing: "-0.01em",
                  whiteSpace: "pre-line",
                  maxWidth: "560px",
                  textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                }}
              >
                {banner.title}
              </h1>
            )}
            {banner.subtitle && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(0.85rem, 2vw, 1rem)",
                  color: "rgba(255,255,255,0.85)",
                  maxWidth: "400px",
                  lineHeight: 1.6,
                }}
              >
                {banner.subtitle}
              </p>
            )}
            {banner.cta_label && banner.cta_url && (
              <Link
                href={banner.cta_url}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.8rem 2rem",
                  background: "var(--color-white)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  marginTop: "0.25rem",
                  transition: "opacity 0.2s",
                }}
                className="hover:opacity-85"
              >
                {banner.cta_label}
              </Link>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => go(-1)}
            aria-label="Previous"
            style={{
              position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", width: "40px", height: "40px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            className="hover:bg-white/25 hidden-xs"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => go(1)}
            aria-label="Next"
            style={{
              position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff", width: "40px", height: "40px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
            className="hover:bg-white/25 hidden-xs"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>

          {/* Dots */}
          <div
            style={{
              position: "absolute", bottom: "1.25rem", right: "1.5rem",
              display: "flex", gap: "0.4rem", alignItems: "center",
            }}
          >
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => { setAutoPlay(false); setCurrent(i); }}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === current ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: i === current ? "#fff" : "rgba(255,255,255,0.45)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .banner-desktop-media {
          display: block;
        }
        .banner-mobile-media {
          display: none;
        }
        @media (max-width: 768px) {
          .banner-desktop-media {
            display: none !important;
          }
          .banner-mobile-media {
            display: block !important;
          }
        }
        @media (max-width: 480px) {
          .hidden-xs {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}

