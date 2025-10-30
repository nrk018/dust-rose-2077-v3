"use client";

import React from "react";

export type ResourcesState = {
  storageUsed: number;
  scrap: number;
  credits: number;
  authority: number; // 0-100
};

type ResourcesActions = {
  setStorageUsed: (v: number) => void;
  addScrap: (v: number) => void;
  spendScrap: (v: number) => void;
  addCredits: (v: number) => void;
  spendCredits: (v: number) => void;
  adjustAuthority: (delta: number) => void;
};

const defaultState: ResourcesState = {
  storageUsed: 62,
  scrap: 340,
  credits: 12890,
  authority: 57,
};

const Ctx = React.createContext<(ResourcesState & ResourcesActions) | null>(null);

export function ResourcesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ResourcesState>(() => {
    try {
      const raw = localStorage.getItem("res-state");
      return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  React.useEffect(() => {
    try { localStorage.setItem("res-state", JSON.stringify(state)); } catch {}
  }, [state]);

  const actions: ResourcesActions = React.useMemo(() => ({
    setStorageUsed: (v) => setState(s => ({ ...s, storageUsed: Math.max(0, Math.min(100, Math.round(v))) })),
    addScrap: (v) => setState(s => ({ ...s, scrap: s.scrap + Math.max(0, v) })),
    spendScrap: (v) => setState(s => ({ ...s, scrap: Math.max(0, s.scrap - Math.max(0, v)) })),
    addCredits: (v) => setState(s => ({ ...s, credits: s.credits + Math.max(0, v) })),
    spendCredits: (v) => setState(s => ({ ...s, credits: Math.max(0, s.credits - Math.max(0, v)) })),
    adjustAuthority: (delta) => setState(s => ({ ...s, authority: Math.max(0, Math.min(100, s.authority + delta)) })),
  }), []);

  return <Ctx.Provider value={{ ...state, ...actions }}>{children}</Ctx.Provider>;
}

export function useResources() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useResources must be used within ResourcesProvider");
  return ctx;
}


