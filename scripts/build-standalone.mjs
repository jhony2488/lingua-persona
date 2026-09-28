import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const standalone = join(root, ".next", "standalone");

// O output standalone do Next não inclui automaticamente:
// assets estáticos, public/ e o Prisma Client gerado.
if (!existsSync(standalone)) {
  console.error("Rode `npm run build` antes de build-standalone.");
  process.exit(1);
}

cpSync(join(root, ".next", "static"), join(standalone, ".next", "static"), {
  recursive: true,
});
cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });

const prismaClient = join(root, "node_modules", ".prisma");
if (existsSync(prismaClient)) {
  cpSync(prismaClient, join(standalone, "node_modules", ".prisma"), {
    recursive: true,
  });
}

console.log("✓ Standalone completo em .next/standalone");
