# Visão geral da arquitetura

O LinguaPersona é dividido em três camadas principais: execução do modelo de linguagem, memória com RAG e pedagogia por prompts.

## Camadas principais

### 1. Engine de execução

Responsável por receber o texto/voz do usuário, gerar a resposta do professor e gerenciar modelos de linguagem.

- **WebLLM/WebGPU** é a engine principal. Os pesos são carregados no navegador e a inferência roda localmente na GPU do usuário.
- **Transformers.js/ONNX Runtime WebAssembly** é o fallback local em CPU quando WebGPU não está disponível ou o WebLLM falha. Ele escolhe um modelo ONNX menor com base na memória e nos núcleos reportados pelo navegador.
- Se WASM não for suportado pelo dispositivo ou falhar, o app tenta **Ollama** (servidor local); por último, usa uma resposta pedagógica determinística local. Os engines WebLLM, WASM e Ollama também podem ser selecionados no chat.
- A seleção considera capacidade de memória, número de núcleos, heurística de dispositivo móvel e suporte a WebGPU. Os pesos são baixados sob demanda e armazenados localmente pelo navegador.

### 2. Dados e RAG

Armazena contexto de aprendizado e recupera trechos relevantes para enriquecer o prompt.

- **SQLite vetorial** guarda vetores e metadados.
- **Embeddings** são gerados no navegador com **Transformers.js** (ex.: `Xenova/all-MiniLM-L6-v2`).
- O RAG busca erros passados, vocabulário aprendido e regras gramaticais relacionadas à frase do usuário.

### 3. Pedagogia

Define como o professor se comporta.

- **Persona**: nome, gênero e sotaque configuráveis.
- **System Prompt**: conjunto fixo de regras enviadas ao modelo.
- **Técnicas**: feedback sandwich, adaptive level, roleplay e ciclo de correção espaçada.

## Fluxo de uma interação

1. O usuário envia uma frase por texto ou voz.
2. O sistema detecta sotaque, gênero e nível atual.
3. Se houver memória/RAG relevante, ela é injetada no contexto.
4. O engine de inferência gera a resposta do professor.
5. A resposta é exibida em texto e, opcionalmente, lida em voz alta.
6. O sistema salva erros e novas palavras para uso futuro.

## Plataforma e codebase

A aplicação é Next.js (App Router) com rotas localizadas e persistência por plataforma:

- **Rotas localizadas**: `src/app/[lang]/` (chat, plan, settings, `~offline`) — `src/proxy.ts` negocia o locale via header/cookie; dicionários em `src/i18n/`.
- **API**: Route Handlers em `src/app/api/` (não localizados), dominíos em `src/modules/<dominio>/` (`schema.ts` Zod + `service.ts` + `repository.ts`).
- **Web/dev**: Prisma + `prisma/dev.db`.
- **Desktop (Tauri)**: mesmo backend como sidecar Node standalone (`127.0.0.1:3111`), SQLite no `appDataDir`.
- **Mobile (Capacitor)**: sem servidor — `src/lib/local-db/` fala direto com `@capacitor-community/sqlite`; `api-client` escolhe o caminho por `Capacitor.isNativePlatform()`.
- **Corpus**: livros de domínio público em `data/library/` (`manifest.json` + `.txt`), baixados por `npm run fetch:books`.

## Veja também

- [Motor de inferência](motor-de-inferencia.md)
- [RAG e memória](rag-e-memoria.md)
- [Pedagogia e prompts](pedagogia-e-prompts.md)
- [Professor virtual](professor-virtual.md)
- [Pesquisa vetorial local](pesquisa-vetorial-local.md)
- [PWA e distribuição](pwa-e-distribuicao.md)
- [Testes](testes.md)
