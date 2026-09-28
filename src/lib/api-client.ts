import type { Conversation, Message, User } from "@prisma/client";

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

export const api = {
  createUser: (payload: CreateUserPayload) =>
    apiFetch<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listConversations: (userId?: string) =>
    apiFetch<Conversation[]>(
      userId ? `/api/conversations?userId=${userId}` : "/api/conversations",
    ),

  createConversation: (payload: CreateConversationPayload) =>
    apiFetch<Conversation>("/api/conversations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteConversation: (id: string) =>
    apiFetch<void>(`/api/conversations/${id}`, { method: "DELETE" }),

  listMessages: (conversationId: string) =>
    apiFetch<Message[]>(`/api/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: string, content: string) =>
    apiFetch<SendMessageResult>(
      `/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      },
    ),
};
