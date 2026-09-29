import { cpSync, existsSync, readdirSync, rmSync } from "node:fs";
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
// Corpus/manifests consumidos em runtime (ex.: study plan generator).
cpSync(join(root, "data"), join(standalone, "data"), { recursive: true });

const prismaClient = join(root, "node_modules", ".prisma");
if (existsSync(prismaClient)) {
  cpSync(prismaClient, join(standalone, "node_modules", ".prisma"), {
    recursive: true,
  });
}

// O sharp (dep de @huggingface/transformers) instala variantes musl em
// qualquer Linux x64 — são ELF musl que nem carregam em glibc, e o
// linuxdeploy do Tauri falha ao resolver libc.musl nelas.
const imgDir = join(standalone, "node_modules", "@img");
if (existsSync(imgDir)) {
  for (const entry of readdirSync(imgDir)) {
    if (entry.includes("musl")) {
      rmSync(join(imgDir, entry), { recursive: true, force: true });
    }
  }
}

console.log("✓ Standalone completo em .next/standalone");
