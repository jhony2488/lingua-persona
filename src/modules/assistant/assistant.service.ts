/**
 * Fallback local do professor virtual — resposta determinística usada quando
 * nenhum engine real (WebLLM/Ollama) está disponível. Mantém o chat
 * funcional offline; ver src/lib/llm/router.ts.
 */
const OPENERS = ["Great start!", "Nice try!", "Good effort!"];

export function generateAssistantReply(
  userContent: string,
  level: string,
): string {
  const opener = OPENERS[userContent.length % OPENERS.length];
  return (
    `${opener} You said: "${userContent}". ` +
    `Let's keep practicing at the ${level} level — can you tell me more about it? ` +
    `(offline mode — language model not loaded)`
  );
}
