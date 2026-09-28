/** @jest-environment <rootDir>/jest.node-env.ts */
import request from "supertest";
import { prisma } from "@/lib/prisma";
import { createApp } from "../helpers/app";
import {
  GET as listPlans,
  POST as generatePlan,
} from "@/app/api/study-plans/route";
import {
  GET as getPlan,
  DELETE as deletePlan,
} from "@/app/api/study-plans/[id]/route";
import { POST as createUser } from "@/app/api/users/route";

const app = createApp({
  "GET /api/study-plans": listPlans,
  "POST /api/study-plans": generatePlan,
  "GET /api/study-plans/:id": getPlan,
  "DELETE /api/study-plans/:id": deletePlan,
  "POST /api/users": createUser,
});

async function seedUser(level = "B1"): Promise<string> {
  const res = await request(app)
    .post("/api/users")
    .send({
      email: `${level.toLowerCase()}@example.com`,
      name: "Ana",
      englishLevel: level,
    });
  return res.body.id;
}

beforeEach(async () => {
  await prisma.studyPlan.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/study-plans", () => {
  it("generates a weekly plan and returns 201", async () => {
    const userId = await seedUser("B1");
    const res = await request(app)
      .post("/api/study-plans")
      .send({ userId, weeks: 4, focus: "balanced" });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(userId);
    expect(res.body.weeks).toBe(4);

    const plan = JSON.parse(res.body.planJson);
    expect(plan.weeks).toHaveLength(4);
    expect(plan.weeks[0]).toMatchObject({ week: 1 });
    expect(plan.weeks[0].topics.length).toBeGreaterThan(0);
  });

  it("excludes topics already used as conversation titles", async () => {
    const userId = await seedUser("B1");
    await prisma.conversation.create({
      data: { userId, title: "Technology in daily life" },
    });

    const res = await request(app)
      .post("/api/study-plans")
      .send({ userId, weeks: 2 });

    const plan = JSON.parse(res.body.planJson);
    const allTopics = plan.weeks.flatMap((w: { topics: string[] }) => w.topics);
    expect(allTopics).not.toContain("Technology in daily life");
  });

  it("returns 404 when user does not exist", async () => {
    const res = await request(app)
      .post("/api/study-plans")
      .send({ userId: "missing" });

    expect(res.status).toBe(404);
  });

  it("returns 422 for invalid focus", async () => {
    const userId = await seedUser();
    const res = await request(app)
      .post("/api/study-plans")
      .send({ userId, focus: "quantum" });

    expect(res.status).toBe(422);
  });
});

describe("GET/DELETE /api/study-plans", () => {
  it("lists plans filtered by userId", async () => {
    const userId = await seedUser();
    await request(app).post("/api/study-plans").send({ userId });

    const all = await request(app).get("/api/study-plans");
    expect(all.body).toHaveLength(1);

    const filtered = await request(app).get("/api/study-plans?userId=nobody");
    expect(filtered.body).toHaveLength(0);
  });

  it("gets and deletes a plan", async () => {
    const userId = await seedUser();
    const created = (
      await request(app).post("/api/study-plans").send({ userId })
    ).body;

    await request(app).get(`/api/study-plans/${created.id}`).expect(200);
    await request(app).delete(`/api/study-plans/${created.id}`).expect(204);
    await request(app).get(`/api/study-plans/${created.id}`).expect(404);
  });
});
