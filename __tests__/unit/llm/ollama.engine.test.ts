import {
  ollamaChat,
  pickOllamaModel,
  probeOllama,
} from "@/lib/llm/ollama.engine";

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("probeOllama", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns installed model names when Ollama responds", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: [{ name: "llama3.2:3b" }] }),
    });
    expect(await probeOllama()).toEqual(["llama3.2:3b"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:11434/api/tags",
      expect.anything(),
    );
  });

  it("returns empty list when Ollama is unreachable", async () => {
    mockFetch.mockRejectedValueOnce(new Error("connection refused"));
    expect(await probeOllama()).toEqual([]);
  });
});

describe("pickOllamaModel", () => {
  it("prefers the strongest installed model for the device tier", () => {
    const installed = ["smollm2:360m", "llama3.2:3b"];
    expect(pickOllamaModel(installed, "large")).toBe("llama3.2:3b");
    expect(pickOllamaModel(installed, "tiny")).toBe("smollm2:360m");
  });

  it("falls back to the first installed model without preference match", () => {
    expect(pickOllamaModel(["mistral:latest"], "medium")).toBe(
      "mistral:latest",
    );
    expect(pickOllamaModel([], "medium")).toBeNull();
  });
});

describe("ollamaChat", () => {
  it("posts the chat payload and returns the reply", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: { content: "Hi there!" } }),
    });
    const reply = await ollamaChat(
      [{ role: "user", content: "Hi" }],
      "llama3.2:1b",
    );
    expect(reply).toBe("Hi there!");
    const [, init] = mockFetch.mock.calls[0];
    expect(JSON.parse(init.body)).toMatchObject({
      model: "llama3.2:1b",
      stream: false,
    });
  });

  it("throws on empty reply", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: {} }),
    });
    await expect(ollamaChat([], "x")).rejects.toThrow("empty reply");
  });
});
