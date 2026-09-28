import {
  Cpu,
  GraduationCap,
  Mic,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Dictionary } from "@/i18n/dictionaries/en-US";

// Ordem corresponde a dict.home.features (local AI, teacher, voice, private)
const ICONS: LucideIcon[] = [Cpu, GraduationCap, Mic, ShieldCheck];

export function Features({ dict }: { dict: Dictionary }) {
  return (
    <section aria-label="Features" className="grid gap-4 sm:grid-cols-2">
      {dict.home.features.map((feature, index) => {
        const Icon = ICONS[index % ICONS.length];
        return (
          <Card
            key={feature.title}
            className="hover:border-primary/30 p-5 transition-colors"
          >
            <div className="bg-muted mb-3 flex size-9 items-center justify-center rounded-lg">
              <Icon className="size-4.5" />
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {feature.description}
            </p>
          </Card>
        );
      })}
    </section>
  );
}
