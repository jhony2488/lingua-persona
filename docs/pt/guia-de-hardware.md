# Guia de hardware e modelos

Não é preciso um computador potente para rodar o LinguaPersona. Este guia ajuda a escolher o modelo certo para o seu hardware, seja rodando no navegador (WebLLM), no Ollama ou em outra API local.

## Por que modelos pequenos funcionam bem aqui

Modelos de 1B–3B parâmetros parecem "fracos" no papel, mas neste app eles entregam boa performance por quatro motivos:

- **RAG**: erros passados, vocabulário aprendido e regras gramaticais do aluno são buscados e injetados no prompt. O modelo não precisa "saber tudo" — o contexto certo chega pronto na janela.
- **Tarefa estreita**: o modelo só precisa ser um professor de inglês. System prompts estruturados (feedback sandwich, nível adaptativo, US/UK) limitam o espaço de resposta, onde modelos pequenos se saem bem.
- **Quantização**: formatos 4-bit (`q4f16` no WebLLM, `Q4_K_M` no GGUF) reduzem memória em ~4x com perda mínima de qualidade.
- **KV cache / prompt caching**: o system prompt é reutilizado entre turnos, então a latência por mensagem cai bastante mesmo em CPU.

## Modelos para Ollama

Com o [Ollama](https://ollama.com) instalado, baixe um modelo com `ollama pull <tag>` e o app o usa via `http://localhost:11434` quando o WebGPU não está disponível ou quando você preferir.

| Modelo         | Download | RAM mínima | RAM recomendada | Notas                                    |
| -------------- | -------- | ---------- | --------------- | ---------------------------------------- |
| `smollm2:360m` | ~270 MB  | 1 GB       | 2 GB            | Dispositivos muito fracos, só CPU        |
| `qwen2.5:0.5b` | ~400 MB  | 1 GB       | 2 GB            | Só CPU, respostas simples                |
| `llama3.2:1b`  | ~1.3 GB  | 2 GB       | 4 GB            | Melhor custo-benefício p/ hardware fraco |
| `qwen2.5:1.5b` | ~1 GB    | 2 GB       | 4 GB            | Bom seguimento de instruções             |
| `gemma2:2b`    | ~1.6 GB  | 3 GB       | 4–6 GB          | —                                        |
| `llama3.2:3b`  | ~2 GB    | 4 GB       | 6–8 GB          | **Recomendação geral**                   |
| `phi3:mini`    | ~2.3 GB  | 4 GB       | 6–8 GB          | Bom em tarefas instruídas                |
| `qwen2.5:7b`   | ~4.7 GB  | 8 GB       | 16 GB           | GPU recomendada; em CPU fica lento       |
| `llama3.1:8b`  | ~4.9 GB  | 8 GB       | 16 GB           | GPU recomendada                          |
| `qwen2.5:14b`  | ~9 GB    | 16 GB      | 32 GB           | Só hardware forte / GPU dedicada         |

Os valores são aproximados. Regra prática: a RAM usada é o **tamanho do modelo quantizado + ~1–2 GB de contexto (KV cache) + margem para o sistema operacional**. Isso segue a orientação oficial do Ollama: ~8 GB de RAM para modelos 7B, ~16 GB para 13B e ~32 GB para 33B.

### Maior modelo que seu hardware aguenta

| Memória disponível | Maior modelo confortável (q4)   |
| ------------------ | ------------------------------- |
| 4 GB RAM           | Até ~3B (`llama3.2:3b`)         |
| 8 GB RAM           | Até ~7–8B (`qwen2.5:7b`)        |
| 16 GB RAM          | Até ~14B (`qwen2.5:14b`)        |
| 32 GB+ RAM         | 33B+ ou modelos sem quantização |

Com GPU, o limite é a VRAM: a mesma tabela vale substituindo RAM por VRAM, desde que a VRAM comporte modelo + contexto.

### Como instalar e usar o Ollama

1. **Instale**:
   - **Windows/macOS**: baixe o instalador em [ollama.com/download](https://ollama.com/download) e execute (no Windows não precisa de administrador).
   - **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`
2. **Verifique**: o Ollama roda em segundo plano e expõe a API em `http://localhost:11434`. Confirme com `ollama -v` ou abrindo `http://localhost:11434` no navegador.
3. **Baixe um modelo** da tabela acima (ou da [biblioteca de modelos](https://ollama.com/library)):

   ```bash
   ollama pull llama3.2:3b
   ```

4. **Teste** conversando direto no terminal:

   ```bash
   ollama run llama3.2:3b
   ```

5. **Pronto** — com o Ollama no ar, o app o detecta como fallback automaticamente.

Comandos úteis:

| Comando                | O que faz                        |
| ---------------------- | -------------------------------- |
| `ollama list`          | Lista os modelos baixados        |
| `ollama ps`            | Mostra modelos carregados em RAM |
| `ollama stop <modelo>` | Descarrega um modelo da memória  |
| `ollama rm <modelo>`   | Apaga um modelo do disco         |
| `ollama serve`         | Sobe o servidor manualmente      |

### Tutoriais e vídeos

- [Quickstart oficial](https://docs.ollama.com/quickstart) — instalação e primeiro chat.
- [Tutorial em texto (PT-BR), por Eduardo Maçan](https://eduardo.macan.eng.br/tech/tutorial-llms-locais-com-ollama/) — instalação passo a passo no Windows, macOS e Linux.
- [Vídeo (PT-BR): Como instalar o Ollama passo a passo](https://www.youtube.com/watch?v=AIdHZv0cO9k)
- [Vídeo (EN): Learn Ollama in 10 Minutes](https://www.youtube.com/watch?v=AGAETsxjg0o)
- [Biblioteca de modelos](https://ollama.com/library) — catálogo completo para escolher tags.

## Outras APIs locais compatíveis

Qualquer servidor local com API **OpenAI-compatible** funciona como backend: [LM Studio](https://lmstudio.ai), `llama-server` do llama.cpp, Jan, etc.

- Use os mesmos modelos em formato **GGUF**, de preferência quantização `Q4_K_M`.
- A mesma tabela de RAM se aplica — o consumo do llama.cpp é equivalente ao do Ollama.
- Configure o endpoint (ex.: `http://localhost:1234/v1`) e a chave nas variáveis de ambiente do app.

## WebLLM (navegador)

Os modelos MLC rodam na GPU do navegador via WebGPU, sem instalar nada. Recapitulação:

| Modelo                              | Tamanho aproximado | Perfil do dispositivo                   |
| ----------------------------------- | ------------------ | --------------------------------------- |
| `SmolLM2-360M-Instruct-q4f32_1-MLC` | ~270 MB            | Dispositivos fracos ou sem GPU dedicada |
| `Llama-3.2-1B-Instruct-q4f16_1-MLC` | ~800 MB            | Tablets e notebooks comuns              |
| `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | ~1,1 GB            | Notebooks melhores                      |
| `Llama-3.2-3B-Instruct-q4f16_1-MLC` | ~2 GB              | Desktop com GPU dedicada                |

Detalhes em [Motor de inferência](motor-de-inferencia.md) e [Modelos locais](modelos-locais.md).

## Guia rápido de decisão

- **PC fraco, 4 GB de RAM, sem GPU**: Ollama com `llama3.2:1b` ou `smollm2:360m`. No navegador, `SmolLM2-360M` se o WebGPU funcionar.
- **Notebook comum, 8 GB de RAM**: Ollama com `llama3.2:3b` ou `qwen2.5:1.5b`; WebLLM com `Llama-3.2-1B`.
- **PC bom, 16 GB de RAM ou GPU com 8 GB VRAM**: Ollama com `qwen2.5:7b`/`llama3.1:8b`; WebLLM com `Llama-3.2-3B`.
- **Hardware forte, 32 GB+ ou GPU com 12 GB+ VRAM**: `qwen2.5:14b` para máxima qualidade.

## Veja também

- [Motor de inferência](motor-de-inferencia.md)
- [Modelos locais](modelos-locais.md)
- [RAG e memória](rag-e-memoria.md)
- [Visão geral da arquitetura](arquitetura.md)
