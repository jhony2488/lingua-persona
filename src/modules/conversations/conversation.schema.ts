import { z } from "zod";
import {
  dialectSchema,
  englishLevelSchema,
  idSchema,
} from "@/modules/users/user.schema";

export const conversationParamsSchema = z.object({ id: idSchema });

export const listConversationsQuerySchema = z.object({
  userId: idSchema.optional(),
});

export const createConversationSchema = z.object({
  userId: idSchema,
  title: z.string().min(1).max(200).optional(),
  dialect: dialectSchema.default("US"),
  level: englishLevelSchema.default("A1"),
});

export const updateConversationSchema = z
  .object({
    title: z.string().min(1).max(200).nullable(),
    dialect: dialectSchema,
    level: englishLevelSchema,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type ListConversationsQuery = z.infer<
  typeof listConversationsQuerySchema
>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
