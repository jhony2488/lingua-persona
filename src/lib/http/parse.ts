import { z } from "zod";
import { AppError } from "@/lib/errors";

export async function parseBody<T>(req: Request, schema: z.ZodType<T>): Promise<T> {
  const raw = await req.text();
  if (!raw.trim()) {
    throw AppError.badRequest("Request body is required");
  }
  return schema.parse(JSON.parse(raw));
}

export async function parseParams<T>(
  ctx: { params: Promise<Record<string, string>> },
  schema: z.ZodType<T>,
): Promise<T> {
  return schema.parse(await ctx.params);
}

export function parseQuery<T>(req: Request, schema: z.ZodType<T>): T {
  const url = new URL(req.url);
  return schema.parse(Object.fromEntries(url.searchParams));
}
