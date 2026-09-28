# RAG e memória

O sistema usa SQLite vetorial para guardar conhecimento de longo prazo e enriquecer as respostas do professor com contexto do aluno.

## O que armazenar

- **Histórico de erros**: padrões gramaticais que o usuário repete (ex.: "confunde since e for").
- **Vocabulário aprendido**: palavras vistas em sessões anteriores para revisões espaçadas.
- **Regras gramaticais e idiomáticas**: regras específicas de US/UK e expressões recorrentes.

## Banco de dados

O SQLite é escolhido por ser leve, embutido e de fácil distribuição em PWA/mobile. A extensão vetorial pode ser:

- **sqlite-vec** (`vec0`): extensão moderna em C.
- **sqlite-vss**: alternativa madura para busca por similaridade.

### Estrutura sugerida

```sql
CREATE TABLE memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,            -- 'error', 'vocabulary', 'rule'
  content TEXT NOT NULL,         -- texto original
  embedding BLOB,                -- vetor gerado
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  review_at DATETIME             -- próxima revisão espaçada
);

CREATE VIRTUAL TABLE memories_vec USING vec0(
  embedding FLOAT[384]
);
```

## Fluxo de RAG

1. O usuário digita: `I go to the market yesterday.`
2. Gera-se o embedding da frase com **Transformers.js**.
3. Busca-se no SQLite vetorial por erros e regras relacionados a `Past Simple`.
4. Os trechos relevantes são inseridos no contexto do prompt.
5. O professor responde corrigindo o erro e mantendo a conversa.

## Embeddings no navegador

```ts
import { pipeline } from "@xenova/transformers";

const embed = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

const out = await embed("I go to the market yesterday.", {
  pooling: "mean",
  normalize: true,
});
```

## Ciclo de revisão espaçada

Quando o modelo detecta um erro, o sistema agenda revisões futuras. O professor pode direcionar a conversa para revisar aquele ponto no dia seguinte.

## Veja também

- [Visão geral da arquitetura](arquitetura.md)
- [Pedagogia e prompts](pedagogia-e-prompts.md)
