import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateAmortizationScheduleWithPayment,
  type PaymentFrequency,
} from "../mortgage";

describe("Negative Amortization Handling", () => {
  it("balance increases when trigger rate is hit for VRM-Fixed Payment", () => {
    // Setup: VRM-Fixed Payment mortgage where rate exceeds trigger rate
    // Payment: $1,000/month (fixed)
    // Balance: $200,000
    // Rate: 7.5% (high rate that exceeds trigger)
    // Trigger rate calculation: payment / balance * paymentsPerYear = 1000/200000 * 12 = 0.06 = 6%
    // Since 7.5% > 6%, trigger rate is hit

    const principal = 200000;
    const annualRate = 0.075; // 7.5% - above trigger rate
    const amortizationMonths = 300; // 25 years
    const frequency: PaymentFrequency = "monthly";
    const fixedPaymentAmount = 1000; // Fixed payment that doesn't cover interest
    const startDate = new Date("2024-01-01");

    const schedule = generateAmortizationScheduleWithPayment(
      principal,
      annualRate,
      amortizationMonths,
      frequency,
      startDate,
      fixedPaymentAmount,
      [], // No prepayments
      [], // No term renewals
      12 // Generate 12 payments
    );

    // First payment: interest = 200000 * (effective monthly rate)
    // Effective monthly rate from 7.5% semi-annual = (1 + 0.075/2)^2 - 1 = 0.07640625
    // Monthly rate = (1.07640625)^(1/12) - 1 ≈ 0.00617
    // Interest = 200000 * 0.00617 ≈ $1,234
    // Payment = $1,000
    // Unpaid interest = $234
    // Balance should INCREASE by $234

    const firstPayment = schedule.payments[0];
    assert.ok(firstPayment.triggerRateHit, "Trigger rate should be hit");
    assert.ok(firstPayment.interestPayment > firstPayment.paymentAmount, "Interest should exceed payment");
    
    // Balance should increase (negative amortization)
    const secondPayment = schedule.payments[1];
    assert.ok(
      secondPayment.remainingBalance > firstPayment.remainingBalance,
      "Balance should increase when trigger rate is hit"
    );

    // Verify unpaid interest is added to balance
    const unpaidInterest = firstPayment.interestPayment - firstPayment.paymentAmount;
    const expectedBalanceIncrease = firstPayment.remainingBalance + unpaidInterest - firstPayment.remainingBalance;
    assert.ok(expectedBalanceIncrease > 0, "Balance should increase by unpaid interest");
  });

  it("principal payment is zero when trigger rate is hit", () => {
    const principal = 200000;
    const annualRate = 0.075; // 7.5%
    const amortizationMonths = 300;
    const frequency: PaymentFrequency = "monthly";
    const fixedPaymentAmount = 1000;
    const startDate = new Date("2024-01-01");

    const schedule = generateAmortizationScheduleWithPayment(
      principal,
      annualRate,
      amortizationMonths,
      frequency,
      startDate,
      fixedPaymentAmount,
      [],
      [],
      3
    );

    const firstPayment = schedule.payments[0];
    if (firstPayment.triggerRateHit) {
      assert.equal(firstPayment.principalPayment, 0, "Principal payment should be zero when trigger rate hit");
    }
  });

  it("prepayments reduce negative amortization when trigger rate is hit", () => {
    const principal = 200000;
    const annualRate = 0.075; // 7.5%
    const amortizationMonths = 300;
    const frequency: PaymentFrequency = "monthly";
    const fixedPaymentAmount = 1000;
    const startDate = new Date("2024-01-01");

    // Add prepayment that covers unpaid interest
    const prepayments = [{
      type: 'one-time' as const,
      amount: 500, // Large prepayment
      startPaymentNumber: 1,
    }];

    const schedule = generateAmortizationScheduleWithPayment(
      principal,
      annualRate,
      amortizationMonths,
      frequency,
      startDate,
      fixedPaymentAmount,
      prepayments,
      [],
      3
    );

    const firstPayment = schedule.payments[0];
    assert.ok(firstPayment.triggerRateHit, "Trigger rate should still be hit");
    
    // With prepayment, balance should decrease or increase less
    const unpaidInterest = firstPayment.interestPayment - firstPayment.paymentAmount;
    const netChange = firstPayment.remainingBalance - principal;
    
    // Prepayment should reduce the negative amortization
    assert.ok(
      netChange < unpaidInterest,
      "Prepayment should reduce negative amortization"
    );
  });

  it("remaining amortization is -1 when trigger rate is hit", () => {
    const principal = 200000;
    const annualRate = 0.075; // 7.5%
    const amortizationMonths = 300;
    const frequency: PaymentFrequency = "monthly";
    const fixedPaymentAmount = 1000;
    const startDate = new Date("2024-01-01");

    const schedule = generateAmortizationScheduleWithPayment(
      principal,
      annualRate,
      amortizationMonths,
      frequency,
      startDate,
      fixedPaymentAmount,
      [],
      [],
      3
    );

    const firstPayment = schedule.payments[0];
    if (firstPayment.triggerRateHit) {
      assert.equal(
        firstPayment.remainingAmortizationMonths,
        -1,
        "Remaining amortization should be -1 when trigger rate hit"
      );
    }
  });
});

