# Pesquisa vetorial local

O LinguaPersona suporta busca semântica 100% no lado do cliente para livros locais e arquivos enviados pelo usuário. Todo o processamento de embeddings acontece no navegador via WebAssembly, sem enviar dados para servidores externos.

## Fontes de dados

| Funcionalidade           | Livros locais (pré-instalados)                       | Livros por upload (usuário)                            |
| ------------------------ | ---------------------------------------------------- | ------------------------------------------------------ |
| Origem dos dados         | Diretório estático do app (`/assets/books`)          | Arquivo selecionado no dispositivo (PDF, EPUB, TXT)    |
| Pré-processamento        | Pré-vetorizado no build ou gerado no primeiro acesso | Vetorizado em tempo de execução no navegador           |
| Armazenamento de vetores | Cache local ou banco vetorial estático empacotado    | IndexedDB do navegador                                 |
| Privacidade              | Totalmente privada e offline                         | Totalmente privada; o arquivo nunca sai do dispositivo |
| Integração com IA        | Disponível para consultas imediatas                  | Disponível na sessão como material complementar        |

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
