/** @jest-environment <rootDir>/jest.node-env.ts */
import request from "supertest";
import { prisma } from "@/lib/prisma";
import { createApp } from "../helpers/app";
import {
  GET as listMessages,
  POST as createMessage,
} from "@/app/api/conversations/[id]/messages/route";
import { POST as createConversation } from "@/app/api/conversations/route";
import { POST as createUser } from "@/app/api/users/route";

const app = createApp({
  "GET /api/conversations/:id/messages": listMessages,
  "POST /api/conversations/:id/messages": createMessage,
  "POST /api/conversations": createConversation,
  "POST /api/users": createUser,
});

async function seedConversation(): Promise<string> {
  const user = (
    await request(app)
      .post("/api/users")
      .send({ email: "ana@example.com", name: "Ana" })
  ).body;
  const conv = (
    await request(app).post("/api/conversations").send({ userId: user.id })
  ).body;
  return conv.id;
}

beforeEach(async () => {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/conversations/:id/messages", () => {
  it("creates user message and assistant reply, returns 201", async () => {
    const conversationId = await seedConversation();
    const res = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .send({ content: "Hello teacher!" });

    expect(res.status).toBe(201);
    expect(res.body.userMessage).toMatchObject({
      conversationId,
      role: "user",
      content: "Hello teacher!",
    });
    expect(res.body.assistantMessage.role).toBe("assistant");
    expect(res.body.assistantMessage.content).toContain("placeholder");
  });

  it("returns 404 when conversation does not exist", async () => {
    const res = await request(app)
      .post("/api/conversations/missing/messages")
      .send({ content: "Hi" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 422 for empty content", async () => {
    const conversationId = await seedConversation();
    const res = await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .send({ content: "" });

    expect(res.status).toBe(422);
  });
});

describe("GET /api/conversations/:id/messages", () => {
  it("returns messages in chronological order", async () => {
    const conversationId = await seedConversation();
    await request(app)
      .post(`/api/conversations/${conversationId}/messages`)
      .send({ content: "First" });

    const res = await request(app).get(
      `/api/conversations/${conversationId}/messages`,
    );

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].role).toBe("user");
    expect(res.body[1].role).toBe("assistant");
  });
});
