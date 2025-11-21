import { useQuery } from "@tanstack/react-query";
import type { CashFlow } from "@shared/schema";
import { cashFlowApi, cashFlowQueryKeys } from "../api";

export function useCashFlowData() {
  const { data, isLoading } = useQuery<CashFlow | null>({
    queryKey: cashFlowQueryKeys.cashFlow(),
    queryFn: cashFlowApi.fetch,
  });

  return {
    cashFlow: data ?? null,
    isLoading,
  };
}

