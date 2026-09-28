import { withErrorHandler } from "@/lib/http/handler";
import { parseBody, parseParams } from "@/lib/http/parse";
import { json } from "@/lib/http/response";
import {
  updateUserSchema,
  userParamsSchema,
} from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await parseParams(ctx, userParamsSchema);
  return json(await userService.get(id));
});

export const PATCH = withErrorHandler(async (req, ctx) => {
  const { id } = await parseParams(ctx, userParamsSchema);
  const input = await parseBody(req, updateUserSchema);
  return json(await userService.update(id, input));
});

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const { id } = await parseParams(ctx, userParamsSchema);
  await userService.remove(id);
  return new Response(null, { status: 204 });
});
