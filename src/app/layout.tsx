import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { CartProvider } from "@/components/providers/CartProvider";

export const metadata: Metadata = {
  title: {
    default: "ANGLELIX by Suraj — Luxury Fragrances",
    template: "%s | ANGLELIX by Suraj",
  },
  description:
    "Discover ANGLELIX by Suraj — a sophisticated fragrance house offering premium, handcrafted perfumes. Explore our signature collection.",
  keywords: ["luxury perfume", "fragrance", "ANGLELIX", "Suraj", "premium scent", "oud", "leather", "floral"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "ANGLELIX by Suraj",
    title: "ANGLELIX by Suraj — Luxury Fragrances",
    description: "A sophisticated fragrance house with a clean, modern and premium shopping experience.",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-sans)",
              fontSize: "0.875rem",
              borderRadius: "0",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text)",
            },
          }}
        />
      </body>
    </html>
  );
}
