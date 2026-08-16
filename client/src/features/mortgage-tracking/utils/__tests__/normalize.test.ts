import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MortgagePayment, MortgageTerm } from "@shared/schema";
import { normalizePayments, normalizeTerm } from "../normalize";

describe("mortgage API normalization", () => {
  it("preserves the accrual basis and statement source while sorting payments", () => {
    const term = {
      id: "term-1",
      mortgageId: "mortgage-1",
      termType: "variable-fixed",
      startDate: "2025-01-02",
      endDate: "2030-01-02",
      termYears: 5,
      lockedSpread: "-0.900",
      fixedRate: null,
      primeRate: "4.450",
      paymentFrequency: "monthly",
      regularPaymentAmount: "1500.69",
      interestAccrualBasis: "actual-365",
      createdAt: new Date(),
    } as MortgageTerm;
    const makePayment = (id: string, paymentDate: string) =>
      ({
        id,
        mortgageId: "mortgage-1",
        termId: "term-1",
        paymentDate,
        paymentPeriodLabel: null,
        regularPaymentAmount: "1500.69",
        prepaymentAmount: "0.00",
        paymentAmount: "1500.69",
        principalPaid: "650.12",
        interestPaid: "850.57",
        remainingBalance: "280455.41",
        primeRate: "4.450",
        effectiveRate: "3.550",
        triggerRateHit: 0,
        calculationSource: "statement",
        isSkipped: 0,
        skippedInterestAccrued: "0.00",
        remainingAmortizationMonths: 273,
        createdAt: new Date(),
      }) as MortgagePayment;

    const normalizedTerm = normalizeTerm(term);
    const normalizedPayments = normalizePayments(
      [makePayment("later", "2026-08-02"), makePayment("earlier", "2026-07-02")],
      [term]
    );

    assert.equal(normalizedTerm?.interestAccrualBasis, "actual-365");
    assert.deepEqual(
      normalizedPayments.map((payment) => payment.id),
      ["earlier", "later"]
    );
    assert.ok(normalizedPayments.every((payment) => payment.calculationSource === "statement"));
  });
});
