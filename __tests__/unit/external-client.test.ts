/** @jest-environment node */
import { http, HttpResponse } from "msw";
import { getJson } from "@/lib/http/external-client";
import { server, startMockServer } from "../helpers/msw";

startMockServer();

describe("getJson (msw)", () => {
  it("returns parsed JSON on success", async () => {
    server.use(
      http.get("https://api.example.com/ping", () =>
        HttpResponse.json({ pong: true }),
      ),
    );
    const data = await getJson<{ pong: boolean }>(
      "https://api.example.com/ping",
    );
    expect(data.pong).toBe(true);
  });

  it("throws AppError when the external service fails", async () => {
    server.use(
      http.get("https://api.example.com/ping", () =>
        HttpResponse.json({ message: "down" }, { status: 503 }),
      ),
    );
    await expect(getJson("https://api.example.com/ping")).rejects.toMatchObject(
      { statusCode: 502 },
    );
  });
});
