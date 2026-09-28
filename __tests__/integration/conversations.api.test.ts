/** @jest-environment <rootDir>/jest.node-env.ts */
import request from "supertest";
import { prisma } from "@/lib/prisma";
import { createApp } from "../helpers/app";
import {
  GET as listConversations,
  POST as createConversation,
} from "@/app/api/conversations/route";
import {
  GET as getConversation,
  PATCH as updateConversation,
  DELETE as deleteConversation,
} from "@/app/api/conversations/[id]/route";
import { POST as createUser } from "@/app/api/users/route";

const app = createApp({
  "GET /api/conversations": listConversations,
  "POST /api/conversations": createConversation,
  "GET /api/conversations/:id": getConversation,
  "PATCH /api/conversations/:id": updateConversation,
  "DELETE /api/conversations/:id": deleteConversation,
  "POST /api/users": createUser,
});

async function seedUser(): Promise<string> {
  const res = await request(app)
    .post("/api/users")
    .send({ email: "ana@example.com", name: "Ana" });
  return res.body.id;
}

beforeEach(async () => {
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/conversations", () => {
  it("creates a conversation and returns 201", async () => {
    const userId = await seedUser();
    const res = await request(app)
      .post("/api/conversations")
      .send({ userId, title: "First class" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      userId,
      title: "First class",
      dialect: "US",
      level: "A1",
    });
  });

  it("returns 404 when user does not exist", async () => {
    const res = await request(app)
      .post("/api/conversations")
      .send({ userId: "missing-user" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 422 for invalid dialect", async () => {
    const userId = await seedUser();
    const res = await request(app)
      .post("/api/conversations")
      .send({ userId, dialect: "BR" });

    expect(res.status).toBe(422);
  });
});

describe("GET /api/conversations", () => {
  it("filters by userId", async () => {
    const userId = await seedUser();
    await request(app).post("/api/conversations").send({ userId });

    const all = await request(app).get("/api/conversations");
    expect(all.body).toHaveLength(1);

    const filtered = await request(app).get("/api/conversations?userId=other");
    expect(filtered.body).toHaveLength(0);
  });
});

describe("PATCH/DELETE /api/conversations/:id", () => {
  it("updates a conversation", async () => {
    const userId = await seedUser();
    const created = (
      await request(app).post("/api/conversations").send({ userId })
    ).body;

    const res = await request(app)
      .patch(`/api/conversations/${created.id}`)
      .send({ dialect: "UK", level: "C1" });

    expect(res.status).toBe(200);
    expect(res.body.dialect).toBe("UK");
    expect(res.body.level).toBe("C1");
  });

  it("deletes a conversation", async () => {
    const userId = await seedUser();
    const created = (
      await request(app).post("/api/conversations").send({ userId })
    ).body;

    await request(app).delete(`/api/conversations/${created.id}`).expect(204);
    await request(app).get(`/api/conversations/${created.id}`).expect(404);
  });
});

describe("cascade delete", () => {
  it("removes conversations when the user is deleted", async () => {
    const userId = await seedUser();
    await request(app).post("/api/conversations").send({ userId });

    await prisma.user.delete({ where: { id: userId } });

    const res = await request(app).get("/api/conversations");
    expect(res.body).toHaveLength(0);
  });
});
