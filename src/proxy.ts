import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextResponse, type NextRequest } from "next/server";
import {
  defaultLocale,
  locales,
  LOCALE_COOKIE,
  type Locale,
} from "@/i18n/config";
import { IS_LANDING } from "@/lib/env";

// Locale preferido: cookie gravado pelo seletor de idioma >
// Accept-Language do navegador > default.
function getLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) {
    return cookie as Locale;
  }
  const languages = new Negotiator({
    headers: {
      "accept-language": request.headers.get("accept-language") ?? "",
    },
  }).languages();
  return match(languages, [...locales], defaultLocale) as Locale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Landing institucional: IS_LANDING serve "/" como página pública e
  // oculta o app — quem usa baixa o release ou roda localmente.
  if (IS_LANDING) {
    if (pathname === "/") return;
    request.nextUrl.pathname = "/";
    return NextResponse.redirect(request.nextUrl);
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (pathnameHasLocale) return;

  request.nextUrl.pathname = `/${getLocale(request)}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!api|serwist|_next|.*\\..*).*)"],
};
