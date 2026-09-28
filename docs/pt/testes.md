# Testes

O projeto usa três níveis de teste, todos executáveis localmente e no CI.

## Pirâmide

### 1. Unitários e integração (Jest)

`npm run test` — `jest --runInBand`.

- **Ambiente**: testes de lógica/BD usam `@jest-environment <rootDir>/jest.node-env.ts`, que injeta `DATABASE_URL=file:./test.db` (SQLite isolada, resetada a cada run via `prisma db push --force-reset`).
- **Componentes**: `jest-environment-jsdom` + React Testing Library (ex.: `__tests__/page.test.tsx`).
- **API**: **Supertest** + mini-router em `__tests__/helpers/app.ts`, que re-rotearia os Route Handlers para chamadas HTTP de verdade — os testes de integração batem na mesma camada de código que o `next dev`.
- **HTTP externo**: MSW (`__tests__/helpers/msw.ts`).
- Estrutura: `__tests__/unit/` e `__tests__/integration/`.

### 2. End-to-end (Playwright)

`npm run test:e2e` — sobe `next dev` sozinho (`webServer` em `playwright.config.ts`) e roda Chromium headless contra a API real.

- **Gherkin**: cenários em pt-BR em `e2e/features/*.feature`, mapeados 1:1 para `e2e/*.spec.ts`.
- **Seed**: `e2e/fixtures.ts` cria usuário real via `POST /api/users` e apaga no `afterAll` (cascade limpa o resto). `seedProfile()` injeta o store Zustand no `localStorage` — com guarda para não sobrescrever em `page.reload()`.
- **Hidratação**: sempre use `goto(page, url)` (espera `networkidle`) — cliques/fills antes da hidratação do React são revertidos silenciosamente.
- **Banco**: compartilha `prisma/dev.db` com o dev server; specs isolam por usuário.
- **Limites conhecidos**: `beforeinstallprompt` não é disparável headless (cenário `@skip`); `SpeechRecognition` e WebLLM/WebGPU não existem em headless — voz e inferência real não são cobertas por e2e.
- Reports em `playwright-report/` (gitignored), artifacts no CI por 7 dias.

### 3. Git hooks (Husky)

`pre-commit` → `npm run lint` · `pre-push` → `npm run test` (Jest apenas — e2e é pesado e roda no CI).

> Como `.npmrc` tem `ignore-scripts=true`, os hooks não ativam sozinhos após `npm install`. Rode `npx husky` uma vez.

## CI

`ci.yml` tem dois jobs: `quality` (lint + format:check + jest + build) e `e2e` (Playwright contra `next dev` com `DATABASE_URL=file:./dev.db`).

## Convenções

- Toda alteração deve tocar testes — comportamento alterado → teste atualizado; feature nova → teste novo.
- Cenários de comportamento visível ao usuário: escreva o Gherkin primeiro, depois o spec.
- Ignore directives (`eslint-disable`, `@ts-ignore`) só em arquivos de teste — veja [diretivas de ignore](diretivas-de-ignore.md).
