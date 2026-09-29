"use client";

import { FolderGit2, Languages, Tag } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dictionary } from "@/i18n/dictionaries/en-US";
import { localeLabels, locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { LINKS } from "./constants";
import { ThemeToggle } from "./theme-toggle";

interface LandingNavProps {
  dict: Dictionary;
  locale: Locale;
  onLocaleChange: (locale: string | null) => void;
}

export function LandingNav({ dict, locale, onLocaleChange }: LandingNavProps) {
  return (
    <header className="bg-background/80 fixed inset-x-0 top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2 px-6 py-3">
        <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Image src="/logo.png" alt="" width={28} height={28} />
          LinguaPersona
        </span>
        <nav aria-label="Landing" className="flex items-center gap-1 text-sm">
          <a
            href={LINKS.docs}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            {dict.landing.navDocs}
          </a>
          <a
            href={LINKS.contributing}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            {dict.landing.contribute}
          </a>
          <a
            href={LINKS.releases}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            <Tag className="size-3.5" />
            {dict.landing.releases}
          </a>
          <Select value={locale} onValueChange={onLocaleChange}>
            <SelectTrigger size="sm" aria-label={dict.landing.toggleLanguage}>
              <Languages className="size-4" />
              <SelectValue>{localeLabels[locale]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locales.map((l) => (
                <SelectItem key={l} value={l}>
                  {localeLabels[l]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ThemeToggle label={dict.landing.toggleTheme} />
          <a
            href={LINKS.repo}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "sm" })}
          >
            <FolderGit2 className="size-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
