# Testing

The project uses three test layers, all runnable locally and in CI.

## Pyramid

### 1. Unit and integration (Jest)

`npm run test` — `jest --runInBand`.

- **Environment**: logic/DB tests use `@jest-environment <rootDir>/jest.node-env.ts`, which injects `DATABASE_URL=file:./test.db` (isolated SQLite, reset per run via `prisma db push --force-reset`).
- **Components**: `jest-environment-jsdom` + React Testing Library (e.g. `__tests__/page.test.tsx`).
- **API**: **Supertest** + the mini-router in `__tests__/helpers/app.ts`, which re-routes Route Handlers into real HTTP calls — integration tests hit the same code layer as `next dev`.
- **External HTTP**: MSW (`__tests__/helpers/msw.ts`).
- Layout: `__tests__/unit/` and `__tests__/integration/`.

### 2. End-to-end (Playwright)

`npm run test:e2e` — boots `next dev` itself (`webServer` in `playwright.config.ts`) and runs headless Chromium against the real API.

- **Gherkin**: pt-BR scenarios in `e2e/features/*.feature`, mapped 1:1 to `e2e/*.spec.ts`.
- **Seeding**: `e2e/fixtures.ts` creates a real user via `POST /api/users` and deletes it in `afterAll` (cascade cleans the rest). `seedProfile()` injects the Zustand store into `localStorage` — guarded so `page.reload()` doesn't overwrite.
- **Hydration**: always use `goto(page, url)` (waits `networkidle`) — clicks/fills before React hydration are silently reverted.
- **Database**: shares `prisma/dev.db` with the dev server; specs isolate per user.
- **Known limits**: `beforeinstallprompt` can't fire headless (`@skip` scenario); `SpeechRecognition` and WebLLM/WebGPU don't exist headless — voice and real inference aren't e2e-covered.
- Reports land in `playwright-report/` (gitignored), uploaded as CI artifacts for 7 days.

### 3. Git hooks (Husky)

`pre-commit` → `npm run lint` · `pre-push` → `npm run test` (Jest only — e2e is heavy and runs in CI).

> Because `.npmrc` sets `ignore-scripts=true`, hooks don't activate automatically after `npm install`. Run `npx husky` once.

## CI

`ci.yml` has two jobs: `quality` (lint + format:check + jest + build) and `e2e` (Playwright against `next dev` with `DATABASE_URL=file:./dev.db`).

## Conventions

- Every change must touch tests — changed behavior → updated tests; new feature → new tests.
- For user-visible behavior: write the Gherkin scenario first, then the spec.
- Ignore directives (`eslint-disable`, `@ts-ignore`) only in test files — see [ignore directives](ignore-directives.md).
