const mockDb = {
  open: jest.fn().mockResolvedValue(undefined),
  execute: jest.fn().mockResolvedValue({ changes: {} }),
  run: jest.fn().mockResolvedValue({ changes: { changes: 1 } }),
  query: jest.fn().mockResolvedValue({ values: [] }),
};

jest.mock("@capacitor-community/sqlite", () => ({
  CapacitorSQLite: {},
  SQLiteConnection: jest.fn().mockImplementation(() => ({
    createConnection: jest.fn().mockResolvedValue(mockDb),
  })),
}));

import { ApiError } from "@/lib/api-client";
import { localApi } from "@/lib/local-db/local-api";

describe("localApi (mobile sqlite layer)", () => {
  afterEach(() => jest.clearAllMocks());

  it("bootstraps schema on first connection", async () => {
    await localApi.listConversations("u_1");
    expect(mockDb.execute).toHaveBeenCalledWith("PRAGMA foreign_keys = ON");
    expect(
      mockDb.execute.mock.calls.filter(([sql]) =>
        String(sql).includes("CREATE TABLE"),
      ).length,
    ).toBeGreaterThanOrEqual(3);
  });

  it("creates user and returns payload", async () => {
    const user = await localApi.createUser({
      email: "ana@example.com",
      name: "Ana",
    });
    expect(user.email).toBe("ana@example.com");
    expect(mockDb.run).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO "User"'),
      expect.arrayContaining(["ana@example.com", "Ana"]),
    );
  });

  it("returns the existing local user for a duplicate email", async () => {
    const existing = {
      id: "u_existing",
      email: "ana@example.com",
      name: "Ana",
      englishLevel: "B2",
      preferredDialect: "UK",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    mockDb.query.mockResolvedValueOnce({ values: [existing] });

    const user = await localApi.createUser({
      email: existing.email,
      name: "Different name",
    });

    expect(user.id).toBe(existing.id);
    expect(user.englishLevel).toBe(existing.englishLevel);
    expect(user.preferredDialect).toBe(existing.preferredDialect);
    expect(mockDb.run).not.toHaveBeenCalled();
  });

  it("returns the user created by a concurrent duplicate request", async () => {
    const existing = {
      id: "u_existing",
      email: "dup@example.com",
      name: "Existing",
      englishLevel: "A1",
      preferredDialect: "US",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    mockDb.run.mockRejectedValueOnce(new Error("UNIQUE constraint failed"));
    mockDb.query
      .mockResolvedValueOnce({ values: [] })
      .mockResolvedValueOnce({ values: [existing] });

    await expect(
      localApi.createUser({ email: existing.email, name: "New" }),
    ).resolves.toMatchObject({ id: existing.id });
  });

  it("maps unrelated insert failure to ApiError 409 when no profile exists", async () => {
    mockDb.run.mockRejectedValueOnce(new Error("UNIQUE constraint failed"));
    mockDb.query
      .mockResolvedValueOnce({ values: [] })
      .mockResolvedValueOnce({ values: [] });
    await expect(
      localApi.createUser({ email: "dup@example.com", name: "Dup" }),
    ).rejects.toMatchObject({ status: 409, name: "ApiError" });
    expect(ApiError).toBeDefined();
  });

  it("returns 404 when creating conversation for missing user", async () => {
    mockDb.query.mockResolvedValueOnce({ values: [] });
    await expect(
      localApi.createConversation({ userId: "missing" }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("createMessage persists a single message with the given role", async () => {
    mockDb.query.mockResolvedValueOnce({ values: [{ id: "c_1" }] });
    const message = await localApi.createMessage("c_1", {
      content: "Hello!",
      role: "assistant",
    });
    expect(message.role).toBe("assistant");
    expect(message.content).toBe("Hello!");
    expect(mockDb.run).toHaveBeenCalledTimes(1);
  });

  it("createMessage defaults role to user", async () => {
    mockDb.query.mockResolvedValueOnce({ values: [{ id: "c_1" }] });
    const message = await localApi.createMessage("c_1", { content: "Hi" });
    expect(message.role).toBe("user");
  });

  it("createMessage returns 404 when conversation is missing", async () => {
    mockDb.query.mockResolvedValueOnce({ values: [] });
    await expect(
      localApi.createMessage("missing", { content: "Hi" }),
    ).rejects.toMatchObject({ status: 404 });
  });
});

  it("looks up an existing local profile by email", async () => {
    const existing = { id: "u_existing", email: "ana@example.com" };
    mockDb.query.mockResolvedValueOnce({ values: [existing] });

    await expect(localApi.findUserByEmail(existing.email)).resolves.toMatchObject(
      existing,
    );
  });
