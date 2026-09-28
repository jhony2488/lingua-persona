"use client";

import { Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  localeLabels,
  locales,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/i18n/config";
import { pathnameWithLocale } from "@/i18n/path";
import { useLocale } from "@/i18n/provider";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const change = (value: string | null) => {
    if (!value) return;
    const next = value as Locale;
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    router.replace(pathnameWithLocale(pathname, next));
  };

  return (
    <Select value={locale} onValueChange={change}>
      <SelectTrigger size="sm" aria-label="Language">
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
  );
}
