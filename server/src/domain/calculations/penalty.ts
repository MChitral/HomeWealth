/**
 * Calculates the estimated 3-month interest penalty.
 * Standard Canadian penalty is often the greater of 3-month interest or IRD.
 *
 * @param balance Current mortgage balance
 * @param annualRate Annual interest rate (decimal, e.g., 0.05 for 5%)
 * @returns The penalty amount in dollars
 */
export function calculateThreeMonthInterestPenalty(balance: number, annualRate: number): number {
  if (balance < 0 || annualRate < 0) return 0;
  // Simple interest calculation: Balance * Rate * (3/12)
  return balance * annualRate * (3 / 12);
}

/**
 * Calculates the estimated Interest Rate Differential (IRD) penalty.
 * IRD applies when the current rate is higher than the current market rate for the remaining term.
 * The lender loses money by re-lending the funds at a lower rate.
 *
 * Approximation Formula:
 * IRD = Balance * (CurrentRate - ComparisonRate) * RemainingTimeInYears
 *
 * @param balance Current mortgage balance
 * @param currentAnnualRate Current mortgage rate (decimal)
 * @param comparisonAnnualRate Current market rate for the remaining term (decimal)
 * @param remainingMonths Number of months remaining in the term
 * @returns The penalty amount in dollars (0 if comparison rate >= current rate)
 */
export function calculateIRDPenalty(
  balance: number,
  currentAnnualRate: number,
  comparisonAnnualRate: number,
  remainingMonths: number
): number {
  if (balance < 0 || currentAnnualRate < 0 || comparisonAnnualRate < 0 || remainingMonths <= 0) {
    return 0;
  }

  // If market rates are higher, the lender can lend at a higher rate, so no loss (IRD is 0).
  if (comparisonAnnualRate >= currentAnnualRate) {
    return 0;
  }

  const rateDifference = currentAnnualRate - comparisonAnnualRate;
  const remainingYears = remainingMonths / 12;

  return balance * rateDifference * remainingYears;
}

/**
 * Penalty calculation method types
 */
export type PenaltyCalculationMethod =
  | "ird_posted_rate"
  | "ird_discounted_rate"
  | "ird_origination_comparison"
  | "three_month_interest"
  | "open_mortgage"
  | "variable_rate";

/**
 * Calculates IRD using posted rate methodology.
 * Uses the lender's posted rate (not discounted rate) for comparison.
 *
 * @param balance Current mortgage balance
 * @param currentRate Current mortgage rate (decimal)
 * @param postedRate Lender's posted rate for remaining term (decimal)
 * @param remainingMonths Number of months remaining in the term
 * @returns The penalty amount in dollars
 */
export function calculateIRDPostedRate(
  balance: number,
  currentRate: number,
  postedRate: number,
  remainingMonths: number
): number {
  if (balance < 0 || currentRate < 0 || postedRate < 0 || remainingMonths <= 0) {
    return 0;
  }

  if (postedRate >= currentRate) {
    return 0;
  }

  const rateDifference = currentRate - postedRate;
  const remainingYears = remainingMonths / 12;

  return balance * rateDifference * remainingYears;
}

/**
 * Calculates IRD using discounted rate methodology.
 * Uses the lender's discounted rate (what borrower actually pays) for comparison.
 *
 * @param balance Current mortgage balance
 * @param currentRate Current mortgage rate (decimal)
 * @param discountedRate Lender's discounted rate for remaining term (decimal)
 * @param remainingMonths Number of months remaining in the term
 * @returns The penalty amount in dollars
 */
export function calculateIRDDiscountedRate(
  balance: number,
  currentRate: number,
  discountedRate: number,
  remainingMonths: number
): number {
  if (balance < 0 || currentRate < 0 || discountedRate < 0 || remainingMonths <= 0) {
    return 0;
  }

  if (discountedRate >= currentRate) {
    return 0;
  }

  const rateDifference = currentRate - discountedRate;
  const remainingYears = remainingMonths / 12;

  return balance * rateDifference * remainingYears;
}

/**
 * Calculates IRD using origination date comparison.
 * Compares current rate to the rate that was available at origination for the remaining term.
 *
 * @param balance Current mortgage balance
 * @param currentRate Current mortgage rate (decimal)
 * @param originationRate Rate available at origination for remaining term (decimal)
 * @param remainingMonths Number of months remaining in the term
 * @returns The penalty amount in dollars
 */
export function calculateIRDOriginationComparison(
  balance: number,
  currentRate: number,
  originationRate: number,
  remainingMonths: number
): number {
  if (balance < 0 || currentRate < 0 || originationRate < 0 || remainingMonths <= 0) {
    return 0;
  }

  if (originationRate >= currentRate) {
    return 0;
  }

  const rateDifference = currentRate - originationRate;
  const remainingYears = remainingMonths / 12;

  return balance * rateDifference * remainingYears;
}

/**
 * Calculates penalty for variable rate mortgages.
 * Variable mortgages typically use 3-month interest penalty.
 *
 * @param balance Current mortgage balance
 * @param annualRate Annual interest rate (decimal)
 * @returns The penalty amount in dollars
 */
export function calculateVariableRatePenalty(balance: number, annualRate: number): number {
  return calculateThreeMonthInterestPenalty(balance, annualRate);
}

/**
 * Calculates penalty for open mortgages.
 * Open mortgages typically have minimal or zero penalties.
 *
 * @returns The penalty amount (usually 0 for open mortgages)
 */
export function calculateOpenMortgagePenalty(): number {
  return 0;
}

/**
 * Determines the estimated penalty based on standard "Greater of" rule.
 *
 * @param balance Current balance
 * @param currentRate Current annual rate (decimal)
 * @param marketRate Current market rate for remaining term (decimal)
 * @param remainingMonths Months remaining in term
 * @returns Object containing the penalty amount and which method was applied
 */
export function calculateStandardPenalty(
  balance: number,
  currentRate: number,
  marketRate: number,
  remainingMonths: number
): { penalty: number; method: "IRD" | "3-Month Interest" } {
  const threeMonth = calculateThreeMonthInterestPenalty(balance, currentRate);
  const ird = calculateIRDPenalty(balance, currentRate, marketRate, remainingMonths);

  if (ird > threeMonth) {
    return { penalty: ird, method: "IRD" };
  } else {
    return { penalty: threeMonth, method: "3-Month Interest" };
  }
}

/**
 * Calculates penalty using a specific calculation method.
 *
 * @param method Penalty calculation method
 * @param balance Current mortgage balance
 * @param currentRate Current mortgage rate (decimal)
 * @param comparisonRate Comparison rate (posted, discounted, or origination rate) (decimal)
 * @param remainingMonths Number of months remaining in the term
 * @param termType Term type (fixed, variable-changing, variable-fixed)
 * @returns Object containing the penalty amount and method used
 */
export function calculatePenaltyByMethod(
  method: PenaltyCalculationMethod | null | undefined,
  balance: number,
  currentRate: number,
  comparisonRate: number,
  remainingMonths: number,
  termType?: "fixed" | "variable-changing" | "variable-fixed"
): { penalty: number; method: string } {
  // Default to standard calculation if no method specified
  if (!method) {
    return calculateStandardPenalty(balance, currentRate, comparisonRate, remainingMonths);
  }

  // Handle open mortgages
  if (method === "open_mortgage") {
    return { penalty: calculateOpenMortgagePenalty(), method: "Open Mortgage" };
  }

  // Handle variable rate mortgages
  if (method === "variable_rate" || termType?.startsWith("variable")) {
    return {
      penalty: calculateVariableRatePenalty(balance, currentRate),
      method: "3-Month Interest (Variable)",
    };
  }

  // Handle 3-month interest only
  if (method === "three_month_interest") {
    return {
      penalty: calculateThreeMonthInterestPenalty(balance, currentRate),
      method: "3-Month Interest",
    };
  }

  // Handle IRD methods
  let irdPenalty = 0;
  let methodName = "";

  switch (method) {
    case "ird_posted_rate":
      irdPenalty = calculateIRDPostedRate(balance, currentRate, comparisonRate, remainingMonths);
      methodName = "IRD (Posted Rate)";
      break;
    case "ird_discounted_rate":
      irdPenalty = calculateIRDDiscountedRate(
        balance,
        currentRate,
        comparisonRate,
        remainingMonths
      );
      methodName = "IRD (Discounted Rate)";
      break;
    case "ird_origination_comparison":
      irdPenalty = calculateIRDOriginationComparison(
        balance,
        currentRate,
        comparisonRate,
        remainingMonths
      );
      methodName = "IRD (Origination Comparison)";
      break;
    default:
      // Fallback to standard calculation
      return calculateStandardPenalty(balance, currentRate, comparisonRate, remainingMonths);
  }

  // For IRD methods, compare with 3-month interest and return the greater
  const threeMonth = calculateThreeMonthInterestPenalty(balance, currentRate);
  if (irdPenalty > threeMonth) {
    return { penalty: irdPenalty, method: methodName };
  } else {
    return { penalty: threeMonth, method: "3-Month Interest" };
  }
}
