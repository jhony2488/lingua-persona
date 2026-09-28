import { withErrorHandler } from "@/lib/http/handler";
import { parseBody } from "@/lib/http/parse";
import { json } from "@/lib/http/response";
import { createUserSchema } from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";

export const GET = withErrorHandler(async () => {
  const users = await userService.list();
  return json(users);
});

export const POST = withErrorHandler(async (req) => {
  const input = await parseBody(req, createUserSchema);
  const user = await userService.create(input);
  return json(user, 201);
});
