"use client";

import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if (
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }
    navigator.serviceWorker.register("/serwist/sw.js").catch(() => {});
  }, []);

  return null;
}
