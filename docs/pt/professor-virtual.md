# Professor virtual

O agente do LinguaPersona também atua como professor virtual de inglês, integrando gramática, vocabulário e prática de conversação por voz e texto. O ensino é estruturado do nível **A1 (Starter)** ao **C2 (Advanced)**, com ajuste dinâmico de complexidade.

> As instruções por nível abaixo são injetadas no system prompt pelo
> `buildSystemPrompt` (`src/modules/assistant/prompt.ts`), combinadas com
> regras simplificadas conforme o tier do modelo em uso.

## Níveis de proficiência

| Nível                       | Foco gramatical                                                        | Foco em conversação                                             | Comportamento do agente                                                                 |
| --------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **A1 - Starter**            | Present Simple, pronomes, verbo To Be, artigos.                        | Cumprimentos, apresentações e frases cotidianas curtas.         | Responde em português com explicações simples; traz frases em inglês com tradução.      |
| **A2 - Elementary**         | Past Simple, Present Continuous, comparativos, modal verbs básicos.    | Pedidos em restaurantes, direções e rotina diária.              | Mistura inglês e português (50/50); incentiva o aluno a responder em inglês.            |
| **B1 - Intermediate**       | Present Perfect, condicionais (1st/2nd), phrasal verbs frequentes.     | Expressar opiniões, planos futuros e experiências de viagem.    | Responde 80% em inglês; corrige erros de gramática sutilmente no final.                 |
| **B2 - Upper-Intermediate** | Past Perfect, voz passiva, reported speech, condicionais (3rd).        | Debates sobre trabalho, tecnologia, filmes e tópicos abstratos. | Conversação 100% em inglês com vocabulário natural e expressões idiomáticas.            |
| **C1/C2 - Advanced**        | Inversion, modal verbs avançados, nuances estilísticas e collocations. | Discussões acadêmicas, reuniões de negócios e fluência nativa.  | Atua como falante nativo; corrige nuances de sotaque (via áudio) e escolha de palavras. |

## Fluxo da aula de conversação por voz

```
[ Aluno ativa modo de conversação por voz ]
          │
          ▼
[ Aluno fala em inglês ]
          │
          ▼
[ Captação com auto-reset (10s) ]
          │
          ▼
[ Processamento (WebLLM / Groq / API local ou externa) ]
          │
          ├─► 1. Resposta de conversação (continua o tema)
          │
          └─► 2. Feedback gramatical / pronúncia (opcional)
```

## Devolutiva dupla

Cada resposta do professor é dividida em duas partes:

1. **Resposta direta**: continua a conversa naturalmente, mantendo o fluxo do assunto e fazendo perguntas abertas.
2. **Feedback gramatical opcional**: aponta desvios de gramática ou pronúncia de forma construtiva, sem interromper o diálogo.

### Exemplo

**Aluno:** "He go to school every day."

**Professor:**

```
Interesting! Does he walk or take the bus?

---
💡 Quick Feedback:
- Instead of: "He go to school every day."
- Better: "He goes to school every day." (Use the third-person singular -s in Present Simple).
```

## Adaptação dinâmica

O agente ajusta o nível ao longo da conversa com base em:

- Tamanho médio das frases do aluno.
- Taxa de erros gramaticais.
- Uso de vocabulário novo.
- Feedback explícito do usuário, se informado.

## Veja também

- [Pedagogia e prompts](pedagogia-e-prompts.md)
- [Voz e áudio](voz-e-audio.md)
- [RAG e memória](rag-e-memoria.md)
