import { z } from "zod";
import { idSchema } from "@/modules/users/user.schema";

export const studyPlanParamsSchema = z.object({
  id: idSchema,
});

export const planFocusSchema = z.enum(["grammar", "speaking", "balanced"]);

export const generatePlanSchema = z.object({
  userId: idSchema,
  weeks: z.coerce.number().int().min(1).max(12).default(4),
  focus: planFocusSchema.default("balanced"),
});

export const listPlansQuerySchema = z.object({
  userId: idSchema.optional(),
});

export type PlanFocus = z.infer<typeof planFocusSchema>;
export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;
export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>;
