import type { LLMMessage } from "@/lib/llm/types";
import type { WasmLLMModel } from "@/lib/llm/models";

type WasmRequest =
  | {
      type: "init";
      id: number;
      model: WasmLLMModel;
    }
  | {
      type: "generate";
      id: number;
      messages: LLMMessage[];
      model: WasmLLMModel;
    };

type WasmResponse =
  | {
      type: "progress";
      id: number;
      progress: number;
      text: string;
    }
  | { type: "ready"; id: number }
  | { type: "result"; id: number; text: string }
  | { type: "error"; id: number; message: string };

interface PendingGeneration {
  resolve: (text: string) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: number, text: string) => void;
}

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, PendingGeneration>();

export function isWasmSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof Worker !== "undefined" &&
    typeof WebAssembly !== "undefined"
  );
}

function failPending(error: Error) {
  for (const generation of pending.values()) generation.reject(error);
  pending.clear();
}

function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./wasm.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onmessage = (event: MessageEvent<WasmResponse>) => {
    const message = event.data;
    const generation = pending.get(message.id);
    if (!generation) return;
    if (message.type === "progress") {
      generation.onProgress?.(message.progress, message.text);
      return;
    }
    pending.delete(message.id);
    if (message.type === "error") generation.reject(new Error(message.message));
    else generation.resolve(message.type === "result" ? message.text : "");
  };
  worker.onerror = (event) => {
    const error = new Error(event.message || "WASM worker failed");
    failPending(error);
    worker?.terminate();
    worker = null;
  };
  return worker;
}

function sendRequest(
  request: WasmRequest,
  onProgress?: (progress: number, text: string) => void,
): Promise<string> {
  if (!isWasmSupported()) {
    return Promise.reject(new Error("WASM inference is not supported"));
  }

  return new Promise<string>((resolve, reject) => {
    pending.set(request.id, { resolve, reject, onProgress });
    try {
      ensureWorker().postMessage(request);
    } catch (error) {
      pending.delete(request.id);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export function preloadWasmLLM(
  model: WasmLLMModel,
  onProgress?: (progress: number, text: string) => void,
): Promise<void> {
  const id = nextId++;
  return sendRequest({ type: "init", id, model }, onProgress).then(() => {});
}

export function generateWasmLLM(
  messages: LLMMessage[],
  model: WasmLLMModel,
  onProgress?: (progress: number, text: string) => void,
): Promise<string> {
  const id = nextId++;
  return sendRequest({ type: "generate", id, messages, model }, onProgress);
}

export function resetWasmLLM(): void {
  failPending(new Error("WASM engine reset"));
  worker?.terminate();
  worker = null;
}
