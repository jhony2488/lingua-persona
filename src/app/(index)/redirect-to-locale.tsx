"use client";

import { useEffect } from "react";
import { detectClientLocale } from "@/i18n/detect";

export function RedirectToLocale() {
  useEffect(() => {
    window.location.replace(`/${detectClientLocale()}`);
  }, []);

  return (
    <p className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
      Redirecting…
    </p>
  );
}
