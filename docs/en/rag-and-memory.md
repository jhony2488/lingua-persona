# RAG and memory

The system uses vector SQLite to store long-term knowledge and enrich the teacher's responses with student context.

## What to store

- **Error history**: grammar patterns the user repeats (e.g., "confuses since and for").
- **Learned vocabulary**: words seen in previous sessions for spaced review.
- **Grammar and idiomatic rules**: US/UK-specific rules and recurring expressions.

## Database

SQLite is chosen because it is lightweight, embedded, and easy to distribute in PWA/mobile. The vector extension can be:

- **sqlite-vec** (`vec0`): a modern C extension.
- **sqlite-vss**: a mature alternative for similarity search.

### Suggested schema

```sql
CREATE TABLE memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,            -- 'error', 'vocabulary', 'rule'
  content TEXT NOT NULL,         -- original text
  embedding BLOB,                -- generated vector
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  review_at DATETIME             -- next spaced review
);

CREATE VIRTUAL TABLE memories_vec USING vec0(
  embedding FLOAT[384]
);
```

## RAG flow

1. The user types: `I go to the market yesterday.`
2. The sentence is embedded with **Transformers.js**.
3. Vector SQLite searches for errors and rules related to `Past Simple`.
4. Relevant snippets are inserted into the prompt context.
5. The teacher responds by correcting the error while keeping the conversation going.

## In-browser embeddings

```ts
import { pipeline } from "@xenova/transformers";

const embed = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

const out = await embed("I go to the market yesterday.", {
  pooling: "mean",
  normalize: true,
});
```

## Spaced correction loop

When the model detects an error, the system schedules future reviews. The teacher can steer the conversation to review that point the next day.

## See also

- [Architecture overview](architecture.md)
- [Pedagogy and prompts](pedagogy-and-prompts.md)
