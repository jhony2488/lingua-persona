# PWA e distribuição

O LinguaPersona é uma aplicação web que pode ser instalada como PWA e empacotada para mobile e desktop.

## PWA

Para permitir instalação nativa a partir do navegador, o Next.js precisa exportar arquivos estáticos e fornecer um `manifest.json`.

### Configuração do Next.js

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

### Manifesto

O arquivo `public/manifest.json` descreve o app para o navegador:

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

## Matriz de compilação

| Plataforma | Tecnologia            | Saída                  |
| ---------- | --------------------- | ---------------------- |
| Web/PWA    | Next.js static export | `out/`                 |
| Android    | Capacitor             | `.apk` / `.aab`        |
| iOS        | Capacitor             | `.ipa` (macOS + Xcode) |
| Windows    | Tauri                 | `.exe` / `.msi`        |
| macOS      | Tauri                 | `.dmg` / `.app`        |
| Linux      | Tauri                 | `.AppImage` / `.deb`   |

## Passos com o Capacitor

```bash
npm run build
npx cap sync
npx cap open android   # ou ios
```

Depois, compile no Android Studio ou Xcode.

## Passos com o Tauri

```bash
npm run tauri build
```

Os binários aparecem em `src-tauri/target/release`.

## Veja também

- [Modelos locais](modelos-locais.md)
- [Motor de inferência](motor-de-inferencia.md)
