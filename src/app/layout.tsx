import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { CartProvider } from "@/components/providers/CartProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://angelix.com";

export const metadata: Metadata = {
  title: {
    default: "ANGELIX by Suraj — Luxury Fragrances",
    template: "%s | ANGELIX by Suraj",
  },
  description:
    "Discover ANGELIX by Suraj — a sophisticated luxury fragrance house offering bespoke, handcrafted perfumes and tester discovery sets.",
  keywords: [
    "ANGELIX",
    "ANGELIX by Suraj",
    "luxury perfume India",
    "artisan perfume",
    "perfume tester kit",
    "oud perfume",
    "extrait de parfum",
    "niche fragrance house",
  ],
  authors: [{ name: "ANGELIX by Suraj", url: SITE_URL }],
  creator: "ANGELIX by Suraj",
  publisher: "ANGELIX by Suraj",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "ANGELIX by Suraj",
    title: "ANGELIX by Suraj — Luxury Fragrances",
    description: "Discover handcrafted luxury perfumes and signature discovery testers by ANGELIX.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ANGELIX by Suraj",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ANGELIX by Suraj — Luxury Fragrances",
    description: "Handcrafted luxury perfumes and signature discovery testers by ANGELIX.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "ANGELIX by Suraj",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-7067697646",
        contactType: "customer service",
        email: "Surajxsingh412@gmail.com",
        availableLanguage: ["English", "Hindi"],
      },
      sameAs: ["https://instagram.com/angelix"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "ANGELIX by Suraj",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/shop?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
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
