# Como contribuir com o LinguaPersona

Obrigado por querer ajudar a construir o LinguaPersona. Antes de abrir uma issue ou pull request, leia as regras abaixo.

## Antes de começar

1. Verifique se já existe uma issue aberta para o que você quer fazer.
2. Para mudanças grandes, abra uma issue primeiro para discutir a proposta.
3. Sempre escreva em português ou inglês, de forma clara e objetiva.

## Regras de branches

- `main` é a branch principal e deve estar sempre passando nos testes.
- Crie branches a partir da `main`.
- Use nomes descritivos no padrão `tipo/descricao-resumida`:
  - `feat/selecao-sotaque`
  - `fix/traducao-prompt`
  - `docs/rag-sqlite`
  - `refactor/loader-modelo`

## Commits

- Mensagens de commit devem ser claras e explicar o "porquê" da mudança.
- **Todos os commits devem ser escritos apenas em inglês**, no imperativo, com um dos prefixos abaixo:
  - `feat:` — nova funcionalidade — `feat: add Ollama fallback`
  - `bug:` — correção de bug — `bug: fix voice recording timeout`
  - `doc:` — documentação — `doc: update inference engine guide`
  - `chore:` — manutenção e configuração — `chore: update dependencies`
- **Todos os commits devem ser assinados com SSH**. Veja o [guia de configuração](docs/pt/assinatura-ssh.md).

## Padrão de código

- O projeto usa **TypeScript** e **ESLint**.
- Formate o código com **Prettier** antes de abrir o PR:
  ```bash
  npm run format
  ```
- Rode a checagem de formatação, lint e testes:
  ```bash
  npm run format:check
  npm run lint
  npm run test
  ```
- **Git hooks (Husky)**: `pre-commit` roda `npm run lint` e `pre-push` roda
  `npm run test` — commits/pushes que falham na checagem são bloqueados.
  Como o `.npmrc` usa `ignore-scripts=true`, o hook não é instalado
  automaticamente após `npm install`; ative uma vez com:
  ```bash
  npx husky
  ```
- Mantenha componentes pequenos e com responsabilidade única.
- Prefira funções e hooks a classes quando possível.
- Nomeie arquivos e pastas em inglês para manter consistência com o ecossistema (ex.: `inferenceEngine.ts`, `useAgentStore.ts`).

## Testes

- **Toda alteração deve tocar testes**: mudanças em comportamento existente
  devem atualizar os testes correspondentes; novas funcionalidades devem
  adicionar testes novos.
- Testes devem usar **Jest** + **React Testing Library**; testes de API usam
  **Supertest** com o mini-router em `__tests__/helpers/app.ts`.
- Não envie testes dependentes de rede ou GPU.

## Pull Requests

1. Sua branch deve estar atualizada com a `main`.
2. O PR deve descrever o que foi alterado e por quê.
3. Marque pelo menos um revisor.
4. O CI deve passar (lint, testes e build).
5. **Cada PR deve alterar no máximo 20 arquivos.** PRs acima desse limite só são aceitos com uma justificativa muito válida descrita no corpo do PR; quando possível, divida em entregas menores.

## Segurança

- Nunca commite chaves de API, tokens, arquivos `.env` ou dados pessoais.
- Se encontrar uma vulnerabilidade, avise em particular antes de abrir uma issue pública.
- Use variáveis de ambiente para credenciais em ambiente de desenvolvimento.

## Licença

Ao contribuir, você concorda que seu código será licenciado sob a mesma licença do projeto.
