import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { helocApi } from "../api";
import type { HelocAccount, InsertHelocAccount, UpdateHelocAccount } from "@shared/schema";

export const helocQueryKeys = {
  all: ["/api/heloc/accounts"] as const,
  accounts: () => [...helocQueryKeys.all, "list"] as const,
  account: (id: string) => [...helocQueryKeys.all, id] as const,
  transactions: (accountId: string) =>
    [...helocQueryKeys.account(accountId), "transactions"] as const,
};

export function useHelocAccounts() {
  return useQuery({
    queryKey: helocQueryKeys.accounts(),
    queryFn: () => helocApi.fetchAccounts(),
  });
}

export function useHelocAccount(id: string | null) {
  return useQuery({
    queryKey: helocQueryKeys.account(id || ""),
    queryFn: () => helocApi.fetchAccount(id!),
    enabled: !!id,
  });
}

export function useCreateHelocAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<InsertHelocAccount, "userId">) => helocApi.createAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helocQueryKeys.accounts() });
    },
  });
}

export function useUpdateHelocAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UpdateHelocAccount> }) =>
      helocApi.updateAccount(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: helocQueryKeys.accounts() });
      queryClient.invalidateQueries({ queryKey: helocQueryKeys.account(variables.id) });
    },
  });
}

export function useDeleteHelocAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => helocApi.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: helocQueryKeys.accounts() });
    },
  });
}
