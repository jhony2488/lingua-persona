import { withErrorHandler } from "@/lib/http/handler";
import { parseBody, parseParams } from "@/lib/http/parse";
import { json } from "@/lib/http/response";
import {
  createMessageWithRoleSchema,
  messageParamsSchema,
} from "@/modules/conversations/message.schema";
import { messageService } from "@/modules/conversations/message.service";

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await parseParams(ctx, messageParamsSchema);
  const messages = await messageService.list(id);
  return json(messages);
});

export const POST = withErrorHandler(async (req, ctx) => {
  const { id } = await parseParams(ctx, messageParamsSchema);
  const input = await parseBody(req, createMessageWithRoleSchema);
  const message = await messageService.create(id, input);
  return json(message, 201);
});
