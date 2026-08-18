import { z } from "zod";
import { STATEMENT_PERIOD_PATTERN } from "./mortgage-ledger";

const money = z
  .union([z.string(), z.number()])
  .transform((val) => (typeof val === "number" ? val.toFixed(2) : val));

const statementPeriod = z.string().regex(STATEMENT_PERIOD_PATTERN);

export const homelineMonthlyFactsSchema = z.object({
  documentType: z.literal("homeline_monthly"),
  statementPeriod,
  statementAsOf: z.string(),
  paymentsReceived: money,
  mortgageOutstanding: money,
  openingBalance: money.optional(),
  helocDrawn: money,
  helocLimit: money.optional(),
  availableCredit: money,
  planTotalLimit: money.optional(),
  paymentDate: z.string().optional(),
  primeWindows: z
    .array(
      z.object({
        from: z.string(),
        to: z.string().optional(),
        primeRate: money,
        mortgageRate: money.optional(),
        helocRate: money.optional(),
      })
    )
    .optional(),
});

export const costOfBorrowingFactsSchema = z.object({
  documentType: z.literal("cost_of_borrowing"),
  statementPeriod,
  isDoubleUpChange: z.boolean(),
  interestToEndOfTerm: money,
  principalAndInterestToEndOfTerm: money.optional(),
  triggeringAnnualRate: money.optional(),
  nextDueDate: z.string().optional(),
  rateReduction: money.optional(),
  remainingTerm: z.string().optional(),
  remainingAmortization: z.string().optional(),
});

export const annualStatementFactsSchema = z.object({
  documentType: z.literal("annual_statement"),
  statementPeriod,
  statementAsOf: z.string(),
  interestAdjustmentDate: z.string().optional(),
  lumpSumRoom: money.optional(),
  annualLumpSumLimitPercent: z.number().optional(),
  skipAPaymentYtd: money.optional(),
  interestInArrears: money.optional(),
  accruedInterest: money.optional(),
  penaltyMethod: z.string().optional(),
  switchOutFee: money.optional(),
  dischargeFee: money.optional(),
  loanProtectorPerThousand: money.optional(),
});

export const statementFactsSchema = z.discriminatedUnion("documentType", [
  homelineMonthlyFactsSchema,
  costOfBorrowingFactsSchema,
  annualStatementFactsSchema,
]);

export type HomelineMonthlyFacts = z.infer<typeof homelineMonthlyFactsSchema>;
export type CostOfBorrowingFacts = z.infer<typeof costOfBorrowingFactsSchema>;
export type AnnualStatementFacts = z.infer<typeof annualStatementFactsSchema>;
export type StatementFacts = z.infer<typeof statementFactsSchema>;
