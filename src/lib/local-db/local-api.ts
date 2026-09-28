import type {
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import type { Conversation, Message, StudyPlan, User } from "@prisma/client";
import { ApiError } from "@/lib/api-client";
import type {
  CreateConversationPayload,
  CreateUserPayload,
  GeneratePlanPayload,
  SendMessageResult,
} from "@/lib/api-client";
import { SCHEMA_STATEMENTS } from "@/lib/local-db/schema.sql";
import { generateAssistantReply } from "@/modules/assistant/assistant.service";
import {
  generatePlan,
  type ManifestBook,
} from "@/modules/study/plan-generator";
import manifest from "../../../data/library/manifest.json";

const manifestBooks = manifest.books as ManifestBook[];

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

  async listStudyPlans(userId?: string): Promise<StudyPlan[]> {
    const connection = await db();
    const result = userId
      ? await connection.query(
          `SELECT * FROM "StudyPlan" WHERE userId = ? ORDER BY createdAt DESC`,
          [userId],
        )
      : await connection.query(
          `SELECT * FROM "StudyPlan" ORDER BY createdAt DESC`,
        );
    return (result.values ?? []) as unknown as StudyPlan[];
  },

  async getStudyPlan(id: string): Promise<StudyPlan> {
    const connection = await db();
    const result = await connection.query(
      `SELECT * FROM "StudyPlan" WHERE id = ?`,
      [id],
    );
    const row = result.values?.[0];
    if (!row) throw new ApiError("Study plan not found", 404, "NOT_FOUND");
    return row as unknown as StudyPlan;
  },

  async generateStudyPlan(payload: GeneratePlanPayload): Promise<StudyPlan> {
    const connection = await db();
    const user = await connection.query(
      `SELECT englishLevel FROM "User" WHERE id = ?`,
      [payload.userId],
    );
    const userRow = user.values?.[0] as { englishLevel: string } | undefined;
    if (!userRow) throw new ApiError("User not found", 404, "NOT_FOUND");

    const conversations = await connection.query(
      `SELECT title FROM "Conversation" WHERE userId = ?`,
      [payload.userId],
    );
    const usedTopics = (conversations.values ?? [])
      .map((row) => (row as { title: string | null }).title)
      .filter((t): t is string => Boolean(t));

    const planJson = generatePlan({
      level: userRow.englishLevel as Parameters<
        typeof generatePlan
      >[0]["level"],
      weeks: payload.weeks ?? 4,
      focus: payload.focus,
      usedTopics,
      books: manifestBooks,
    });

    const plan = {
      id: crypto.randomUUID(),
      userId: payload.userId,
      level: userRow.englishLevel,
      weeks: payload.weeks ?? 4,
      focus: payload.focus ?? "balanced",
      planJson: JSON.stringify(planJson),
      createdAt: now(),
    };
    await connection.run(
      `INSERT INTO "StudyPlan" (id, userId, level, weeks, focus, planJson, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        plan.id,
        plan.userId,
        plan.level,
        plan.weeks,
        plan.focus,
        plan.planJson,
        plan.createdAt,
      ],
    );
    return plan as unknown as StudyPlan;
  },

  async deleteStudyPlan(id: string): Promise<void> {
    const connection = await db();
    const result = await connection.run(
      `DELETE FROM "StudyPlan" WHERE id = ?`,
      [id],
    );
    if (result.changes?.changes === 0) {
      throw new ApiError("Study plan not found", 404, "NOT_FOUND");
    }
  },
};

export type LocalApi = typeof localApi;
