# Agent gender

The gender module manages the teacher's identity. Switching between "teacher" (male) and "teacher" (female) impacts the **System Prompt**, grammatical agreement, and greetings.

## Types

```ts
type AgentGender = "male" | "female";

interface AgentConfig {
  gender: AgentGender;
  name: string; // e.g., "Alex" or "Alexia"
  targetLanguage: string; // language being taught
}
```

## PromptBuilder

`PromptBuilder` receives `AgentConfig` and generates the System Prompt adjusted for gender:

- Identity: "You are Alex, a friendly professor..." or "You are Alexia, a friendly teacher..."
- Agreement: adjectives and self-referential pronouns in the feminine when applicable.
- Tone: friendly, patient, and encouraging, respecting the chosen persona.

## State and persistence

State is kept in a client hook/store:

- Read saved preference from `localStorage` on startup.
- Update global state when the user changes gender.
- Persist the choice immediately.
- Propagate the new config to the inference engine on the next interaction.

## Interface

The UI must include:

- Toggle buttons: "Professor" | "Teacher" (female equivalent can be localized).
- Active agent name.
- Visual feedback of the current selection.

## Flow

1. Load saved config or default (`male`, name "Alex").
2. User selects the desired gender.
3. State is updated and persisted to `localStorage`.
4. `PromptBuilder` generates the new System Prompt.
5. The next LLM call uses the updated prompt.

## See also

- [Pedagogy and prompts](pedagogy-and-prompts.md)
- [Inference engine](inference-engine.md)
