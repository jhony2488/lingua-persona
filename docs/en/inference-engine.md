# Inference engine

The inference engine picks and runs the most suitable language model for the user's device and context. All generation happens **client-side** (webview/browser) — the API only persists messages.

## WebLLM as the main layer

[WebLLM](https://github.com/mlc-ai/web-llm) runs language models directly in the browser using WebGPU. This eliminates server cost and reduces network latency. The engine runs in a **Web Worker** (`src/lib/llm/webllm.worker.ts`) so the UI stays responsive; if the bundler/environment does not support the worker, it falls back to the main thread.

```ts
// src/lib/llm/webllm.engine.ts — simplified
const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
  appConfig, // /models/* when a local manifest exists, else Hugging Face
  initProgressCallback: (report) => store.setProgress(report.progress, report.text),
});
const completion = await engine.chat.completions.create({ messages, temperature, max_tokens });
```

### Device-aware model selection

The model is chosen automatically from device capability (`detectDeviceCapabilities` in `src/lib/llm/models.ts`): `navigator.deviceMemory`, `hardwareConcurrency`, and a mobile heuristic (Capacitor/mobile UA downgrades one tier). The user can override it in the chat header selector.

| Tier   | Model                               | Size     | Device profile                     |
| ------ | ----------------------------------- | -------- | ---------------------------------- |
| tiny   | `SmolLM2-360M-Instruct-q4f32_1-MLC` | ~270 MB  | Weak devices, no dedicated GPU     |
| small  | `Llama-3.2-1B-Instruct-q4f16_1-MLC` | ~800 MB  | Tablets and common notebooks       |
| medium | `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | ~1.1 GB  | Better notebooks                   |
| large  | `Llama-3.2-3B-Instruct-q4f16_1-MLC` | ~2 GB    | Desktop with dedicated GPU         |

Each tier carries its own budget: `maxHistory` (4–12 messages), `maxTokens` (256–512), and `temperature` — see `LLM_MODELS`.

## Fallback chain

The router (`src/lib/llm/router.ts`) tries in order and never fails:

1. **WebLLM** — when `navigator.gpu.requestAdapter()` returns an adapter.
2. **Ollama** — non-native shells only; probes `GET /api/tags` at `http://localhost:11434` (2s) and picks among the **installed models** by preference for the detected tier.
3. **Local** — `generateAssistantReply`, a deterministic "offline mode" reply that keeps the chat functional.

The user's preference (`settings.llmEngine`: `auto | webllm | ollama | local`) can force a path; `auto` walks the whole chain.

## Where generation happens

`api.sendMessage` (`src/lib/api-client.ts`) orchestrates: persists the user message → `generateChatReply` produces the reply → persists the assistant message. `POST /api/conversations/:id/messages` accepts `{content, role}` and stores one message per call — the teacher's reply is never generated on the server, keeping web/desktop/mobile at parity.

## Optimizations

- **KV cache / prompt caching**: the system prompt and fixed instructions are preprocessed and reused across turns.
- **Web Workers**: WebLLM and tokenization run off the main thread.
- **Quantization**: 4-bit models (q4f16) are the default.
- **On-demand download**: weights come from Hugging Face on first use and stay in the Cache API/IndexedDB; `npm run download-models` enables self-hosting.

## WebLLM vs Ollama

| Aspect        | WebLLM                 | Ollama                       |
| ------------- | ---------------------- | ---------------------------- |
| Location      | In the browser         | Local server                 |
| Hardware      | WebGPU                 | Local CPU/GPU                |
| System prompt | `messages[0]` (system) | `messages[0]` (system)       |
| Cache         | Engine KV cache        | llama.cpp KV cache           |

## See also

- [Hardware guide](hardware-guide.md)
- [Local models](local-models.md)
- [PWA and distribution](pwa-and-distribution.md)
