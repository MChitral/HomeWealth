import { useMemo } from "react";

interface UseCashFlowCalculationsProps {
  monthlyIncome: number;
  extraPaycheques: number;
  annualBonus: number;
  propertyTax: number;
  insurance: number;
  condoFees: number;
  utilities: number;
  groceries: number;
  dining: number;
  transportation: number;
  entertainment: number;
  carLoan: number;
  studentLoan: number;
  creditCard: number;
  mortgagePayment?: number;
}

export function useCashFlowCalculations({
  monthlyIncome,
  extraPaycheques,
  annualBonus,
  propertyTax,
  insurance,
  condoFees,
  utilities,
  groceries,
  dining,
  transportation,
  entertainment,
  carLoan,
  studentLoan,
  creditCard,
  mortgagePayment = 2100,
}: UseCashFlowCalculationsProps) {
  const extraPaychequesMonthly = useMemo(
    () => (monthlyIncome * extraPaycheques) / 12,
    [monthlyIncome, extraPaycheques],
  );

  const annualBonusMonthly = useMemo(() => annualBonus / 12, [annualBonus]);

  const totalMonthlyIncome = useMemo(
    () => monthlyIncome + extraPaychequesMonthly + annualBonusMonthly,
    [monthlyIncome, extraPaychequesMonthly, annualBonusMonthly],
  );

  const fixedHousingCosts = propertyTax + insurance + condoFees + utilities;
  const variableExpenses = groceries + dining + transportation + entertainment;
  const otherDebtPayments = carLoan + studentLoan + creditCard;
  const totalMonthlyExpenses = fixedHousingCosts + variableExpenses + otherDebtPayments + mortgagePayment;
  const monthlySurplus = totalMonthlyIncome - totalMonthlyExpenses;

  const runwayMonths = useMemo(() => {
    if (monthlySurplus > 0) {
      return Math.round((totalMonthlyIncome / totalMonthlyExpenses) * 12);
    }
    return null;
  }, [totalMonthlyIncome, totalMonthlyExpenses, monthlySurplus]);

  return {
    extraPaychequesMonthly,
    annualBonusMonthly,
    totalMonthlyIncome,
    fixedHousingCosts,
    variableExpenses,
    otherDebtPayments,
    totalMonthlyExpenses,
    monthlySurplus,
    runwayMonths,
    mortgagePayment,
  };
}

