/** @jest-environment <rootDir>/jest.node-env.ts */
import type { Conversation, User } from "@prisma/client";
import { conversationRepository } from "@/modules/conversations/conversation.repository";
import { conversationService } from "@/modules/conversations/conversation.service";
import { userRepository } from "@/modules/users/user.repository";

jest.mock("@/modules/conversations/conversation.repository");
jest.mock("@/modules/users/user.repository");

const convRepo = jest.mocked(conversationRepository);
const userRepo = jest.mocked(userRepository);

const user: User = {
  id: "u_1",
  email: "ana@example.com",
  name: "Ana",
  englishLevel: "A1",
  preferredDialect: "US",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const conversation: Conversation = {
  id: "c_1",
  userId: "u_1",
  title: "First class",
  dialect: "US",
  level: "A1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("conversationService", () => {
  afterEach(() => jest.clearAllMocks());

  it("lists conversations without filter", async () => {
    convRepo.findMany.mockResolvedValue([conversation]);
    expect(await conversationService.list()).toEqual([conversation]);
    expect(convRepo.findMany).toHaveBeenCalledWith(undefined);
  });

  it("lists conversations filtered by userId", async () => {
    convRepo.findMany.mockResolvedValue([conversation]);
    await conversationService.list("u_1");
    expect(convRepo.findMany).toHaveBeenCalledWith("u_1");
  });

  it("creates a conversation when user exists", async () => {
    userRepo.findById.mockResolvedValue(user);
    convRepo.create.mockResolvedValue(conversation);
    const input = {
      userId: "u_1",
      title: "First class",
      dialect: "US" as const,
      level: "A1" as const,
    };
    expect(await conversationService.create(input)).toEqual(conversation);
  });

  it("throws 404 when creating conversation for missing user", async () => {
    userRepo.findById.mockResolvedValue(null);
    await expect(
      conversationService.create({
        userId: "missing",
        dialect: "US",
        level: "A1",
      }),
    ).rejects.toMatchObject({ statusCode: 404, code: "NOT_FOUND" });
    expect(convRepo.create).not.toHaveBeenCalled();
  });

  it("throws 404 when conversation does not exist", async () => {
    convRepo.findById.mockResolvedValue(null);
    await expect(conversationService.get("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
