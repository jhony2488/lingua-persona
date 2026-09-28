import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");
const stashDir = join(root, ".next-mobile-stash");
const stashed = [
  join(root, "src", "app", "api"),
  join(root, "src", "app", "serwist"),
];

// Route Handlers quebram `output: "export"`. Para o build mobile,
// movemos api/ e serwist/ para um stash fora de src/, geramos out/
// e restauramos em finally — a UI nativa usa a camada local sqlite.
mkdirSync(stashDir, { recursive: true });

try {
  for (const dir of stashed) {
    if (existsSync(dir)) {
      renameSync(dir, join(stashDir, basename(dir)));
    }
  }
  execFileSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, MOBILE_EXPORT: "1" },
    shell: process.platform === "win32",
  });
  console.log("\n✓ Mobile export gerado em out/");
} finally {
  for (const dir of stashed) {
    const stash = join(stashDir, basename(dir));
    if (existsSync(stash)) {
      renameSync(stash, dir);
    }
  }
}
