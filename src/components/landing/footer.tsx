import type { Dictionary } from "@/i18n/dictionaries/en-US";
import { LINKS } from "./constants";

export function LandingFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-auto flex flex-col items-center gap-3 border-t py-8 text-center text-sm">
      <p className="text-muted-foreground">{dict.footer.tagline}</p>
      <nav
        aria-label="Footer"
        className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-xs"
      >
        <a
          className="hover:text-foreground transition-colors"
          href={LINKS.repo}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a
          className="hover:text-foreground transition-colors"
          href={LINKS.contributing}
          target="_blank"
          rel="noopener noreferrer"
        >
          {dict.landing.contribute}
        </a>
        <a
          className="hover:text-foreground transition-colors"
          href={LINKS.releases}
          target="_blank"
          rel="noopener noreferrer"
        >
          {dict.landing.releases}
        </a>
        <a
          className="hover:text-foreground transition-colors"
          href={LINKS.license}
          target="_blank"
          rel="noopener noreferrer"
        >
          {dict.landing.footerLicense}
        </a>
      </nav>
    </footer>
  );
}
