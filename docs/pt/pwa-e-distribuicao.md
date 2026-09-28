# PWA e distribuição

O LinguaPersona é uma PWA instalável construída com Next.js (Turbopack) e Serwist, com service worker, manifesto e suporte a instalação offline.

## Implementação atual

### Manifesto

O manifesto é gerado por `src/app/manifest.ts` (App Router) e servido em `/manifest.webmanifest`:

- `name`/`short_name`: **LinguaPersona**
- `display: standalone`, `orientation: portrait`
- `theme_color`/`background_color`: `#4f46e5` / `#ffffff`
- Ícones em `public/icons/`: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (gerados por `scripts/generate-icons.mjs`)

### Service worker (Serwist + Turbopack)

O projeto usa `@serwist/turbopack`, que compila o service worker no build (esbuild) e o serve via Route Handler:

- `src/app/sw.ts` — fonte do worker (Serwist)
- `src/app/serwist/[path]/route.ts` — serve `/serwist/sw.js` e `/serwist/sw.js.map`
- `src/components/pwa/sw-register.tsx` — registra o SW apenas em produção

Estratégias de cache em `sw.ts`:

- `/api/*` → **NetworkFirst** (timeout 5s, fallback para cache offline)
- Navegação (`mode: "navigate"`) → **StaleWhileRevalidate**
- Assets/ páginas → `defaultCache` do Serwist + precache do build
- Fallback offline → `/~offline` (`src/app/~offline/page.tsx`)

### Instalação

`src/components/pwa/install-banner.tsx` intercepta `beforeinstallprompt` e exibe um banner customizado. O dismissal é persistido em `localStorage`.

### Notificações

`src/lib/notifications.ts` encapsula permissão (`Notification.requestPermission`) e assinatura push (`pushManager.getSubscription`). O Web Push com VAPID fica para uma fase futura.

> **Nota**: o `output: "export"` não é usado — os Route Handlers (`/api/*`) exigem servidor Node. Para empacotar em Capacitor/Tauri, a API precisa ser hospedada separadamente ou embutida.

## Empacotamento e releases (CI/CD)

Dois workflows em `.github/workflows/`:

- `ci.yml` — lint, format:check, testes e build em push/PR para `master`
- `release.yml` — em tags `v*.*.*`: build → empacota `app-release.pk` (tar.gz de `.next/static`), `app-release.rxe` (zip de `.next`), `SHA256SUMS.txt` → Release no GitHub

## Matriz de compilação

| Plataforma | Tecnologia        | Saída                              |
| ---------- | ----------------- | ---------------------------------- |
| Web/PWA    | Next.js + Serwist | `.next/` + `app-release.pk`/`.rxe` |
| Android    | Capacitor         | `.apk` / `.aab` (requer API)       |
| iOS        | Capacitor         | `.ipa` (macOS + Xcode, requer API) |
| Desktop    | Tauri             | `.exe`/`.msi`/`.dmg` (requer API)  |

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
- [Pesquisa vetorial local](pesquisa-vetorial-local.md)
