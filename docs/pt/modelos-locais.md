# Modelos locais

O WebLLM resolve os pesos do modelo em runtime, nesta ordem:

1. **`public/models/`** — se `public/models/manifest.json` existir e contiver o `modelId`, os arquivos são servidos localmente (`/models/<id>/resolve/main/...`), permitindo uso 100% offline desde o primeiro acesso.
2. **Hugging Face** — sem manifest local, o `prebuiltAppConfig` baixa do HF na primeira execução e o WebLLM guarda no **Cache API / IndexedDB** do navegador/webview para uso offline nas vezes seguintes.
3. **Fallback** — se WebGPU ou o download WebLLM falhar, a cadeia tenta WASM → Ollama → resposta local, ver [Motor de inferência](motor-de-inferencia.md).

## Modelos ONNX para WASM

O fallback em CPU usa Transformers.js e ONNX Runtime WebAssembly, com modelos próprios hospedados no Hugging Face. Eles não são incluídos no catálogo MLC nem no script `npm run download-models`.

| Perfil       | Modelo                                 | Arquivo quantizado    |
| ------------ | -------------------------------------- | --------------------- |
| tiny/small   | `onnx-community/Qwen2.5-0.5B-Instruct` | ONNX `q4f16`, ~483 MB |
| medium/large | `onnx-community/Qwen2.5-1.5B-Instruct` | ONNX `q4f16`, ~1,4 GB |

Transformers.js baixa o modelo sob demanda e usa o cache do navegador para reutilizá-lo. O primeiro uso precisa de conexão; depois, a inferência pode funcionar offline enquanto os pesos permanecerem no cache. O tamanho escolhido respeita o tier, a memória e os núcleos reportados pelo dispositivo. Confira os limites em [Guia de hardware](guia-de-hardware.md).

## Script de download (self-hosting opcional)

O script `scripts/download-mlc-models.mjs` baixa os arquivos de cada modelo do Hugging Face para `public/models/` e gera o `manifest.json` que o runtime usa para detectar o self-hosting.

### Modelos padrão

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

### Rodando o download

```bash
npm run download-models
```

Ao final, o script escreve `public/models/manifest.json` no formato
`{ "models": [{ "modelId": "...", "modelLib": "....wasm" }] }`.

> **Atenção ao tamanho**: embutir modelos em `public/models/` infla o
> instalador (270 MB–2 GB por modelo). O default recomendado é o download
> sob demanda do Hugging Face — use o script só se precisar de offline
> total no primeiro uso.

Esse script só baixa modelos WebLLM/MLC. Ele não self-hospeda os modelos ONNX usados pelo fallback WASM.

## Armazenamento no navegador

Na primeira execução via HF, o WebLLM baixa os arquivos e os guarda no **Cache API / IndexedDB** do navegador. Nas vezes seguintes, os modelos são lidos do cache local, permitindo uso offline.

## Fluxo completo (self-hosted)

1. Desenvolvedor roda `npm run download-models`.
2. Arquivos `.bin`/configs vão para `public/models/<id>/resolve/main/` e a `.wasm` para `public/models/libs/`; o `manifest.json` é gerado.
3. Build estático (`out/`) e standalone empacotam os modelos em `public/`.
4. No dispositivo do usuário, o app detecta o manifest e serve localmente.

## Veja também

- [Motor de inferência](motor-de-inferencia.md)
- [Guia de hardware](guia-de-hardware.md)
- [PWA e distribuição](pwa-e-distribuicao.md)
