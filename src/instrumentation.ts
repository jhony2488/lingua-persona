import { IS_LANDING } from "@/lib/env";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  // Landing deploy / serverless (ex.: Vercel): filesystem read-only e sem
  // SQLite — o bootstrap do schema só faz sentido no standalone/Tauri.
  if (IS_LANDING || process.env.VERCEL === "1") return;

  const [{ prisma }, { SCHEMA_STATEMENTS, USER_PROFILE_COLUMN_MIGRATIONS }] =
    await Promise.all([
      import("@/lib/prisma"),
      import("@/lib/local-db/schema.sql"),
    ]);

  for (const statement of SCHEMA_STATEMENTS) {
    await prisma.$executeRawUnsafe(statement);
  }

  const userColumns = await prisma.$queryRawUnsafe<{ name: string }[]>(
    `PRAGMA table_info("User")`,
  );
  const existingColumns = new Set(userColumns.map((column) => column.name));
  for (const migration of USER_PROFILE_COLUMN_MIGRATIONS) {
    if (!existingColumns.has(migration.name)) {
      await prisma.$executeRawUnsafe(migration.statement);
    }
  }
}
