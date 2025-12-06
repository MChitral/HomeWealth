import type { UseFormReturn } from "react-hook-form";

interface UseMortgageDialogHandlersProps {
  setIsCreateMortgageOpen: (open: boolean) => void;
  setIsEditMortgageOpen: (open: boolean) => void;
  setIsTermRenewalOpen: (open: boolean) => void;
  editMortgageForm: UseFormReturn<any>;
  createMortgageForm: UseFormReturn<any>;
  firstTermFormState: {
    reset: () => void;
  };
}

/**
 * Hook to consolidate dialog open/close handlers with form reset logic.
 * Ensures forms are reset when dialogs close.
 */
export function useMortgageDialogHandlers({
  setIsCreateMortgageOpen,
  setIsEditMortgageOpen,
  setIsTermRenewalOpen,
  editMortgageForm,
  createMortgageForm,
  firstTermFormState,
}: UseMortgageDialogHandlersProps) {
  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateMortgageOpen(open);
    // Form reset is handled by useEffect in useMortgageForms
  };

  const handleEditMortgageDialogOpenChange = (open: boolean) => {
    setIsEditMortgageOpen(open);
    if (!open) {
      editMortgageForm.reset();
    }
  };

  const handleTermRenewalDialogOpenChange = (open: boolean) => {
    setIsTermRenewalOpen(open);
    if (!open) {
      firstTermFormState.reset();
    }
  };

  return {
    handleCreateDialogOpenChange,
    handleEditMortgageDialogOpenChange,
    handleTermRenewalDialogOpenChange,
  };
}

