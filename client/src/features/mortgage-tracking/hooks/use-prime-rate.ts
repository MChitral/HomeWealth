import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mortgageApi, mortgageQueryKeys, type PrimeRateResponse } from "../api";

const DEFAULT_PRIME = "6.45";

export function usePrimeRate(initialPrime: string = DEFAULT_PRIME) {
  const [primeRate, setPrimeRate] = useState(initialPrime);

  const {
    data: primeRateData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<PrimeRateResponse>({
    queryKey: mortgageQueryKeys.primeRate(),
    queryFn: () => mortgageApi.fetchPrimeRate(),
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (!primeRateData?.primeRate) return;
    const newRate = primeRateData.primeRate.toString();
    if (newRate !== primeRate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrimeRate(newRate);
    }
  }, [primeRateData, primeRate]);

  return {
    primeRate,
    setPrimeRate,
    primeRateData,
    isPrimeRateLoading: isLoading && !primeRateData,
    isPrimeRateFetching: isFetching,
    refetchPrimeRate: refetch,
  };
}
