import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  investmentApi,
  type InvestmentTransactionPayload,
  type InvestmentIncomePayload,
} from "../api";

export function useInvestments() {
  return useQuery({
    queryKey: ["investments"],
    queryFn: () => investmentApi.fetchInvestments(),
  });
}

export function useInvestment(id: string | null) {
  return useQuery({
    queryKey: ["investments", id],
    queryFn: () => (id ? investmentApi.fetchInvestment(id) : null),
    enabled: !!id,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investmentApi.createInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
}

export function useUpdateInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof investmentApi.updateInvestment>[1];
    }) => investmentApi.updateInvestment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["investments", variables.id] });
    },
  });
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: investmentApi.deleteInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
}

export function useInvestmentTransactions(investmentId: string | null) {
  return useQuery({
    queryKey: ["investments", investmentId, "transactions"],
    queryFn: () => (investmentId ? investmentApi.fetchTransactions(investmentId) : []),
    enabled: !!investmentId,
  });
}

export function useRecordInvestmentTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      investmentId,
      payload,
    }: {
      investmentId: string;
      payload: InvestmentTransactionPayload;
    }) => investmentApi.recordTransaction(investmentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["investments", variables.investmentId, "transactions"],
      });
    },
  });
}

export function useInvestmentIncome(investmentId: string | null, taxYear?: number) {
  return useQuery({
    queryKey: ["investments", investmentId, "income", taxYear],
    queryFn: () => (investmentId ? investmentApi.fetchIncome(investmentId, taxYear) : []),
    enabled: !!investmentId,
  });
}

export function useRecordInvestmentIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      investmentId,
      payload,
    }: {
      investmentId: string;
      payload: InvestmentIncomePayload;
    }) => investmentApi.recordIncome(investmentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["investments", variables.investmentId, "income"],
      });
    },
  });
}
