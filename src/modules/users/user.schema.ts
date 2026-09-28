import { z } from "zod";

export const englishLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);
export const dialectSchema = z.enum(["US", "UK"]);
export const idSchema = z.string().min(1);

export const userParamsSchema = z.object({ id: idSchema });

export const createUserSchema = z.object({
  email: z.email(),
  name: z.string().min(1).max(120),
  englishLevel: englishLevelSchema.default("A1"),
  preferredDialect: dialectSchema.default("US"),
});

export const updateUserSchema = z
  .object({
    email: z.email(),
    name: z.string().min(1).max(120),
    englishLevel: englishLevelSchema,
    preferredDialect: dialectSchema,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type EnglishLevel = z.infer<typeof englishLevelSchema>;
export type Dialect = z.infer<typeof dialectSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
