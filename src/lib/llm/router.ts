import { generateAssistantReply } from "@/modules/assistant/assistant.service";
import { buildSystemPrompt, toChatMessages } from "@/modules/assistant/prompt";
import {
  getModel,
  detectDeviceCapabilities,
  detectDeviceTier,
  pickWasmModel,
  pickDefaultModel,
} from "@/lib/llm/models";
import {
  ollamaChat,
  pickOllamaModel,
  probeOllama,
} from "@/lib/llm/ollama.engine";
import { useLLMStore } from "@/lib/llm/store";
import type { ChatContext, EngineKind } from "@/lib/llm/types";
import { generateWebLLM, hasWebGPU } from "@/lib/llm/webllm.engine";
import { generateWasmLLM, isWasmSupported } from "@/lib/llm/wasm.engine";
import { useSettings } from "@/lib/store/settings";

interface HistoryMessage {
  role: string;
  content: string;
}

export interface ChatReply {
  reply: string;
  engine: EngineKind;
}

/**
 * Roteia a geração pela cadeia WebLLM → WASM → Ollama → fallback local.
 * Nunca lança: a última opção é determinística e sempre funciona.
 */
export async function generateChatReply(
  history: HistoryMessage[],
  ctx: ChatContext,
): Promise<ChatReply> {
  const { llmEngine, llmModel } = useSettings.getState();
  const store = useLLMStore.getState();
  const capabilities = detectDeviceCapabilities();
  const tier = detectDeviceTier(capabilities);
  const model =
    (llmModel ? getModel(llmModel) : undefined) ??
    pickDefaultModel(capabilities);
  store.setModelId(model.modelId);

  const messages = toChatMessages(
    history,
    buildSystemPrompt(ctx, model.tier),
    model.maxHistory,
  );
  const preference = llmEngine ?? "auto";
  const preferredTier = getModel(llmModel ?? "")?.tier ?? tier;

  if (preference !== "local" && preference !== "ollama") {
    if (preference !== "wasm" && (await hasWebGPU())) {
      try {
        store.setStatus("downloading");
        const reply = await generateWebLLM(messages, model, (report) => {
          store.setProgress(report.progress, report.text);
          if (report.progress >= 1) store.setStatus("generating");
        });
        store.setStatus("ready");
        store.setEngine("webllm");
        return { reply, engine: "webllm" };
      } catch {
        // Falhou (download, adapter, worker) — segue a cadeia.
      }
    }

    const wasmModel = pickWasmModel(capabilities, preferredTier);
    if (wasmModel && isWasmSupported()) {
      try {
        store.setModelId(wasmModel.modelId);
        store.setStatus("downloading");
        const reply = await generateWasmLLM(messages, wasmModel, (progress, text) => {
          store.setProgress(progress, text);
          if (progress >= 1) store.setStatus("generating");
        });
        store.setStatus("ready");
        store.setEngine("wasm");
        return { reply, engine: "wasm" };
      } catch {
        // Falhou o runtime ou download — segue para o Ollama/fallback local.
      }
    }
  }

  if (
    preference !== "local" &&
    preference !== "webllm" &&
    preference !== "wasm"
  ) {
    const installed = await probeOllama();
    const ollamaModel = pickOllamaModel(installed, tier);
    if (ollamaModel) {
      try {
        store.setStatus("generating");
        const reply = await ollamaChat(messages, ollamaModel);
        store.setStatus("ready");
        store.setEngine("ollama");
        return { reply, engine: "ollama" };
      } catch {
        // Ollama indisponível/falhou — cai no fallback local.
      }
    }
  }

  store.setStatus("fallback");
  store.setEngine("local");
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  return {
    reply: generateAssistantReply(lastUser?.content ?? "", String(ctx.level)),
    engine: "local",
  };
}
