import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const libDir = join(root, "data", "library");
const manifestPath = join(libDir, "manifest.json");
const force = process.argv.includes("--force");
const MIN_SIZE = 10 * 1024; // sanity: conteúdo real tem bem mais que 10KB

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
mkdirSync(libDir, { recursive: true });

const normalize = (text) => text.toLowerCase().replace(/\s+/g, " ");

let ok = 0;
let skipped = 0;
let failed = 0;

for (const book of manifest.books) {
  const dest = join(libDir, `${book.slug}.txt`);

  if (!force && existsSync(dest) && statSync(dest).size > MIN_SIZE) {
    console.log(`skip   ${book.slug} (já existe)`);
    skipped++;
    continue;
  }

  try {
    const res = await fetch(book.url, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (text.length < MIN_SIZE) {
      throw new Error(`conteúdo pequeno demais (${text.length} bytes)`);
    }
    // Valida que baixamos o livro certo (Gutenberg usa IDs fáceis de confundir).
    if (
      book.titleHint &&
      !normalize(text.slice(0, 8192)).includes(normalize(book.titleHint))
    ) {
      throw new Error(`título não confere (esperava "${book.titleHint}")`);
    }
    writeFileSync(dest, text, "utf8");
    console.log(`ok     ${book.slug} ← ${book.url}`);
    ok++;
  } catch (error) {
    console.error(`fail   ${book.slug}: ${error.message}`);
    failed++;
  }
}

console.log(`\n${ok} baixados, ${skipped} pulados, ${failed} falhas`);
if (failed > 0) process.exit(1);
