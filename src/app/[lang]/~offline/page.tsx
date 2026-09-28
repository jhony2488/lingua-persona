import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/i18n/get-dictionary";

export default async function OfflinePage({
  params,
}: PageProps<"/[lang]/~offline">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold">{dict.offline.title}</h1>
      <p className="text-muted-foreground max-w-md">{dict.offline.text}</p>
      <Link
        href={`/${lang}`}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium"
      >
        {dict.offline.tryAgain}
      </Link>
    </main>
  );
}
