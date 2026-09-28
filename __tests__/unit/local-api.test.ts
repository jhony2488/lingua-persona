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

  it("maps unique violation to ApiError 409", async () => {
    mockDb.run.mockRejectedValueOnce(new Error("UNIQUE constraint failed"));
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

  it("sendMessage persists user + assistant messages", async () => {
    mockDb.query.mockResolvedValueOnce({ values: [{ level: "B1" }] });
    const result = await localApi.sendMessage("c_1", "Hello!");
    expect(result.userMessage.role).toBe("user");
    expect(result.assistantMessage.role).toBe("assistant");
    expect(result.assistantMessage.content).toContain("placeholder");
    expect(mockDb.run).toHaveBeenCalledTimes(2);
  });
});
