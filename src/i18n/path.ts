import type { Locale } from "./config";
import { isLocale } from "./detect";

export function localeFromPathname(pathname: string): Locale | undefined {
  const segment = pathname.split("/")[1] ?? "";
  return isLocale(segment) ? segment : undefined;
}

// Troca (ou adiciona) o prefixo de locale num pathname.
// "/en-US/chat" + "es" → "/es/chat"; "/chat" + "es" → "/es/chat".
export function pathnameWithLocale(pathname: string, locale: Locale): string {
  const current = localeFromPathname(pathname);
  const rest = current ? pathname.slice(current.length + 1) : pathname;
  return rest && rest !== "/" ? `/${locale}${rest}` : `/${locale}`;
}
