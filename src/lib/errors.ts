export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE_ENTITY"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new AppError(message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized", details?: unknown) {
    return new AppError(message, 401, "UNAUTHORIZED", details);
  }

  static notFound(message = "Resource not found", details?: unknown) {
    return new AppError(message, 404, "NOT_FOUND", details);
  }

  static conflict(message = "Resource already exists", details?: unknown) {
    return new AppError(message, 409, "CONFLICT", details);
  }
}
