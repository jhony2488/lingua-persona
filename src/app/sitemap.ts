import type { MetadataRoute } from "next";
import { IS_LANDING } from "@/lib/env";

export const dynamic = "force-static";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://github.com/jhony2488/lingua-persona";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!IS_LANDING) return [];
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
