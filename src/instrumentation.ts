export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const [{ prisma }, { SCHEMA_STATEMENTS }] = await Promise.all([
    import("@/lib/prisma"),
    import("@/lib/local-db/schema.sql"),
  ]);

  for (const statement of SCHEMA_STATEMENTS) {
    await prisma.$executeRawUnsafe(statement);
  }
}
