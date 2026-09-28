import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { InstallBanner } from "@/components/pwa/install-banner";
import { SwRegister } from "@/components/pwa/sw-register";
import { Providers } from "@/components/providers";
import { ProductTour } from "@/components/tour/product-tour";
import { locales } from "@/i18n/config";
import { getDictionary, hasLocale } from "@/i18n/get-dictionary";
import { I18nProvider } from "@/i18n/provider";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const description = hasLocale(lang)
    ? (await getDictionary(lang)).metadata.description
    : "";
  return {
    applicationName: "LinguaPersona",
    title: {
      default: "LinguaPersona",
      template: "%s — LinguaPersona",
    },
    description,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "LinguaPersona",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <I18nProvider locale={lang} dict={dict}>
            <header className="border-b">
              <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                <Link
                  href={`/${lang}`}
                  data-tour="home"
                  className="text-lg font-bold tracking-tight"
                >
                  LinguaPersona
                </Link>
                <div className="flex items-center gap-4 text-sm font-medium">
                  <Link
                    href={`/${lang}/chat`}
                    data-tour="chat"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {dict.nav.chat}
                  </Link>
                  <Link
                    href={`/${lang}/plan`}
                    data-tour="plan"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {dict.nav.plan}
                  </Link>
                  <Link
                    href={`/${lang}/settings`}
                    data-tour="settings"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {dict.nav.settings}
                  </Link>
                  <span data-tour="language" className="inline-flex">
                    <LanguageSwitcher />
                  </span>
                </div>
              </nav>
            </header>
            <div className="flex-1">{children}</div>
            <footer className="text-muted-foreground border-t py-4 text-center text-xs">
              {dict.footer.tagline}
            </footer>
            <InstallBanner />
            <SwRegister />
            <ProductTour />
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
