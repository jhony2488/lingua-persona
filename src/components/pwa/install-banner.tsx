"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDict } from "@/i18n/provider";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "linguapersona-install-dismissed";

export function InstallBanner() {
  const dict = useDict();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(DISMISSED_KEY) === "1",
  );

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  };

  const install = async () => {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setDeferred(null);
    dismiss();
  };

  return (
    <div className="bg-background/95 fixed inset-x-0 bottom-0 z-50 border-t p-4 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <p className="text-sm">{dict.installBanner.text}</p>
        <div className="flex gap-2">
          <Button size="sm" onClick={install}>
            {dict.installBanner.install}
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {dict.installBanner.notNow}
          </Button>
        </div>
      </div>
    </div>
  );
}
