import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { mortgageApi, mortgageQueryKeys } from "../api";
import {
  calculateSkippedPayment,
  canSkipPayment,
  countSkippedPaymentsInYear,
} from "@server-shared/calculations/payment-skipping";
import type { PaymentFrequency } from "@server-shared/calculations/mortgage";
import type { MortgagePayment } from "@shared/schema";
import { useMemo, useState } from "react";
import type { SkippedPaymentCalculation } from "@server-shared/calculations/payment-skipping";

interface UseSkipPaymentProps {
  mortgageId: string;
  termId: string;
  currentBalance: number;
  currentAmortizationMonths: number;
  effectiveRate: number; // Annual rate as decimal (e.g., 0.0549)
  paymentFrequency: PaymentFrequency;
  payments: MortgagePayment[];
  maxSkipsPerYear?: number;
}

interface UseSkipPaymentReturn {
  skipPaymentMutation: ReturnType<
    typeof useMutation<MortgagePayment, Error, { paymentDate: string; maxSkipsPerYear?: number }>
  >;
  canSkip: boolean;
  skippedThisYear: number;
  skipLimit: number;
  skipImpact: SkippedPaymentCalculation | null;
  calculateSkipImpact: (paymentDate: string) => void;
  resetSkipImpact: () => void;
}

/**
 * Custom hook for skip payment functionality
 * Handles eligibility checking, impact calculation, and API mutation
 */
export function useSkipPayment({
  mortgageId,
  termId,
  currentBalance,
  currentAmortizationMonths,
  effectiveRate,
  paymentFrequency,
  payments,
  maxSkipsPerYear = 2,
}: UseSkipPaymentProps): UseSkipPaymentReturn {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [skipImpact, setSkipImpact] = useState<SkippedPaymentCalculation | null>(null);

  // Calculate skip eligibility
  const currentYear = new Date().getFullYear();
  const skippedThisYear = useMemo(() => {
    return countSkippedPaymentsInYear(payments, currentYear);
  }, [payments, currentYear]);

  const skipLimit = maxSkipsPerYear;
  const canSkip = useMemo(() => {
    return canSkipPayment(skippedThisYear, skipLimit);
  }, [skippedThisYear, skipLimit]);

  // Calculate skip impact preview
  const calculateSkipImpact = (_paymentDate: string) => {
    try {
      const impact = calculateSkippedPayment(
        currentBalance,
        effectiveRate,
        paymentFrequency,
        currentAmortizationMonths
      );
      setSkipImpact(impact);
    } catch (error) {
      console.error("Error calculating skip impact:", error);
      setSkipImpact(null);
    }
  };

  const resetSkipImpact = () => {
    setSkipImpact(null);
  };

  // Skip payment mutation
  const skipPaymentMutation = useMutation({
    mutationFn: async (payload: { paymentDate: string; maxSkipsPerYear?: number }) => {
      return mortgageApi.skipPayment(mortgageId, termId, {
        paymentDate: payload.paymentDate,
        maxSkipsPerYear: payload.maxSkipsPerYear || maxSkipsPerYear,
      });
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgagePayments(mortgageId) });
      queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });

      toast({
        title: "Payment Skipped",
        description:
          "Your payment has been skipped. Interest will accrue and your balance will increase.",
      });

      resetSkipImpact();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to skip payment",
        variant: "destructive",
      });
    },
  });

  return {
    skipPaymentMutation,
    canSkip,
    skippedThisYear,
    skipLimit,
    skipImpact,
    calculateSkipImpact,
    resetSkipImpact,
  };
}
