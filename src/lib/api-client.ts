import { Capacitor } from "@capacitor/core";
import type { Conversation, Message, StudyPlan, User } from "@prisma/client";
import { useSettings } from "@/lib/store/settings";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string; code?: string };
    } | null;
    throw new ApiError(
      body?.error?.message ?? `Request failed with status ${res.status}`,
      res.status,
      body?.error?.code,
    );
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// No shell nativo (Android/iOS/desktop) não existe servidor remoto:
// a camada local (sqlite do dispositivo) substitui o fetch para /api/*.
async function local() {
  const { localApi } = await import("@/lib/local-db/local-api");
  return localApi;
}

const isNative = () => Capacitor.isNativePlatform();

export interface CreateUserPayload {
  email: string;
  name: string;
  englishLevel?: string;
  preferredDialect?: string;
}

export interface CreateConversationPayload {
  userId: string;
  title?: string;
  dialect?: string;
  level?: string;
}

export interface SendMessageResult {
  userMessage: Message;
  assistantMessage: Message;
}

export interface CreateMessagePayload {
  content: string;
  role?: "user" | "assistant";
}

/** Nível/dialeto da conversa — default: settings do usuário. */
export interface SendMessageContext {
  level?: string;
  dialect?: string;
}

export interface GeneratePlanPayload {
  userId: string;
  weeks?: number;
  focus?: "grammar" | "speaking" | "balanced";
}

export const api = {
  createUser: (payload: CreateUserPayload): Promise<User> =>
    isNative()
      ? local().then((l) => l.createUser(payload))
      : apiFetch<User>("/api/users", {
          method: "POST",
          body: JSON.stringify(payload),
        }),

  listConversations: (userId?: string): Promise<Conversation[]> =>
    isNative()
      ? local().then((l) => l.listConversations(userId))
      : apiFetch<Conversation[]>(
          userId ? `/api/conversations?userId=${userId}` : "/api/conversations",
        ),

  createConversation: (
    payload: CreateConversationPayload,
  ): Promise<Conversation> =>
    isNative()
      ? local().then((l) => l.createConversation(payload))
      : apiFetch<Conversation>("/api/conversations", {
          method: "POST",
          body: JSON.stringify(payload),
        }),

  deleteConversation: (id: string): Promise<void> =>
    isNative()
      ? local().then((l) => l.deleteConversation(id))
      : apiFetch<void>(`/api/conversations/${id}`, { method: "DELETE" }),

  listMessages: (conversationId: string): Promise<Message[]> =>
    isNative()
      ? local().then((l) => l.listMessages(conversationId))
      : apiFetch<Message[]>(`/api/conversations/${conversationId}/messages`),

  createMessage: (
    conversationId: string,
    input: CreateMessagePayload,
  ): Promise<Message> =>
    isNative()
      ? local().then((l) => l.createMessage(conversationId, input))
      : apiFetch<Message>(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          body: JSON.stringify(input),
        }),

  /**
   * Persiste a mensagem do usuário, gera a resposta no engine local
   * (WebLLM → Ollama → fallback; src/lib/llm/router.ts) e persiste a
   * resposta do assistente. O retorno mantém o par {user, assistant}.
   */
  sendMessage: async (
    conversationId: string,
    content: string,
    ctx?: SendMessageContext,
  ): Promise<SendMessageResult> => {
    const userMessage = await api.createMessage(conversationId, {
      content,
      role: "user",
    });
    const history = await api.listMessages(conversationId);
    const settings = useSettings.getState();
    const { generateChatReply } = await import("@/lib/llm/router");
    const { reply } = await generateChatReply(history, {
      level: ctx?.level ?? settings.level,
      dialect: ctx?.dialect ?? settings.dialect,
      agentName: settings.agentName,
      agentGender: settings.agentGender,
    });
    const assistantMessage = await api.createMessage(conversationId, {
      content: reply,
      role: "assistant",
    });
    return { userMessage, assistantMessage };
  },

  listStudyPlans: (userId?: string): Promise<StudyPlan[]> =>
    isNative()
      ? local().then((l) => l.listStudyPlans(userId))
      : apiFetch<StudyPlan[]>(
          userId ? `/api/study-plans?userId=${userId}` : "/api/study-plans",
        ),

  getStudyPlan: (id: string): Promise<StudyPlan> =>
    isNative()
      ? local().then((l) => l.getStudyPlan(id))
      : apiFetch<StudyPlan>(`/api/study-plans/${id}`),

  generateStudyPlan: (payload: GeneratePlanPayload): Promise<StudyPlan> =>
    isNative()
      ? local().then((l) => l.generateStudyPlan(payload))
      : apiFetch<StudyPlan>("/api/study-plans", {
          method: "POST",
          body: JSON.stringify(payload),
        }),

  deleteStudyPlan: (id: string): Promise<void> =>
    isNative()
      ? local().then((l) => l.deleteStudyPlan(id))
      : apiFetch<void>(`/api/study-plans/${id}`, { method: "DELETE" }),
};
