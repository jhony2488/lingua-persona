import { withErrorHandler } from "@/lib/http/handler";
import { parseBody } from "@/lib/http/parse";
import { json } from "@/lib/http/response";
import { lookupUserSchema } from "@/modules/users/user.schema";
import { userService } from "@/modules/users/user.service";

export const POST = withErrorHandler(async (req) => {
  const { email } = await parseBody(req, lookupUserSchema);
  const user = await userService.findByEmail(email);
  return json(user);
});