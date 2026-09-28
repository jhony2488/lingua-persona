# Modelos locais

Para que o WebLLM funcione offline e sem rate-limits, os modelos são hospedados localmente na pasta `public/models/` e baixados com um script.

## Script de download

O script `scripts/download-mlc-models.mjs` faz o download dos arquivos de cada modelo a partir do repositório no Hugging Face.

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

Recomenda-se adicionar o script ao `package.json`:

```json
{
  "scripts": {
    "download-models": "node scripts/download-mlc-models.mjs",
    "prebuild": "npm run download-models"
  }
}
```

## Armazenamento no navegador

Na primeira execução, o WebLLM carrega os arquivos do servidor e os guarda no **Cache API / IndexedDB** do navegador. Nas vezes seguintes, os modelos são lidos do cache local, permitindo uso offline.

### URLs locais

Com os modelos em `/public/models/`, o WebLLM acessa `http://localhost:3000/models/{modelId}/resolve/main/...` em vez de buscar no Hugging Face.

## Gerenciamento de cache

A UI pode oferecer:

- Botão "Baixar para uso offline".
- Indicador de espaço usado.
- Opção de remover um modelo do cache.

## Fluxo completo

1. Desenvolvedor roda `npm run download-models`.
2. Arquivos `.wasm` e `.bin` vão para `public/models/`.
3. Build estático (`out/`) empacota os modelos.
4. No dispositivo do usuário, o app faz cache para uso offline.

## Veja também

- [Motor de inferência](motor-de-inferencia.md)
- [Guia de hardware](guia-de-hardware.md)
- [PWA e distribuição](pwa-e-distribuicao.md)
