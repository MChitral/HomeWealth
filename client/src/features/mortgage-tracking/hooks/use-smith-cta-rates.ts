import { useQuery } from "@tanstack/react-query";
import { useHelocAccounts } from "@/features/heloc/hooks";
import { useMortgageSelection } from "../contexts/mortgage-selection-context";
import { mortgageApi, mortgageQueryKeys } from "../api/mortgage-api";

export function useSmithCtaRates(): {
  helocEffectiveRate?: number;
  mortgageEffectiveRate?: number;
} {
  const { data: helocAccounts = [] } = useHelocAccounts();
  const { selectedMortgage } = useMortgageSelection();
  const { data: primeRateData } = useQuery({
    queryKey: mortgageQueryKeys.primeRate(),
    queryFn: mortgageApi.fetchPrimeRate,
  });
  const { data: terms } = useQuery({
    queryKey: mortgageQueryKeys.mortgageTerms(selectedMortgage?.id ?? null),
    queryFn: () => mortgageApi.fetchMortgageTerms(selectedMortgage!.id),
    enabled: Boolean(selectedMortgage?.id),
  });

  const prime = primeRateData?.primeRate;
  const heloc = helocAccounts[0];
  const term = terms?.[0];

  const helocEffectiveRate =
    prime != null && heloc?.interestSpread != null
      ? Number(prime) + Number(heloc.interestSpread)
      : undefined;

  if (!term) {
    return { helocEffectiveRate };
  }

  if (term.termType === "fixed" && term.fixedRate != null) {
    return { helocEffectiveRate, mortgageEffectiveRate: Number(term.fixedRate) };
  }

  if (prime != null && term.lockedSpread != null) {
    return {
      helocEffectiveRate,
      mortgageEffectiveRate: Number(prime) + Number(term.lockedSpread),
    };
  }

  return { helocEffectiveRate };
}
