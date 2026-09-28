"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Dialect = "US" | "UK";
export type EnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type AgentGender = "male" | "female";

interface SettingsState {
  userId: string | null;
  dialect: Dialect;
  level: EnglishLevel;
  agentName: string;
  agentGender: AgentGender;
  setUserId: (userId: string | null) => void;
  setDialect: (dialect: Dialect) => void;
  setLevel: (level: EnglishLevel) => void;
  setAgentName: (name: string) => void;
  setAgentGender: (gender: AgentGender) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      userId: null,
      dialect: "US",
      level: "A1",
      agentName: "Alex",
      agentGender: "male",
      setUserId: (userId) => set({ userId }),
      setDialect: (dialect) => set({ dialect }),
      setLevel: (level) => set({ level }),
      setAgentName: (agentName) => set({ agentName }),
      setAgentGender: (agentGender) => set({ agentGender }),
    }),
    { name: "linguapersona-settings" },
  ),
);
