import type { Prisma, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const userRepository = {
  findMany(): Promise<User[]> {
    return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  },
};

export type UserRepository = typeof userRepository;
