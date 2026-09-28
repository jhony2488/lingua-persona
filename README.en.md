# LinguaPersona

Complete English learning and conversation system powered by local AI and vector RAG.

## What is it

**LinguaPersona** is a PWA/Next.js application for chatting with a virtual English teacher ("Alex" or "Alexia"), choosing the dialect (American or British English), and practicing English with real-time feedback. Its key differentiator is the hybrid inference architecture: language models run **directly in the browser** via WebLLM/WebGPU, with a fallback to local Ollama or external APIs when needed.

## Main features

- **Customizable bilingual AI teacher**: name, gender, and dialect adjustable by the user.
- **In-browser local execution**: WebLLM/WebGPU for privacy and low latency.
- **Smart fallback**: local Ollama or external API when the device does not support WebGPU.
- **Vector memory and RAG**: vector SQLite stores errors, vocabulary, and grammar rules for contextual answers.
- **Voice input and output**: Web Speech API for pronunciation and listening practice.
- **Multiplatform distribution**: PWA, Android/iOS (Capacitor), and desktop (Tauri).

## High-level architecture

```
┌─────────────────────────────────────────────┐
│  Next.js PWA / Capacitor / Tauri            │
│  - Chat, settings, and voice UI             │
├─────────────────────────────────────────────┤
│  Inference Engine                           │
│  - WebLLM (primary)                         │
│  - Fallback Ollama / OpenAI / Groq          │
├─────────────────────────────────────────────┤
│  RAG and Memory                             │
│  - Vector SQLite                            │
│  - In-browser embeddings (Transformers.js)  │
├─────────────────────────────────────────────┤
│  Pedagogy                                   │
│  - System prompts, US/UK, feedback sandwich │
└─────────────────────────────────────────────┘
```

## Running locally

Even without programming experience, you can run the project by following the steps below.

### Prerequisites

- **Node.js 20 or newer** — download the LTS version at [nodejs.org](https://nodejs.org). To check if it's already installed, open a terminal and run `node --version`.
- **Git** — download at [git-scm.com](https://git-scm.com). Verify with `git --version`.

### Step by step

1. **Download the project**:

   ```bash
   git clone <repository-url>
   cd linguapersona
   ```

2. **Install dependencies** (downloads everything the project needs):

   ```bash
   npm install
   ```

3. **Create the environment file** — copy the example file:

   - Windows (PowerShell): `Copy-Item .env.example .env`
   - Linux/macOS: `cp .env.example .env`

   The `.env` file already comes configured with `DATABASE_URL="file:./dev.db"`. Since the database is SQLite, **you don't need to install any database server** — data is stored in a local file.

4. **Prepare the database** (creates the tables):

   ```bash
   npm run db:migrate
   ```

5. **Start the application**:

   ```bash
   npm run dev
   ```

6. **Open the browser**: go to `http://localhost:3000`

### Testing the API

With the server running, test the endpoints in your browser or with `curl`:

- `GET /api/health` — server status (`{ "status": "ok" }`)
- `GET /api/users` — list users
- `POST /api/users` — create a user (`email`, `name`, `englishLevel`, `preferredDialect`)
- `GET /api/conversations` — list conversations (accepts `?userId=`)
- `POST /api/conversations` — create a conversation for a user

Example:

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","name":"Ana"}'
```

### Running the tests

```bash
npm run test
```

Tests use a separate SQLite database (`prisma/test.db`), created automatically — nothing to configure.

### Common issues

- **`npm` is not recognized**: close and reopen the terminal after installing Node.js.
- **Port 3000 already in use**: run `npm run dev -- --port 3001` and open `http://localhost:3001`.
- **Database error**: run `npm run db:push` to recreate the tables.
- **Permission denied**: the project does not need an administrator terminal; if the error persists, check your antivirus/firewall.

## Documentation

- [Architecture overview](docs/en/architecture.md)
- [Inference engine](docs/en/inference-engine.md)
- [RAG and memory](docs/en/rag-and-memory.md)
- [Pedagogy and prompts](docs/en/pedagogy-and-prompts.md)
- [Voice and audio](docs/en/voice-and-audio.md)
- [Agent gender](docs/en/agent-gender.md)
- [PWA and distribution](docs/en/pwa-and-distribution.md)
- [Local models](docs/en/local-models.md)
- [Virtual teacher](docs/en/virtual-teacher.md)
- [Local vector search](docs/en/local-vector-search.md)
- [`.npmrc` configuration](docs/en/npmrc.md)
- [SSH signing for commits](docs/en/ssh-signing.md)
- [How to contribute](CONTRIBUTING.en.md)

For the Portuguese version, see [README.md](README.md) and [docs/pt/](docs/pt/).

## Tech stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router and TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Jest + React Testing Library
- **PWA**: [Serwist](https://serwist.pages.dev) (`@serwist/turbopack`)
- **State**: [TanStack Query](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs)
- **UI**: [shadcn/ui](https://ui.shadcn.com) (Base UI)
- **Local LLM**: [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm)
- **Database**: SQLite via [Prisma ORM](https://www.prisma.io) (vector extension planned)
- **Validation**: [Zod](https://zod.dev)
- **Network mocking**: [MSW](https://mswjs.io)
- **Embeddings**: Transformers.js (Xenova/all-MiniLM-L6-v2)
- **Voice**: Web Speech API
- **Mobile distribution**: Capacitor
- **Desktop distribution**: Tauri

## Available scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run format       # Format project with Prettier
npm run format:check # Check formatting
npm run db:migrate   # Create/apply Prisma migrations
npm run db:push      # Sync schema to the database (no migration)
npm run db:generate  # Generate the Prisma Client
```

## CI/CD

- **CI**: `.github/workflows/ci.yml` — lint, format:check, tests and build on push/PR to `master`.
- **Release**: `.github/workflows/release.yml` — on `v*.*.*` tags, produces `app-release.pk`, `app-release.rxe` and `SHA256SUMS.txt`, and publishes the GitHub Release.

## License

[GNU GPL v3](LICENSE).
