import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { StudyPlan } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { conversationRepository } from "@/modules/conversations/conversation.repository";
import { userRepository } from "@/modules/users/user.repository";
import {
  generatePlan,
  type ManifestBook,
  type PlanJson,
} from "@/modules/study/plan-generator";
import { studyPlanRepository } from "@/modules/study/plan.repository";
import type { GeneratePlanInput } from "@/modules/study/plan.schema";
import type { EnglishLevel } from "@/lib/store/settings";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

let cachedBooks: ManifestBook[] | null = null;

export function loadManifestBooks(): ManifestBook[] {
  cachedBooks ??= (
    JSON.parse(
      readFileSync(
        join(process.cwd(), "data", "library", "manifest.json"),
        "utf8",
      ),
    ) as { books: ManifestBook[] }
  ).books;
  return cachedBooks;
}

function toEnglishLevel(level: string): EnglishLevel {
  return (LEVELS as readonly string[]).includes(level)
    ? (level as EnglishLevel)
    : "A1";
}

export const studyPlanService = {
  async list(userId?: string): Promise<StudyPlan[]> {
    return studyPlanRepository.findMany(userId);
  },

  async getById(id: string): Promise<StudyPlan> {
    const plan = await studyPlanRepository.findById(id);
    if (!plan) throw AppError.notFound("Study plan not found");
    return plan;
  },

  async generate(input: GeneratePlanInput): Promise<StudyPlan> {
    const user = await userRepository.findById(input.userId);
    if (!user) throw AppError.notFound("User not found");

    const conversations = await conversationRepository.findMany(user.id);
    const usedTopics = conversations
      .map((c) => c.title)
      .filter((t): t is string => Boolean(t));

    const planJson: PlanJson = generatePlan({
      level: toEnglishLevel(user.englishLevel),
      weeks: input.weeks,
      focus: input.focus,
      usedTopics,
      books: loadManifestBooks(),
    });

    return studyPlanRepository.create({
      userId: user.id,
      level: user.englishLevel,
      weeks: input.weeks,
      focus: input.focus,
      planJson: JSON.stringify(planJson),
    });
  },

  async delete(id: string): Promise<void> {
    const plan = await studyPlanRepository.findById(id);
    if (!plan) throw AppError.notFound("Study plan not found");
    await studyPlanRepository.delete(id);
  },
};

export type StudyPlanService = typeof studyPlanService;
