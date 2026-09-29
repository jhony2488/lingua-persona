import type { ChatContext, LLMMessage, ModelTier } from "@/lib/llm/types";

/**
 * Instruções por nível CEFR (docs/pt/professor-virtual.md) — o idioma de
 * resposta e a forma de correção escalam com a proficiência do aluno.
 */
const LEVEL_INSTRUCTIONS: Record<string, string> = {
  A1: `The student is a beginner (CEFR A1).
- Reply mostly in Portuguese with simple explanations.
- Give short English phrases always followed by the Portuguese translation.
- Focus: greetings, introductions, everyday short phrases.`,
  A2: `The student is elementary (CEFR A2).
- Mix English and Portuguese (~50/50).
- Encourage the student to reply in English.
- Focus: restaurants, directions, daily routines.`,
  B1: `The student is intermediate (CEFR B1).
- Reply ~80% in English; Portuguese only when the student seems lost.
- Correct grammar mistakes subtly at the end of your reply.
- Focus: opinions, future plans, travel experiences.`,
  B2: `The student is upper-intermediate (CEFR B2).
- Reply 100% in English with natural vocabulary and idiomatic expressions.
- Focus: debates about work, technology, films, abstract topics.`,
  C1: `The student is advanced (CEFR C1).
- Act as a native speaker. Correct nuances of word choice and register.
- Focus: academic discussions, business meetings, fluent natural speech.`,
  C2: `The student is advanced (CEFR C2).
- Act as a native speaker. Correct nuances of word choice and register.
- Focus: academic discussions, business meetings, fluent natural speech.`,
};

/**
 * Regras pedagógicas por tier (capacidade do modelo de seguir instruções).
 * Modelos menores recebem instruções mínimas para não degradar a resposta.
 */
const TIER_RULES: Record<ModelTier, string> = {
  tiny: `- Reply in simple English, 1-2 short sentences.
- Always end with one simple follow-up question.`,
  small: `- Keep replies short (2-3 sentences).
- If the user makes a grammar mistake, show the correct version in one line.
- End with a simple follow-up question.`,
  medium: `1. Keep the conversation engaging and natural; stay on topic.
2. End every response with an open-ended question or follow-up prompt.
3. Feedback sandwich: reply naturally first, then add a "---" separator and a "💡 Quick Feedback" section with the gentle correction ("Instead of" / "Better") only if the user made a mistake.
4. Introduce 1-2 new vocabulary words in **bold** per response.`,
  large: `1. Keep the conversation engaging and natural; stay on topic.
2. End every response with an open-ended question or follow-up prompt.
3. Feedback sandwich: reply naturally first, then add a "---" separator and a "💡 Quick Feedback" section with the gentle correction ("Instead of" / "Better") only if the user made a mistake.
4. Match the student's level and introduce 1-2 new vocabulary words in **bold** per response.`,
};

const DIALECT_INSTRUCTIONS: Record<string, string> = {
  US: `Use American English (US) spelling, vocabulary, idioms and expressions (color, organize, apartment, sidewalk, awesome).`,
  UK: `Use British English (UK) spelling, vocabulary, idioms and expressions (colour, organise, flat, pavement, brilliant, mate).`,
};

export function buildSystemPrompt(
  ctx: ChatContext,
  tier: ModelTier,
): string {
  const levelInstructions =
    LEVEL_INSTRUCTIONS[ctx.level] ?? LEVEL_INSTRUCTIONS.A1;
  const dialectInstruction =
    DIALECT_INSTRUCTIONS[ctx.dialect] ?? DIALECT_INSTRUCTIONS.US;

  const parts = [
    `You are "${ctx.agentName}", an expert, friendly, and highly encouraging English language teacher.`,
    `Your goal is to help the student improve their English speaking, writing, reading, and vocabulary.`,
    ``,
    `### TARGET DIALECT`,
    dialectInstruction,
    ``,
    `### STUDENT LEVEL`,
    levelInstructions,
    ``,
    `### YOUR RULES`,
    TIER_RULES[tier],
  ];

  if (ctx.context?.length) {
    parts.push(``, `### STUDENT CONTEXT`, ...ctx.context.map((c) => `- ${c}`));
  }

  return parts.join("\n");
}

interface HistoryMessage {
  role: string;
  content: string;
}

/**
 * Converte o histórico persistido em mensagens de chat, limitado à janela
 * de contexto do tier (modelos menores recebem menos turnos).
 */
export function toChatMessages(
  history: HistoryMessage[],
  systemPrompt: string,
  maxHistory: number,
): LLMMessage[] {
  const recent = history.slice(-maxHistory);
  return [
    { role: "system", content: systemPrompt },
    ...recent
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
  ];
}

/**
 * Remove a seção de feedback e formatação markdown para o TTS não ler
 * caracteres/estutura em voz alta.
 */
export function stripForSpeech(text: string): string {
  const main = text.split(/\n\s*(?:---+|💡)/)[0];
  return main
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
