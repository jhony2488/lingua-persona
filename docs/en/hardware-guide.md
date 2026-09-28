# Hardware and model guide

You do not need a powerful computer to run LinguaPersona. This guide helps you pick the right model for your hardware, whether running in the browser (WebLLM), on Ollama, or on another local API.

## Why small models work well here

Models with 1B–3B parameters may look "weak" on paper, but in this app they deliver good performance for four reasons:

- **RAG**: the student's past errors, learned vocabulary, and grammar rules are retrieved and injected into the prompt. The model does not need to "know everything" — the right context arrives ready in the window.
- **Narrow task**: the model only needs to be an English teacher. Structured system prompts (feedback sandwich, adaptive level, US/UK) constrain the response space, where small models perform well.
- **Quantization**: 4-bit formats (`q4f16` in WebLLM, `Q4_K_M` in GGUF) reduce memory usage ~4x with minimal quality loss.
- **KV cache / prompt caching**: the system prompt is reused across turns, so per-message latency drops significantly even on CPU.

## Models for Ollama

With [Ollama](https://ollama.com) installed, pull a model with `ollama pull <tag>` and the app uses it via `http://localhost:11434` when WebGPU is unavailable or when you prefer it.

| Model          | Download | Min RAM | Recommended RAM | Notes                                |
| -------------- | -------- | ------- | --------------- | ------------------------------------ |
| `smollm2:360m` | ~270 MB  | 1 GB    | 2 GB            | Very weak devices, CPU-only          |
| `qwen2.5:0.5b` | ~400 MB  | 1 GB    | 2 GB            | CPU-only, simple responses           |
| `llama3.2:1b`  | ~1.3 GB  | 2 GB    | 4 GB            | Best value for weak hardware         |
| `qwen2.5:1.5b` | ~1 GB    | 2 GB    | 4 GB            | Good instruction following           |
| `gemma2:2b`    | ~1.6 GB  | 3 GB    | 4–6 GB          | —                                    |
| `llama3.2:3b`  | ~2 GB    | 4 GB    | 6–8 GB          | **General recommendation**           |
| `phi3:mini`    | ~2.3 GB  | 4 GB    | 6–8 GB          | Good at instructed tasks             |
| `qwen2.5:7b`   | ~4.7 GB  | 8 GB    | 16 GB           | GPU recommended; slow on CPU         |
| `llama3.1:8b`  | ~4.9 GB  | 8 GB    | 16 GB           | GPU recommended                      |
| `qwen2.5:14b`  | ~9 GB    | 16 GB   | 32 GB           | Strong hardware / dedicated GPU only |

Values are approximate. Rule of thumb: RAM usage is the **quantized model size + ~1–2 GB of context (KV cache) + headroom for the operating system**. This follows Ollama's official guidance: ~8 GB of RAM for 7B models, ~16 GB for 13B, and ~32 GB for 33B.

### Largest model your hardware can handle

| Available memory | Largest comfortable model (q4) |
| ---------------- | ------------------------------ |
| 4 GB RAM         | Up to ~3B (`llama3.2:3b`)      |
| 8 GB RAM         | Up to ~7–8B (`qwen2.5:7b`)     |
| 16 GB RAM        | Up to ~14B (`qwen2.5:14b`)     |
| 32 GB+ RAM       | 33B+ or unquantized models     |

With a GPU, the limit is VRAM: the same table applies substituting RAM for VRAM, as long as the VRAM fits model + context.

### How to install and use Ollama

1. **Install**:
   - **Windows/macOS**: download the installer from [ollama.com/download](https://ollama.com/download) and run it (no administrator rights needed on Windows).
   - **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`
2. **Verify**: Ollama runs in the background and serves the API at `http://localhost:11434`. Check with `ollama -v` or by opening `http://localhost:11434` in the browser.
3. **Pull a model** from the table above (or the [model library](https://ollama.com/library)):

   ```bash
   ollama pull llama3.2:3b
   ```

4. **Test it** by chatting right in the terminal:

   ```bash
   ollama run llama3.2:3b
   ```

5. **Done** — with Ollama running, the app detects it as a fallback automatically.

Useful commands:

| Command               | What it does                |
| --------------------- | --------------------------- |
| `ollama list`         | Lists downloaded models     |
| `ollama ps`           | Shows models loaded in RAM  |
| `ollama stop <model>` | Unloads a model from memory |
| `ollama rm <model>`   | Deletes a model from disk   |
| `ollama serve`        | Starts the server manually  |

### Tutorials and videos

- [Official quickstart](https://docs.ollama.com/quickstart) — install and first chat.
- [Video: Learn Ollama in 10 Minutes](https://www.youtube.com/watch?v=AGAETsxjg0o) — install on Windows/Mac/Linux, pull and run models, CLI and server.
- [Video: Ollama Tutorial for Beginners](https://www.youtube.com/watch?v=fU38n-CH7ds) — step-by-step install, model download and API test.
- [Model library](https://ollama.com/library) — full catalog to pick tags.

## Other compatible local APIs

Any local server with an **OpenAI-compatible** API works as a backend: [LM Studio](https://lmstudio.ai), llama.cpp's `llama-server`, Jan, etc.

- Use the same models in **GGUF** format, preferably `Q4_K_M` quantization.
- The same RAM table applies — llama.cpp memory usage is equivalent to Ollama's.
- Configure the endpoint (e.g., `http://localhost:1234/v1`) and key in the app's environment variables.

## WebLLM (browser)

MLC models run on the browser's GPU via WebGPU, with no installation. Recap:

| Model                               | Approximate size | Device profile                                |
| ----------------------------------- | ---------------- | --------------------------------------------- |
| `SmolLM2-360M-Instruct-q4f32_1-MLC` | ~270 MB          | Weak devices or devices without dedicated GPU |
| `Llama-3.2-1B-Instruct-q4f16_1-MLC` | ~800 MB          | Tablets and common notebooks                  |
| `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | ~1.1 GB          | Better notebooks                              |
| `Llama-3.2-3B-Instruct-q4f16_1-MLC` | ~2 GB            | Desktops with dedicated GPU                   |

Details in [Inference engine](inference-engine.md) and [Local models](local-models.md).

## Quick decision guide

- **Weak PC, 4 GB RAM, no GPU**: Ollama with `llama3.2:1b` or `smollm2:360m`. In the browser, `SmolLM2-360M` if WebGPU works.
- **Common notebook, 8 GB RAM**: Ollama with `llama3.2:3b` or `qwen2.5:1.5b`; WebLLM with `Llama-3.2-1B`.
- **Good PC, 16 GB RAM or GPU with 8 GB VRAM**: Ollama with `qwen2.5:7b`/`llama3.1:8b`; WebLLM with `Llama-3.2-3B`.
- **Strong hardware, 32 GB+ or GPU with 12 GB+ VRAM**: `qwen2.5:14b` for maximum quality.

## See also

- [Inference engine](inference-engine.md)
- [Local models](local-models.md)
- [RAG and memory](rag-and-memory.md)
- [Architecture overview](architecture.md)
