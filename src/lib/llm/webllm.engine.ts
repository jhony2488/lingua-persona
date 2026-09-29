import type {
  AppConfig,
  InitProgressReport,
  ModelRecord,
  WebWorkerMLCEngine,
} from "@mlc-ai/web-llm";
import { LLM_MODELS, type LLMModel } from "@/lib/llm/models";
import type { LLMMessage } from "@/lib/llm/types";

interface GPUAdapterLike {
  requestAdapter(): Promise<unknown>;
}

export async function hasWebGPU(): Promise<boolean> {
  try {
    const gpu = (navigator as { gpu?: GPUAdapterLike }).gpu;
    if (!gpu) return false;
    return (await gpu.requestAdapter()) !== null;
  } catch {
    return false;
  }
}

interface ModelsManifest {
  models: { modelId: string; modelLib: string }[];
}

let manifestPromise: Promise<ModelsManifest | null> | null = null;

/** Manifest gerado por `npm run download-models` — detecta self-hosting. */
function fetchManifest(): Promise<ModelsManifest | null> {
  manifestPromise ??= fetch("/models/manifest.json")
    .then(async (res) => {
      if (!res.ok) return null;
      const body = (await res.json()) as ModelsManifest;
      return Array.isArray(body.models) ? body : null;
    })
    .catch(() => null);
  return manifestPromise;
}

/**
 * Resolve a fonte dos pesos de cada modelo do catálogo:
 * /models/* (self-host, empacotado) → Hugging Face (prebuiltAppConfig).
 */
export async function resolveAppConfig(): Promise<AppConfig> {
  const { prebuiltAppConfig } = await import("@mlc-ai/web-llm");
  const manifest = await fetchManifest();
  const local = new Map(
    (manifest?.models ?? []).map((m) => [m.modelId, m.modelLib]),
  );

  const model_list: ModelRecord[] = LLM_MODELS.map((model) => {
    const modelLib = local.get(model.modelId);
    if (modelLib) {
      return {
        model_id: model.modelId,
        model: `/models/${model.modelId}`,
        model_lib: `/models/libs/${modelLib}`,
      };
    }
    const record = prebuiltAppConfig.model_list.find(
      (r) => r.model_id === model.modelId,
    );
    if (!record) throw new Error(`Unknown model_id: ${model.modelId}`);
    return record;
  });

  return { model_list };
}

let enginePromise: Promise<WebWorkerMLCEngine> | null = null;
let loadedModelId: string | null = null;

type ProgressCallback = (report: InitProgressReport) => void;

function createWorker(): Worker {
  return new Worker(new URL("./webllm.worker.ts", import.meta.url), {
    type: "module",
  });
}

/**
 * Engine singleton em Web Worker; se o bundler/ambiente não suportar o
 * worker, cai para a main thread (CreateMLCEngine).
 */
export async function initWebLLM(
  model: LLMModel,
  onProgress?: ProgressCallback,
): Promise<WebWorkerMLCEngine> {
  const webllm = await import("@mlc-ai/web-llm");
  const appConfig = await resolveAppConfig();
  if (!enginePromise) {
    const pending = (async () => {
      const config = { appConfig, initProgressCallback: onProgress };
      try {
        return await webllm.CreateWebWorkerMLCEngine(
          createWorker(),
          model.modelId,
          config,
        );
      } catch {
        return (await webllm.CreateMLCEngine(
          model.modelId,
          config,
        )) as unknown as WebWorkerMLCEngine;
      }
    })();
    enginePromise = pending;
    // Um init rejeitado não pode envenenar o singleton: libera para retry
    // (importante com o preload em background, que pode falhar por rede).
    pending.catch(() => {
      if (enginePromise === pending) enginePromise = null;
    });
  }
  const engine = await enginePromise;
  engine.setInitProgressCallback(onProgress);
  loadedModelId ??= model.modelId;
  if (loadedModelId !== model.modelId) {
    await engine.reload(model.modelId);
    loadedModelId = model.modelId;
  }
  return engine;
}

export async function generateWebLLM(
  messages: LLMMessage[],
  model: LLMModel,
  onProgress?: ProgressCallback,
): Promise<string> {
  const engine = await initWebLLM(model, onProgress);
  const completion = await engine.chat.completions.create({
    messages,
    temperature: model.temperature,
    max_tokens: model.maxTokens,
    stream: false,
  });
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("WebLLM returned an empty reply");
  return typeof content === "string" ? content : "";
}

/** Troca de modelo/limpeza — descarrega o engine para o próximo init. */
export async function resetWebLLM(): Promise<void> {
  loadedModelId = null;
  const pending = enginePromise;
  enginePromise = null;
  if (pending) {
    const engine = await pending.catch(() => null);
    await engine?.unload().catch(() => {});
  }
}
