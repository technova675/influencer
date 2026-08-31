import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3200";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The roster is the agency's asset and the admin surface is internal.
      disallow: ["/admin", "/roster", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
