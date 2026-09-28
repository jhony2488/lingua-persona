import http from "node:http";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<Record<string, string>> };
type RouteHandler = (
  req: NextRequest,
  ctx: RouteContext,
) => Promise<Response> | Response;

function matchPath(
  pattern: string,
  path: string,
): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    const segment = patternParts[i];
    if (segment.startsWith(":")) {
      params[segment.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (segment !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

/**
 * Mini-router que adapta Route Handlers do Next.js para um listener Node,
 * permitindo testá-los com supertest sem subir o servidor do Next.
 */
export function createApp(routes: Record<string, RouteHandler>) {
  const parsed = Object.entries(routes).map(([key, handler]) => {
    const [method, pattern] = key.split(" ");
    return { method: method.toUpperCase(), pattern, handler };
  });

  const listener = async (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) => {
    try {
      const url = new URL(req.url ?? "/", "http://localhost");
      let handler: RouteHandler | undefined;
      let params: Record<string, string> = {};

      for (const route of parsed) {
        if (route.method !== req.method) continue;
        const match = matchPath(route.pattern, url.pathname);
        if (match) {
          handler = route.handler;
          params = match;
          break;
        }
      }

      if (!handler) {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            error: { code: "NOT_FOUND", message: "Route not found" },
          }),
        );
        return;
      }

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value)
          headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }

      let body: Buffer | undefined;
      if (req.method !== "GET" && req.method !== "HEAD") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const buf = Buffer.concat(chunks);
        if (buf.length) body = buf;
      }

      const init = {
        method: req.method,
        headers,
        ...(body ? { body, duplex: "half" } : {}),
      } as ConstructorParameters<typeof NextRequest>[1];
      const request = new NextRequest(url, init);
      const response = await handler(request, {
        params: Promise.resolve(params),
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      res.writeHead(response.status, responseHeaders);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          error: { code: "INTERNAL_ERROR", message: String(error) },
        }),
      );
    }
  };

  return listener;
}
