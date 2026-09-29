import { IS_LANDING } from "@/lib/env";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Landing deploy / serverless (ex.: Vercel): filesystem read-only e sem
  // SQLite — o bootstrap do schema só faz sentido no standalone/Tauri.
  if (IS_LANDING || process.env.VERCEL === "1") return;

  const [{ prisma }, { SCHEMA_STATEMENTS }] = await Promise.all([
    import("@/lib/prisma"),
    import("@/lib/local-db/schema.sql"),
  ]);

  for (const statement of SCHEMA_STATEMENTS) {
    await prisma.$executeRawUnsafe(statement);
  }
}
