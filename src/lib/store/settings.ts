"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Dialect = "US" | "UK";
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type AgentGender = "male" | "female";
export type ChatMode = "chat" | "voice";
export type VoiceFlow = "auto" | "confirm";
/** Engine de inferência: auto (WebLLM→Ollama→local) ou forçado. */
export type LLMEnginePreference = "auto" | "webllm" | "ollama" | "local";

interface SettingsState {
  userId: string | null;
  dialect: Dialect;
  level: EnglishLevel;
  agentName: string;
  agentGender: AgentGender;
  chatMode: ChatMode;
  voiceFlow: VoiceFlow;
  llmEngine: LLMEnginePreference;
  /** modelId MLC — `null` = escolha automática por capacidade do dispositivo. */
  llmModel: string | null;
  tourCompleted: boolean;
  setUserId: (userId: string | null) => void;
  setDialect: (dialect: Dialect) => void;
  setLevel: (level: EnglishLevel) => void;
  setAgentName: (name: string) => void;
  setAgentGender: (gender: AgentGender) => void;
  setChatMode: (mode: ChatMode) => void;
  setVoiceFlow: (flow: VoiceFlow) => void;
  setLLMEngine: (engine: LLMEnginePreference) => void;
  setLLMModel: (modelId: string | null) => void;
  setTourCompleted: (completed: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      userId: null,
      dialect: "US",
      level: "A1",
      agentName: "Alex",
      agentGender: "male",
      chatMode: "chat",
      voiceFlow: "auto",
      llmEngine: "auto",
      llmModel: null,
      tourCompleted: false,
      setUserId: (userId) => set({ userId }),
      setDialect: (dialect) => set({ dialect }),
      setLevel: (level) => set({ level }),
      setAgentName: (agentName) => set({ agentName }),
      setAgentGender: (agentGender) => set({ agentGender }),
      setChatMode: (chatMode) => set({ chatMode }),
      setVoiceFlow: (voiceFlow) => set({ voiceFlow }),
      setLLMEngine: (llmEngine) => set({ llmEngine }),
      setLLMModel: (llmModel) => set({ llmModel }),
      setTourCompleted: (tourCompleted) => set({ tourCompleted }),
    }),
    { name: "linguapersona-settings" },
  ),
);
