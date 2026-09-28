# LinguaPersona

Sistema completo de aprendizado e conversação em inglês, alimentado por IA local e RAG vetorial.

## O que é

O **LinguaPersona** é uma aplicação PWA/Next.js que permite conversar com um professor de inglês virtual ("Alex" ou "Alexia"), escolher o sotaque (American English ou British English) e treinar inglês com feedback em tempo real. O diferencial é a arquitetura híbrida de inferência: modelos de linguagem rodam **diretamente no navegador** via WebLLM/WebGPU, com fallback para Ollama local ou APIs externas quando necessário.

## Principais recursos

- **Professor AI bilingue personalizável**: nome, gênero e sotaque ajustáveis pelo usuário.
- **Execução local no navegador**: WebLLM/WebGPU para privacidade e latência baixa.
- **Fallback inteligente**: Ollama local ou API externa quando o dispositivo não suporta WebGPU.
- **Memória e RAG vetorial**: SQLite vetorial armazena erros, vocabulário e regras gramaticais para respostas contextualizadas.
- **Entrada e saída de voz**: Web Speech API para prática de pronúncia e escuta.
- **Distribuição multiplataforma**: PWA, Android/iOS (Capacitor) e desktop (Tauri).

## Arquitetura de alto nível

```
┌─────────────────────────────────────────────┐
│  Next.js PWA / Capacitor / Tauri            │
│  - UI de chat, configuração e voz           │
├─────────────────────────────────────────────┤
│  Engine de Inferência                       │
│  - WebLLM (principal)                       │
│  - Fallback Ollama / OpenAI / Groq          │
├─────────────────────────────────────────────┤
│  RAG e Memória                              │
│  - SQLite vetorial                          │
│  - Embeddings no navegador (Transformers.js)│
├─────────────────────────────────────────────┤
│  Pedagogia                                  │
│  - System Prompts, US/UK, feedback sandwich │
└─────────────────────────────────────────────┘
```

## Como rodar localmente

Mesmo sem experiência com programação, você consegue rodar o projeto seguindo os passos abaixo.

### Pré-requisitos

- **Node.js 22 ou superior** — baixe a versão LTS em [nodejs.org](https://nodejs.org). Para conferir se já está instalado, abra o terminal e rode `node --version`.
- **Git** — baixe em [git-scm.com](https://git-scm.com). Verifique com `git --version`.

### Passo a passo

1. **Baixe o projeto**:

   ```bash
   git clone <url-do-repositorio>
   cd linguapersona
   ```

2. **Instale as dependências** (baixa tudo que o projeto precisa):

   ```bash
   npm install
   ```

3. **Crie o arquivo de ambiente** — copie o arquivo de exemplo:

   - Windows (PowerShell): `Copy-Item .env.example .env`
   - Linux/macOS: `cp .env.example .env`

   O `.env` já vem configurado com `DATABASE_URL="file:./dev.db"`. Como o banco é SQLite, **não é preciso instalar nenhum servidor de banco de dados** — os dados ficam em um arquivo local.

4. **Prepare o banco de dados** (cria as tabelas):

   ```bash
   npm run db:migrate
   ```

5. **Inicie a aplicação**:

   ```bash
   npm run dev
   ```

6. **Abra no navegador**: acesse `http://localhost:3000`

### Testando a API

Com o servidor rodando, teste os endpoints no navegador ou com `curl`:

- `GET /api/health` — status do servidor (`{ "status": "ok" }`)
- `GET /api/users` — lista usuários
- `POST /api/users` — cria usuário (`email`, `name`, `englishLevel`, `preferredDialect`)
- `GET /api/conversations` — lista conversas (aceita `?userId=`)
- `POST /api/conversations` — cria conversa para um usuário

Exemplo:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","name":"Ana"}'
```

### Rodando os testes

```bash
npm run test
```

Os testes usam um banco SQLite separado (`prisma/test.db`), criado automaticamente — nada a configurar.

### Problemas comuns

- **`npm` não é reconhecido**: feche e reabra o terminal depois de instalar o Node.js.
- **Porta 3000 já está em uso**: rode `npm run dev -- --port 3001` e acesse `http://localhost:3001`.
- **Erro de banco de dados**: rode `npm run db:push` para recriar as tabelas.
- **Permissão negada**: o projeto não precisa de terminal administrador; se o erro persistir, verifique antivírus/firewall.

## Documentação

- [Visão geral da arquitetura](docs/pt/arquitetura.md)
- [Motor de inferência](docs/pt/motor-de-inferencia.md)
- [RAG e memória](docs/pt/rag-e-memoria.md)
- [Pedagogia e prompts](docs/pt/pedagogia-e-prompts.md)
- [Voz e áudio](docs/pt/voz-e-audio.md)
- [Gênero do agente](docs/pt/genero-do-agente.md)
- [PWA e distribuição](docs/pt/pwa-e-distribuicao.md)
- [Modelos locais](docs/pt/modelos-locais.md)
- [Guia de hardware e modelos](docs/pt/guia-de-hardware.md)
- [Professor virtual](docs/pt/professor-virtual.md)
- [Pesquisa vetorial local](docs/pt/pesquisa-vetorial-local.md)
- [Configuração do `.npmrc`](docs/pt/npmrc.md)
- [Assinatura SSH para commits](docs/pt/assinatura-ssh.md)
- [Diretivas de ignore](docs/pt/diretivas-de-ignore.md)
- [Testes](docs/pt/testes.md)
- [Como contribuir](CONTRIBUTING.md)

Para a versão em inglês, veja [README.en.md](README.en.md) e [docs/en/](docs/en/).

## Stack tecnológico

- **Framework**: [Next.js 16](https://nextjs.org) com App Router e TypeScript
- **Estilização**: Tailwind CSS v4
- **Testes**: Jest + React Testing Library
- **PWA**: [Serwist](https://serwist.pages.dev) (`@serwist/turbopack`)
- **Estado**: [TanStack Query](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs)
- **UI**: [shadcn/ui](https://ui.shadcn.com) (Base UI)
- **LLM local**: [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm)
- **Banco de dados**: SQLite via [Prisma ORM](https://www.prisma.io) (extensão vetorial planejada)
- **Validação**: [Zod](https://zod.dev)
- **Mocks de rede**: [MSW](https://mswjs.io)
- **Embeddings**: Transformers.js (Xenova/all-MiniLM-L6-v2)
- **Voz**: Web Speech API
- **Distribuição mobile**: Capacitor
- **Distribuição desktop**: Tauri

## Scripts disponíveis

```bash
npm run dev          # Inicia o servidor de desenvolvimento
npm run build        # Gera build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Roda ESLint
npm run test         # Roda testes com Jest
npm run format       # Formata o projeto com Prettier
npm run format:check # Verifica formatação
npm run db:migrate   # Cria/aplica migrações do Prisma
npm run db:push      # Sincroniza schema com o banco (sem migração)
npm run db:generate  # Gera o Prisma Client
```

## CI/CD

- **CI**: `.github/workflows/ci.yml` — lint, format:check, testes e build em push/PR para `master`.
- **Release**: `.github/workflows/release.yml` — em tags `v*.*.*`, gera `app-release.pk`, `app-release.rxe` e `SHA256SUMS.txt`, e publica a Release no GitHub.

## Licença

[GNU GPL v3](LICENSE).
