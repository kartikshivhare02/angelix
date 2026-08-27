"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { User, ShoppingBag, LogOut, ShieldCheck } from "lucide-react";

const NAV = [
  { href: "/account", label: "Profile", icon: User },
  { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.isAdmin) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="container-site section-py">
      <div style={{ marginBottom: "2.5rem" }}>
        <p className="label-caps" style={{ color: "var(--color-text-muted)", marginBottom: "0.4rem" }}>
          My Account
        </p>
        <h1 className="heading-editorial" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
          Account
        </h1>
      </div>

      <div className="account-layout">
        {/* Sidebar */}
        <aside>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.85rem 1rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#fff",
                  background: "#111",
                  border: "1px solid #111",
                  textDecoration: "none",
                  marginBottom: "0.75rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  transition: "all 0.2s",
                }}
              >
                <span>⚡ Admin Dashboard</span>
              </Link>
            )}

            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.82rem",
                    fontWeight: active ? 600 : 400,
                    letterSpacing: "0.04em",
                    color: active ? "var(--color-text)" : "var(--color-text-muted)",
                    background: active ? "var(--color-bg-soft)" : "transparent",
                    border: active ? "1px solid var(--color-border)" : "1px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={15} strokeWidth={1.5} />
                  {label}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                fontFamily: "var(--font-sans)",
                fontSize: "0.82rem",
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: "var(--color-text-muted)",
                background: "transparent",
                border: "1px solid transparent",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                marginTop: "1rem",
                borderTop: "1px solid var(--color-border)",
                paddingTop: "1rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <LogOut size={15} strokeWidth={1.5} />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main>{children}</main>
      </div>

      <style>{`
        .account-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 3rem;
          align-items: start;
        }
        @media (max-width: 768px) {
          .account-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .account-layout aside nav {
            flex-direction: row !important;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
