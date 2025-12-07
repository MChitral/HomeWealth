import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Mortgage } from "@shared/schema";
import { mortgageApi, mortgageQueryKeys } from "../api";

const STORAGE_KEY = "selectedMortgageId";

interface MortgageSelectionContextValue {
  selectedMortgageId: string | null;
  setSelectedMortgageId: (id: string | null) => void;
  mortgages: Mortgage[];
  selectedMortgage: Mortgage | null;
  isLoading: boolean;
}

const MortgageSelectionContext = createContext<MortgageSelectionContextValue | undefined>(undefined);

export function MortgageSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedMortgageId, setSelectedMortgageIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored || null;
    }
    return null;
  });

  const {
    data: mortgages = [],
    isLoading,
  } = useQuery<Mortgage[]>({
    queryKey: mortgageQueryKeys.mortgages(),
    queryFn: mortgageApi.fetchMortgages,
  });

  useEffect(() => {
    if (selectedMortgageId) {
      localStorage.setItem(STORAGE_KEY, selectedMortgageId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedMortgageId]);

  useEffect(() => {
    if (mortgages.length === 0) {
      setSelectedMortgageIdState(null);
      return;
    }

    if (!selectedMortgageId || !mortgages.some((m) => m.id === selectedMortgageId)) {
      setSelectedMortgageIdState(mortgages[0].id);
    }
  }, [mortgages, selectedMortgageId]);

  const setSelectedMortgageId = useCallback((id: string | null) => {
    setSelectedMortgageIdState(id);
  }, []);

  const selectedMortgage = mortgages.find((m) => m.id === selectedMortgageId) ?? null;

  return (
    <MortgageSelectionContext.Provider
      value={{
        selectedMortgageId,
        setSelectedMortgageId,
        mortgages,
        selectedMortgage,
        isLoading,
      }}
    >
      {children}
    </MortgageSelectionContext.Provider>
  );
}

export function useMortgageSelection() {
  const context = useContext(MortgageSelectionContext);
  if (context === undefined) {
    throw new Error("useMortgageSelection must be used within a MortgageSelectionProvider");
  }
  return context;
}
