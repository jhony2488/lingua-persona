# Local models

To make WebLLM work offline and avoid rate limits, models are hosted locally in the `public/models/` folder and downloaded with a script.

## Download script

The `scripts/download-mlc-models.mjs` script downloads the files for each model from the Hugging Face repository.

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

Add the script to `package.json`:

```json
{
  "scripts": {
    "download-models": "node scripts/download-mlc-models.mjs",
    "prebuild": "npm run download-models"
  }
}
```

## Browser storage

On first run, WebLLM loads the files from the server and stores them in the browser's **Cache API / IndexedDB**. On subsequent runs, models are read from local cache, enabling offline use.

### Local URLs

With models in `/public/models/`, WebLLM accesses `http://localhost:3000/models/{modelId}/resolve/main/...` instead of fetching from Hugging Face.

## Cache management

The UI can offer:

- Button to "Download for offline use".
- Indicator of used space.
- Option to remove a model from cache.

## Complete flow

1. Developer runs `npm run download-models`.
2. `.wasm` and `.bin` files go to `public/models/`.
3. Static build (`out/`) packages the models.
4. On the user's device, the app caches them for offline use.

## See also

- [Inference engine](inference-engine.md)
- [Hardware guide](hardware-guide.md)
- [PWA and distribution](pwa-and-distribution.md)
