import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Mortgage, MortgageTerm, MortgagePayment } from "@shared/schema";
import { validateMortgagePayment } from "../payment-validation";

const mockMortgage: Mortgage = {
  id: "mortgage-1",
  userId: "user-1",
  propertyPrice: "750000.00",
  downPayment: "150000.00",
  originalAmount: "600000.00",
  currentBalance: "580000.00",
  startDate: "2023-01-01",
  amortizationYears: 25,
  amortizationMonths: 0,
  paymentFrequency: "monthly",
  annualPrepaymentLimitPercent: 20,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockTerm: MortgageTerm = {
  id: "term-1",
  mortgageId: "mortgage-1",
  termType: "fixed",
  startDate: "2023-01-01",
  endDate: "2028-01-01",
  termYears: 5,
  fixedRate: "5.490",
  lockedSpread: null,
  primeRate: null,
  paymentFrequency: "monthly",
  regularPaymentAmount: "3500.00",
  createdAt: new Date().toISOString(),
};

describe("validateMortgagePayment", () => {
  it("calculates expected principal/interest split", () => {
    const result = validateMortgagePayment({
      mortgage: mockMortgage,
      term: mockTerm,
      paymentAmount: 3500,
      regularPaymentAmount: 3500,
      prepaymentAmount: 0,
    });

    assert.equal(result.expectedPrincipal + result.expectedInterest, 3500);
    assert.ok(result.expectedPrincipal > 0);
    assert.ok(result.expectedInterest > 0);
    assert.equal(result.triggerRateHit, false);
  });

  it("flags trigger rate when payment < interest", () => {
    const previous: MortgagePayment = {
      id: "p1",
      mortgageId: "mortgage-1",
      termId: "term-1",
      paymentDate: "2023-02-01",
      paymentPeriodLabel: null,
      regularPaymentAmount: "3500.00",
      prepaymentAmount: "0",
      paymentAmount: "3500.00",
      principalPaid: "1500.00",
      interestPaid: "2000.00",
      remainingBalance: "578500.00",
      primeRate: null,
      effectiveRate: "5.490",
      triggerRateHit: 0,
      remainingAmortizationMonths: 300,
      createdAt: new Date().toISOString(),
    };

    const result = validateMortgagePayment({
      mortgage: mockMortgage,
      term: {
        ...mockTerm,
        termType: "variable-fixed",
        fixedRate: null,
        lockedSpread: "-1.000",
        primeRate: "6.500",
      },
      previousPayment: previous,
      paymentAmount: 1000,
      regularPaymentAmount: 1000,
      prepaymentAmount: 0,
    });

    assert.equal(result.triggerRateHit, true);
    assert.equal(result.remainingAmortizationMonths, previous.remainingAmortizationMonths);
  });
});

