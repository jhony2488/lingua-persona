<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LinguaPersona

Virtual English teacher (A1–C2), local-first and private by design. Web/PWA
with Next.js, desktop via Tauri sidecar, mobile via Capacitor with on-device
SQLite. No external server required for native builds.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript — `output: "standalone"`
  (sidecar/web) or `output: "export"` when `MOBILE_EXPORT=1`
- Tailwind CSS v4 + Base UI (shadcn preset) — `buttonVariants` on links, no
  `asChild`
- Prisma + SQLite · Zod · TanStack Query · Zustand
- Serwist (PWA service worker via `/serwist/[path]`)
- Jest + React Testing Library + Supertest + MSW
- Capacitor (Android/iOS) · Tauri (desktop) · `@capacitor-community/sqlite`

## Commands

```bash
npm run dev               # dev server (port 3000)
npm run build             # standalone production build → .next/standalone
npm run test              # jest --runInBand (uses isolated prisma/test.db)
npm run lint && npm run format:check
npx tsc --noEmit

npm run db:migrate        # prisma migrate dev (dev.db)
npm run db:push           # push schema without migration
npm run db:generate       # prisma generate

npm run build:mobile      # static export → out/ (stashes api/serwist/proxy)
npm run mobile:sync       # cap sync
npm run build:standalone  # complete .next/standalone (static, public, data, .prisma)
npm run sidecar:bin       # download Node binary for Tauri sidecar
npm run fetch:books       # download the bundled book corpus → data/library/
```

## Structure

```
src/app/[lang]/           localized pages (en-US, en-GB, pt-BR, es)
src/app/(index)/          "/" locale redirect (client)
src/app/api/              Route Handlers — NOT localized
src/app/serwist/[path]/   service worker route
src/modules/<domain>/     schema.ts (zod) · service.ts · repository.ts
src/modules/study/        + plan-generator.ts, topics.data.ts (shared, pure)
src/i18n/                 config, detect, get-dictionary, provider, dictionaries/
src/lib/local-db/         mobile sqlite layer (schema.sql.ts + local-api.ts)
src/lib/http/             withErrorHandler, parse, response helpers
src/lib/store/settings.ts user prefs (userId, level, dialect, agent, chatMode)
src/proxy.ts              locale negotiation (negotiator + localematcher)
src/instrumentation.ts    register() → idempotent schema bootstrap (standalone)
src-tauri/                Rust shell: spawns Node sidecar on 127.0.0.1:3111
data/library/             bundled corpus — manifest.json + downloaded .txt
scripts/                  build-mobile, build-standalone, fetch-node-bin, fetch-books
__tests__/                unit/ + integration/ + helpers/ (supertest mini-router)
```

## Architecture: data per platform

| Platform | Backend                    | Storage                       |
| -------- | -------------------------- | ----------------------------- |
| Web/dev  | Route Handlers (`/api/*`)  | Prisma + `prisma/dev.db`      |
| Desktop  | Same code as Tauri sidecar | Prisma + `appDataDir` SQLite  |
| Mobile   | No server — `local-api.ts` | `@capacitor-community/sqlite` |

`api-client` branches: `Capacitor.isNativePlatform()` → `localApi`, else
`fetch("/api/*")`. Tauri webview is not "native" for Capacitor — it fetches
the sidecar on localhost. Shared pure logic (`plan-generator`, Zod schemas,
`generateAssistantReply`) is imported by both server and mobile paths.

## Conventions

- **Commits**: conventional prefixes, English only (`feat:`, `fix:`,
  `docs:`, `chore:`). SSH-signed.
- **PRs**: max 20 changed files; larger only with strong justification in
  the PR body — prefer splitting into smaller deliveries.
- **Migrations**: never edit an applied `prisma/migrations/*` file — create a
  new migration. Mirror any schema change in `src/lib/local-db/schema.sql.ts`.
- **API**: validate with Zod (`parseBody`/`parseQuery`/`parseParams`), throw
  `AppError` for domain errors, wrap handlers in `withErrorHandler`.
- **Docs**: always bilingual — every `docs/pt/*.md` has a `docs/en/*.md`
  twin (pt uses Portuguese filenames, en uses English filenames).
- **`.npmrc`**: `ignore-scripts=true` + minimum release age — never weaken it;
  CI rebuilds `@prisma/engines`/`esbuild` explicitly.
- **Native**: no external URL needed. `CAPACITOR_SERVER_URL` is an optional
  remote override only.

## Documentation map

| Topic                            | Português                                                        | English                                                    |
| -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Architecture                     | [arquitetura.md](docs/pt/arquitetura.md)                         | [architecture.md](docs/en/architecture.md)                 |
| Inference engine (WebLLM/Ollama) | [motor-de-inferencia.md](docs/pt/motor-de-inferencia.md)         | [inference-engine.md](docs/en/inference-engine.md)         |
| Local models                     | [modelos-locais.md](docs/pt/modelos-locais.md)                   | [local-models.md](docs/en/local-models.md)                 |
| Hardware & model guide           | [guia-de-hardware.md](docs/pt/guia-de-hardware.md)               | [hardware-guide.md](docs/en/hardware-guide.md)             |
| Virtual teacher                  | [professor-virtual.md](docs/pt/professor-virtual.md)             | [virtual-teacher.md](docs/en/virtual-teacher.md)           |
| Pedagogy & prompts               | [pedagogia-e-prompts.md](docs/pt/pedagogia-e-prompts.md)         | [pedagogy-and-prompts.md](docs/en/pedagogy-and-prompts.md) |
| RAG & memory                     | [rag-e-memoria.md](docs/pt/rag-e-memoria.md)                     | [rag-and-memory.md](docs/en/rag-and-memory.md)             |
| Local vector search              | [pesquisa-vetorial-local.md](docs/pt/pesquisa-vetorial-local.md) | [local-vector-search.md](docs/en/local-vector-search.md)   |
| Voice & audio                    | [voz-e-audio.md](docs/pt/voz-e-audio.md)                         | [voice-and-audio.md](docs/en/voice-and-audio.md)           |
| Agent gender                     | [genero-do-agente.md](docs/pt/genero-do-agente.md)               | [agent-gender.md](docs/en/agent-gender.md)                 |
| PWA & distribution               | [pwa-e-distribuicao.md](docs/pt/pwa-e-distribuicao.md)           | [pwa-and-distribution.md](docs/en/pwa-and-distribution.md) |
| `.npmrc` security                | [npmrc.md](docs/pt/npmrc.md)                                     | [npmrc.md](docs/en/npmrc.md)                               |
| SSH commit signing               | [assinatura-ssh.md](docs/pt/assinatura-ssh.md)                   | [ssh-signing.md](docs/en/ssh-signing.md)                   |

See also: `README.md` / `README.en.md`, `CONTRIBUTING.md` /
`CONTRIBUTING.en.md`.

## Gotchas

- **`prisma generate` EPERM on Windows**: a running dev server locks
  `query_engine-windows.dll.node`. Stop `npm run dev`, run generate, restart.
- **Stale IDE Prisma errors** (`has no exported member 'User'`): restart the
  TS server — `generate` rewrites `.prisma/client` under the editor.
- **Mobile export** temporarily stashes `src/app/api`, `src/app/serwist` and
  `src/proxy.ts`; it restores them in `finally` — check `git status` if a
  build crashed mid-run.
- **Tauri builds** need Rust + MSVC/WebView2 (CI provides them); the sidecar
  binary per triple is produced by `npm run sidecar:bin`.
- **Gutenberg texts** include legal headers/footers — strip `*** START OF` /
  `*** END OF` markers when chunking for RAG.
