import type {
  AgentGender,
  Dialect,
  EnglishLevel,
  LLMEnginePreference,
} from "@/lib/store/settings";

export type EngineKind = "webllm" | "ollama" | "local";

export type { LLMEnginePreference };

/**
 * Capacidade de seguir instruções do modelo — independe do engine que o hospeda.
 * tiny: ~360M | small: ~1B | medium: ~1.5B | large: ~3B+
 */
export type ModelTier = "tiny" | "small" | "medium" | "large";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatContext {
  level: EnglishLevel | string;
  dialect: Dialect | string;
  agentName: string;
  agentGender: AgentGender;
  /**
   * Contexto extra injetado no system prompt (RAG futuro: erros recorrentes,
   * vocabulário aprendido, trechos do corpus).
   */
  context?: string[];
}
