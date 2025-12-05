import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { scenarioApi, type ProjectionRequest, type ProjectionResponse } from "../api";
import type { DraftPrepaymentEvent } from "./use-scenario-editor-state";

interface UseScenarioEditorProjectionsProps {
  currentMortgageData: {
    currentBalance: number;
    currentRate: number;
    currentAmortization: number;
    monthlyPayment: number;
  };
  prepaymentSplit: number[];
  monthlySurplus: number;
  prepaymentEvents: DraftPrepaymentEvent[];
  rateAssumption: number | null;
  mortgageId: string | undefined;
}

export function useScenarioEditorProjections({
  currentMortgageData,
  prepaymentSplit,
  monthlySurplus,
  prepaymentEvents,
  rateAssumption,
  mortgageId,
}: UseScenarioEditorProjectionsProps) {
  // Build projection request for API
  const projectionRequest = useMemo((): ProjectionRequest | null => {
    if (!currentMortgageData.currentBalance || currentMortgageData.currentBalance <= 0) {
      return null;
    }

    const prepayPercent = prepaymentSplit[0] / 100;
    const monthlyPrepay = Math.max(0, monthlySurplus) * prepayPercent;

    // Convert draft prepayment events to API format
    const apiPrepaymentEvents = prepaymentEvents.map((event) => {
      // For one-time events, convert oneTimeYear to payment number
      // Year N = payment ((N-1) * 12 + 1) for monthly payments
      // E.g., Year 2 = payment 13 (start of 2nd year)
      let startPaymentNumber = event.startPaymentNumber || 1;
      if (event.eventType === "one-time" && event.oneTimeYear) {
        startPaymentNumber = (event.oneTimeYear - 1) * 12 + 1;
      }

      return {
        type: event.eventType as "annual" | "one-time",
        amount: Number(event.amount || 0),
        startPaymentNumber,
        recurrenceMonth: event.recurrenceMonth || undefined,
      };
    });

    return {
      currentBalance: currentMortgageData.currentBalance,
      annualRate: currentMortgageData.currentRate / 100, // Convert to decimal
      amortizationMonths: Math.round(currentMortgageData.currentAmortization * 12),
      paymentFrequency: "monthly",
      actualPaymentAmount: currentMortgageData.monthlyPayment, // Use actual payment amount, not recalculated
      monthlyPrepayAmount: monthlyPrepay,
      prepaymentEvents: apiPrepaymentEvents,
      // Add rate override if user has set a different assumption
      rateOverride: rateAssumption !== null ? rateAssumption / 100 : undefined,
      // Include mortgage ID to fetch historical payments
      mortgageId: mortgageId,
    };
  }, [currentMortgageData, prepaymentSplit, monthlySurplus, prepaymentEvents, rateAssumption, mortgageId]);

  // Fetch projection from backend using authoritative Canadian mortgage calculation engine
  const { data: projectionData, isLoading: projectionLoading } = useQuery<ProjectionResponse>({
    queryKey: ["mortgages", "projection", projectionRequest],
    queryFn: () => scenarioApi.fetchProjection(projectionRequest!),
    enabled: !!projectionRequest,
    staleTime: 5000, // Cache for 5 seconds to prevent excessive API calls
  });

  // Extract projection data with fallbacks for loading state
  const mortgageProjection = projectionData?.chartData || [];
  const yearlyAmortization = projectionData?.yearlyData || [];
  const projectedPayoff = projectionData?.summary.projectedPayoff || 0;
  const totalInterest = projectionData?.summary.totalInterest || 0;
  const interestSaved = projectionData?.summary.interestSaved || 0;

  return {
    mortgageProjection,
    yearlyAmortization,
    projectedPayoff,
    totalInterest,
    interestSaved,
    projectionLoading,
  };
}

