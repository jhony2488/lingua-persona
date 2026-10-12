# Architecture overview

LinguaPersona is divided into three main layers: language model execution, RAG memory, and prompt-based pedagogy.

## Main layers

### 1. Execution engine

Responsible for receiving user text/voice, generating the teacher's response, and managing language models.

- **WebLLM/WebGPU** is the primary engine. Weights are loaded in the browser and inference runs locally on the user's GPU.
- **Transformers.js/ONNX Runtime WebAssembly** is the local CPU fallback when WebGPU is unavailable or WebLLM fails. It selects a smaller ONNX model based on memory and logical processors reported by the browser.
- If WASM is unsupported by the device or fails, the app tries **Ollama** (local server), then a deterministic local teaching reply. WebLLM, WASM, and Ollama can also be selected in chat.
- Selection considers memory capacity, logical processor count, a mobile-device heuristic, and WebGPU support. Weights are downloaded on demand and stored locally by the browser.

### 2. Data and RAG

Stores learning context and retrieves relevant snippets to enrich the prompt.

- **Vector SQLite** stores vectors and metadata.
- **Embeddings** are generated in the browser with **Transformers.js** (e.g., `Xenova/all-MiniLM-L6-v2`).
- RAG searches for past errors, learned vocabulary, and grammar rules related to the user's sentence.

### 3. Pedagogy

Defines how the teacher behaves.

- **Persona**: configurable name, gender, and dialect.
- **System prompt**: a fixed set of rules sent to the model.
- **Techniques**: feedback sandwich, adaptive level, roleplay, and spaced correction loop.

## Interaction flow

1. The user sends a sentence by text or voice.
2. The system detects dialect, gender, and current level.
3. If relevant memory/RAG exists, it is injected into the context.
4. The inference engine generates the teacher's response.
5. The response is shown as text and, optionally, read aloud.
6. The system saves errors and new words for future use.

## Platform and codebase

The app is Next.js (App Router) with localized routes and per-platform persistence:

- **Localized routes**: `src/app/[lang]/` (chat, plan, settings, `~offline`) — `src/proxy.ts` negotiates the locale via header/cookie; dictionaries live in `src/i18n/`.
- **API**: Route Handlers in `src/app/api/` (not localized), domains in `src/modules/<domain>/` (`schema.ts` Zod + `service.ts` + `repository.ts`).
- **Web/dev**: Prisma + `prisma/dev.db`.
- **Desktop (Tauri)**: same backend as a standalone Node sidecar (`127.0.0.1:3111`), SQLite in `appDataDir`.
- **Mobile (Capacitor)**: no server — `src/lib/local-db/` talks directly to `@capacitor-community/sqlite`; `api-client` picks the path via `Capacitor.isNativePlatform()`.
- **Corpus**: public-domain books in `data/library/` (`manifest.json` + `.txt`), fetched by `npm run fetch:books`.

## See also

- [Inference engine](inference-engine.md)
- [RAG and memory](rag-and-memory.md)
- [Pedagogy and prompts](pedagogy-and-prompts.md)
- [Virtual teacher](virtual-teacher.md)
- [Local vector search](local-vector-search.md)
- [PWA and distribution](pwa-and-distribution.md)
- [Testing](testing.md)
