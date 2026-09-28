import type { Metadata } from "next";
import type { ReactNode } from "react";
import { defaultLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import "../globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://github.com/jhony2488/lingua-persona";

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.LANDING_PAGE !== "1") return {};

  const dict = await getDictionary(defaultLocale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "LinguaPersona",
      template: "LinguaPersona — %s",
    },
    description: dict.metadata.description,
    openGraph: {
      title: "LinguaPersona",
      description: dict.metadata.description,
      type: "website",
      siteName: "LinguaPersona",
      locale: defaultLocale.replace("-", "_"),
      alternateLocale: locales
        .filter((l) => l !== defaultLocale)
        .map((l) => l.replace("-", "_")),
      images: ["/icons/icon-512.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: "LinguaPersona",
      description: dict.metadata.description,
    },
    alternates: {
      canonical: "/",
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, "/"])),
        "x-default": "/",
      },
    },
    robots: { index: true, follow: true },
  };
}

// Root layout mínimo para a rota "/" fora de [lang]. No standalone o proxy
// redireciona antes desta página renderizar; no static export (mobile),
// ela é o index.html que redireciona no cliente.
export default function IndexLayout({ children }: { children: ReactNode }) {
  const landing = process.env.LANDING_PAGE === "1";
  return (
    <html lang={landing ? defaultLocale : "en"}>
      <body>{children}</body>
    </html>
  );
}
