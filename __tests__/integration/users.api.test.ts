/** @jest-environment node */
import request from "supertest";
import { prisma } from "@/lib/prisma";
import { createApp } from "../helpers/app";
import { GET as listUsers, POST as createUser } from "@/app/api/users/route";
import {
  GET as getUser,
  PATCH as updateUser,
  DELETE as deleteUser,
} from "@/app/api/users/[id]/route";

const app = createApp({
  "GET /api/users": listUsers,
  "POST /api/users": createUser,
  "GET /api/users/:id": getUser,
  "PATCH /api/users/:id": updateUser,
  "DELETE /api/users/:id": deleteUser,
});

const validUser = { email: "ana@example.com", name: "Ana" };

beforeEach(async () => {
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/users", () => {
  it("creates a user and returns 201", async () => {
    const res = await request(app).post("/api/users").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      email: "ana@example.com",
      name: "Ana",
      englishLevel: "A1",
      preferredDialect: "US",
    });
    expect(res.body.id).toBeDefined();
  });

  it("returns 422 for invalid email", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ email: "invalid", name: "Ana" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("UNPROCESSABLE_ENTITY");
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Content-Type", "application/json")
      .send("{ not json");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });

  it("returns 400 for empty body", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Content-Type", "application/json")
      .send("");

    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate email", async () => {
    await request(app).post("/api/users").send(validUser).expect(201);
    const res = await request(app)
      .post("/api/users")
      .send({ ...validUser, name: "Outra Ana" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
  });
});

describe("GET /api/users", () => {
  it("returns an empty list", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns created users", async () => {
    await request(app).post("/api/users").send(validUser).expect(201);
    const res = await request(app).get("/api/users");
    expect(res.body).toHaveLength(1);
  });
});

describe("GET /api/users/:id", () => {
  it("returns the user", async () => {
    const created = (await request(app).post("/api/users").send(validUser))
      .body;
    const res = await request(app).get(`/api/users/${created.id}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("ana@example.com");
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/users/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});

describe("PATCH /api/users/:id", () => {
  it("updates the user", async () => {
    const created = (await request(app).post("/api/users").send(validUser))
      .body;
    const res = await request(app)
      .patch(`/api/users/${created.id}`)
      .send({ name: "Ana Paula", englishLevel: "B1" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Ana Paula");
    expect(res.body.englishLevel).toBe("B1");
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).patch("/api/users/nope").send({ name: "X" });
    expect(res.status).toBe(404);
  });

  it("returns 422 for empty update", async () => {
    const created = (await request(app).post("/api/users").send(validUser))
      .body;
    const res = await request(app).patch(`/api/users/${created.id}`).send({});
    expect(res.status).toBe(422);
  });
});

describe("DELETE /api/users/:id", () => {
  it("deletes the user and returns 204", async () => {
    const created = (await request(app).post("/api/users").send(validUser))
      .body;
    await request(app).delete(`/api/users/${created.id}`).expect(204);
    await request(app).get(`/api/users/${created.id}`).expect(404);
  });

  it("returns 404 for unknown id", async () => {
    await request(app).delete("/api/users/nope").expect(404);
  });
});
