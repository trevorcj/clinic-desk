"use client";

import React, { createContext, useContext, useState } from "react";

interface FailureSimulationContextType {
  simulateFailure: boolean;
  setSimulateFailure: (val: boolean) => void;
}

const FailureSimulationContext = createContext<FailureSimulationContextType>({
  simulateFailure: false,
  setSimulateFailure: () => {},
});

export function FailureSimulationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [simulateFailure, setSimulateFailureState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem("clinic_simulate_failure") === "true";
    } catch {
      return false;
    }
  });

  const setSimulateFailure = (val: boolean) => {
    setSimulateFailureState(val);
    try {
      window.localStorage.setItem("clinic_simulate_failure", val ? "true" : "false");
    } catch {}
  };

  return (
    <FailureSimulationContext.Provider
      value={{ simulateFailure, setSimulateFailure }}>
      {children}
    </FailureSimulationContext.Provider>
  );
}

export function useFailureSimulation() {
  return useContext(FailureSimulationContext);
}
