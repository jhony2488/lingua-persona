import { z } from "zod";
import { idSchema } from "@/modules/users/user.schema";

export const messageParamsSchema = z.object({
  id: idSchema,
});

export const messageRoleSchema = z.enum(["user", "assistant"]);

export const createMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});

export const createMessageWithRoleSchema = createMessageSchema.extend({
  role: messageRoleSchema.default("user"),
});

export type MessageRole = z.infer<typeof messageRoleSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type CreateMessageWithRoleInput = z.infer<
  typeof createMessageWithRoleSchema
>;
