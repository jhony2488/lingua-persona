/** @jest-environment <rootDir>/jest.node-env.ts */
import { z } from "zod";
import { AppError } from "@/lib/errors";
import { mapError, withErrorHandler } from "@/lib/http/handler";

describe("mapError", () => {
  it("maps AppError to its status code", async () => {
    const res = mapError(AppError.notFound("User not found"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toBe("User not found");
  });

  it("maps AppError unauthorized to 401", async () => {
    const res = mapError(AppError.unauthorized());
    expect(res.status).toBe(401);
  });

  it("maps ZodError to 422 with details", async () => {
    const schema = z.object({ name: z.string() });
    let res: Response | undefined;
    try {
      schema.parse({});
    } catch (error) {
      res = mapError(error);
    }
    expect(res?.status).toBe(422);
    const body = await res?.json();
    expect(body.error.code).toBe("UNPROCESSABLE_ENTITY");
    expect(body.error.details[0].path).toBe("name");
  });

  it("maps SyntaxError to 400", async () => {
    const res = mapError(new SyntaxError("Unexpected token"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("maps unknown errors to 500", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const res = mapError(new Error("boom"));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
    spy.mockRestore();
  });
});

describe("withErrorHandler", () => {
  const ctx = { params: Promise.resolve({}) };

  it("passes through successful responses", async () => {
    const handler = withErrorHandler(() => Response.json({ ok: true }));
    const res = await handler(new Request("http://localhost/"), ctx);
    expect(res.status).toBe(200);
  });

  it("converts thrown AppError into response", async () => {
    const handler = withErrorHandler(() => {
      throw AppError.conflict("Email already in use");
    });
    const res = await handler(new Request("http://localhost/"), ctx);
    expect(res.status).toBe(409);
  });
});
