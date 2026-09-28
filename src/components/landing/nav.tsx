import { FolderGit2, Tag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en-US";
import { LINKS } from "./constants";

export function LandingNav({ dict }: { dict: Dictionary }) {
  return (
    <header className="flex items-center justify-between py-5">
      <span className="text-lg font-bold tracking-tight">LinguaPersona</span>
      <nav aria-label="Landing" className="flex items-center gap-1 text-sm">
        <a
          href={LINKS.docs}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          {dict.landing.navDocs}
        </a>
        <a
          href={LINKS.contributing}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          {dict.landing.contribute}
        </a>
        <a
          href={LINKS.releases}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          <Tag className="size-3.5" />
          {dict.landing.releases}
        </a>
        <a
          href={LINKS.repo}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "sm" })}
        >
          <FolderGit2 className="size-3.5" />
          GitHub
        </a>
      </nav>
    </header>
  );
}
