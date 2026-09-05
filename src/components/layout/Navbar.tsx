"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { FullscreenMenu } from "./FullscreenMenu";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchModal } from "@/components/search/SearchModal";
import { motion } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { toggleCart, totalItems } = useCart();
  const count = totalItems();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        id="main-nav"
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "var(--nav-height)",
          background: scrolled ? "rgba(255,255,255,0.97)" : "var(--color-bg)",
          borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
          transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
          boxShadow: scrolled ? "0 1px 16px rgba(0,0,0,0.06)" : "none",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div
          className="container-site h-full"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            height: "100%",
          }}
        >
          {/* LEFT — Menu */}
          <div className="flex items-center">
            <button
              id="nav-menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 0",
                minHeight: "44px",
              }}
            >
              <Menu size={20} strokeWidth={1.5} />
              <span
                className="hidden sm:inline"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Menu
              </span>
            </button>
          </div>

          {/* CENTER — Logo */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
              userSelect: "none",
              padding: "4px 0",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="ANGELIX - BY SURAJ"
              style={{
                height: "clamp(34px, 4.5vw, 44px)",
                width: "auto",
                objectFit: "contain",
                display: "block",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.08))",
              }}
            />
          </Link>

          {/* RIGHT — Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "clamp(0.75rem, 2vw, 1.25rem)",
            }}
          >
            <button
              id="nav-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", minHeight: "44px", display: "none" }}
              className="sm:flex items-center"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            <Link
              href="/account"
              aria-label="My account"
              style={{ display: "none", alignItems: "center", padding: "8px", minHeight: "44px" }}
              className="sm:flex"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            <button
              id="nav-cart-btn"
              onClick={toggleCart}
              aria-label={mounted && count > 0 ? `Cart (${count})` : "Cart"}
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {mounted && count > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    background: "var(--color-text)",
                    color: "var(--color-white)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1,
                  }}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <FullscreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
