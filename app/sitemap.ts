import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3200";
  const now = new Date();
  return [
    { url: base, lastModified: now, priority: 1 },
    { url: `${base}/roster`, lastModified: now, priority: 0.8 },
    { url: `${base}/join`, lastModified: now, priority: 0.8 },
  ];
}
