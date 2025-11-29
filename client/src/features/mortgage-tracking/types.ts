export type UiTerm = {
  id: string;
  mortgageId: string;
  termType: "fixed" | "variable-changing" | "variable-fixed";
  startDate: string;
  endDate: string;
  termYears: number;
  lockedSpread: number;
  fixedRate: number | null;
  primeRate: number | null;
  paymentFrequency: "monthly" | "biweekly" | "accelerated-biweekly" | "semi-monthly" | "weekly" | "accelerated-weekly";
  regularPaymentAmount: number;
};

export type UiPayment = {
  id: string;
  date: string;
  year: number;
  paymentPeriodLabel?: string;
  regularPaymentAmount: number;
  prepaymentAmount: number;
  paymentAmount: number;
  primeRate?: number;
  termSpread?: number;
  effectiveRate: number;
  principal: number;
  interest: number;
  remainingBalance: number;
  mortgageType: string;
  triggerHit: boolean;
  amortizationYears: number;
  termStartDate?: string;
  remainingAmortizationMonths: number;
};

