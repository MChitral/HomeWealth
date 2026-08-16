import {
  calculateInterestPayment,
  type PaymentFrequency,
} from "@server-shared/calculations/mortgage";
import { INTEREST_ACCRUAL_BASES, type InterestAccrualBasis } from "@shared/mortgage-ledger";

export { INTEREST_ACCRUAL_BASES };
export type { InterestAccrualBasis };

export type InterestRateSegment = {
  startDate: string;
  endDate: string;
  annualRate: number;
};

type InterestForBasisInput = {
  balance: number;
  basis: InterestAccrualBasis;
  annualRate: number;
  frequency: PaymentFrequency;
  rateSegments?: InterestRateSegment[];
};

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ISO date: ${value}`);
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) {
    throw new Error(`Invalid ISO date: ${value}`);
  }

  return timestamp;
}

function daysBetween(startDate: string, endDate: string): number {
  const days = (parseIsoDate(endDate) - parseIsoDate(startDate)) / MILLISECONDS_PER_DAY;
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error("Interest accrual segment end date must be after its start date");
  }
  return days;
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateActual365Interest(
  balance: number,
  rateSegments: InterestRateSegment[]
): number {
  if (!Number.isFinite(balance) || balance < 0) {
    throw new Error("Interest accrual balance must be a non-negative number");
  }
  if (rateSegments.length === 0) {
    throw new Error("Actual/365 interest requires at least one rate segment");
  }

  let accruedInterest = 0;
  let previousEndDate: string | undefined;

  for (const segment of rateSegments) {
    if (previousEndDate && segment.startDate !== previousEndDate) {
      throw new Error("Actual/365 rate segments must be contiguous");
    }
    if (!Number.isFinite(segment.annualRate) || segment.annualRate < 0) {
      throw new Error("Interest accrual rates must be non-negative numbers");
    }

    accruedInterest +=
      balance * segment.annualRate * (daysBetween(segment.startDate, segment.endDate) / 365);
    previousEndDate = segment.endDate;
  }

  return roundCurrency(accruedInterest);
}

export function calculateInterestForBasis({
  balance,
  basis,
  annualRate,
  frequency,
  rateSegments,
}: InterestForBasisInput): number {
  if (basis === "actual-365") {
    return calculateActual365Interest(balance, rateSegments ?? []);
  }

  return calculateInterestPayment(balance, annualRate, frequency);
}
