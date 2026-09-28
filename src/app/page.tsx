import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Local-first AI",
    description:
      "Language models run in your browser via WebLLM/WebGPU, with Ollama and external API fallbacks.",
  },
  {
    title: "Adaptive teacher",
    description:
      "A virtual teacher that adapts to your level — from A1 to C2 — with grammar feedback.",
  },
  {
    title: "Voice practice",
    description:
      "Speak and listen with the Web Speech API to train pronunciation and comprehension.",
  },
  {
    title: "Private by design",
    description:
      "Conversations, memory, and documents stay on your device — fully offline-capable PWA.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Learn English with your own AI teacher
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          LinguaPersona is a private, installable web app that lets you practice
          English conversation with an adaptive virtual teacher — running mostly
          on your own device.
        </p>
        <div className="flex gap-3">
          <Link href="/chat" className={buttonVariants({ size: "lg" })}>
            Start practicing
          </Link>
          <Link
            href="/plan"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Study plan
          </Link>
          <Link
            href="/settings"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Configure teacher
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
