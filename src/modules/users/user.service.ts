import { Prisma, type User } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { userRepository } from "@/modules/users/user.repository";
import type {
  CreateUserInput,
  UpdateUserInput,
} from "@/modules/users/user.schema";

export const userService = {
  list(): Promise<User[]> {
    return userRepository.findMany();
  },
  findByEmail(email: string): Promise<User | null> {
    return userRepository.findByEmail(email);
  },

  async get(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound("User not found");
    return user;
  },

  async createOrGet(
    input: CreateUserInput,
  ): Promise<{ user: User; created: boolean }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) return { user: existing, created: false };

    try {
      return { user: await userRepository.create(input), created: true };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const user = await userRepository.findByEmail(input.email);
        if (user) return { user, created: false };
      }
      throw error;
    }
  },

  async update(id: string, input: UpdateUserInput): Promise<User> {
    await userService.get(id);
    if (input.email) {
      const existing = await userRepository.findByEmail(input.email);
      if (existing && existing.id !== id) {
        throw AppError.conflict("Email already in use");
      }
    }
    return userRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await userRepository.delete(id);
  },
};

export type UserService = typeof userService;
