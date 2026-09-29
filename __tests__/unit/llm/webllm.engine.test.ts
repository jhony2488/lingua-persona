jest.mock("@mlc-ai/web-llm", () => ({
  prebuiltAppConfig: {
    model_list: [
      "SmolLM2-360M-Instruct-q4f32_1-MLC",
      "Llama-3.2-1B-Instruct-q4f16_1-MLC",
      "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
      "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    ].map((model_id) => ({
      model_id,
      model: "https://huggingface.co/mlc-ai/test",
      model_lib: "https://example.com/lib.wasm",
    })),
  },
  CreateWebWorkerMLCEngine: jest.fn(),
  CreateMLCEngine: jest.fn(),
}));

import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { LLM_MODELS } from "@/lib/llm/models";
import { initWebLLM, resetWebLLM } from "@/lib/llm/webllm.engine";

const createMLCEngine = CreateMLCEngine as jest.Mock;
const mockFetch = jest.fn();
global.fetch = mockFetch;

const model = LLM_MODELS[0];

function fakeEngine() {
  return {
    setInitProgressCallback: jest.fn(),
    unload: jest.fn(() => Promise.resolve()),
  };
}

describe("initWebLLM", () => {
  beforeEach(async () => {
    await resetWebLLM();
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: false });
  });

  it("retries after a failed init instead of caching the rejection", async () => {
    createMLCEngine
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(fakeEngine());

    await expect(initWebLLM(model)).rejects.toThrow("boom");
    const engine = await initWebLLM(model);
    expect(createMLCEngine).toHaveBeenCalledTimes(2);
    expect(engine).toBeDefined();
  });

  it("reuses the warmed engine for subsequent calls", async () => {
    const engine = fakeEngine();
    createMLCEngine.mockResolvedValueOnce(engine);
    const first = await initWebLLM(model);
    const second = await initWebLLM(model);
    expect(createMLCEngine).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
  });
});
