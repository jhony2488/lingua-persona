import type { Conversation, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const conversationRepository = {
  findMany(userId?: string): Promise<Conversation[]> {
    return prisma.conversation.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string): Promise<Conversation | null> {
    return prisma.conversation.findUnique({ where: { id } });
  },

  create(data: Prisma.ConversationUncheckedCreateInput): Promise<Conversation> {
    return prisma.conversation.create({ data });
  },

  update(
    id: string,
    data: Prisma.ConversationUpdateInput,
  ): Promise<Conversation> {
    return prisma.conversation.update({ where: { id }, data });
  },

  delete(id: string): Promise<Conversation> {
    return prisma.conversation.delete({ where: { id } });
  },
};

export type ConversationRepository = typeof conversationRepository;
