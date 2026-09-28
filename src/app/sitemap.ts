import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://github.com/jhony2488/lingua-persona";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.LANDING_PAGE !== "1") return [];
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
