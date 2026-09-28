/** @jest-environment node */
import {
  createUserSchema,
  updateUserSchema,
} from "@/modules/users/user.schema";
import {
  createConversationSchema,
  listConversationsQuerySchema,
  updateConversationSchema,
} from "@/modules/conversations/conversation.schema";

describe("user schemas", () => {
  it("accepts a valid user payload with defaults", () => {
    const parsed = createUserSchema.parse({
      email: "ana@example.com",
      name: "Ana",
    });
    expect(parsed.englishLevel).toBe("A1");
    expect(parsed.preferredDialect).toBe("US");
  });

  it("rejects an invalid email", () => {
    expect(() =>
      createUserSchema.parse({ email: "not-an-email", name: "Ana" }),
    ).toThrow();
  });

  it("rejects an unknown english level", () => {
    expect(() =>
      createUserSchema.parse({
        email: "ana@example.com",
        name: "Ana",
        englishLevel: "D5",
      }),
    ).toThrow();
  });

  it("rejects an empty update payload", () => {
    expect(() => updateUserSchema.parse({})).toThrow();
  });

  it("accepts a partial update", () => {
    const parsed = updateUserSchema.parse({ name: "Ana Paula" });
    expect(parsed.name).toBe("Ana Paula");
  });
});

describe("conversation schemas", () => {
  it("accepts a valid conversation payload with defaults", () => {
    const parsed = createConversationSchema.parse({ userId: "u_1" });
    expect(parsed.dialect).toBe("US");
    expect(parsed.level).toBe("A1");
  });

  it("rejects a conversation without userId", () => {
    expect(() => createConversationSchema.parse({ title: "Hi" })).toThrow();
  });

  it("parses list query params", () => {
    expect(listConversationsQuerySchema.parse({})).toEqual({});
    expect(listConversationsQuerySchema.parse({ userId: "u_1" })).toEqual({
      userId: "u_1",
    });
  });

  it("rejects empty update payload", () => {
    expect(() => updateConversationSchema.parse({})).toThrow();
  });
});
