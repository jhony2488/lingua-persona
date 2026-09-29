import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logoPath = join(root, "public", "logo.png");
const outDir = join(root, "public", "icons");

// Gradiente da logo: azul → ciano → violeta (diagonal).
const gradientBg = (size) =>
  Buffer.from(
    `<svg width="${size}" height="${size}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2563eb"/>
          <stop offset="0.5" stop-color="#06b6d4"/>
          <stop offset="1" stop-color="#6d28d9"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#g)"/>
    </svg>`,
  );

const logo = sharp(logoPath);
mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  await logo
    .clone()
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(outDir, `icon-${size}.png`));
  console.log(`generated icon-${size}.png`);
}

// Maskable: zona segura é um círculo de ~80% — logo a 66% garante que a
// ponta do balão não seja cortada ao aplicar máscara circular/squircle.
const MASKABLE = 512;
const inner = Math.round(MASKABLE * 0.66);
const padded = await logo
  .clone()
  .resize(inner, inner, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .toBuffer();
await sharp(gradientBg(MASKABLE))
  .composite([{ input: padded, gravity: "center" }])
  .png()
  .toFile(join(outDir, "icon-maskable-512.png"));
console.log("generated icon-maskable-512.png");

// Favicon moderno — o Next serve src/app/icon.png junto do favicon.ico legado.
await logo
  .clone()
  .resize(64, 64, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(join(root, "src", "app", "icon.png"));
console.log("generated src/app/icon.png");
