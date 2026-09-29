import { generateAssistantReply } from "@/modules/assistant/assistant.service";
import { buildSystemPrompt, toChatMessages } from "@/modules/assistant/prompt";
import {
  detectDeviceCapabilities,
  detectDeviceTier,
  getModel,
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
 * Roteia a geração pela cadeia WebLLM → Ollama → fallback local.
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

  if (preference !== "local" && preference !== "ollama") {
    if (await hasWebGPU()) {
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
  }

  if (preference !== "local" && preference !== "webllm") {
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
