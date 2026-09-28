import type { Dictionary } from "@/i18n/dictionaries/en-US";

export function Stats({ dict }: { dict: Dictionary }) {
  return (
    <section
      aria-label="LinguaPersona stats"
      className="grid grid-cols-2 gap-4 sm:grid-cols-4"
    >
      {dict.landing.stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
          <p className="text-muted-foreground mt-1 text-sm">{stat.label}</p>
        </div>
      ))}
    </section>
  );
}
