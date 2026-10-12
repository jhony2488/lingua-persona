import { z } from "zod";
import { idSchema } from "@/modules/users/user.schema";

export const studyPlanParamsSchema = z.object({
  id: idSchema,
});

export const planFocusSchema = z.enum(["grammar", "speaking", "balanced"]);
export const planDurationUnitSchema = z.enum(["week", "month"]);

const generatePlanRequestSchema = z.object({
  userId: idSchema,
  weeks: z.coerce.number().int().min(1).max(12).default(4),
  durationUnit: planDurationUnitSchema.default("week"),
  duration: z.coerce.number().int().min(1).max(12).optional(),
  focus: planFocusSchema.default("balanced"),
});

export const generatePlanSchema = generatePlanRequestSchema.transform(
  (input, ctx) => {
    const duration =
      input.duration ??
      (input.durationUnit === "month"
        ? Math.max(1, Math.round(input.weeks / 4))
        : input.weeks);
    const weeks = input.durationUnit === "month" ? duration * 4 : duration;
    if (weeks > 12) {
      ctx.addIssue({
        code: "custom",
        path: ["duration"],
        message: "Study plans cannot exceed twelve weeks",
      });
      return z.NEVER;
    }
    return { ...input, duration, weeks };
  },
);

export const listPlansQuerySchema = z.object({
  userId: idSchema.optional(),
});

export type PlanFocus = z.infer<typeof planFocusSchema>;
export type PlanDurationUnit = z.infer<typeof planDurationUnitSchema>;
export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;
export type ListPlansQuery = z.infer<typeof listPlansQuerySchema>;
