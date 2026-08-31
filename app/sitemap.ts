import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3200";
  const now = new Date();
  return [
    { url: base, lastModified: now, priority: 1 },
    { url: `${base}/for-influencers`, lastModified: now, priority: 0.9 },
    { url: `${base}/for-creators`, lastModified: now, priority: 0.9 },
    { url: `${base}/for-models`, lastModified: now, priority: 0.9 },
    { url: `${base}/for-brands`, lastModified: now, priority: 0.9 },
    { url: `${base}/join`, lastModified: now, priority: 0.8 },
  ];
}
