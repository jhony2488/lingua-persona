import { generateWasmLLM, resetWasmLLM } from "@/lib/llm/wasm.engine";
import { WASM_LLM_MODELS } from "@/lib/llm/models";

class FakeWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = jest.fn((request: { id: number }) => {
    this.onmessage?.({
      data: {
        type: "progress",
        id: request.id,
        progress: 0.5,
        text: "onnx/model_q4f16.onnx",
      },
    } as MessageEvent);
    this.onmessage?.({
      data: { type: "result", id: request.id, text: "A WASM reply" },
    } as MessageEvent);
  });
  terminate = jest.fn();
}

describe("generateWasmLLM", () => {
  let fakeWorker: FakeWorker;

  beforeEach(() => {
    resetWasmLLM();
    fakeWorker = new FakeWorker();
    global.Worker = jest.fn(() => fakeWorker) as unknown as typeof Worker;
  });

  afterEach(() => {
    resetWasmLLM();
    jest.restoreAllMocks();
  });

  it("runs requests in a worker and reports normalized download progress", async () => {
    const onProgress = jest.fn();
    const reply = await generateWasmLLM(
      [{ role: "user", content: "Hello" }],
      WASM_LLM_MODELS[0],
      onProgress,
    );

    expect(reply).toBe("A WASM reply");
    expect(onProgress).toHaveBeenCalledWith(0.5, "onnx/model_q4f16.onnx");
    expect(fakeWorker.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "generate",
        model: WASM_LLM_MODELS[0],
      }),
    );
  });
});
