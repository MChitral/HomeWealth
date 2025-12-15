import type { MortgageTerm } from "@shared/schema";

/**
 * Convert a mortgage term definition into an annual rate (decimal form, e.g., 0.0549).
 */
export function getTermEffectiveRate(term: MortgageTerm, fallbackPrimePercent = 5.49): number {
  if (term.termType === "fixed" && term.fixedRate) {
    return parseFloat(term.fixedRate) / 100;
  }

  const primePercent = term.primeRate ? parseFloat(term.primeRate) : fallbackPrimePercent;
  const spreadPercent = term.lockedSpread ? parseFloat(term.lockedSpread) : 0;

  return (primePercent + spreadPercent) / 100;
}

/**
 * Determine whether a term should update its regular payment when the term changes.
 * Variable fixed-payment mortgages intentionally keep the same payment.
 */
export function shouldUpdatePaymentAmount(term: MortgageTerm): boolean {
  return term.termType !== "variable-fixed";
}
