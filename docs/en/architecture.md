# Architecture overview

LinguaPersona is divided into three main layers: language model execution, RAG memory, and prompt-based pedagogy.

## Main layers

### 1. Execution engine

Responsible for receiving user text/voice, generating the teacher's response, and managing language models.

- **WebLLM/WebGPU** is the primary engine. Weights are loaded in the browser and inference runs locally on the user's GPU.
- **Fallback** is triggered when WebGPU is unavailable, the model is too heavy, or the user chooses an alternative backend. Options are **Ollama** (local server) or external APIs (**OpenAI**, **Groq**, etc.).
- The model choice considers device capability: video memory, WebGPU support, and bandwidth.

### 2. Data and RAG

Stores learning context and retrieves relevant snippets to enrich the prompt.

- **Vector SQLite** stores vectors and metadata.
- **Embeddings** are generated in the browser with **Transformers.js** (e.g., `Xenova/all-MiniLM-L6-v2`).
- RAG searches for past errors, learned vocabulary, and grammar rules related to the user's sentence.

### 3. Pedagogy

Defines how the teacher behaves.

- **Persona**: configurable name, gender, and dialect.
- **System prompt**: a fixed set of rules sent to the model.
- **Techniques**: feedback sandwich, adaptive level, roleplay, and spaced correction loop.

## Interaction flow

1. The user sends a sentence by text or voice.
2. The system detects dialect, gender, and current level.
3. If relevant memory/RAG exists, it is injected into the context.
4. The inference engine generates the teacher's response.
5. The response is shown as text and, optionally, read aloud.
6. The system saves errors and new words for future use.

## See also

- [Inference engine](inference-engine.md)
- [RAG and memory](rag-and-memory.md)
- [Pedagogy and prompts](pedagogy-and-prompts.md)
- [Virtual teacher](virtual-teacher.md)
- [Local vector search](local-vector-search.md)
