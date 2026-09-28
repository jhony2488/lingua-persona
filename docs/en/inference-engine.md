# Inference engine

The inference engine chooses and runs the most suitable language model for the device and user context.

## WebLLM as the main layer

[WebLLM](https://github.com/mlc-ai/web-llm) runs language models directly in the browser using WebGPU. This eliminates server costs and reduces network latency.

```ts
import { CreateMLCEngine } from "@mlc-ai/web-llm";

const engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC", {
  appConfig: {
    model_list: [
      {
        model_id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
        model: "/models/Llama-3.2-1B-Instruct-q4f16_1-MLC",
        overrides: {
          system_prompt: "You are Alex, an expert English teacher...",
          temperature: 0.6,
        },
      },
    ],
  },
});
```

### Suggested models

The model choice depends on VRAM and WebGPU support:

| Model                               | Approximate size | Recommended use                               |
| ----------------------------------- | ---------------- | --------------------------------------------- |
| `SmolLM2-360M-Instruct-q4f32_1-MLC` | ~270 MB          | Weak devices or devices without dedicated GPU |
| `Llama-3.2-1B-Instruct-q4f16_1-MLC` | ~800 MB          | Tablets and common notebooks                  |
| `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | ~1.1 GB          | Better notebooks                              |
| `Llama-3.2-3B-Instruct-q4f16_1-MLC` | ~2 GB            | Desktops with dedicated GPU                   |

## Fallback

When WebGPU is not available, the system tries:

1. **Ollama** running on the same device (`http://localhost:11434`).
2. **External API** (OpenAI, Groq, etc.), configured through an environment variable.

The fallback logic is transparent to the UI: the interface calls the same `generateResponse`, but the engine chooses the backend.

## Optimizations

- **KV cache / prompt caching**: system prompt and fixed instructions are pre-processed and reused across turns.
- **Web Workers**: WebLLM and tokenization run off the main thread to avoid freezing the UI.
- **Quantization**: 4-bit models (q4f16) are the default to balance size and quality.

## Differences between WebLLM and Ollama

| Aspect        | WebLLM                    | Ollama                              |
| ------------- | ------------------------- | ----------------------------------- |
| Local         | In browser                | Local server                        |
| Hardware      | WebGPU                    | Local CPU/GPU                       |
| System prompt | `overrides.system_prompt` | Model with configured system prompt |
| Cache         | Engine KV cache           | llama.cpp KV cache                  |

## See also

- [Local models](local-models.md)
- [PWA and distribution](pwa-and-distribution.md)
