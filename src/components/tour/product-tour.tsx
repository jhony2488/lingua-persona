"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { Button } from "@/components/ui/button";
import { format } from "@/i18n/format";
import { useDict, useLocale } from "@/i18n/provider";
import { useSettings } from "@/lib/store/settings";

const STEP_KEYS = ["home", "chat", "plan", "settings", "language"] as const;

const POPOVER_WIDTH = 288;
const VIEWPORT_PAD = 12;
const SPOTLIGHT_PAD = 4;

export function ProductTour() {
  const dict = useDict();
  const locale = useLocale();
  const pathname = usePathname();
  const userId = useSettings((state) => state.userId);
  const tourCompleted = useSettings((state) => state.tourCompleted);
  const setTourCompleted = useSettings((state) => state.setTourCompleted);

  // true apenas no cliente — evita mismatch de hidratação com SSR.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Espera o onboarding fechar para não sobrepor dialogs na página de chat.
  const waitingForOnboarding = !userId && pathname === `/${locale}/chat`;
  const active = mounted && !tourCompleted && !waitingForOnboarding;

  const measure = useCallback(() => {
    const target = document.querySelector(`[data-tour="${STEP_KEYS[step]}"]`);
    setRect(target ? target.getBoundingClientRect() : null);
  }, [step]);

  useEffect(() => {
    if (!active) return;
    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, measure]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTourCompleted(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, setTourCompleted]);

  if (!active) return null;

  const content = dict.tour.steps[STEP_KEYS[step]];
  const isLast = step === STEP_KEYS.length - 1;

  const popoverStyle: CSSProperties = rect
    ? {
        left: Math.min(
          Math.max(
            rect.left + rect.width / 2 - POPOVER_WIDTH / 2,
            VIEWPORT_PAD,
          ),
          window.innerWidth - POPOVER_WIDTH - VIEWPORT_PAD,
        ),
        ...(rect.bottom + 220 < window.innerHeight
          ? { top: rect.bottom + VIEWPORT_PAD }
          : { bottom: window.innerHeight - rect.top + VIEWPORT_PAD }),
      }
    : {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };

  return (
    <>
      {/* Bloqueia cliques na página enquanto o tour está ativo. */}
      <div aria-hidden className="fixed inset-0 z-40" />
      {rect ? (
        <div
          aria-hidden
          className="ring-primary pointer-events-none fixed z-40 rounded-md ring-2"
          style={{
            top: rect.top - SPOTLIGHT_PAD,
            left: rect.left - SPOTLIGHT_PAD,
            width: rect.width + SPOTLIGHT_PAD * 2,
            height: rect.height + SPOTLIGHT_PAD * 2,
            boxShadow: "0 0 0 9999px rgb(0 0 0 / 0.6)",
          }}
        />
      ) : (
        <div aria-hidden className="fixed inset-0 z-40 bg-black/60" />
      )}
      <div
        role="dialog"
        aria-label={dict.tour.replayTitle}
        className="bg-card fixed z-50 rounded-lg border p-4 shadow-lg"
        style={{ width: POPOVER_WIDTH, ...popoverStyle }}
      >
        <p className="text-muted-foreground text-xs">
          {format(dict.tour.stepOf, {
            current: step + 1,
            total: STEP_KEYS.length,
          })}
        </p>
        <h2 className="mt-1 font-semibold">{content.title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {content.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTourCompleted(true)}
          >
            {dict.tour.skip}
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
              >
                {dict.tour.back}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() =>
                isLast ? setTourCompleted(true) : setStep(step + 1)
              }
            >
              {isLast ? dict.tour.finish : dict.tour.next}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
