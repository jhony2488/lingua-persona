/** @jest-environment <rootDir>/jest.node-env.ts */
import type { Conversation, Message } from "@prisma/client";
import { conversationRepository } from "@/modules/conversations/conversation.repository";
import { messageRepository } from "@/modules/conversations/message.repository";
import { messageService } from "@/modules/conversations/message.service";
import { generateAssistantReply } from "@/modules/assistant/assistant.service";

jest.mock("@/modules/conversations/conversation.repository");
jest.mock("@/modules/conversations/message.repository");

const convRepo = jest.mocked(conversationRepository);
const msgRepo = jest.mocked(messageRepository);

const conversation: Conversation = {
  id: "c_1",
  userId: "u_1",
  title: "Lesson 1",
  dialect: "US",
  level: "A1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const userMessage: Message = {
  id: "m_1",
  conversationId: "c_1",
  role: "user",
  content: "Hello!",
  createdAt: new Date(),
};

const assistantMessage: Message = {
  id: "m_2",
  conversationId: "c_1",
  role: "assistant",
  content: "Nice!",
  createdAt: new Date(),
};

describe("messageService", () => {
  afterEach(() => jest.clearAllMocks());

  it("lists messages when the conversation exists", async () => {
    convRepo.findById.mockResolvedValue(conversation);
    msgRepo.findManyByConversation.mockResolvedValue([userMessage]);
    expect(await messageService.list("c_1")).toEqual([userMessage]);
  });

  it("throws 404 when conversation is missing", async () => {
    convRepo.findById.mockResolvedValue(null);
    await expect(messageService.list("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("creates user + assistant messages", async () => {
    convRepo.findById.mockResolvedValue(conversation);
    msgRepo.create
      .mockResolvedValueOnce(userMessage)
      .mockResolvedValueOnce(assistantMessage);

    const result = await messageService.create("c_1", { content: "Hello!" });

    expect(result.userMessage.role).toBe("user");
    expect(result.assistantMessage.role).toBe("assistant");
    expect(msgRepo.create).toHaveBeenNthCalledWith(1, {
      conversationId: "c_1",
      role: "user",
      content: "Hello!",
    });
    expect(msgRepo.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        conversationId: "c_1",
        role: "assistant",
      }),
    );
  });
});

describe("generateAssistantReply", () => {
  it("returns a pedagogical placeholder", () => {
    const reply = generateAssistantReply("Hello", "B2");
    expect(reply).toContain("B2");
    expect(reply).toContain("placeholder");
  });
});
