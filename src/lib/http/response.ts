import { NextResponse } from "next/server";

export interface ErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function json<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse<ErrorBody> {
  const error: ErrorBody["error"] = { code, message };
  if (details !== undefined) error.details = details;
  return NextResponse.json({ error }, { status });
}
