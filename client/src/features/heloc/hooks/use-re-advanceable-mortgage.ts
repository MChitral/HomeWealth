import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reAdvanceableMortgageApi } from "../api/heloc-api";
import type { CreditRoomResponse, CreditRoomHistoryItem } from "../api/heloc-api";

export const reAdvanceableQueryKeys = {
  all: ["/api/mortgages"] as const,
  creditRoom: (mortgageId: string) => [...reAdvanceableQueryKeys.all, mortgageId, "credit-room"] as const,
  creditRoomHistory: (mortgageId: string) => [...reAdvanceableQueryKeys.all, mortgageId, "credit-room-history"] as const,
};

export function useCreditRoom(mortgageId: string | null) {
  return useQuery({
    queryKey: reAdvanceableQueryKeys.creditRoom(mortgageId || ""),
    queryFn: () => reAdvanceableMortgageApi.getCreditRoom(mortgageId!),
    enabled: !!mortgageId,
  });
}

export function useCreditRoomHistory(mortgageId: string | null) {
  return useQuery({
    queryKey: reAdvanceableQueryKeys.creditRoomHistory(mortgageId || ""),
    queryFn: () => reAdvanceableMortgageApi.getCreditRoomHistory(mortgageId!),
    enabled: !!mortgageId,
  });
}

export function useMarkMortgageAsReAdvanceable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mortgageId, helocAccountId }: { mortgageId: string; helocAccountId: string }) =>
      reAdvanceableMortgageApi.markMortgageAsReAdvanceable(mortgageId, helocAccountId),
    onSuccess: (_, variables) => {
      // Invalidate mortgage queries to refresh mortgage data
      queryClient.invalidateQueries({ queryKey: ["/api/mortgages"] });
      // Invalidate HELOC accounts to refresh linked status
      queryClient.invalidateQueries({ queryKey: ["/api/heloc/accounts"] });
      // Invalidate credit room queries
      queryClient.invalidateQueries({ queryKey: reAdvanceableQueryKeys.creditRoom(variables.mortgageId) });
      queryClient.invalidateQueries({ queryKey: reAdvanceableQueryKeys.creditRoomHistory(variables.mortgageId) });
    },
  });
}

