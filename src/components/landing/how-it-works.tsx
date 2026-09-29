import type { Dictionary } from "@/i18n/dictionaries/en-US";

export function HowItWorks({ dict }: { dict: Dictionary }) {
  return (
    <section aria-label={dict.landing.howItWorks.title}>
      <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
        {dict.landing.howItWorks.title}
      </h2>
      <ol className="grid gap-6 sm:grid-cols-3">
        {dict.landing.howItWorks.steps.map((step, index) => (
          <li
            key={step.title}
            className="group hover:bg-muted/50 flex flex-col gap-2 rounded-xl p-3 transition-all duration-200 hover:-translate-y-0.5"
          >
            <span className="bg-primary text-primary-foreground group-hover:ring-primary/30 flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-shadow group-hover:ring-4">
              {index + 1}
            </span>
            <h3 className="font-semibold">{step.title}</h3>
            <p className="text-muted-foreground text-sm">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
