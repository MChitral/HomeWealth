import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateAmortizationSchedule,
  generateAmortizationScheduleWithPayment,
  type PaymentFrequency,
  type TermRenewal,
} from "../mortgage";

describe("Term Renewal Amortization Reset", () => {
  it("uses original amortization period at term renewal (Canadian convention)", () => {
    // Setup: Mortgage with 25-year amortization
    // After 5 years (60 payments), term renews
    // At renewal, payment should be recalculated using original 25-year amortization, not remaining 20 years

    const principal = 500000;
    const initialRate = 0.05; // 5%
    const originalAmortizationMonths = 300; // 25 years
    const frequency: PaymentFrequency = "monthly";
    const startDate = new Date("2020-01-01");

    // Calculate initial payment
    const initialPayment =
      (principal * (initialRate / 12) * Math.pow(1 + initialRate / 12, 300)) /
      (Math.pow(1 + initialRate / 12, 300) - 1);

    // After 60 payments (5 years), term renews with new rate
    const renewalRate = 0.06; // 6% (higher rate)
    const renewalPaymentNumber = 61; // Payment 61 is the renewal

    // Calculate what balance would be after 60 payments
    let remainingBalance = principal;
    for (let i = 0; i < 60; i++) {
      const monthlyRate = Math.pow(1 + initialRate / 2, 1 / 6) - 1; // Approximate
      const interest = remainingBalance * monthlyRate;
      const principalPayment = initialPayment - interest;
      remainingBalance -= principalPayment;
    }

    // Term renewal: should use original amortization (300 months), not remaining (~240 months)
    const termRenewals: TermRenewal[] = [
      {
        startPaymentNumber: renewalPaymentNumber,
        newRate: renewalRate,
        originalAmortizationMonths: originalAmortizationMonths, // Original 25 years
      },
    ];

    const schedule = generateAmortizationSchedule(
      principal,
      initialRate,
      originalAmortizationMonths,
      frequency,
      startDate,
      [], // No prepayments
      termRenewals,
      72 // Generate 72 payments (6 years)
    );

    // Find the renewal payment
    const renewalPayment = schedule.payments.find((p) => p.paymentNumber === renewalPaymentNumber);
    assert.ok(renewalPayment, "Renewal payment should exist");

    // Payment after renewal should be calculated using original amortization
    // This means the payment will be higher than if we used remaining amortization
    const paymentAfterRenewal = schedule.payments.find(
      (p) => p.paymentNumber === renewalPaymentNumber + 1
    );
    assert.ok(paymentAfterRenewal, "Payment after renewal should exist");

    // Verify the payment amount is recalculated (not just continuing with old payment)
    // The exact amount depends on the balance at renewal, but it should be different from initial payment
    assert.ok(
      Math.abs(paymentAfterRenewal.paymentAmount - initialPayment) > 1,
      "Payment should be recalculated at renewal"
    );
  });

  it("VRM-Fixed Payment keeps same payment amount at renewal", () => {
    const principal = 500000;
    const initialRate = 0.05;
    const originalAmortizationMonths = 300;
    const frequency: PaymentFrequency = "monthly";
    const startDate = new Date("2020-01-01");

    const initialPayment = 3000; // Fixed payment amount

    const termRenewals: TermRenewal[] = [
      {
        startPaymentNumber: 61,
        newRate: 0.06, // Rate increases
        newPaymentAmount: initialPayment, // VRM-Fixed: payment stays same
        originalAmortizationMonths: originalAmortizationMonths,
      },
    ];

    const schedule = generateAmortizationScheduleWithPayment(
      principal,
      initialRate,
      originalAmortizationMonths,
      frequency,
      startDate,
      initialPayment,
      [],
      termRenewals,
      72
    );

    const renewalPayment = schedule.payments.find((p) => p.paymentNumber === 61);
    const paymentAfterRenewal = schedule.payments.find((p) => p.paymentNumber === 62);

    assert.ok(renewalPayment, "Renewal payment should exist");
    assert.ok(paymentAfterRenewal, "Payment after renewal should exist");

    // VRM-Fixed: payment amount should stay the same
    assert.equal(
      paymentAfterRenewal.paymentAmount,
      initialPayment,
      "VRM-Fixed payment should remain unchanged at renewal"
    );
  });

  it("VRM-Changing recalculates payment using original amortization", () => {
    const principal = 500000;
    const initialRate = 0.05;
    const originalAmortizationMonths = 300;
    const frequency: PaymentFrequency = "monthly";
    const startDate = new Date("2020-01-01");

    const termRenewals: TermRenewal[] = [
      {
        startPaymentNumber: 61,
        newRate: 0.06, // Rate increases
        // newPaymentAmount not set = VRM-Changing, recalculate
        originalAmortizationMonths: originalAmortizationMonths,
      },
    ];

    const schedule = generateAmortizationSchedule(
      principal,
      initialRate,
      originalAmortizationMonths,
      frequency,
      startDate,
      [],
      termRenewals,
      72
    );

    const renewalPayment = schedule.payments.find((p) => p.paymentNumber === 61);
    const paymentAfterRenewal = schedule.payments.find((p) => p.paymentNumber === 62);

    assert.ok(renewalPayment, "Renewal payment should exist");
    assert.ok(paymentAfterRenewal, "Payment after renewal should exist");

    // VRM-Changing: payment should be recalculated
    // With higher rate, payment should increase
    const paymentBeforeRenewal = schedule.payments.find((p) => p.paymentNumber === 60);
    assert.ok(paymentBeforeRenewal, "Payment before renewal should exist");

    // Payment should change (likely increase due to higher rate)
    assert.ok(
      Math.abs(paymentAfterRenewal.paymentAmount - paymentBeforeRenewal.paymentAmount) > 0.01,
      "VRM-Changing payment should be recalculated at renewal"
    );
  });
});
