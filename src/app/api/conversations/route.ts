import { withErrorHandler } from "@/lib/http/handler";
import { parseBody, parseQuery } from "@/lib/http/parse";
import { json } from "@/lib/http/response";
import {
  createConversationSchema,
  listConversationsQuerySchema,
} from "@/modules/conversations/conversation.schema";
import { conversationService } from "@/modules/conversations/conversation.service";

export const GET = withErrorHandler(async (req) => {
  const { userId } = parseQuery(req, listConversationsQuerySchema);
  const conversations = await conversationService.list(userId);
  return json(conversations);
});

export const POST = withErrorHandler(async (req) => {
  const input = await parseBody(req, createConversationSchema);
  const conversation = await conversationService.create(input);
  return json(conversation, 201);
});
