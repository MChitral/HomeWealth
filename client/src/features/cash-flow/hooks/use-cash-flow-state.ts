import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/query-client";
import { useToast } from "@/shared/hooks/use-toast";
import type { CashFlow } from "@shared/schema";
import { cashFlowApi, cashFlowQueryKeys, type CashFlowPayload } from "../api";

const DEFAULTS = {
  monthlyIncome: 8000,
  extraPaycheques: 2,
  annualBonus: 10000,
  propertyTax: 400,
  insurance: 150,
  condoFees: 0,
  utilities: 200,
  groceries: 600,
  dining: 300,
  transportation: 200,
  entertainment: 400,
  carLoan: 0,
  studentLoan: 0,
  creditCard: 0,
} as const;

interface UseCashFlowStateProps {
  cashFlow: CashFlow | null;
}

export function useCashFlowState({ cashFlow }: UseCashFlowStateProps) {
  const { toast } = useToast();

  const [monthlyIncome, setMonthlyIncome] = useState<number>(DEFAULTS.monthlyIncome);
  const [extraPaycheques, setExtraPaycheques] = useState<number>(DEFAULTS.extraPaycheques);
  const [annualBonus, setAnnualBonus] = useState<number>(DEFAULTS.annualBonus);

  const [propertyTax, setPropertyTax] = useState<number>(DEFAULTS.propertyTax);
  const [insurance, setInsurance] = useState<number>(DEFAULTS.insurance);
  const [condoFees, setCondoFees] = useState<number>(DEFAULTS.condoFees);
  const [utilities, setUtilities] = useState<number>(DEFAULTS.utilities);

  const [groceries, setGroceries] = useState<number>(DEFAULTS.groceries);
  const [dining, setDining] = useState<number>(DEFAULTS.dining);
  const [transportation, setTransportation] = useState<number>(DEFAULTS.transportation);
  const [entertainment, setEntertainment] = useState<number>(DEFAULTS.entertainment);

  const [carLoan, setCarLoan] = useState<number>(DEFAULTS.carLoan);
  const [studentLoan, setStudentLoan] = useState<number>(DEFAULTS.studentLoan);
  const [creditCard, setCreditCard] = useState<number>(DEFAULTS.creditCard);

  useEffect(() => {
    if (!cashFlow) return;

    setMonthlyIncome(
      cashFlow.monthlyIncome != null ? Number(cashFlow.monthlyIncome) : DEFAULTS.monthlyIncome
    );
    setExtraPaycheques(cashFlow.extraPaycheques ?? DEFAULTS.extraPaycheques);
    setAnnualBonus(
      cashFlow.annualBonus != null ? Number(cashFlow.annualBonus) : DEFAULTS.annualBonus
    );

    setPropertyTax(
      cashFlow.propertyTax != null ? Number(cashFlow.propertyTax) : DEFAULTS.propertyTax
    );
    setInsurance(
      cashFlow.homeInsurance != null ? Number(cashFlow.homeInsurance) : DEFAULTS.insurance
    );
    setCondoFees(cashFlow.condoFees != null ? Number(cashFlow.condoFees) : DEFAULTS.condoFees);
    setUtilities(cashFlow.utilities != null ? Number(cashFlow.utilities) : DEFAULTS.utilities);

    setGroceries(cashFlow.groceries != null ? Number(cashFlow.groceries) : DEFAULTS.groceries);
    setDining(cashFlow.dining != null ? Number(cashFlow.dining) : DEFAULTS.dining);
    setTransportation(
      cashFlow.transportation != null ? Number(cashFlow.transportation) : DEFAULTS.transportation
    );
    setEntertainment(
      cashFlow.entertainment != null ? Number(cashFlow.entertainment) : DEFAULTS.entertainment
    );

    setCarLoan(cashFlow.carLoan != null ? Number(cashFlow.carLoan) : DEFAULTS.carLoan);
    setStudentLoan(
      cashFlow.studentLoan != null ? Number(cashFlow.studentLoan) : DEFAULTS.studentLoan
    );
    setCreditCard(cashFlow.creditCard != null ? Number(cashFlow.creditCard) : DEFAULTS.creditCard);
  }, [cashFlow]);

  const saveMutation = useMutation({
    mutationFn: (payload: CashFlowPayload) => {
      if (cashFlow?.id) {
        return cashFlowApi.update(cashFlow.id, payload);
      }
      return cashFlowApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cashFlowQueryKeys.cashFlow() });
      toast({
        title: "Cash flow saved",
        description: "Your income and expenses have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save cash flow data",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const payload: CashFlowPayload = {
      monthlyIncome: monthlyIncome.toString(),
      extraPaycheques,
      annualBonus: annualBonus.toString(),
      propertyTax: propertyTax.toString(),
      homeInsurance: insurance.toString(),
      condoFees: condoFees.toString(),
      utilities: utilities.toString(),
      groceries: groceries.toString(),
      dining: dining.toString(),
      transportation: transportation.toString(),
      entertainment: entertainment.toString(),
      carLoan: carLoan.toString(),
      studentLoan: studentLoan.toString(),
      creditCard: creditCard.toString(),
    };

    saveMutation.mutate(payload);
  };

  return {
    // Income
    monthlyIncome,
    setMonthlyIncome,
    extraPaycheques,
    setExtraPaycheques,
    annualBonus,
    setAnnualBonus,
    // Fixed Expenses
    propertyTax,
    setPropertyTax,
    insurance,
    setInsurance,
    condoFees,
    setCondoFees,
    utilities,
    setUtilities,
    // Variable Expenses
    groceries,
    setGroceries,
    dining,
    setDining,
    transportation,
    setTransportation,
    entertainment,
    setEntertainment,
    // Debt
    carLoan,
    setCarLoan,
    studentLoan,
    setStudentLoan,
    creditCard,
    setCreditCard,
    // Actions
    handleSave,
    saveMutation,
  };
}
