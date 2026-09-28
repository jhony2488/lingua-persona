# Contributing to LinguaPersona

Thank you for helping build LinguaPersona. Before opening an issue or pull request, please read the rules below.

## Before you start

1. Check if an issue already exists for what you want to do.
2. For large changes, open an issue first to discuss the proposal.
3. Always write clearly and directly, in Portuguese or English.

## Branch rules

- `main` is the primary branch and must always pass the tests.
- Create branches from `main`.
- Use descriptive names following the pattern `type/short-description`:
  - `feat/dialect-selector`
  - `fix/prompt-translation`
  - `docs/rag-sqlite`
  - `refactor/model-loader`

## Commits

- Commit messages should be clear and explain the "why" of the change.
- **All commits must be written in English only**, in imperative mood, using one of the prefixes below:
  - `feat:` — new feature — `feat: add Ollama fallback`
  - `bug:` — bug fix — `bug: fix voice recording timeout`
  - `doc:` — documentation — `doc: update inference engine guide`
  - `chore:` — maintenance and configuration — `chore: update dependencies`
- **All commits must be SSH-signed**. See the [setup guide](docs/en/ssh-signing.md).

## Code style

- The project uses **TypeScript** and **ESLint**.
- Format code with **Prettier** before opening the PR:
  ```bash
  npm run format
  ```
- Run the formatting check, lint, and tests:
  ```bash
  npm run format:check
  npm run lint
  npm run test
  ```
- **Git hooks (Husky)**: `pre-commit` runs `npm run lint` and `pre-push` runs
  `npm run test` — commits/pushes that fail the check are blocked.
  Because `.npmrc` sets `ignore-scripts=true`, hooks are not installed
  automatically after `npm install`; activate them once with:
  ```bash
  npx husky
  ```
- Ignore comments (`eslint-disable`, `@ts-ignore`, `@ts-expect-error`,
  `@ts-nocheck`) are only acceptable in test files (`__tests__/`, `e2e/`, test
  helpers). In production code, fix the underlying problem instead of
  silencing lint/typecheck. See [ignore directives](docs/en/ignore-directives.md).
- Keep components small and focused.
- Prefer functions and hooks over classes.
- Name files and folders in English for ecosystem consistency (e.g., `inferenceEngine.ts`, `useAgentStore.ts`).

## Tests

- **Every change must touch tests**: changes to existing behavior must update
  the corresponding tests; new features must add new tests.
- Tests must use **Jest** + **React Testing Library**; API tests use
  **Supertest** with the mini-router in `__tests__/helpers/app.ts`.
- End-to-end tests use **Playwright** (`npm run test:e2e`) with Gherkin
  scenarios in `e2e/features/` — they run in CI, so `pre-push` does not
  need to pass them.
- Do not submit tests that depend on network or GPU.

## Pull Requests

1. Your branch should be up to date with `main`.
2. The PR must describe what changed and why.
3. Request at least one reviewer.
4. CI must pass (lint, tests, and build).
5. **Each PR must change at most 20 files.** PRs above this limit are only accepted with a very strong justification in the PR body; whenever possible, split into smaller deliveries.

## Security

- Never commit API keys, tokens, `.env` files, or personal data.
- If you find a vulnerability, report it privately before opening a public issue.
- Use environment variables for credentials in development.

## License

By contributing, you agree that your code will be licensed under the same license as the project.
