import type { Message, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const messageRepository = {
  findManyByConversation(conversationId: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  },

  create(data: Prisma.MessageUncheckedCreateInput): Promise<Message> {
    return prisma.message.create({ data });
  },

  createMany(data: Prisma.MessageUncheckedCreateInput[]): Promise<number> {
    return prisma.message.createMany({ data }).then((result) => result.count);
  },
};

export type MessageRepository = typeof messageRepository;
