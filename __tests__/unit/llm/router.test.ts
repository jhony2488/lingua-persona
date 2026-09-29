import { generateChatReply } from "@/lib/llm/router";
import { generateWebLLM, hasWebGPU } from "@/lib/llm/webllm.engine";
import {
  ollamaChat,
  pickOllamaModel,
  probeOllama,
} from "@/lib/llm/ollama.engine";
import { useSettings } from "@/lib/store/settings";

jest.mock("@/lib/llm/webllm.engine", () => ({
  hasWebGPU: jest.fn(),
  generateWebLLM: jest.fn(),
  resolveAppConfig: jest.fn(),
  initWebLLM: jest.fn(),
  resetWebLLM: jest.fn(),
}));

jest.mock("@/lib/llm/ollama.engine", () => ({
  probeOllama: jest.fn(),
  pickOllamaModel: jest.fn(),
  ollamaChat: jest.fn(),
}));

const mockHasWebGPU = jest.mocked(hasWebGPU);
const mockWebLLM = jest.mocked(generateWebLLM);
const mockProbe = jest.mocked(probeOllama);
const mockOllama = jest.mocked(ollamaChat);
const mockPickOllama = jest.mocked(pickOllamaModel);

const ctx = {
  level: "B1",
  dialect: "US",
  agentName: "Alex",
  agentGender: "male" as const,
};

const history = [
  { role: "user", content: "Hello teacher" },
  { role: "assistant", content: "Hi!" },
  { role: "user", content: "How are you?" },
];

describe("generateChatReply — engine chain", () => {
  beforeEach(() => {
    useSettings.setState({ llmEngine: "auto", llmModel: null });
    mockHasWebGPU.mockResolvedValue(false);
    mockProbe.mockResolvedValue([]);
    mockPickOllama.mockReturnValue(null);
  });
  afterEach(() => jest.clearAllMocks());

  it("uses WebLLM when WebGPU is available", async () => {
    mockHasWebGPU.mockResolvedValue(true);
    mockWebLLM.mockResolvedValue("Doing great, thanks!");

    const result = await generateChatReply(history, ctx);

    expect(result).toEqual({ reply: "Doing great, thanks!", engine: "webllm" });
    const [messages] = mockWebLLM.mock.calls[0];
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain('"Alex"');
    expect(mockProbe).not.toHaveBeenCalled();
  });

  it("falls back to Ollama when WebGPU is unavailable", async () => {
    mockProbe.mockResolvedValue(["llama3.2:3b"]);
    mockPickOllama.mockReturnValue("llama3.2:3b");
    mockOllama.mockResolvedValue("Ollama says hi");

    const result = await generateChatReply(history, ctx);

    expect(result).toEqual({ reply: "Ollama says hi", engine: "ollama" });
    expect(mockOllama).toHaveBeenCalledWith(expect.anything(), "llama3.2:3b");
  });

  it("falls back to Ollama when WebLLM fails", async () => {
    mockHasWebGPU.mockResolvedValue(true);
    mockWebLLM.mockRejectedValue(new Error("download failed"));
    mockProbe.mockResolvedValue(["llama3.2:1b"]);
    mockPickOllama.mockReturnValue("llama3.2:1b");
    mockOllama.mockResolvedValue("Recovered");

    const result = await generateChatReply(history, ctx);
    expect(result.engine).toBe("ollama");
  });

  it("returns the deterministic local reply when no engine works", async () => {
    const result = await generateChatReply(history, ctx);

    expect(result.engine).toBe("local");
    expect(result.reply).toContain("offline mode");
    expect(result.reply).toContain("How are you?");
  });

  it("honors the explicit local preference without probing engines", async () => {
    useSettings.setState({ llmEngine: "local" });

    const result = await generateChatReply(history, ctx);

    expect(result.engine).toBe("local");
    expect(mockHasWebGPU).not.toHaveBeenCalled();
    expect(mockProbe).not.toHaveBeenCalled();
  });
});
