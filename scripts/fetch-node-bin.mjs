import { execFileSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  rmSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..");

// Baixa o binário oficial do Node para o target do runner e o renomeia
// como sidecar do Tauri: binaries/linguapersona-server-<triple>[.exe]
const NODE_VERSION = process.env.SIDECAR_NODE_VERSION ?? "v22.14.0";
const PLATFORM = process.argv[2] ?? process.platform;
const ARCH = process.argv[3] ?? process.arch;

const targets = {
  "linux-x64": { dist: "linux-x64", triple: "x86_64-unknown-linux-gnu" },
  "win32-x64": { dist: "win-x64", triple: "x86_64-pc-windows-msvc" },
  "darwin-arm64": { dist: "darwin-arm64", triple: "aarch64-apple-darwin" },
  "darwin-x64": { dist: "darwin-x64", triple: "x86_64-apple-darwin" },
};

const target = targets[`${PLATFORM}-${ARCH}`];
if (!target) {
  console.error(`Target não suportado: ${PLATFORM}-${ARCH}`);
  process.exit(1);
}

const isWin = PLATFORM === "win32";
const archive = isWin ? "zip" : "tar.xz";
const distName = `node-${NODE_VERSION}-${target.dist}`;
const url = `https://nodejs.org/dist/${NODE_VERSION}/${distName}.${archive}`;
const tmpDir = join(root, ".sidecar-tmp");
const outDir = join(root, "src-tauri", "binaries");

mkdirSync(tmpDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

console.log(`Baixando ${url}`);
const archivePath = join(tmpDir, `node.${archive}`);
execFileSync("curl", ["-fsSL", url, "-o", archivePath], { stdio: "inherit" });

if (isWin) {
  execFileSync("tar", ["-xf", archivePath, "-C", tmpDir]);
} else {
  execFileSync("tar", ["-xJf", archivePath, "-C", tmpDir]);
}

const nodeBin = join(
  tmpDir,
  distName,
  isWin ? "node.exe" : join("bin", "node"),
);
const dest = join(
  outDir,
  `linguapersona-server-${target.triple}${isWin ? ".exe" : ""}`,
);
copyFileSync(nodeBin, dest);
if (!isWin) chmodSync(dest, 0o755);

rmSync(tmpDir, { recursive: true, force: true });
try {
  unlinkSync(archivePath);
} catch {
  // já removido com o tmpDir
}
console.log(`✓ Sidecar node em ${dest}`);
