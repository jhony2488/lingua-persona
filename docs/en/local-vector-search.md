# Local vector search

LinguaPersona supports 100% client-side semantic search for local books and user-uploaded files. All embedding processing runs in the browser via WebAssembly, without sending data to external servers.

## Data sources

| Feature        | Local books (pre-installed)                               | User uploads                                       |
| -------------- | --------------------------------------------------------- | -------------------------------------------------- |
| Data origin    | `data/library/` (committed corpus, see below)             | File selected on the device (PDF, EPUB, TXT)       |
| Pre-processing | Pre-vectorized at build time or generated on first access | Vectorized at runtime in the browser               |
| Vector storage | Local cache or packaged static vector database            | Browser IndexedDB                                  |
| Privacy        | Fully private and offline                                 | Fully private; the file never leaves the device    |
| AI integration | Available for immediate queries                           | Available in the session as supplementary material |

### Bundled corpus (`data/library/`)

Public-domain corpus (Project Gutenberg) organized in `manifest.json` with
two types per suggested CEFR level:

- **`type: "study"`** — study/reference materials (grammar, exercises,
  vocabulary): Graded Lessons in English, How to Speak and Write Correctly,
  Practical Exercises in English, Advanced English Grammar with Exercises,
  The Grammar of English Grammars, Fifteen Thousand Useful Phrases,
  Roget's Thesaurus.
- **`type: "reading"`** — graded reading (Alice in Wonderland, Wizard of Oz,
  Tom Sawyer, Christmas Carol, Time Machine, Frankenstein, Pride and
  Prejudice, Jane Eyre, Moby Dick).

To re-download or update the corpus: `npm run fetch:books` (validates each
downloaded file's title). A1–A2 level material (modern graded readers) is
copyright-protected and cannot be bundled — the teacher covers those levels
with generated exercises.

> **Pipeline note**: Gutenberg texts include legal headers/footers —
> the chunker should strip them (`*** START OF`/`*** END OF` markers).

## Processing and indexing flow

```
[ System local books ] ──┐
                          ├──► Text extractor ──► Chunking
[ User uploads ] ────────┘            │
                                      ▼
                           Local embedding model
                           (Transformers.js / WASM)
                                      │
                                      ▼
                            In-memory vector store
                                (IndexedDB)
                                      │
                                      ▼
                               Vector query
```

### 1. Extraction and chunking

- Text is extracted from PDF, EPUB, or TXT.
- The document is split into chunks of about 300 to 500 tokens, with overlap.
- Each chunk keeps metadata: book, chapter, and page.

### 2. Local vectorization

- A compact model such as `all-MiniLM-L6-v2` runs in the browser via **Transformers.js**.
- Each chunk becomes a high-dimensional vector.

### 3. Indexing and persistence

- Vectors are held in memory for fast cosine-similarity search.
- They are also saved to **IndexedDB** for instant loading in future sessions.

### 4. Query

- The user asks a question in any language.
- The system embeds the question and finds the most similar chunks.
- Relevant snippets are injected into the teacher's context.

## Pedagogical advantages

- **Precise answers with citation**: the agent can quote exact excerpts, including book, chapter, and page.
- **Privacy and performance**: hundreds of pages are processed with no network usage and no API costs.
- **Flexible semantic search**: the student asks in any language; the system finds related passages by meaning, not just exact keywords.

## See also

- [RAG and memory](rag-and-memory.md)
- [Inference engine](inference-engine.md)
