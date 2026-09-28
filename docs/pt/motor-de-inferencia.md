# Motor de inferência

O motor de inferência escolhe e executa o modelo de linguagem mais adequado para o dispositivo e o contexto do usuário.

## WebLLM como camada principal

O [WebLLM](https://github.com/mlc-ai/web-llm) executa modelos de linguagem diretamente no navegador usando WebGPU. Isso elimina custo de servidor e reduz a latência de rede.

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

### Modelos sugeridos

A escolha do modelo depende da VRAM e do suporte a WebGPU do dispositivo. Modelos menores mantêm boa performance neste app porque o RAG injeta o contexto relevante e os system prompts estruturados estreitam a tarefa — veja o [Guia de hardware](guia-de-hardware.md) para requisitos detalhados e recomendações para Ollama.

| Modelo                              | Tamanho aproximado | Uso recomendado                         |
| ----------------------------------- | ------------------ | --------------------------------------- |
| `SmolLM2-360M-Instruct-q4f32_1-MLC` | ~270 MB            | Dispositivos fracos ou sem GPU dedicada |
| `Llama-3.2-1B-Instruct-q4f16_1-MLC` | ~800 MB            | Tablets e notebooks comum               |
| `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | ~1,1 GB            | Notebooks melhores                      |
| `Llama-3.2-3B-Instruct-q4f16_1-MLC` | ~2 GB              | Desktop com GPU dedicada                |

## Fallback

Quando WebGPU não está disponível, o sistema tenta:

1. **Ollama** rodando no mesmo dispositivo (`http://localhost:11434`).
2. **API externa** (OpenAI, Groq etc.), configurada por variável de ambiente.

A lógica de fallback é transparente para a UI: a interface chama o mesmo `generateResponse`, mas a engine escolhe o backend.

## Otimizações

- **KV cache / prompt caching**: system prompt e instruções fixas são pré-processadas e reutilizados entre turnos.
- **Web Workers**: o WebLLM e a tokenização rodam fora da thread principal para não travar a UI.
- **Quantização**: modelos em 4 bits (q4f16) são o padrão para equilibrar tamanho e qualidade.

## Diferenças entre WebLLM e Ollama

| Aspecto       | WebLLM                    | Ollama                        |
| ------------- | ------------------------- | ----------------------------- |
| Local         | No navegador              | Servidor local                |
| Hardware      | WebGPU                    | CPU/GPU local                 |
| System prompt | `overrides.system_prompt` | Modelo com system configurado |
| Cache         | KV cache do motor         | KV cache do llama.cpp         |

## Veja também

- [Guia de hardware](guia-de-hardware.md)
- [Modelos locais](modelos-locais.md)
- [PWA e distribuição](pwa-e-distribuicao.md)
