import { useEffect } from "react";
import { useBackfillForm } from "./use-backfill-form";
import type { UiTerm } from "../types";

interface UseBackfillFormStateProps {
  currentTerm?: UiTerm | null;
  isOpen: boolean;
  onClose?: () => void;
  onReset?: () => void;
}

/**
 * Complete hook for backfill form state management
 * Handles form initialization and reset
 */
export function useBackfillFormState({
  currentTerm,
  isOpen,
  onClose,
  onReset,
}: UseBackfillFormStateProps) {
  const form = useBackfillForm({
    defaultPaymentAmount: currentTerm?.regularPaymentAmount?.toString() || "",
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        startDate: "",
        numberOfPayments: "12",
        paymentAmount: currentTerm?.regularPaymentAmount?.toString() || "",
      });
      onReset?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return form;
}
