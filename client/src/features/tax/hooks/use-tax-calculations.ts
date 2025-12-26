import { useQuery, useMutation } from "@tanstack/react-query";
import {
  taxApi,
  type TaxDeductionPayload,
  type TaxSavingsPayload,
  type InvestmentIncomeTaxPayload,
} from "../api";

export function useMarginalTaxRate(income: number | null, province: string | null, year?: number) {
  return useQuery({
    queryKey: ["tax", "marginal-rate", income, province, year],
    queryFn: () => (income && province ? taxApi.getMarginalTaxRate(income, province, year) : null),
    enabled: !!income && !!province,
  });
}

export function useCalculateTaxDeduction() {
  return useMutation({
    mutationFn: (payload: TaxDeductionPayload) => taxApi.calculateTaxDeduction(payload),
  });
}

export function useCalculateTaxSavings() {
  return useMutation({
    mutationFn: (payload: TaxSavingsPayload) => taxApi.calculateTaxSavings(payload),
  });
}

export function useCalculateInvestmentIncomeTax() {
  return useMutation({
    mutationFn: (payload: InvestmentIncomeTaxPayload) =>
      taxApi.calculateInvestmentIncomeTax(payload),
  });
}

export function useTaxBrackets(province: string | null, year?: number) {
  return useQuery({
    queryKey: ["tax", "brackets", province, year],
    queryFn: () => (province ? taxApi.getTaxBrackets(province, year) : null),
    enabled: !!province,
  });
}
