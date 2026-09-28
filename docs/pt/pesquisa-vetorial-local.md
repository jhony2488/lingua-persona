# Pesquisa vetorial local

O LinguaPersona suporta busca semântica 100% no lado do cliente para livros locais e arquivos enviados pelo usuário. Todo o processamento de embeddings acontece no navegador via WebAssembly, sem enviar dados para servidores externos.

## Fontes de dados

| Funcionalidade           | Livros locais (pré-instalados)                       | Livros por upload (usuário)                            |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------ |
| Origem dos dados         | `data/library/` (corpus commitado, ver abaixo)       | Arquivo selecionado no dispositivo (PDF, EPUB, TXT)    |
| Pré-processamento        | Pré-vetorizado no build ou gerado no primeiro acesso | Vetorizado em tempo de execução no navegador           |
| Armazenamento de vetores | Cache local ou banco vetorial estático empacotado    | IndexedDB do navegador                                 |
| Privacidade              | Totalmente privada e offline                         | Totalmente privada; o arquivo nunca sai do dispositivo |
| Integração com IA        | Disponível para consultas imediatas                  | Disponível na sessão como material complementar        |

### Corpus incluso (`data/library/`)

Corpus de domínio público (Project Gutenberg) organizado em `manifest.json`
com dois tipos por nível CEFR sugerido:

- **`type: "study"`** — materiais de estudo/referência (gramática, exercícios,
  vocabulário): Graded Lessons in English, How to Speak and Write Correctly,
  Practical Exercises in English, Advanced English Grammar with Exercises,
  The Grammar of English Grammars, Fifteen Thousand Useful Phrases,
  Roget's Thesaurus.
- **`type: "reading"`** — leitura por nível (Alice in Wonderland, Wizard of Oz,
  Tom Sawyer, Christmas Carol, Time Machine, Frankenstein, Pride and Prejudice,
  Jane Eyre, Moby Dick).

Para re-baixar ou atualizar o corpus: `npm run fetch:books` (valida título de
cada arquivo baixado). Material de nível A1–A2 (graded readers modernos) é
protegido por copyright e não pode ser empacotado — o professor cobre esses
níveis com exercícios gerados.

> **Nota para o pipeline**: textos do Gutenberg têm cabeçalho/rodapé legais —
> o chunking deve removê-los (marcadores `*** START OF`/`*** END OF`).

## Fluxo de processamento e indexação

```
[ Livros locais do sistema ] ──┐
                               ├──► Extrator de texto ──► Chunking
[ Uploads do usuário ] ────────┘              │
                                              ▼
                                  Modelo de embeddings local
                                  (Transformers.js / WASM)
                                              │
                                              ▼
                                  Banco vetorial in-memory
                                       (IndexedDB)
                                              │
                                              ▼
                                     Consulta vetorial
```

### 1. Extração e chunking

- O texto é extraído do PDF, EPUB ou TXT.
- O documento é dividido em blocos de aproximadamente 300 a 500 tokens, com sobreposição.
- Cada bloco mantém metadados: livro, capítulo e página.

### 2. Vetorização local

- Um modelo compacto, como `all-MiniLM-L6-v2`, roda no navegador via **Transformers.js**.
- Cada bloco se torna um vetor de alta dimensão.

### 3. Indexação e persistência

- Os vetores são armazenados em memória para cálculo rápido de similaridade por cosseno.
- Também são salvos no **IndexedDB** para carregamento instantâneo em acessos futuros.

### 4. Consulta

- O usuário faz uma pergunta em português ou inglês.
- O sistema gera o embedding da pergunta e busca os blocos mais similares.
- Os trechos relevantes são injetados no contexto do professor.

## Vantagens didáticas

- **Respostas precisas com citação**: o agente pode citar trechos exatos, incluindo livro, capítulo e página.
- **Privacidade e desempenho**: documentos de centenas de páginas são processados sem rede e sem custos de API.
- **Busca semântica flexível**: o aluno pergunta em português ou inglês; o sistema encontra trechos pelo significado, não apenas por palavras-chave exatas.

## Veja também

- [RAG e memória](rag-e-memoria.md)
- [Motor de inferência](motor-de-inferencia.md)
