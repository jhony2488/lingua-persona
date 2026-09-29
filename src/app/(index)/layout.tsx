import type { Metadata, Viewport } from "next";
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
    applicationName: "LinguaPersona",
    category: "education",
    keywords: [
      "english",
      "language learning",
      "AI tutor",
      "local-first",
      "privacy",
      "WebLLM",
      "offline",
      "PWA",
    ],
    authors: [{ name: "jhony2488", url: "https://github.com/jhony2488" }],
    creator: "jhony2488",
    icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
    openGraph: {
      title: "LinguaPersona",
      description: dict.metadata.description,
      type: "website",
      siteName: "LinguaPersona",
      locale: defaultLocale.replace("-", "_"),
      alternateLocale: locales
        .filter((l) => l !== defaultLocale)
        .map((l) => l.replace("-", "_")),
      images: [
        {
          url: "/icons/icon-512.png",
          width: 512,
          height: 512,
          alt: "LinguaPersona",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "LinguaPersona",
      description: dict.metadata.description,
      images: ["/icons/icon-512.png"],
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

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

// Aplica o tema salvo/sistema antes da hidratação — evita flash claro no dark.
const themeInit = `(function(){try{var t=localStorage.getItem("linguapersona-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

// Root layout mínimo para a rota "/" fora de [lang]. No standalone o proxy
// redireciona antes desta página renderizar; no static export (mobile),
// ela é o index.html que redireciona no cliente.
export default function IndexLayout({ children }: { children: ReactNode }) {
  const landing = process.env.LANDING_PAGE === "1";
  return (
    <html lang={landing ? defaultLocale : "en"}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        {children}
      </body>
    </html>
  );
}
