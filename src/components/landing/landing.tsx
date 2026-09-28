"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en-US";
import { detectClientLocale } from "@/i18n/detect";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale } from "@/i18n/config";
import { LandingNav } from "./nav";
import { Hero } from "./hero";
import { Stats } from "./stats";
import { HowItWorks } from "./how-it-works";
import { Features } from "./features";
import { FinalCta } from "./cta";
import { LandingFooter } from "./footer";
import { LINKS } from "./constants";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LinguaPersona",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web, Windows, macOS, Linux, Android, iOS",
  description:
    "Adaptive virtual English teacher (A1–C2) running local-first on your device.",
  url: LINKS.repo,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export function Landing({ dict: ssrDict }: { dict: Dictionary }) {
  const [dict, setDict] = useState(ssrDict);

  // Enhancement: SSR renderiza o locale default; no cliente, troca para o
  // idioma detectado se for diferente.
  useEffect(() => {
    const detected = detectClientLocale();
    if (detected !== defaultLocale) {
      getDictionary(detected).then(setDict);
    }
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-14 px-6">
        <LandingNav dict={dict} />
        <main className="flex flex-col gap-14">
          <Hero dict={dict} />
          <Stats dict={dict} />
          <HowItWorks dict={dict} />
          <Features dict={dict} />
          <FinalCta dict={dict} />
        </main>
        <LandingFooter dict={dict} />
      </div>
    </>
  );
}
