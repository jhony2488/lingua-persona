"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "@/i18n/format";
import { useDict } from "@/i18n/provider";
import {
  LLM_MODELS,
  detectDeviceCapabilities,
  detectDeviceTier,
  getModel,
  pickDefaultModel,
} from "@/lib/llm/models";
import { useLLMStore } from "@/lib/llm/store";
import { resetWebLLM } from "@/lib/llm/webllm.engine";
import { useSettings, type LLMEnginePreference } from "@/lib/store/settings";

const ENGINE_OPTIONS: { value: LLMEnginePreference; key: keyof EngineDict }[] =
  [
    { value: "auto", key: "engineAuto" },
    { value: "webllm", key: "engineWebllm" },
    { value: "ollama", key: "engineOllama" },
    { value: "local", key: "engineLocal" },
  ];

interface EngineDict {
  engineAuto: string;
  engineWebllm: string;
  engineOllama: string;
  engineLocal: string;
}

/**
 * Chip do engine de inferência no header do chat: mostra status/progresso
 * de download e permite trocar engine e modelo (override do auto-detect).
 */
export function EngineStatus() {
  const dict = useDict();
  const status = useLLMStore((s) => s.status);
  const progress = useLLMStore((s) => s.progress);
  const progressText = useLLMStore((s) => s.progressText);
  const engine = useLLMStore((s) => s.engine);
  const activeModelId = useLLMStore((s) => s.modelId);

  const llmEngine = useSettings((s) => s.llmEngine);
  const llmModel = useSettings((s) => s.llmModel);
  const setLLMEngine = useSettings((s) => s.setLLMEngine);
  const setLLMModel = useSettings((s) => s.setLLMModel);

  const recommended = useMemo(
    () => pickDefaultModel(detectDeviceCapabilities()),
    [],
  );
  const deviceTier = useMemo(
    () => detectDeviceTier(detectDeviceCapabilities()),
    [],
  );

  const activeModel =
    (activeModelId ? getModel(activeModelId) : undefined) ??
    (llmModel ? getModel(llmModel) : undefined) ??
    recommended;

  const statusBadge = (() => {
    if (status === "downloading" || status === "generating") {
      const pct = Math.round(progress * 100);
      return (
        <Badge variant="secondary">
          {progress > 0
            ? format(dict.llm.downloading, {
                model: activeModel.label,
                pct: String(pct),
              })
            : dict.voice.thinking}
        </Badge>
      );
    }
    if (status === "fallback" || engine === "local") {
      return <Badge variant="outline">{dict.llm.offlineMode}</Badge>;
    }
    if (engine) {
      return (
        <Badge variant="secondary">{format(dict.llm.ready, { engine })}</Badge>
      );
    }
    return null;
  })();

  return (
    <div className="flex items-center gap-2 text-xs">
      {statusBadge}
      {status === "downloading" && progress > 0 && progress < 1 && (
        <span
          className="bg-muted relative h-1 w-16 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          title={progressText}
        >
          <span
            className="bg-primary absolute inset-y-0 left-0"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </span>
      )}

      <Select
        value={llmEngine}
        onValueChange={(value) => setLLMEngine(value as LLMEnginePreference)}
      >
        <SelectTrigger size="sm" aria-label={dict.llm.engine}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ENGINE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {dict.llm[option.key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={llmModel ?? "auto"}
        onValueChange={(value) => {
          void resetWebLLM();
          setLLMModel(value === "auto" ? null : value);
        }}
      >
        <SelectTrigger size="sm" aria-label={dict.llm.model}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">
            {dict.llm.auto} — {recommended.label} ({dict.llm.recommended})
          </SelectItem>
          {LLM_MODELS.map((model) => (
            <SelectItem key={model.modelId} value={model.modelId}>
              {model.label}
              {model.tier === deviceTier && model !== recommended
                ? ` (${dict.llm.recommended})`
                : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
