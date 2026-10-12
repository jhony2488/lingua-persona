import { Capacitor } from "@capacitor/core";
import type { ModelTier } from "@/lib/llm/types";

export interface LLMModel {
  modelId: string;
  label: string;
  sizeMB: number;
  tier: ModelTier;
  minDeviceMemoryGB: number;
  maxHistory: number;
  maxTokens: number;
  temperature: number;
}

/**
 * Catálogo WebLLM ordenado do menor para o maior (docs/pt/guia-de-hardware.md).
 */
export const LLM_MODELS: LLMModel[] = [
  {
    modelId: "SmolLM2-360M-Instruct-q4f32_1-MLC",
    label: "SmolLM2 360M",
    sizeMB: 270,
    tier: "tiny",
    minDeviceMemoryGB: 2,
    maxHistory: 4,
    maxTokens: 256,
    temperature: 0.4,
  },
  {
    modelId: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 1B",
    sizeMB: 800,
    tier: "small",
    minDeviceMemoryGB: 4,
    maxHistory: 8,
    maxTokens: 384,
    temperature: 0.6,
  },
  {
    modelId: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "Qwen 2.5 1.5B",
    sizeMB: 1100,
    tier: "medium",
    minDeviceMemoryGB: 8,
    maxHistory: 10,
    maxTokens: 512,
    temperature: 0.6,
  },
  {
    modelId: "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 3B",
    sizeMB: 2000,
    tier: "large",
    minDeviceMemoryGB: 16,
    maxHistory: 12,
    maxTokens: 512,
    temperature: 0.6,
  },
];

export interface WasmLLMModel extends LLMModel {
  minHardwareConcurrency: number;
}

export const WASM_LLM_MODELS: WasmLLMModel[] = [
  {
    modelId: "onnx-community/Qwen2.5-0.5B-Instruct",
    label: "Qwen 2.5 0.5B (WASM)",
    sizeMB: 483,
    tier: "tiny",
    minDeviceMemoryGB: 4,
    minHardwareConcurrency: 4,
    maxHistory: 4,
    maxTokens: 192,
    temperature: 0.4,
  },
  {
    modelId: "onnx-community/Qwen2.5-1.5B-Instruct",
    label: "Qwen 2.5 1.5B (WASM)",
    sizeMB: 1400,
    tier: "medium",
    minDeviceMemoryGB: 8,
    minHardwareConcurrency: 6,
    maxHistory: 6,
    maxTokens: 256,
    temperature: 0.5,
  },
];

const TIER_ORDER: ModelTier[] = ["tiny", "small", "medium", "large"];

/**
 * Modelos Ollama preferidos por tier — escolhidos entre os instalados
 * (`GET /api/tags`), do maior que cabe no dispositivo para baixo.
 */
export const OLLAMA_PREFERENCE: Record<ModelTier, string[]> = {
  tiny: ["smollm2:360m", "qwen2.5:0.5b", "llama3.2:1b"],
  small: ["llama3.2:1b", "qwen2.5:1.5b", "smollm2:360m"],
  medium: ["qwen2.5:1.5b", "llama3.2:3b", "llama3.2:1b"],
  large: ["llama3.2:3b", "gemma2:2b", "qwen2.5:7b", "llama3.1:8b"],
};

export interface DeviceCapabilities {
  deviceMemoryGB: number | null;
  hardwareConcurrency: number | null;
  isMobile: boolean;
}

export function detectDeviceCapabilities(nav?: {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  userAgent?: string;
}): DeviceCapabilities {
  const source =
    nav ??
    (typeof navigator !== "undefined"
      ? (navigator as {
          deviceMemory?: number;
          hardwareConcurrency?: number;
          userAgent?: string;
        })
      : undefined);
  const userAgent = source?.userAgent ?? "";
  const isMobile =
    Capacitor.isNativePlatform() ||
    /Android|iPhone|iPad|Mobile/i.test(userAgent);
  return {
    deviceMemoryGB: source?.deviceMemory ?? null,
    hardwareConcurrency: source?.hardwareConcurrency ?? null,
    isMobile,
  };
}

/** Maior tier que o dispositivo comporta. */
export function detectDeviceTier(caps: DeviceCapabilities): ModelTier {
  let tier: ModelTier = "small"; // default conservador (deviceMemory ausente)
  const memory = caps.deviceMemoryGB;
  if (memory !== null) {
    if (memory >= 16) tier = "large";
    else if (memory >= 8) tier = "medium";
    else if (memory >= 4) tier = "small";
    else tier = "tiny";
  }
  if (
    caps.hardwareConcurrency !== null &&
    caps.hardwareConcurrency <= 4 &&
    TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf("tiny")
  ) {
    tier = TIER_ORDER[TIER_ORDER.indexOf(tier) - 1];
  }
  if (caps.isMobile && TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf("tiny")) {
    tier = TIER_ORDER[TIER_ORDER.indexOf(tier) - 1];
  }
  return tier;
}

/** Modelo recomendado = maior que cabe no tier detectado. */
export function pickDefaultModel(caps?: DeviceCapabilities): LLMModel {
  const tier = detectDeviceTier(caps ?? detectDeviceCapabilities());
  return LLM_MODELS.find((model) => model.tier === tier) ?? LLM_MODELS[0];
}

export function canRunWasmModel(
  model: WasmLLMModel,
  caps: DeviceCapabilities,
): boolean {
  if (
    model.tier !== "tiny" &&
    (caps.deviceMemoryGB === null || caps.hardwareConcurrency === null)
  ) {
    return false;
  }
  if (
    caps.deviceMemoryGB !== null &&
    caps.deviceMemoryGB < model.minDeviceMemoryGB
  ) {
    return false;
  }
  if (
    caps.hardwareConcurrency !== null &&
    caps.hardwareConcurrency < model.minHardwareConcurrency
  ) {
    return false;
  }
  return caps.deviceMemoryGB !== null || caps.hardwareConcurrency !== null;
}

export function pickWasmModel(
  caps: DeviceCapabilities,
  preferredTier: ModelTier = detectDeviceTier(caps),
): WasmLLMModel | undefined {
  const tier = TIER_ORDER[
    Math.min(TIER_ORDER.indexOf(detectDeviceTier(caps)), TIER_ORDER.indexOf(preferredTier))
  ];
  return [...WASM_LLM_MODELS]
    .reverse()
    .find(
      (model) =>
        TIER_ORDER.indexOf(model.tier) <= TIER_ORDER.indexOf(tier) &&
        canRunWasmModel(model, caps),
    );
}

export function getWasmModel(modelId: string): WasmLLMModel | undefined {
  return WASM_LLM_MODELS.find((model) => model.modelId === modelId);
}

export function getModel(modelId: string): LLMModel | undefined {
  return LLM_MODELS.find((model) => model.modelId === modelId);
}
