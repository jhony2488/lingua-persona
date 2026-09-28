import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold">You are offline</h1>
      <p className="max-w-md text-muted-foreground">
        LinguaPersona needs an internet connection for this page. Some content
        may still be available from the cache.
      </p>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </Link>
    </main>
  );
}
