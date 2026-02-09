import { useMutation, useQueryClient } from "@tanstack/react-query";
import { helocApi } from "../api";
import { helocQueryKeys } from "./use-heloc-accounts";
import type { BorrowPayload } from "../api/heloc-api";

export function useHelocBorrowing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, payload }: { accountId: string; payload: BorrowPayload }) =>
      helocApi.recordBorrowing(accountId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: helocQueryKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: helocQueryKeys.account(variables.accountId) });
      queryClient.invalidateQueries({ queryKey: helocQueryKeys.transactions(variables.accountId) });
    },
  });
}


