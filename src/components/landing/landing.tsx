"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en-US";
import { detectClientLocale } from "@/i18n/detect";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, LOCALE_STORAGE_KEY, type Locale } from "@/i18n/config";
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
  inLanguage: ["en-US", "en-GB", "pt-BR", "es"],
  browserRequirements: "Requires JavaScript. WebGPU recommended for local AI.",
  description:
    "Adaptive virtual English teacher (A1–C2) running local-first on your device.",
  url: LINKS.repo,
  author: { "@type": "Person", name: "jhony2488", url: LINKS.repo },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export function Landing({ dict: ssrDict }: { dict: Dictionary }) {
  const [dict, setDict] = useState(ssrDict);
  // Locale detectado no cliente (localStorage > browser) — o SSR sempre usa
  // o default, então o snapshot do servidor é defaultLocale (sem mismatch).
  const detected = useSyncExternalStore(
    () => () => {},
    () => detectClientLocale(),
    () => defaultLocale,
  );
  const [selected, setSelected] = useState<Locale | null>(null);
  const locale = selected ?? detected;

  // Sincroniza o lang do documento quando o locale muda.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  // Detecção no mount: carrega o dicionário se o locale não for o default.
  useEffect(() => {
    if (detected !== defaultLocale) {
      getDictionary(detected).then(setDict);
    }
  }, [detected]);

  const changeLocale = (value: string | null) => {
    if (!value || value === locale) return;
    const next = value as Locale;
    setSelected(next);
    if (next === defaultLocale) setDict(ssrDict);
    else getDictionary(next).then(setDict);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Modo privado sem storage — a troca vale só na sessão.
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* pt-20 compensa a altura do nav fixo */}
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-14 px-6 pt-20">
        <LandingNav dict={dict} locale={locale} onLocaleChange={changeLocale} />
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
