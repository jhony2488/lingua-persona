import { FolderGit2, Tag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en-US";
import { LINKS } from "./constants";

function ChatMock({ dict }: { dict: Dictionary }) {
  const { user, teacher, learner } = dict.landing.chatMock;
  return (
    <div
      aria-hidden="true"
      className="bg-card w-full max-w-sm rounded-xl border p-4 text-left text-sm shadow-lg"
    >
      <div className="flex flex-col gap-3">
        <p className="bg-primary text-primary-foreground ml-8 rounded-lg rounded-br-sm px-3 py-2">
          {user}
        </p>
        <p className="bg-muted mr-8 rounded-lg rounded-bl-sm px-3 py-2">
          {teacher}
        </p>
        <p className="bg-primary text-primary-foreground ml-8 rounded-lg rounded-br-sm px-3 py-2">
          {learner}
        </p>
      </div>
    </div>
  );
}

export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section
      aria-label={dict.home.heroTitle}
      className="relative overflow-hidden rounded-2xl border"
    >
      {/* Fundo decorativo: gradiente + dot pattern com tokens */}
      <div className="bg-muted/40 absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="from-background via-background/60 absolute inset-0 -z-10 bg-gradient-to-b to-transparent" />

      <div className="flex flex-col items-center gap-10 px-6 py-16 text-center sm:py-20 lg:flex-row lg:justify-between lg:text-left">
        <div className="flex max-w-xl flex-col items-center gap-5 lg:items-start">
          <span className="bg-muted text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium">
            {dict.landing.eyebrow}
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {dict.home.heroTitle}
          </h1>
          <p className="text-muted-foreground text-lg">
            {dict.home.heroSubtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a
              href={LINKS.releases}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg" })}
            >
              <Tag className="size-4" />
              {dict.landing.ctaPrimary}
            </a>
            <a
              href={LINKS.repo}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              <FolderGit2 className="size-4" />
              {dict.landing.viewRepository}
            </a>
          </div>
        </div>
        <ChatMock dict={dict} />
      </div>
    </section>
  );
}
