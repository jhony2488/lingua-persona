"use client";

import { useEffect } from "react";
import {
  detectDeviceCapabilities,
  getModel,
  pickWasmModel,
  pickDefaultModel,
} from "@/lib/llm/models";
import { useLLMStore } from "@/lib/llm/store";
import { hasWebGPU, initWebLLM } from "@/lib/llm/webllm.engine";
import {
  isWasmSupported,
  preloadWasmLLM,
} from "@/lib/llm/wasm.engine";
import { createSpeechRecognition } from "@/lib/speech";
import { initWhisper, isWhisperSupported } from "@/lib/stt/whisper.engine";
import { useSettings } from "@/lib/store/settings";

function isSaveData(): boolean {
  return Boolean(
    (navigator as { connection?: { saveData?: boolean } }).connection?.saveData,
  );
}

/**
 * Aquece o engine escolhido em background e o Whisper quando necessário.
 * WASM só é pré-carregado quando selecionado, evitando download inesperado
 * no modo automático. Respeita Save-Data e os limites de hardware.
 */
export function ModelPreloader() {
  const llmEngine = useSettings((s) => s.llmEngine);
  const llmModel = useSettings((s) => s.llmModel);

  useEffect(() => {
    if (llmEngine === "ollama" || llmEngine === "local") return;
    if (isSaveData()) return;

    let cancelled = false;

    const warmLLM = async () => {
      const capabilities = detectDeviceCapabilities();
      const model =
        (llmModel ? getModel(llmModel) : undefined) ??
        pickDefaultModel(capabilities);
      const preference = llmEngine ?? "auto";
      const store = useLLMStore.getState();

      if (preference === "wasm") {
        const wasmModel = pickWasmModel(capabilities, model.tier);
        if (!wasmModel || !isWasmSupported()) return;

        store.setModelId(wasmModel.modelId);
        store.setStatus("downloading");
        try {
          await preloadWasmLLM(wasmModel, (progress, text) => {
            store.setProgress(progress, text);
          });
          if (cancelled) return;
          store.setStatus("ready");
          store.setEngine("wasm");
        } catch {
          if (!cancelled) {
            store.setStatus("idle");
            store.setEngine(null);
          }
        }
        return;
      }

      if (preference === "auto" || preference === "webllm") {
        if (!cancelled && (await hasWebGPU())) {
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

    // requestIdleCallback não existe no Safari — fallback para setTimeout.
    const idle = (
      window as {
        requestIdleCallback?: Window["requestIdleCallback"];
      }
    ).requestIdleCallback;
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
