import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { helocApi } from "../api";
import { helocQueryKeys } from "./use-heloc-accounts";

export function useCreditLimit(accountId: string | null) {
  return useQuery({
    queryKey: [...helocQueryKeys.account(accountId || ""), "credit-limit"],
    queryFn: () => helocApi.getCreditLimit(accountId!),
    enabled: !!accountId,
  });
}

export function useRecalculateCreditLimit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => helocApi.recalculateCreditLimit(accountId),
    onSuccess: (_, accountId) => {
      queryClient.invalidateQueries({ queryKey: helocQueryKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: helocQueryKeys.account(accountId) });
      queryClient.invalidateQueries({ queryKey: [...helocQueryKeys.account(accountId), "credit-limit"] });
    },
  });
}

