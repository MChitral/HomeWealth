import { useQuery } from "@tanstack/react-query";
import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import { mortgageApi, mortgageQueryKeys } from "../api";

export function useMortgageData() {
  const {
    data: mortgages,
    isLoading: mortgagesLoading,
  } = useQuery<Mortgage[]>({
    queryKey: mortgageQueryKeys.mortgages(),
    queryFn: mortgageApi.fetchMortgages,
  });

  const mortgage = mortgages?.[0] ?? null;

  const {
    data: terms,
    isLoading: termsLoading,
  } = useQuery<MortgageTerm[]>({
    queryKey: mortgageQueryKeys.mortgageTerms(mortgage?.id ?? null),
    queryFn: () => mortgageApi.fetchMortgageTerms(mortgage!.id),
    enabled: Boolean(mortgage?.id),
  });

  const {
    data: payments,
    isLoading: paymentsLoading,
  } = useQuery<MortgagePayment[]>({
    queryKey: mortgageQueryKeys.mortgagePayments(mortgage?.id ?? null),
    queryFn: () => mortgageApi.fetchMortgagePayments(mortgage!.id),
    enabled: Boolean(mortgage?.id),
  });

  return {
    mortgage,
    terms,
    payments,
    isLoading: mortgagesLoading || termsLoading || paymentsLoading,
  };
}

