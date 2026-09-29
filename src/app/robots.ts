import type { MetadataRoute } from "next";
import { IS_LANDING } from "@/lib/env";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!IS_LANDING) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "/sitemap.xml",
  };
}
