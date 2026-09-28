import type { Message } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { conversationRepository } from "@/modules/conversations/conversation.repository";
import { messageRepository } from "@/modules/conversations/message.repository";
import type { CreateMessageInput } from "@/modules/conversations/message.schema";
import { generateAssistantReply } from "@/modules/assistant/assistant.service";

export const messageService = {
  async list(conversationId: string): Promise<Message[]> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) throw AppError.notFound("Conversation not found");
    return messageRepository.findManyByConversation(conversationId);
  },

  async create(
    conversationId: string,
    input: CreateMessageInput,
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const conversation = await conversationRepository.findById(conversationId);
    if (!conversation) throw AppError.notFound("Conversation not found");

    const userMessage = await messageRepository.create({
      conversationId,
      role: "user",
      content: input.content,
    });

    const assistantMessage = await messageRepository.create({
      conversationId,
      role: "assistant",
      content: generateAssistantReply(input.content, conversation.level),
    });

    return { userMessage, assistantMessage };
  },
};

export type MessageService = typeof messageService;
