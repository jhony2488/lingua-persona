import { withErrorHandler } from "@/lib/http/handler";
import { parseParams } from "@/lib/http/parse";
import { json } from "@/lib/http/response";
import { studyPlanParamsSchema } from "@/modules/study/plan.schema";
import { studyPlanService } from "@/modules/study/plan.service";

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id } = await parseParams(ctx, studyPlanParamsSchema);
  const plan = await studyPlanService.getById(id);
  return json(plan);
});

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const { id } = await parseParams(ctx, studyPlanParamsSchema);
  await studyPlanService.delete(id);
  return new Response(null, { status: 204 });
});
