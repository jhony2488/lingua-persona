/// <reference lib="webworker" />

import type { WasmLLMModel } from "@/lib/llm/models";
import type { LLMMessage } from "@/lib/llm/types";

declare const self: DedicatedWorkerGlobalScope;

interface WasmRequest {
  type: "generate";
  id: number;
  messages: LLMMessage[];
  model: WasmLLMModel;
}

interface PipelineProgress {
  status?: string;
  file?: string;
  progress?: number;
}

interface GeneratedMessage {
  content?: string;
}

interface TextGenerator {
  (
    messages: LLMMessage[],
    options: Record<string, unknown>,
  ): Promise<{ generated_text: GeneratedMessage[] }[]>;
  dispose(): Promise<void>;
}

type PipelineFactory = (
  task: string,
  modelId: string,
  options: Record<string, unknown>,
) => Promise<TextGenerator>;

let generatorPromise: Promise<TextGenerator> | null = null;
let loadedModelId: string | null = null;
let queue = Promise.resolve();

async function getGenerator(
  model: WasmLLMModel,
  id: number,
): Promise<TextGenerator> {
  if (loadedModelId !== model.modelId) {
    const previous = await generatorPromise?.catch(() => null);
    await previous?.dispose().catch(() => {});
    generatorPromise = null;
    loadedModelId = null;
  }

  if (!generatorPromise) {
    const pending = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      const createPipeline = pipeline as unknown as PipelineFactory;
      return createPipeline("text-generation", model.modelId, {
        device: "wasm",
        dtype: "q4f16",
        progress_callback: (report: PipelineProgress) => {
          if (report.status !== "progress") return;
          const value = report.progress ?? 0;
          const progress = value > 1 ? value / 100 : value;
          self.postMessage({
            type: "progress",
            id,
            progress,
            text: report.file ?? "",
          });
        },
      });
    })();
    generatorPromise = pending;
    loadedModelId = model.modelId;
    pending.catch(() => {
      if (generatorPromise === pending) {
        generatorPromise = null;
        loadedModelId = null;
      }
    });
  }
  return generatorPromise;
}

async function generate(request: WasmRequest): Promise<void> {
  try {
    const generator = await getGenerator(request.model, request.id);
    self.postMessage({
      type: "progress",
      id: request.id,
      progress: 1,
      text: "WASM model ready",
    });
    const result = await generator(request.messages, {
      max_new_tokens: request.model.maxTokens,
      temperature: request.model.temperature,
      do_sample: true,
    });
    const reply = result[0]?.generated_text.at(-1)?.content?.trim();
    if (!reply) throw new Error("WASM model returned an empty reply");
    self.postMessage({ type: "result", id: request.id, text: reply });
  } catch (error) {
    self.postMessage({
      type: "error",
      id: request.id,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

self.onmessage = (event: MessageEvent<WasmRequest>) => {
  const request = event.data;
  queue = queue.then(() => generate(request));
};
