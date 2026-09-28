import { withErrorHandler } from "@/lib/http/handler";
import { parseBody, parseQuery } from "@/lib/http/parse";
import { json } from "@/lib/http/response";
import {
  generatePlanSchema,
  listPlansQuerySchema,
} from "@/modules/study/plan.schema";
import { studyPlanService } from "@/modules/study/plan.service";

export const GET = withErrorHandler(async (req) => {
  const { userId } = await parseQuery(req, listPlansQuerySchema);
  const plans = await studyPlanService.list(userId);
  return json(plans);
});

export const POST = withErrorHandler(async (req) => {
  const input = await parseBody(req, generatePlanSchema);
  const plan = await studyPlanService.generate(input);
  return json(plan, 201);
});
