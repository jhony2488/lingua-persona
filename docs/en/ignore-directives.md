# Ignore directives

Comments that silence the linter or typechecker — `eslint-disable`,
`eslint-disable-next-line`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck` —
**are only acceptable in test files**: `__tests__/`, `e2e/`, `jest.env.ts`, and
test helpers.

In production code, fix the underlying problem instead of silencing the tool.
Ignore comments hide real bugs and erase the warning signal that lint and
TypeScript exist to provide.

## Rules

- **Tests only**: `__tests__/`, `e2e/`, `jest.env.ts`, fixtures, and test
  helpers are the only places where an ignore comment is acceptable.
- **Keep it minimal**: prefer single-line `eslint-disable-next-line <rule>`
  over a whole-file `eslint-disable`.
- **Always justify**: end the comment with `-- <reason>` explaining why the
  suppression is needed.

## Existing examples

- `e2e/fixtures.ts` — `eslint-disable-next-line react-hooks/rules-of-hooks`
  justified by the Playwright fixture API.
- `jest.env.ts` — `eslint-disable-next-line @typescript-eslint/no-require-imports`
  to conditionally load `undici` in the Jest setup.

## Generated files

Generated or bundled files that trigger lint (e.g., bundles, build output)
must be excluded via `ignores` in the ESLint flat config — never by adding
ignore comments to source code.
