import { setupServer } from "msw/node";

export const server = setupServer();

export function startMockServer() {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
