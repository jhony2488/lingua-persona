# PWA and distribution

LinguaPersona is a web app that can be installed as a PWA and packaged for mobile and desktop.

## PWA

To allow native installation from the browser, Next.js must export static files and provide a `manifest.json`.

### Next.js configuration

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Manifest

The `public/manifest.json` file describes the app to the browser:

```json
{
  "name": "Alex English Teacher",
  "short_name": "Alex AI",
  "description": "AI English Tutor powered by WebLLM",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#090d16",
  "theme_color": "#f97316",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Build matrix

| Platform | Technology            | Output                 |
| -------- | --------------------- | ---------------------- |
| Web/PWA  | Next.js static export | `out/`                 |
| Android  | Capacitor             | `.apk` / `.aab`        |
| iOS      | Capacitor             | `.ipa` (macOS + Xcode) |
| Windows  | Tauri                 | `.exe` / `.msi`        |
| macOS    | Tauri                 | `.dmg` / `.app`        |
| Linux    | Tauri                 | `.AppImage` / `.deb`   |

## Capacitor steps

```bash
npm run build
npx cap sync
npx cap open android   # or ios
```

Then build in Android Studio or Xcode.

## Tauri steps

```bash
npm run tauri build
```

Binaries appear in `src-tauri/target/release`.

## See also

- [Local models](local-models.md)
- [Inference engine](inference-engine.md)
