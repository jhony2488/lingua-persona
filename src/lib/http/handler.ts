import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { errorResponse } from "@/lib/http/response";

export type RouteContext = { params: Promise<Record<string, string>> };
export type RouteHandler = (
  req: Request,
  ctx: RouteContext,
) => Promise<Response> | Response;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      return mapError(error);
    }
  };
}

export function mapError(error: unknown): Response {
  if (error instanceof AppError) {
    return errorResponse(
      error.code,
      error.message,
      error.statusCode,
      error.details,
    );
  }

  if (error instanceof ZodError) {
    return errorResponse(
      "UNPROCESSABLE_ENTITY",
      "Validation failed",
      422,
      error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  if (error instanceof SyntaxError) {
    return errorResponse("BAD_REQUEST", "Malformed JSON body", 400);
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return errorResponse("NOT_FOUND", "Resource not found", 404);
  }

  console.error("[api] unhandled error:", error);
  return errorResponse("INTERNAL_ERROR", "Internal server error", 500);
}
