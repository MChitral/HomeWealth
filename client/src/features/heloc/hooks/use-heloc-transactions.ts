import { useQuery } from "@tanstack/react-query";
import { helocApi } from "../api";
import { helocQueryKeys } from "./use-heloc-accounts";

export function useHelocTransactions(accountId: string | null) {
  return useQuery({
    queryKey: helocQueryKeys.transactions(accountId || ""),
    queryFn: () => helocApi.fetchTransactions(accountId!),
    enabled: !!accountId,
  });
}
