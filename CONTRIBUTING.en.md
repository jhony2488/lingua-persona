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
- Prefer imperative, short titles in Portuguese or English:
  - `adiciona fallback para Ollama`
  - `corrige timeout de gravação de voz`
  - `atualiza documentação do motor de inferência`

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
- Keep components small and focused.
- Prefer functions and hooks over classes.
- Name files and folders in English for ecosystem consistency (e.g., `inferenceEngine.ts`, `useAgentStore.ts`).

## Tests

- Whenever you add a new feature, add unit tests where it makes sense.
- Tests must use **Jest** + **React Testing Library**.
- Do not submit tests that depend on network or GPU.

## Pull Requests

1. Your branch should be up to date with `main`.
2. The PR must describe what changed and why.
3. Request at least one reviewer.
4. CI must pass (lint, tests, and build).
5. Avoid very large PRs; prefer smaller, focused deliveries.

## Security

- Never commit API keys, tokens, `.env` files, or personal data.
- If you find a vulnerability, report it privately before opening a public issue.
- Use environment variables for credentials in development.

## License

By contributing, you agree that your code will be licensed under the same license as the project.
