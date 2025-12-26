import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { mortgageApi, mortgageQueryKeys } from "../api";
import { canSkipPayment, countSkippedPaymentsInYear } from "@/shared/utils/payment-skipping";
import { calculateSkipImpact } from "../api/mortgage-api";
import type { PaymentFrequency } from "@/shared/calculations/mortgage";
import type { MortgagePayment } from "@shared/schema";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { SkipImpactResponse } from "../api/mortgage-api";

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
  const [skipImpact, setSkipImpact] = useState<SkipImpactResponse | null>(null);

  // Calculate skip eligibility
  const currentYear = new Date().getFullYear();
  const skippedThisYear = useMemo(() => {
    return countSkippedPaymentsInYear(payments, currentYear);
  }, [payments, currentYear]);

  const skipLimit = maxSkipsPerYear;
  const canSkip = useMemo(() => {
    return canSkipPayment(skippedThisYear, skipLimit);
  }, [skippedThisYear, skipLimit]);

  // Calculate skip impact preview using API
  const calculateSkipImpactMutation = useMutation({
    mutationFn: () =>
      calculateSkipImpact({
        currentBalance,
        annualRate: effectiveRate,
        paymentFrequency,
        currentAmortizationMonths,
        numberOfSkips: 1,
      }),
    onSuccess: (data) => {
      setSkipImpact({
        totalInterestAccrued: data.totalInterestAccrued,
        finalBalance: data.finalBalance,
        extendedAmortizationMonths: data.extendedAmortizationMonths,
        balanceIncrease: data.balanceIncrease,
      });
    },
    onError: (error) => {
      console.error("Error calculating skip impact:", error);
      setSkipImpact(null);
    },
  });

  const calculateSkipImpactPreview = (_paymentDate: string) => {
    calculateSkipImpactMutation.mutate();
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
    calculateSkipImpact: calculateSkipImpactPreview,
    resetSkipImpact,
  };
}
