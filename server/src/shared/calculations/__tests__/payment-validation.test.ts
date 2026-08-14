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

  it("applies a pure lump-sum prepayment 100% to principal with zero interest", () => {
    const result = validateMortgagePayment({
      mortgage: mockMortgage,
      term: mockTerm,
      paymentAmount: 10000,
      regularPaymentAmount: 0,
      prepaymentAmount: 10000,
    });

    // Canadian convention: lump-sum prepayments reduce the balance by exactly
    // their amount — no interest portion, no double-counting.
    assert.equal(result.expectedPrincipal, 10000);
    assert.equal(result.expectedInterest, 0);
    assert.equal(result.expectedBalance, 580000 - 10000);
    assert.equal(result.triggerRateHit, false);
    assert.ok(result.remainingAmortizationMonths > 0);
  });

  it("does not double-count the prepayment in a combined regular + lump-sum payment", () => {
    const regularOnly = validateMortgagePayment({
      mortgage: mockMortgage,
      term: mockTerm,
      paymentAmount: 3500,
      regularPaymentAmount: 3500,
      prepaymentAmount: 0,
    });
    const combined = validateMortgagePayment({
      mortgage: mockMortgage,
      term: mockTerm,
      paymentAmount: 4000,
      regularPaymentAmount: 3500,
      prepaymentAmount: 500,
    });

    // Interest depends only on the balance and rate, so it must be identical.
    assert.equal(combined.expectedInterest, regularOnly.expectedInterest);
    // The whole payment is accounted for: principal + interest === total.
    assert.equal(combined.expectedPrincipal + combined.expectedInterest, 4000);
    // The $500 prepayment adds exactly $500 of principal (the old bug added $1000).
    assert.equal(combined.expectedPrincipal, regularOnly.expectedPrincipal + 500);
    assert.equal(
      combined.expectedBalance,
      Number((regularOnly.expectedBalance - 500).toFixed(2))
    );
  });

  it("rejects a prepayment larger than the total payment", () => {
    assert.throws(
      () =>
        validateMortgagePayment({
          mortgage: mockMortgage,
          term: mockTerm,
          paymentAmount: 5000,
          regularPaymentAmount: 0,
          prepaymentAmount: 10000,
        }),
      /cannot exceed/
    );
  });

  it("rejects non-finite or negative payment amounts", () => {
    assert.throws(
      () =>
        validateMortgagePayment({
          mortgage: mockMortgage,
          term: mockTerm,
          paymentAmount: NaN,
          regularPaymentAmount: 0,
          prepaymentAmount: 0,
        }),
      /non-negative/
    );
    assert.throws(
      () =>
        validateMortgagePayment({
          mortgage: mockMortgage,
          term: mockTerm,
          paymentAmount: 3500,
          regularPaymentAmount: 3500,
          prepaymentAmount: -100,
        }),
      /non-negative/
    );
  });
});
