import { match } from "@formatjs/intl-localematcher";
import {
  defaultLocale,
  locales,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "./config";

// Resolve uma lista de preferências (Accept-Language ou navigator.languages)
// para um locale suportado. "en"/"pt"/"es" sem região mapeiam para a variante
// default de cada idioma (en-US, pt-BR, es).
export function detectLocale(languages: readonly string[]): Locale {
  return match([...languages], [...locales], defaultLocale) as Locale;
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Detecção no cliente: preferência persistida → idioma do navegador → default.
export function detectClientLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && isLocale(stored)) return stored;
  return detectLocale(navigator.languages ?? [navigator.language]);
}
