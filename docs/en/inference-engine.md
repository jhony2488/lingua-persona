# Inference engine

The inference engine picks and runs the most suitable language model for the user's device and context. All generation happens **client-side** (webview/browser) — the API only persists messages.

## WebLLM as the main layer

[WebLLM](https://github.com/mlc-ai/web-llm) runs language models directly in the browser using WebGPU. This eliminates server cost and reduces network latency. The engine runs in a **Web Worker** (`src/lib/llm/webllm.worker.ts`) so the UI stays responsive; if the bundler/environment does not support the worker, it falls back to the main thread.

```ts
// src/lib/llm/webllm.engine.ts — simplified
const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
  appConfig, // /models/* when a local manifest exists, else Hugging Face
  initProgressCallback: (report) =>
    store.setProgress(report.progress, report.text),
});
const completion = await engine.chat.completions.create({
  messages,
  temperature,
  max_tokens,
});
```

### Device-aware model selection

The model is chosen automatically from device capability (`detectDeviceCapabilities` in `src/lib/llm/models.ts`): `navigator.deviceMemory`, `hardwareConcurrency`, and a mobile heuristic (Capacitor/mobile UA downgrades one tier). The user can override it in the chat header selector.

| Tier   | Model                               | Size    | Device profile                 |
| ------ | ----------------------------------- | ------- | ------------------------------ |
| tiny   | `SmolLM2-360M-Instruct-q4f32_1-MLC` | ~270 MB | Weak devices, no dedicated GPU |
| small  | `Llama-3.2-1B-Instruct-q4f16_1-MLC` | ~800 MB | Tablets and common notebooks   |
| medium | `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | ~1.1 GB | Better notebooks               |
| large  | `Llama-3.2-3B-Instruct-q4f16_1-MLC` | ~2 GB   | Desktop with dedicated GPU     |

Each tier carries its own budget: `maxHistory` (4–12 messages), `maxTokens` (256–512), and `temperature` — see `LLM_MODELS`.

## WASM as a CPU fallback

When WebGPU is unavailable or WebLLM fails, the app tries Transformers.js with ONNX Runtime in **WebAssembly**, inside a Web Worker. This path uses its own ONNX models, not WebLLM's MLC artifacts.

| Profile      | ONNX model                                       | Approximate size | Minimum requirements                                 |
| ------------ | ------------------------------------------------ | ---------------- | ---------------------------------------------------- |
| tiny/small   | `onnx-community/Qwen2.5-0.5B-Instruct` (`q4f16`) | ~483 MB          | 4 GB memory or more; 4 threads or more when reported |
| medium/large | `onnx-community/Qwen2.5-1.5B-Instruct` (`q4f16`) | ~1.4 GB          | 8 GB memory and 6 threads or more                    |

Selection reuses the device tier and the tier requested in the existing model selector, but never chooses a model above detected capacity. If only the smaller model fits, it is used; if available signals are insufficient or the device falls below the minimum, the router skips WASM and tries Ollama/local fallback. CPU inference is expected to be slower than WebGPU.

## Fallback chain

The router (`src/lib/llm/router.ts`) tries in order and never fails:

1. **WebLLM** — when `navigator.gpu.requestAdapter()` returns an adapter.
2. **WASM** — Transformers.js/ONNX Runtime, with model size selected from memory and CPU capability.
3. **Ollama** — non-native shells only; probes `GET /api/tags` at `http://localhost:11434` (2s) and picks among the **installed models** by preference for the detected tier.
4. **Local** — `generateAssistantReply`, a deterministic "offline mode" reply that keeps the chat functional.

The user's preference (`settings.llmEngine`: `auto | webllm | wasm | ollama | local`) selects the preferred path; `auto` tries WebLLM and WASM before Ollama. WebLLM and WASM can also be selected individually in the chat header.

## Where generation happens

`api.sendMessage` (`src/lib/api-client.ts`) orchestrates: persists the user message → `generateChatReply` produces the reply → persists the assistant message. `POST /api/conversations/:id/messages` accepts `{content, role}` and stores one message per call — the teacher's reply is never generated on the server, keeping web/desktop/mobile at parity.

## Optimizations

- **KV cache / prompt caching**: the system prompt and fixed instructions are preprocessed and reused across turns.
- **Web Workers**: WebLLM and tokenization run off the main thread.
- **Quantization**: 4-bit models (q4f16) are the default.
- **On-demand download**: weights come from Hugging Face on first use and stay in the Cache API/IndexedDB; `npm run download-models` enables self-hosting.
- **Background preload**: `ModelPreloader` (`src/components/model-preloader.tsx`, mounted in the localized layout) starts `initWebLLM` at idle time when any page opens, so the first reply doesn't wait for the download. It respects the engine preference (`ollama`/`local` skip it), WebGPU availability, and `navigator.connection.saveData`. A failed init clears the engine singleton so the next message can retry.

## WebLLM vs Ollama

| Aspect        | WebLLM                 | WASM/Transformers.js | Ollama                 |
| ------------- | ---------------------- | -------------------- | ---------------------- |
| Location      | In the browser         | In the browser       | Local server           |
| Hardware      | WebGPU                 | CPU via WebAssembly  | Local CPU/GPU          |
| Format        | MLC                    | Quantized ONNX       | GGUF                   |
| System prompt | `messages[0]` (system) | Model chat template  | `messages[0]` (system) |
| Cache         | Engine KV cache        | Browser Cache API    | llama.cpp KV cache     |

## See also

- [Hardware guide](hardware-guide.md)
- [Local models](local-models.md)
- [PWA and distribution](pwa-and-distribution.md)
