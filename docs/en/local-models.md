# Local models

WebLLM resolves model weights at runtime, in this order:

1. **`public/models/`** — if `public/models/manifest.json` exists and contains the `modelId`, files are served locally (`/models/<id>/resolve/main/...`), enabling fully offline first use.
2. **Hugging Face** — without a local manifest, `prebuiltAppConfig` downloads from HF on first run and WebLLM stores it in the browser/webview **Cache API / IndexedDB** for offline reuse.
3. **Fallback** — if WebGPU or the WebLLM download fails, the engine chain tries WASM → Ollama → local reply; see [Inference engine](inference-engine.md).

## ONNX models for WASM

The CPU fallback uses Transformers.js and ONNX Runtime WebAssembly, with separate models hosted on Hugging Face. These models are not part of the MLC catalog or the `npm run download-models` script.

| Profile      | Model                                  | Quantized file        |
| ------------ | -------------------------------------- | --------------------- |
| tiny/small   | `onnx-community/Qwen2.5-0.5B-Instruct` | ONNX `q4f16`, ~483 MB |
| medium/large | `onnx-community/Qwen2.5-1.5B-Instruct` | ONNX `q4f16`, ~1.4 GB |

Transformers.js downloads the model on demand and reuses the browser cache. The first use needs a connection; afterward, inference can work offline while the weights remain cached. Model size respects the device tier, memory, and logical processors reported by the browser. See the [Hardware guide](hardware-guide.md) for limits.

## Download script (optional self-hosting)

The `scripts/download-mlc-models.mjs` script downloads each model's files from Hugging Face into `public/models/` and generates the `manifest.json` the runtime uses to detect self-hosting.

### Default models

```js
const MODEL_IDS = [
  "SmolLM2-360M-Instruct-q4f32_1-MLC",
  "Llama-3.2-1B-Instruct-q4f32_1-MLC",
  "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  "Phi-3.5-mini-instruct-q4f16_1-MLC",
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
];
```

### Running the download

```bash
npm run download-models
```

At the end, the script writes `public/models/manifest.json` in the format
`{ "models": [{ "modelId": "...", "modelLib": "....wasm" }] }`.

> **Size warning**: bundling models in `public/models/` inflates the
> installer (270 MB–2 GB per model). The recommended default is on-demand
> download from Hugging Face — use the script only if you need fully
> offline first use.

This script downloads WebLLM/MLC models only. It does not self-host the ONNX models used by the WASM fallback.

## Browser storage

On first run via HF, WebLLM downloads the files and stores them in the browser's **Cache API / IndexedDB**. Subsequent runs read from the local cache, enabling offline use.

## Full flow (self-hosted)

1. Developer runs `npm run download-models`.
2. `.bin`/config files go to `public/models/<id>/resolve/main/` and the `.wasm` to `public/models/libs/`; `manifest.json` is generated.
3. Static export (`out/`) and standalone builds package the models inside `public/`.
4. On the user's device, the app detects the manifest and serves locally.

## See also

- [Inference engine](inference-engine.md)
- [Hardware guide](hardware-guide.md)
- [PWA and distribution](pwa-and-distribution.md)
