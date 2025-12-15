import { useQuery } from "@tanstack/react-query";
import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import { mortgageApi, mortgageQueryKeys } from "../api";

export function useMortgageData(selectedMortgageId?: string | null) {
  const { data: mortgages, isLoading: mortgagesLoading } = useQuery<Mortgage[]>({
    queryKey: mortgageQueryKeys.mortgages(),
    queryFn: mortgageApi.fetchMortgages,
  });

  const activeMortgage =
    mortgages?.find((m) => m.id === selectedMortgageId) ?? mortgages?.[0] ?? null;

  const { data: terms, isLoading: termsLoading } = useQuery<MortgageTerm[]>({
    queryKey: mortgageQueryKeys.mortgageTerms(activeMortgage?.id ?? null),
    queryFn: () => mortgageApi.fetchMortgageTerms(activeMortgage!.id),
    enabled: Boolean(activeMortgage?.id),
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<MortgagePayment[]>({
    queryKey: mortgageQueryKeys.mortgagePayments(activeMortgage?.id ?? null),
    queryFn: () => mortgageApi.fetchMortgagePayments(activeMortgage!.id),
    enabled: Boolean(activeMortgage?.id),
  });

  return {
    mortgages: mortgages ?? [],
    mortgage: activeMortgage,
    terms,
    payments,
    isLoading: mortgagesLoading || termsLoading || paymentsLoading,
  };
}
