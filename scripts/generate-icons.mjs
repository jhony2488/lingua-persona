import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");

const BG = { r: 0x4f, g: 0x46, b: 0xe5 }; // indigo-600
const FG = { r: 0xff, g: 0xff, b: 0xff };

function drawIcon(size, circleRatio) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * circleRatio;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const inside =
        Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) <= r;
      const color = inside ? FG : BG;
      png.data[idx] = color.r;
      png.data[idx + 1] = color.g;
      png.data[idx + 2] = color.b;
      png.data[idx + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

const icons = [
  { name: "icon-192.png", size: 192, ratio: 0.7 },
  { name: "icon-512.png", size: 512, ratio: 0.7 },
  { name: "icon-maskable-512.png", size: 512, ratio: 0.55 },
];

mkdirSync(outDir, { recursive: true });
for (const icon of icons) {
  writeFileSync(join(outDir, icon.name), drawIcon(icon.size, icon.ratio));
  console.log(`generated ${icon.name}`);
}
