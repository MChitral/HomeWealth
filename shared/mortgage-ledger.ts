export const INTEREST_ACCRUAL_BASES = ["canadian-semi-annual", "actual-365"] as const;
export type InterestAccrualBasis = (typeof INTEREST_ACCRUAL_BASES)[number];

export const PAYMENT_CALCULATION_SOURCES = ["calculated", "statement"] as const;
export type PaymentCalculationSource = (typeof PAYMENT_CALCULATION_SOURCES)[number];
