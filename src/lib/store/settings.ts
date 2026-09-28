"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Dialect = "US" | "UK";
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type AgentGender = "male" | "female";
export type ChatMode = "chat" | "voice";
export type VoiceFlow = "auto" | "confirm";

interface SettingsState {
  userId: string | null;
  dialect: Dialect;
  level: EnglishLevel;
  agentName: string;
  agentGender: AgentGender;
  chatMode: ChatMode;
  voiceFlow: VoiceFlow;
  tourCompleted: boolean;
  setUserId: (userId: string | null) => void;
  setDialect: (dialect: Dialect) => void;
  setLevel: (level: EnglishLevel) => void;
  setAgentName: (name: string) => void;
  setAgentGender: (gender: AgentGender) => void;
  setChatMode: (mode: ChatMode) => void;
  setVoiceFlow: (flow: VoiceFlow) => void;
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
      tourCompleted: false,
      setUserId: (userId) => set({ userId }),
      setDialect: (dialect) => set({ dialect }),
      setLevel: (level) => set({ level }),
      setAgentName: (agentName) => set({ agentName }),
      setAgentGender: (agentGender) => set({ agentGender }),
      setChatMode: (chatMode) => set({ chatMode }),
      setVoiceFlow: (voiceFlow) => set({ voiceFlow }),
      setTourCompleted: (tourCompleted) => set({ tourCompleted }),
    }),
    { name: "linguapersona-settings" },
  ),
);
