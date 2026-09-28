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
- [How to contribute](CONTRIBUTING.en.md)

For the Portuguese version, see [README.md](README.md) and [docs/pt/](docs/pt/).

## Tech stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router and TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Jest + React Testing Library
- **Local LLM**: [@mlc-ai/web-llm](https://github.com/mlc-ai/web-llm)
- **Database**: SQLite with vector extension (sqlite-vec)
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
```

## License

To be defined.
