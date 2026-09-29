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

## Cadeia de fallback

O roteador (`src/lib/llm/router.ts`) tenta em ordem e nunca falha:

1. **WebLLM** — se `navigator.gpu.requestAdapter()` retornar adapter.
2. **Ollama** — apenas fora do shell nativo; probe `GET /api/tags` em `http://localhost:11434` (2s) e escolhe entre os **modelos instalados** por preferência do tier detectado.
3. **Local** — `generateAssistantReply`, resposta determinística ("offline mode") que mantém o chat funcional.

A preferência do usuário (`settings.llmEngine`: `auto | webllm | ollama | local`) pode forçar um caminho; `auto` percorre a cadeia inteira.

## Onde a geração acontece

`api.sendMessage` (`src/lib/api-client.ts`) orquestra: persiste a mensagem do usuário → `generateChatReply` gera a resposta → persiste a mensagem do assistente. `POST /api/conversations/:id/messages` aceita `{content, role}` e grava uma mensagem por vez — a resposta do professor nunca é gerada no servidor, garantindo paridade web/desktop/mobile.

## Otimizações

- **KV cache / prompt caching**: system prompt e instruções fixas são pré-processadas e reutilizadas entre turnos.
- **Web Workers**: o WebLLM e a tokenização rodam fora da thread principal.
- **Quantização**: modelos em 4 bits (q4f16) são o padrão.
- **Download sob demanda**: pesos vêm do Hugging Face na primeira vez e ficam no Cache API/IndexedDB; `npm run download-models` permite self-hosting.
- **Preload em background**: o `ModelPreloader` (`src/components/model-preloader.tsx`, montado no layout localizado) dispara `initWebLLM` em tempo ocioso ao abrir qualquer página, então a primeira resposta não espera o download. Respeita a preferência de engine (`ollama`/`local` pulam), a disponibilidade de WebGPU e `navigator.connection.saveData`. Um init falho limpa o singleton do engine, permitindo retry na próxima mensagem.

## Diferenças entre WebLLM e Ollama

| Aspecto       | WebLLM                 | Ollama                 |
| ------------- | ---------------------- | ---------------------- |
| Local         | No navegador           | Servidor local         |
| Hardware      | WebGPU                 | CPU/GPU local          |
| System prompt | `messages[0]` (system) | `messages[0]` (system) |
| Cache         | KV cache do motor      | KV cache do llama.cpp  |

## Veja também

- [Guia de hardware](guia-de-hardware.md)
- [Modelos locais](modelos-locais.md)
- [PWA e distribuição](pwa-e-distribuicao.md)
