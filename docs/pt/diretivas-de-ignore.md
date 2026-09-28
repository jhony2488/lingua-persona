# Diretivas de ignore

Comentários que silenciam o linter ou o typechecker — `eslint-disable`,
`eslint-disable-next-line`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck` —
**só são aceitáveis em arquivos de teste**: `__tests__/`, `e2e/`, `jest.env.ts`
e helpers de teste.

Em código de produção, corrija a causa do problema em vez de silenciar a
ferramenta. Ignore comments escondem bugs reais e apagam o sinal de alerta que
o lint e o TypeScript existem para dar.

## Regras

- **Testes apenas**: `__tests__/`, `e2e/`, `jest.env.ts`, fixtures e helpers de
  teste são os únicos lugares onde um comentário de ignore é aceitável.
- **Mínimo possível**: prefira `eslint-disable-next-line <regra>` com escopo de
  uma linha em vez de `eslint-disable` no arquivo inteiro.
- **Sempre justifique**: termine o comentário com `-- <motivo>` explicando por
  que a supressão é necessária.

## Exemplos existentes

- `e2e/fixtures.ts` — `eslint-disable-next-line react-hooks/rules-of-hooks`
  justificado pela API de fixtures do Playwright.
- `jest.env.ts` — `eslint-disable-next-line @typescript-eslint/no-require-imports`
  para carregar `undici` condicionalmente no setup do Jest.

## Arquivos gerados

Arquivos gerados ou empacotados que disparam lint (ex.: bundles, saídas de
build) devem ser excluídos via `ignores` no flat config do ESLint — nunca
adicionando comentários de ignore ao código-fonte.
