import type { Conversation } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { conversationRepository } from "@/modules/conversations/conversation.repository";
import type {
  CreateConversationInput,
  UpdateConversationInput,
} from "@/modules/conversations/conversation.schema";
import { userRepository } from "@/modules/users/user.repository";

export const conversationService = {
  list(userId?: string): Promise<Conversation[]> {
    return conversationRepository.findMany(userId);
  },

  async get(id: string): Promise<Conversation> {
    const conversation = await conversationRepository.findById(id);
    if (!conversation) throw AppError.notFound("Conversation not found");
    return conversation;
  },

  async create(input: CreateConversationInput): Promise<Conversation> {
    const user = await userRepository.findById(input.userId);
    if (!user) throw AppError.notFound("User not found");
    return conversationRepository.create(input);
  },

  async update(
    id: string,
    input: UpdateConversationInput,
  ): Promise<Conversation> {
    await conversationService.get(id);
    return conversationRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await conversationRepository.delete(id);
  },
};

export type ConversationService = typeof conversationService;
