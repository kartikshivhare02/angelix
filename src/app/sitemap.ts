import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://angelix.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,               lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/shop`,           lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/testers`,        lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/about`,          lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`,        lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`,        lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,          lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/shipping-policy`,lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/return-policy`,  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  const categories = ["men", "women", "unisex", "best-sellers", "new-arrivals", "testers"];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/category/${c}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const fragranceFamilies = ["woody", "fresh", "aquatic", "citrus", "floral", "fruity", "oud", "amber", "musk", "spicy", "gourmand"];
  const fragranceRoutes: MetadataRoute.Sitemap = fragranceFamilies.map((f) => ({
    url: `${BASE}/fragrance/${f}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...categoryRoutes, ...fragranceRoutes];
}
