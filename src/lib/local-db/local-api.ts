import type {
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import type { Conversation, Message, User } from "@prisma/client";
import { ApiError } from "@/lib/api-client";
import type {
  CreateConversationPayload,
  CreateUserPayload,
  SendMessageResult,
} from "@/lib/api-client";
import { SCHEMA_STATEMENTS } from "@/lib/local-db/schema.sql";
import { generateAssistantReply } from "@/modules/assistant/assistant.service";

let dbPromise: Promise<SQLiteDBConnection> | null = null;

async function db(): Promise<SQLiteDBConnection> {
  dbPromise ??= (async () => {
    const { CapacitorSQLite, SQLiteConnection } =
      await import("@capacitor-community/sqlite");
    const sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
    const connection = await sqlite.createConnection(
      "linguapersona",
      false,
      "no-encryption",
      1,
      false,
    );
    await connection.open();
    await connection.execute("PRAGMA foreign_keys = ON");
    for (const statement of SCHEMA_STATEMENTS) {
      await connection.execute(statement);
    }
    return connection;
  })();
  return dbPromise;
}

const now = () => new Date().toISOString();

export const localApi = {
  async createUser(payload: CreateUserPayload): Promise<User> {
    const connection = await db();
    const user = {
      id: crypto.randomUUID(),
      email: payload.email,
      name: payload.name,
      englishLevel: payload.englishLevel ?? "A1",
      preferredDialect: payload.preferredDialect ?? "US",
      createdAt: now(),
      updatedAt: now(),
    };
    try {
      await connection.run(
        `INSERT INTO "User" (id, email, name, englishLevel, preferredDialect, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email,
          user.name,
          user.englishLevel,
          user.preferredDialect,
          user.createdAt,
          user.updatedAt,
        ],
      );
    } catch {
      throw new ApiError("Email already in use", 409, "CONFLICT");
    }
    return user as unknown as User;
  },

  async listConversations(userId?: string): Promise<Conversation[]> {
    const connection = await db();
    const result = userId
      ? await connection.query(
          `SELECT * FROM "Conversation" WHERE userId = ? ORDER BY createdAt DESC`,
          [userId],
        )
      : await connection.query(
          `SELECT * FROM "Conversation" ORDER BY createdAt DESC`,
        );
    return (result.values ?? []) as unknown as Conversation[];
  },

  async createConversation(
    payload: CreateConversationPayload,
  ): Promise<Conversation> {
    const connection = await db();
    const user = await connection.query(`SELECT id FROM "User" WHERE id = ?`, [
      payload.userId,
    ]);
    if (!user.values?.length) {
      throw new ApiError("User not found", 404, "NOT_FOUND");
    }
    const conversation = {
      id: crypto.randomUUID(),
      userId: payload.userId,
      title: payload.title ?? null,
      dialect: payload.dialect ?? "US",
      level: payload.level ?? "A1",
      createdAt: now(),
      updatedAt: now(),
    };
    await connection.run(
      `INSERT INTO "Conversation" (id, userId, title, dialect, level, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        conversation.id,
        conversation.userId,
        conversation.title,
        conversation.dialect,
        conversation.level,
        conversation.createdAt,
        conversation.updatedAt,
      ],
    );
    return conversation as unknown as Conversation;
  },

  async deleteConversation(id: string): Promise<void> {
    const connection = await db();
    const result = await connection.run(
      `DELETE FROM "Conversation" WHERE id = ?`,
      [id],
    );
    if (result.changes?.changes === 0) {
      throw new ApiError("Conversation not found", 404, "NOT_FOUND");
    }
  },

  async listMessages(conversationId: string): Promise<Message[]> {
    const connection = await db();
    const conversation = await connection.query(
      `SELECT id FROM "Conversation" WHERE id = ?`,
      [conversationId],
    );
    if (!conversation.values?.length) {
      throw new ApiError("Conversation not found", 404, "NOT_FOUND");
    }
    const result = await connection.query(
      `SELECT * FROM "Message" WHERE conversationId = ? ORDER BY createdAt ASC`,
      [conversationId],
    );
    return (result.values ?? []) as unknown as Message[];
  },

  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<SendMessageResult> {
    const connection = await db();
    const conversation = await connection.query(
      `SELECT level FROM "Conversation" WHERE id = ?`,
      [conversationId],
    );
    const row = conversation.values?.[0] as { level: string } | undefined;
    if (!row) throw new ApiError("Conversation not found", 404, "NOT_FOUND");

    const userMessage = {
      id: crypto.randomUUID(),
      conversationId,
      role: "user",
      content,
      createdAt: now(),
    };
    const assistantMessage = {
      id: crypto.randomUUID(),
      conversationId,
      role: "assistant",
      content: generateAssistantReply(content, row.level),
      createdAt: now(),
    };
    await connection.run(
      `INSERT INTO "Message" (id, conversationId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [
        userMessage.id,
        conversationId,
        "user",
        userMessage.content,
        userMessage.createdAt,
      ],
    );
    await connection.run(
      `INSERT INTO "Message" (id, conversationId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [
        assistantMessage.id,
        conversationId,
        "assistant",
        assistantMessage.content,
        assistantMessage.createdAt,
      ],
    );
    return {
      userMessage: userMessage as unknown as Message,
      assistantMessage: assistantMessage as unknown as Message,
    };
  },
};

export type LocalApi = typeof localApi;
