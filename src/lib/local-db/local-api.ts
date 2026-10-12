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
  UpdateUserPayload,
} from "@/lib/api-client";
import {
  SCHEMA_STATEMENTS,
  USER_PROFILE_COLUMN_MIGRATIONS,
} from "@/lib/local-db/schema.sql";
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
    const userColumns = await connection.query(`PRAGMA table_info("User")`);
    const existingColumns = new Set(
      ((userColumns.values ?? []) as { name: string }[]).map(
        (column) => column.name,
      ),
    );
    for (const migration of USER_PROFILE_COLUMN_MIGRATIONS) {
      if (!existingColumns.has(migration.name)) {
        await connection.execute(migration.statement);
      }
    }
    return connection;
  })();
  return dbPromise;
}

const now = () => new Date().toISOString();

export const localApi = {
  async findUserByEmail(email: string): Promise<User | null> {
    const connection = await db();
    const result = await connection.query(
      `SELECT * FROM "User" WHERE email = ?`,
      [email],
    );
    return (result.values?.[0] as User | undefined) ?? null;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const connection = await db();
    const existing = await connection.query(
      `SELECT * FROM "User" WHERE email = ?`,
      [payload.email],
    );
    if (existing.values?.[0]) return existing.values[0] as unknown as User;

    const user = {
      id: crypto.randomUUID(),
      email: payload.email,
      name: payload.name,
      agentName: payload.agentName ?? "Alex",
      agentGender: payload.agentGender ?? "male",
      englishLevel: payload.englishLevel ?? "A1",
      preferredDialect: payload.preferredDialect ?? "US",
      createdAt: now(),
      updatedAt: now(),
    };
    try {
      await connection.run(
        `INSERT INTO "User" (id, email, name, agentName, agentGender, englishLevel, preferredDialect, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id,
          user.email,
          user.name,
          user.agentName,
          user.agentGender,
          user.englishLevel,
          user.preferredDialect,
          user.createdAt,
          user.updatedAt,
        ],
      );
    } catch {
      const racedUser = await connection.query(
        `SELECT * FROM "User" WHERE email = ?`,
        [payload.email],
      );
      if (racedUser.values?.[0]) {
        return racedUser.values[0] as unknown as User;
      }
      throw new ApiError("Email already in use", 409, "CONFLICT");
    }
    return user as unknown as User;
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const connection = await db();
    const fields: string[] = [];
    const values: string[] = [];
    const columns = [
      ["agentName", payload.agentName],
      ["agentGender", payload.agentGender],
      ["englishLevel", payload.englishLevel],
      ["preferredDialect", payload.preferredDialect],
    ] as const;

    for (const [column, value] of columns) {
      if (value === undefined) continue;
      fields.push(`"${column}" = ?`);
      values.push(value);
    }
    if (fields.length === 0) {
      throw new ApiError("At least one field must be provided", 422);
    }

    fields.push('"updatedAt" = ?');
    values.push(now(), id);
    await connection.run(
      `UPDATE "User" SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );
    const result = await connection.query(`SELECT * FROM "User" WHERE id = ?`, [
      id,
    ]);
    if (!result.values?.[0]) throw new ApiError("User not found", 404);
    return result.values[0] as unknown as User;
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

  // Persiste uma mensagem por vez — a resposta do assistente é gerada no
  // cliente (src/lib/llm/router.ts) e gravada numa segunda chamada.
  async createMessage(
    conversationId: string,
    input: { content: string; role?: "user" | "assistant" },
  ): Promise<Message> {
    const connection = await db();
    const conversation = await connection.query(
      `SELECT id FROM "Conversation" WHERE id = ?`,
      [conversationId],
    );
    if (!conversation.values?.length) {
      throw new ApiError("Conversation not found", 404, "NOT_FOUND");
    }

    const message = {
      id: crypto.randomUUID(),
      conversationId,
      role: input.role ?? "user",
      content: input.content,
      createdAt: now(),
    };
    await connection.run(
      `INSERT INTO "Message" (id, conversationId, role, content, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [
        message.id,
        conversationId,
        message.role,
        message.content,
        message.createdAt,
      ],
    );
    return message as unknown as Message;
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

    const durationUnit = payload.durationUnit ?? "week";
    const duration =
      payload.duration ??
      (durationUnit === "month"
        ? Math.max(1, Math.round((payload.weeks ?? 4) / 4))
        : (payload.weeks ?? 4));
    const weeks = durationUnit === "month" ? duration * 4 : duration;

    const planJson = generatePlan({
      level: userRow.englishLevel as Parameters<
        typeof generatePlan
      >[0]["level"],
      weeks,
      durationUnit,
      duration,
      focus: payload.focus,
      usedTopics,
      books: manifestBooks,
    });

    const plan = {
      id: crypto.randomUUID(),
      userId: payload.userId,
      level: userRow.englishLevel,
      weeks,
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
