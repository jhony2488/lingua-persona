# Virtual teacher

The LinguaPersona agent also acts as a virtual English teacher, integrating grammar, vocabulary, and speaking practice by voice and text. Teaching is structured from **A1 (Starter)** to **C2 (Advanced)**, with dynamic complexity adjustment.

> The per-level instructions below are injected into the system prompt by
> `buildSystemPrompt` (`src/modules/assistant/prompt.ts`), combined with
> simplified rules according to the tier of the model in use.

## Proficiency levels

| Level                       | Grammar focus                                                     | Conversation focus                                            | Agent behavior                                                                                                |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **A1 - Starter**            | Present Simple, pronouns, verb To Be, articles.                   | Greetings, introductions, and short daily phrases.            | Responds in the user's native language with simple explanations; provides English sentences with translation. |
| **A2 - Elementary**         | Past Simple, Present Continuous, comparatives, basic modal verbs. | Ordering at restaurants, directions, daily routine.           | Mixes English and the user's language (50/50); encourages the learner to answer in English.                   |
| **B1 - Intermediate**       | Present Perfect, conditionals (1st/2nd), common phrasal verbs.    | Expressing opinions, future plans, and travel experiences.    | Responds 80% in English; subtly corrects grammar at the end of the response.                                  |
| **B2 - Upper-Intermediate** | Past Perfect, passive voice, reported speech, conditionals (3rd). | Debates about work, technology, films, and abstract topics.   | 100% English conversation with natural vocabulary and idiomatic expressions.                                  |
| **C1/C2 - Advanced**        | Inversion, advanced modal verbs, stylistic nuances, collocations. | Academic discussions, business meetings, native-like fluency. | Acts as a native speaker; corrects accent (via audio) and word-choice nuances.                                |

## Voice conversation class flow

```
[ Student activates voice conversation mode ]
          │
          ▼
[ Student speaks in English ]
          │
          ▼
[ Capture with auto-reset (10s) ]
          │
          ▼
[ Processing (WebLLM / Groq / local or external API) ]
          │
          ├─► 1. Conversation reply (continues the topic)
          │
          └─► 2. Grammar / pronunciation feedback (optional)
```

## Dual feedback

Each teacher response is split into two parts:

1. **Direct reply**: continues the conversation naturally, keeping the topic flowing and asking open-ended questions.
2. **Optional grammar feedback**: points out grammar or pronunciation deviations constructively, without interrupting the dialogue.

### Example

**Student:** "He go to school every day."

**Teacher:**

```
Interesting! Does he walk or take the bus?

---
💡 Quick Feedback:
- Instead of: "He go to school every day."
- Better: "He goes to school every day." (Use the third-person singular -s in Present Simple).
```

## Dynamic adaptation

The agent adjusts the level during the conversation based on:

- Average sentence length.
- Grammar error rate.
- Use of new vocabulary.
- Explicit user feedback, if provided.

## See also

- [Pedagogy and prompts](pedagogy-and-prompts.md)
- [Voice and audio](voice-and-audio.md)
- [RAG and memory](rag-and-memory.md)
