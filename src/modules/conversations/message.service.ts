import type { Message } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { conversationRepository } from "@/modules/conversations/conversation.repository";
import { messageRepository } from "@/modules/conversations/message.repository";
import type { CreateMessageWithRoleInput } from "@/modules/conversations/message.schema";

export const messageService = {
  async list(conversationId: string): Promise<Message[]> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) throw AppError.notFound("Conversation not found");
    return messageRepository.findManyByConversation(conversationId);
  },

  /**
   * Persiste uma única mensagem. A resposta do assistente é gerada no
   * cliente (WebLLM/Ollama) e gravada por uma segunda chamada com
   * `role: "assistant"` — ver src/lib/llm/router.ts.
   */
  async create(
    conversationId: string,
    input: CreateMessageWithRoleInput,
  ): Promise<Message> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) throw AppError.notFound("Conversation not found");

    return messageRepository.create({
      conversationId,
      role: input.role ?? "user",
      content: input.content,
    });
  },
};

export type MessageService = typeof messageService;
