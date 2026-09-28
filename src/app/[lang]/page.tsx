import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary, hasLocale } from "@/i18n/get-dictionary";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16">
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {dict.home.heroTitle}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          {dict.home.heroSubtitle}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/${lang}/chat`}
            className={buttonVariants({ size: "lg" })}
          >
            {dict.home.startPracticing}
          </Link>
          <Link
            href={`/${lang}/settings`}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {dict.home.configureTeacher}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {dict.home.features.map((feature) => (
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
