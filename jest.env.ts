process.env.DATABASE_URL = "file:./test.db";

// jest-environment-node não injeta os globals do undici (fetch/Request/...).
// Só polyfilla quando o ambiente de teste é node (jsdom não tem TextDecoder).
if (typeof window === "undefined") {
  const undici =
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("undici") as typeof import("undici");
  Object.assign(globalThis, {
    fetch: undici.fetch,
    Headers: undici.Headers,
    Request: undici.Request,
    Response: undici.Response,
  });
}
