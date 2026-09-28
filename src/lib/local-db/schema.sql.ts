/**
 * DDL idempotente que espelha prisma/schema.prisma + migrations.
 * Fonte única para: (a) camada de dados local do mobile (Capacitor SQLite)
 * e (b) bootstrap do DB no sidecar/standalone via instrumentation.ts.
 * Regenerar/validar após mudanças no schema: npm run db:schema:sql
 */
export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "englishLevel" TEXT NOT NULL DEFAULT 'A1',
    "preferredDialect" TEXT NOT NULL DEFAULT 'US',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "User_englishLevel_idx" ON "User"("englishLevel")`,
  `CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "dialect" TEXT NOT NULL DEFAULT 'US',
    "level" TEXT NOT NULL DEFAULT 'A1',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Conversation_createdAt_idx" ON "Conversation"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Conversation_updatedAt_idx" ON "Conversation"("updatedAt")`,
  `CREATE INDEX IF NOT EXISTS "Conversation_userId_createdAt_idx" ON "Conversation"("userId", "createdAt")`,
  `CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Message_role_idx" ON "Message"("role")`,
  `CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Message_conversationId_role_createdAt_idx" ON "Message"("conversationId", "role", "createdAt")`,
  `CREATE TABLE IF NOT EXISTS "StudyPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "weeks" INTEGER NOT NULL,
    "focus" TEXT,
    "planJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "StudyPlan_userId_createdAt_idx" ON "StudyPlan"("userId", "createdAt")`,
];
