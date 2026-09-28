/**
 * Placeholder do professor virtual.
 * Será substituído pelo motor de inferência real (WebLLM/Ollama)
 * na fase de integração do LLM.
 */
const OPENERS = ["Great start!", "Nice try!", "Good effort!"];

export function generateAssistantReply(
  userContent: string,
  level: string,
): string {
  const opener = OPENERS[userContent.length % OPENERS.length];
  return (
    `${opener} You said: "${userContent}". ` +
    `Let's practice at the ${level} level. ` +
    `(This is a placeholder response — the LLM engine is not wired yet.)`
  );
}
