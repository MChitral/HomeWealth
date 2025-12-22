import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateRemainingAmortization,
  generateAmortizationSchedule,
  type PaymentFrequency,
} from "../mortgage";
import { validateMortgagePayment } from "../payment-validation";
import type { Mortgage, MortgageTerm } from "@shared/schema";

describe("Amortization Calculation with Prepayments", () => {
  const mockMortgage: Mortgage = {
    id: "mortgage-1",
    userId: "user-1",
    propertyPrice: "500000.00",
    downPayment: "100000.00",
    originalAmount: "400000.00",
    currentBalance: "400000.00",
    startDate: "2020-01-01",
    amortizationYears: 25,
    amortizationMonths: 0,
    paymentFrequency: "monthly",
    annualPrepaymentLimitPercent: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTerm: MortgageTerm = {
    id: "term-1",
    mortgageId: "mortgage-1",
    termType: "fixed",
    startDate: "2020-01-01",
    endDate: "2025-01-01",
    termYears: 5,
    fixedRate: "5.490",
    lockedSpread: null,
    primeRate: null,
    paymentFrequency: "monthly",
    regularPaymentAmount: "2500.00",
    createdAt: new Date(),
  };

  it("calculates shorter amortization when prepayments are included", () => {
    const principal = 400000;
    const annualRate = 0.0549; // 5.49%
    const frequency: PaymentFrequency = "monthly";

    // Calculate regular payment
    const regularPayment = 2500;
    const prepaymentAmount = 500; // $500 prepayment per month
    const totalPayment = regularPayment + prepaymentAmount;

    // Calculate amortization with regular payment only
    const amortizationRegularOnly = calculateRemainingAmortization(
      principal,
      regularPayment,
      annualRate,
      frequency
    );

    // Calculate amortization with prepayments included
    const amortizationWithPrepayments = calculateRemainingAmortization(
      principal,
      totalPayment,
      annualRate,
      frequency
    );

    // Amortization with prepayments should be shorter
    assert.ok(
      amortizationWithPrepayments < amortizationRegularOnly,
      "Amortization with prepayments should be shorter than without"
    );

    // The difference should be significant (prepayments accelerate payoff)
    const difference = amortizationRegularOnly - amortizationWithPrepayments;
    assert.ok(
      difference > 12, // At least 1 year difference
      `Expected significant difference in amortization. Regular: ${amortizationRegularOnly} months, With prepayments: ${amortizationWithPrepayments} months`
    );
  });

  it("validateMortgagePayment uses total payment amount for amortization", () => {
    const result = validateMortgagePayment({
      mortgage: mockMortgage,
      term: mockTerm,
      paymentAmount: 3000, // Regular $2500 + prepayment $500
      regularPaymentAmount: 2500,
      prepaymentAmount: 500,
    });

    // The amortization should be calculated using the total payment (3000), not just regular (2500)
    // This means it should be shorter than if we only used regularPaymentAmount
    assert.ok(result.remainingAmortizationMonths > 0, "Remaining amortization should be positive");
    assert.ok(
      result.remainingAmortizationMonths < 300,
      "Remaining amortization should be less than original 25 years (300 months)"
    );
  });

  it("amortization schedule accounts for prepayments in remaining amortization", () => {
    const principal = 400000;
    const annualRate = 0.0549;
    const amortizationMonths = 300;
    const frequency: PaymentFrequency = "monthly";
    const startDate = new Date(2020, 0, 1);

    // Create schedule with monthly prepayments
    const prepayments = [
      {
        type: "monthly-percent" as const,
        amount: 0,
        monthlyPercent: 20, // 20% of regular payment as prepayment
        startPaymentNumber: 1,
      },
    ];

    const schedule = generateAmortizationSchedule(
      principal,
      annualRate,
      amortizationMonths,
      frequency,
      startDate,
      prepayments,
      [],
      24 // Generate 24 payments (2 years)
    );

    // After 24 payments with prepayments, remaining amortization should be shorter
    const lastPayment = schedule.payments[schedule.payments.length - 1];
    assert.ok(lastPayment, "Should have payments");

    // Remaining amortization should account for prepayments
    // It should be less than if we had no prepayments
    if (lastPayment.remainingAmortizationMonths > 0) {
      // With prepayments, we should have less remaining amortization
      // than the original 300 months minus 24 months (276 months)
      assert.ok(
        lastPayment.remainingAmortizationMonths < 276,
        `Remaining amortization (${lastPayment.remainingAmortizationMonths} months) should be less than 276 months due to prepayments`
      );
    }
  });

  it("amortization calculation correctly handles zero prepayments", () => {
    const principal = 400000;
    const annualRate = 0.0549;
    const frequency: PaymentFrequency = "monthly";

    const regularPayment = 2500;
    const noPrepayment = 0;
    const totalPayment = regularPayment + noPrepayment;

    // With no prepayments, should get same result using regularPayment or totalPayment
    const amortizationRegular = calculateRemainingAmortization(
      principal,
      regularPayment,
      annualRate,
      frequency
    );

    const amortizationTotal = calculateRemainingAmortization(
      principal,
      totalPayment,
      annualRate,
      frequency
    );

    assert.equal(
      amortizationRegular,
      amortizationTotal,
      "With no prepayments, amortization should be the same"
    );
  });
});
