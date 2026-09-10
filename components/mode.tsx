"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AnalysisMode } from "@/lib/types";

const ModeContext = createContext<AnalysisMode>("demo");

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AnalysisMode>("demo");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status")
      .then((res) => res.json())
      .then((data: { mode?: AnalysisMode }) => {
        if (!cancelled && (data.mode === "live" || data.mode === "demo")) {
          setMode(data.mode);
        }
      })
      .catch(() => {
        /* stay on demo */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>;
}

export function useAnalysisMode(): AnalysisMode {
  return useContext(ModeContext);
}
