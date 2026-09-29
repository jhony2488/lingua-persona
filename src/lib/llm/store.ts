"use client";

import { create } from "zustand";
import type { EngineKind } from "@/lib/llm/types";

export type LLMStatus =
  | "idle"
  | "downloading" // baixando/carregando pesos do modelo
  | "ready"
  | "generating"
  | "fallback" // engine indisponível — resposta local determinística
  | "error";

interface LLMState {
  status: LLMStatus;
  progress: number; // 0–1
  progressText: string;
  engine: EngineKind | null;
  modelId: string | null;
  setProgress: (progress: number, text: string) => void;
  setStatus: (status: LLMStatus) => void;
  setEngine: (engine: EngineKind | null) => void;
  setModelId: (modelId: string | null) => void;
}

/** Estado volátil do engine — não persistido (download reflete o cache real). */
export const useLLMStore = create<LLMState>()((set) => ({
  status: "idle",
  progress: 0,
  progressText: "",
  engine: null,
  modelId: null,
  setProgress: (progress, progressText) => set({ progress, progressText }),
  setStatus: (status) => set({ status }),
  setEngine: (engine) => set({ engine }),
  setModelId: (modelId) => set({ modelId }),
}));
