"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/Icons";

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active?: boolean;
}

const DEFAULT_SHOP_LINKS = [
  { label: "All Perfumes", href: "/shop" },
  { label: "Men", href: "/category/men" },
  { label: "Women", href: "/category/women" },
  { label: "Unisex", href: "/category/unisex" },
  { label: "Testers", href: "/testers" },
  { label: "Best Sellers", href: "/category/best-sellers" },
];

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
        setLoaded(true);
      })
      .catch(() => {
        setLoaded(true);
      });
  }, []);

  const shopLinks = loaded && categories.length > 0
    ? [
        { label: "All Fragrances", href: "/shop" },
        ...categories.map((c) => ({
          label: c.name,
          href: c.slug === "testers" ? "/testers" : `/category/${c.slug}`,
        })),
      ]
    : DEFAULT_SHOP_LINKS;

  return (
    <footer
      style={{
        background: "var(--color-bg-soft)",
        borderTop: "1px solid var(--color-border)",
        paddingTop: "4rem",
        paddingBottom: "2rem",
      }}
    >
      <div className="container-site">
        {/* Top Row */}
        <div
          className="footer-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "3rem",
            paddingBottom: "3rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="ANGELIX - BY SURAJ"
                style={{
                  height: "48px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              />
            </div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
                maxWidth: "220px",
              }}
            >
              A sophisticated fragrance house crafting premium, long-lasting luxury scents for the discerning.
            </p>
          </div>

          {/* Dynamic Shop Categories */}
          <FooterLinkGroup
            title="Shop & Collections"
            links={shopLinks}
          />

          {/* Company */}
          <FooterLinkGroup
            title="Company"
            links={[
              { label: "About Angelix", href: "/about" },
              { label: "Contact Us", href: "/contact" },
              { label: "My Account", href: "/account" },
            ]}
          />

          {/* Legal */}
          <FooterLinkGroup
            title="Legal"
            links={[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms & Conditions", href: "/terms" },
              { label: "Shipping Policy", href: "/shipping-policy" },
              { label: "Return Policy", href: "/return-policy" },
            ]}
          />

          {/* Contact */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p className="label-caps" style={{ color: "var(--color-text-muted)" }}>Contact Us</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <a
                href="mailto:Surajxsingh412@gmail.com"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                }}
                className="hover:text-black transition-colors"
              >
                <Mail size={15} strokeWidth={1.5} />
                <span>Surajxsingh412@gmail.com</span>
              </a>
              <a
                href="https://wa.me/917067697646"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                }}
                className="hover:text-black transition-colors"
              >
                <MessageCircle size={15} strokeWidth={1.5} />
                <span>+91 70676 97646</span>
              </a>
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
              <a
                href="https://wa.me/917067697646"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="hover:opacity-50 transition-opacity"
              >
                <MessageCircle size={18} strokeWidth={1.5} />
              </a>
              <a
                href="mailto:Surajxsingh412@gmail.com"
                aria-label="Email us"
                className="hover:opacity-50 transition-opacity"
              >
                <Mail size={18} strokeWidth={1.5} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:opacity-50 transition-opacity"
              >
                <InstagramIcon size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "1.5rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-text-light)",
            }}
          >
            © {new Date().getFullYear()} ANGELIX by Suraj. All rights reserved.
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.75rem",
              color: "var(--color-text-light)",
            }}
          >
            India
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p className="label-caps" style={{ color: "var(--color-text-muted)" }}>{title}</p>
      <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", listStyle: "none" }}>
        {links.map((link, idx) => (
          <li key={`${link.href}-${idx}`}>
            <Link
              href={link.href}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                textDecoration: "none",
              }}
              className="hover:text-black transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
