"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  Image, Megaphone, Settings, LogOut, TestTube2, FolderOpen
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/testers", label: "Testers", icon: TestTube2 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/promobar", label: "Promo Bar", icon: Megaphone },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="ANGELIX"
          style={{
            height: "38px",
            width: "auto",
            objectFit: "contain",
            display: "block",
            marginBottom: "0.4rem",
          }}
        />
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>Admin Dashboard</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "1rem 0" }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.7rem 1.5rem",
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
                borderLeft: active ? "2px solid #fff" : "2px solid transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                fontWeight: active ? 500 : 400,
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "1rem 0", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.7rem 1.5rem",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            cursor: "pointer",
            width: "100%",
            transition: "color 0.15s",
          }}
          className="hover:text-white"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
