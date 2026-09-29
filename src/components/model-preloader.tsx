"use client";

import { useEffect } from "react";
import {
  detectDeviceCapabilities,
  getModel,
  pickDefaultModel,
} from "@/lib/llm/models";
import { useLLMStore } from "@/lib/llm/store";
import { hasWebGPU, initWebLLM } from "@/lib/llm/webllm.engine";
import { createSpeechRecognition } from "@/lib/speech";
import { initWhisper, isWhisperSupported } from "@/lib/stt/whisper.engine";
import { useSettings } from "@/lib/store/settings";

function isSaveData(): boolean {
  return Boolean(
    (navigator as { connection?: { saveData?: boolean } }).connection?.saveData,
  );
}

/**
 * Aquece os modelos on-device em background assim que qualquer página abre:
 * o LLM (WebLLM) sempre que o engine preferido permitir, e o Whisper quando
 * a Web Speech API não existir (fallback STT). Respeita Save-Data.
 */
export function ModelPreloader() {
  const llmEngine = useSettings((s) => s.llmEngine);
  const llmModel = useSettings((s) => s.llmModel);

  useEffect(() => {
    if (llmEngine === "ollama" || llmEngine === "local") return;
    if (isSaveData()) return;

    let cancelled = false;

    const warmLLM = async () => {
      const model =
        (llmModel ? getModel(llmModel) : undefined) ??
        pickDefaultModel(detectDeviceCapabilities());
      if (!(await hasWebGPU()) || cancelled) return;
      const store = useLLMStore.getState();
      store.setModelId(model.modelId);
      store.setStatus("downloading");
      try {
        await initWebLLM(model, (report) => {
          store.setProgress(report.progress, report.text);
        });
        if (cancelled) return;
        store.setStatus("ready");
        store.setEngine("webllm");
      } catch {
        if (!cancelled) {
          store.setStatus("idle");
          store.setEngine(null);
        }
      }
    };

    const warmSTT = () => {
      if (createSpeechRecognition() || !isWhisperSupported()) return;
      void initWhisper().catch(() => {});
    };

    const run = () => {
      void warmLLM();
      warmSTT();
    };

    const idle = window.requestIdleCallback;
    const id = idle
      ? idle(run, { timeout: 4000 })
      : (setTimeout(run, 1500) as unknown as number);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, [llmEngine, llmModel]);

  return null;
}
