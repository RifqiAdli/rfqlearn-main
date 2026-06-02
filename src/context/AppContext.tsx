import { createContext, useContext, useState, type ReactNode } from "react";

import type { SessionRecord, SetupConfig } from "@/types/rfqlearn";

interface AppCtx {
  setupConfig: SetupConfig | null;
  setSetupConfig: (c: SetupConfig | null) => void;
  currentSession: SessionRecord | null;
  setCurrentSession: (s: SessionRecord | null) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [setupConfig, setSetupConfig] = useState<SetupConfig | null>(null);
  const [currentSession, setCurrentSession] = useState<SessionRecord | null>(null);

  return (
    <Ctx.Provider value={{ setupConfig, setSetupConfig, currentSession, setCurrentSession }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
