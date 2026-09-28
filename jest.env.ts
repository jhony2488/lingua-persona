process.env.DATABASE_URL = "file:./test.db";

// jest-environment-node não injeta os globals do undici (fetch/Request/...).
// Só polyfilla quando o ambiente de teste é node (jsdom não tem TextDecoder).
if (typeof window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fetch, Headers, Request, Response } =
    require("undici") as typeof import("undici");
  Object.assign(globalThis, { fetch, Headers, Request, Response });
}
