import { withErrorHandler } from "@/lib/http/handler";
import { parseBody, parseParams } from "@/lib/http/parse";
import { json } from "@/lib/http/response";
import {
  conversationParamsSchema,
  updateConversationSchema,
} from "@/modules/conversations/conversation.schema";
import { conversationService } from "@/modules/conversations/conversation.service";

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await parseParams(ctx, conversationParamsSchema);
  return json(await conversationService.get(id));
});

export const PATCH = withErrorHandler(async (req, ctx) => {
  const { id } = await parseParams(ctx, conversationParamsSchema);
  const input = await parseBody(req, updateConversationSchema);
  return json(await conversationService.update(id, input));
});

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const { id } = await parseParams(ctx, conversationParamsSchema);
  await conversationService.remove(id);
  return new Response(null, { status: 204 });
});
