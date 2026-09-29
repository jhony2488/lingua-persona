"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

export const THEME_STORAGE_KEY = "linguapersona-theme";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function isDarkSnapshot() {
  return document.documentElement.classList.contains("dark");
}

/** Alterna light/dark aplicando `.dark` no <html> (variante do Tailwind v4). */
export function ThemeToggle({ label }: { label: string }) {
  const dark = useSyncExternalStore(
    subscribe,
    isDarkSnapshot,
    () => false, // SSR sempre light — sem mismatch de hidratação
  );

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // localStorage indisponível (modo privado) — tema vale só na sessão.
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
      aria-pressed={dark}
      title={label}
    >
      {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </Button>
  );
}
