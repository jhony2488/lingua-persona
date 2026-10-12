"use client";

import { format } from "@/i18n/format";
import { useDict } from "@/i18n/provider";
import { getModel, getWasmModel } from "@/lib/llm/models";
import { useLLMStore } from "@/lib/llm/store";

export function ModelDownloadProgress() {
  const dict = useDict();
  const status = useLLMStore((state) => state.status);
  const progress = useLLMStore((state) => state.progress);
  const progressText = useLLMStore((state) => state.progressText);
  const modelId = useLLMStore((state) => state.modelId);

  if (status !== "downloading") return null;

  const loadedPercent = Math.min(100, Math.max(0, Math.round(progress * 100)));
  const remainingPercent = 100 - loadedPercent;
  const model = modelId
    ? (getModel(modelId) ?? getWasmModel(modelId))?.label
    : undefined;
  const progressLabel = format(dict.llm.downloadProgress, {
    model: model ?? dict.llm.model,
    pct: String(remainingPercent),
  });

  return (
    <div className="border-b bg-muted/50 px-4 py-2" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-5xl items-center gap-3 text-xs">
        <span className="min-w-0 flex-1 truncate">{progressLabel}</span>
        <span
          className="bg-background relative h-1.5 w-24 shrink-0 overflow-hidden rounded-full"
          role="progressbar"
          aria-label={progressLabel}
          aria-valuenow={loadedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={progressText || progressLabel}
          title={progressText || progressLabel}
        >
          <span
            className="bg-primary absolute inset-y-0 left-0"
            style={{ width: `${loadedPercent}%` }}
          />
        </span>
      </div>
    </div>
  );
}