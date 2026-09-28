import { Tag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en-US";
import { LINKS } from "./constants";

export function FinalCta({ dict }: { dict: Dictionary }) {
  return (
    <section
      aria-label={dict.landing.ctaTitle}
      className="bg-primary text-primary-foreground flex flex-col items-center gap-4 rounded-2xl px-6 py-12 text-center"
    >
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {dict.landing.ctaTitle}
      </h2>
      <p className="max-w-lg text-sm opacity-90">{dict.landing.ctaText}</p>
      <a
        href={LINKS.releases}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "secondary", size: "lg" })}
      >
        <Tag className="size-4" />
        {dict.landing.ctaPrimary}
      </a>
    </section>
  );
}
