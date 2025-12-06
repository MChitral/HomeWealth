import { useState } from "react";

/**
 * Hook for managing dialog open/close states in mortgage tracking
 * Extracted from use-mortgage-tracking-state.ts for better organization
 */
export function useMortgageDialogs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTermRenewalOpen, setIsTermRenewalOpen] = useState(false);
  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  const [isEditMortgageOpen, setIsEditMortgageOpen] = useState(false);
  const [isEditTermOpen, setIsEditTermOpen] = useState(false);

  return {
    isDialogOpen,
    setIsDialogOpen,
    isTermRenewalOpen,
    setIsTermRenewalOpen,
    isBackfillOpen,
    setIsBackfillOpen,
    isEditMortgageOpen,
    setIsEditMortgageOpen,
    isEditTermOpen,
    setIsEditTermOpen,
  };
}

