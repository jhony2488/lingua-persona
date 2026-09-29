import { Capacitor } from "@capacitor/core";
import { OLLAMA_PREFERENCE } from "@/lib/llm/models";
import type { LLMMessage, ModelTier } from "@/lib/llm/types";

const OLLAMA_BASE_URL = "http://localhost:11434";
const PROBE_TIMEOUT_MS = 2_000;
const CHAT_TIMEOUT_MS = 120_000;

interface OllamaTagsResponse {
  models?: { name: string }[];
}

/**
 * Ollama só existe no mesmo dispositivo em web/desktop — no shell nativo
 * (Capacitor) localhost:11434 nunca responde, então nem tentamos.
 */
export async function probeOllama(
  baseUrl = OLLAMA_BASE_URL,
): Promise<string[]> {
  if (Capacitor.isNativePlatform()) return [];
  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const body = (await res.json()) as OllamaTagsResponse;
    return (body.models ?? []).map((m) => m.name);
  } catch {
    return [];
  }
}

/** Maior modelo instalado que combina com o tier detectado. */
export function pickOllamaModel(
  installed: string[],
  tier: ModelTier,
): string | null {
  for (const preferred of OLLAMA_PREFERENCE[tier]) {
    const match = installed.find(
      (name) => name === preferred || name.startsWith(preferred),
    );
    if (match) return match;
  }
  // Sem correspondência de preferência: usa o menor modelo instalado.
  return installed[0] ?? null;
}

export async function ollamaChat(
  messages: LLMMessage[],
  model: string,
  baseUrl = OLLAMA_BASE_URL,
): Promise<string> {
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model, messages, stream: false }),
    signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Ollama responded with ${res.status}`);
  const body = (await res.json()) as {
    message?: { content?: string };
  };
  const content = body.message?.content;
  if (!content) throw new Error("Ollama returned an empty reply");
  return content;
}
