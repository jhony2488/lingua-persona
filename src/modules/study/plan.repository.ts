import type { Prisma, StudyPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const studyPlanRepository = {
  findMany(userId?: string): Promise<StudyPlan[]> {
    return prisma.studyPlan.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string): Promise<StudyPlan | null> {
    return prisma.studyPlan.findUnique({ where: { id } });
  },

  create(data: Prisma.StudyPlanUncheckedCreateInput): Promise<StudyPlan> {
    return prisma.studyPlan.create({ data });
  },

  delete(id: string): Promise<StudyPlan> {
    return prisma.studyPlan.delete({ where: { id } });
  },
};

export type StudyPlanRepository = typeof studyPlanRepository;
