# Motor de inferência

O motor de inferência escolhe e executa o modelo de linguagem mais adequado para o dispositivo e o contexto do usuário. Toda a geração acontece **no cliente** (webview/navegador) — a API só persiste mensagens.

## WebLLM como camada principal

O [WebLLM](https://github.com/mlc-ai/web-llm) executa modelos de linguagem diretamente no navegador usando WebGPU. Isso elimina custo de servidor e reduz a latência de rede. O engine roda num **Web Worker** (`src/lib/llm/webllm.worker.ts`) para não travar a UI; se o bundler/ambiente não suportar o worker, cai para a main thread.

```ts
// src/lib/llm/webllm.engine.ts — simplificado
const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
  appConfig, // /models/* se houver manifest local, senão Hugging Face
  initProgressCallback: (report) =>
    store.setProgress(report.progress, report.text),
});
const completion = await engine.chat.completions.create({
  messages,
  temperature,
  max_tokens,
});
```

### Seleção de modelo por dispositivo

O modelo é escolhido automaticamente pela capacidade do dispositivo (`detectDeviceCapabilities` em `src/lib/llm/models.ts`): `navigator.deviceMemory`, `hardwareConcurrency` e heurística mobile (rebaixa um tier no Capacitor/UA móvel). O usuário pode sobrescrever pelo seletor no header do chat.

| Tier   | Modelo                              | Tamanho | Perfil                       |
| ------ | ----------------------------------- | ------- | ---------------------------- |
| tiny   | `SmolLM2-360M-Instruct-q4f32_1-MLC` | ~270 MB | Dispositivos fracos, sem GPU |
| small  | `Llama-3.2-1B-Instruct-q4f16_1-MLC` | ~800 MB | Tablets e notebooks comuns   |
| medium | `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | ~1,1 GB | Notebooks melhores           |
| large  | `Llama-3.2-3B-Instruct-q4f16_1-MLC` | ~2 GB   | Desktop com GPU dedicada     |

Cada tier carrega seu próprio orçamento: `maxHistory` (4–12 mensagens), `maxTokens` (256–512) e `temperature` — ver `LLM_MODELS`.

## WASM como fallback de CPU

Quando WebGPU não está disponível ou o WebLLM falha, o app tenta Transformers.js com ONNX Runtime em **WebAssembly**, dentro de um Web Worker. Esse caminho usa modelos ONNX próprios, não os arquivos MLC do WebLLM.

| Perfil       | Modelo ONNX                                      | Tamanho aproximado | Requisitos mínimos                                           |
| ------------ | ------------------------------------------------ | ------------------ | ------------------------------------------------------------ |
| tiny/small   | `onnx-community/Qwen2.5-0.5B-Instruct` (`q4f16`) | ~483 MB            | 4 GB de memória ou mais; 4 threads ou mais quando informadas |
| medium/large | `onnx-community/Qwen2.5-1.5B-Instruct` (`q4f16`) | ~1,4 GB            | 8 GB de memória e 6 threads ou mais                          |

A seleção reutiliza o tier do dispositivo e o tier solicitado no seletor atual, mas nunca escolhe um modelo acima da capacidade detectada. Se só o modelo menor couber, ele é usado; se os sinais disponíveis não forem suficientes ou o dispositivo ficar abaixo do mínimo, o roteador pula o WASM e tenta Ollama/fallback local. A inferência em CPU tende a ser mais lenta que WebGPU.

## Cadeia de fallback

O roteador (`src/lib/llm/router.ts`) tenta em ordem e nunca falha:

1. **WebLLM** — se `navigator.gpu.requestAdapter()` retornar adapter.
2. **WASM** — Transformers.js/ONNX Runtime, com modelo escolhido por capacidade de memória e CPU.
3. **Ollama** — apenas fora do shell nativo; probe `GET /api/tags` em `http://localhost:11434` (2s) e escolhe entre os **modelos instalados** por preferência do tier detectado.
4. **Local** — `generateAssistantReply`, resposta determinística ("offline mode") que mantém o chat funcional.

A preferência do usuário (`settings.llmEngine`: `auto | webllm | wasm | ollama | local`) escolhe o caminho prioritário; no modo `auto`, WebLLM e WASM são tentados antes do Ollama. WebLLM e WASM também podem ser selecionados individualmente no header do chat.

## Onde a geração acontece

`api.sendMessage` (`src/lib/api-client.ts`) orquestra: persiste a mensagem do usuário → `generateChatReply` gera a resposta → persiste a mensagem do assistente. `POST /api/conversations/:id/messages` aceita `{content, role}` e grava uma mensagem por vez — a resposta do professor nunca é gerada no servidor, garantindo paridade web/desktop/mobile.

## Otimizações

- **KV cache / prompt caching**: system prompt e instruções fixas são pré-processadas e reutilizadas entre turnos.
- **Web Workers**: WebLLM, WASM, Whisper e tokenização rodam fora da thread principal.
- **Quantização**: modelos em 4 bits (q4f16) são o padrão.
- **Download sob demanda**: os pesos vêm do Hugging Face na primeira vez e ficam no cache do navegador; `npm run download-models` permite self-hosting dos modelos MLC. O cache evita baixar de novo, mas não mantém o modelo carregado na memória após fechar o app.
- **Preload em background**: o `ModelPreloader` (`src/components/model-preloader.tsx`, montado no layout localizado) aquece WebLLM quando WebGPU está disponível e WASM quando ele é selecionado. No modo automático sem WebGPU, o WASM é carregado na primeira mensagem, evitando iniciar um download grande sem ação do usuário. O preload começa em tempo ocioso e respeita o tier do dispositivo, `navigator.connection.saveData` e as preferências `ollama`/`local`. O worker mantém o pipeline em memória durante a sessão; se o app for fechado ou o sistema encerrar o worker, os pesos continuam em cache e o pipeline é recriado no próximo uso.

## Diferenças entre WebLLM e Ollama

| Aspecto       | WebLLM                 | WASM/Transformers.js       | Ollama                 |
| ------------- | ---------------------- | -------------------------- | ---------------------- |
| Local         | No navegador           | No navegador               | Servidor local         |
| Hardware      | WebGPU                 | CPU via WebAssembly        | CPU/GPU local          |
| Formato       | MLC                    | ONNX quantizado            | GGUF                   |
| System prompt | `messages[0]` (system) | Template de chat do modelo | `messages[0]` (system) |
| Cache         | KV cache do motor      | Cache API do navegador     | KV cache do llama.cpp  |

## Veja também

- [Guia de hardware](guia-de-hardware.md)
- [Modelos locais](modelos-locais.md)
- [PWA e distribuição](pwa-e-distribuicao.md)
