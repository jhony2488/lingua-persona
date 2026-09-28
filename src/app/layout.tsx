import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { InstallBanner } from "@/components/pwa/install-banner";
import { SwRegister } from "@/components/pwa/sw-register";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "LinguaPersona",
  title: {
    default: "LinguaPersona",
    template: "%s — LinguaPersona",
  },
  description:
    "Learn English by talking to a virtual teacher — local AI, voice, and offline support.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LinguaPersona",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <header className="border-b">
            <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
              <Link href="/" className="text-lg font-bold tracking-tight">
                LinguaPersona
              </Link>
              <div className="flex items-center gap-4 text-sm font-medium">
                <Link
                  href="/chat"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Chat
                </Link>
                <Link
                  href="/settings"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Settings
                </Link>
              </div>
            </nav>
          </header>
          <div className="flex-1">{children}</div>
          <footer className="text-muted-foreground border-t py-4 text-center text-xs">
            LinguaPersona — learn English with a local AI teacher
          </footer>
          <InstallBanner />
          <SwRegister />
        </Providers>
      </body>
    </html>
  );
}
