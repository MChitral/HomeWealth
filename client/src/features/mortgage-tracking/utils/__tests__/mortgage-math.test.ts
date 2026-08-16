import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculatePayment,
  calculatePaymentBreakdown,
  getEffectivePeriodicRate,
  type PaymentFrequency,
} from "../mortgage-math";

const principal = 400_000;
const annualRate = 0.055;
const amortizationMonths = 25 * 12;

describe("mortgage-math payment helpers", () => {
  it("previews an Actual/365 payment using calendar days", () => {
    const breakdown = calculatePaymentBreakdown({
      balance: 282105.53,
      paymentAmount: 2500.69,
      regularPaymentAmount: 1500.69,
      extraPrepaymentAmount: 1000,
      frequency: "monthly",
      annualRate: 0.0355,
      interestAccrualBasis: "actual-365",
      periodStartDate: "2026-07-02",
      periodEndDate: "2026-08-02",
    });

    assert.equal(breakdown.interest, 850.57);
    assert.equal(breakdown.principal, 1650.12);
    assert.equal(breakdown.remainingBalance, 280455.41);
  });

  it("keeps accelerated payments in lockstep with the monthly schedule", () => {
    const monthly = calculatePayment(principal, annualRate, amortizationMonths, "monthly");
    const accelBiweekly = calculatePayment(
      principal,
      annualRate,
      amortizationMonths,
      "accelerated-biweekly"
    );
    const accelWeekly = calculatePayment(
      principal,
      annualRate,
      amortizationMonths,
      "accelerated-weekly"
    );

    assert.ok(
      Math.abs(accelBiweekly - monthly / 2) < 0.01,
      "accelerated bi-weekly halves the monthly"
    );
    assert.ok(
      Math.abs(accelWeekly - monthly / 4) < 0.01,
      "accelerated weekly quarters the monthly"
    );
  });

  it("splits a scheduled payment into principal and interest with Canadian compounding", () => {
    const paymentAmount = Number(
      calculatePayment(principal, annualRate, amortizationMonths, "monthly").toFixed(2)
    );
    const breakdown = calculatePaymentBreakdown({
      balance: principal,
      paymentAmount,
      regularPaymentAmount: paymentAmount,
      frequency: "monthly",
      annualRate,
    });

    assert.ok(Math.abs(breakdown.principal + breakdown.interest - paymentAmount) < 0.01);
    assert.equal(breakdown.remainingBalance, Number((principal - breakdown.principal).toFixed(2)));
    assert.ok(
      breakdown.remainingAmortizationMonths > 0 &&
        breakdown.remainingAmortizationMonths <= amortizationMonths
    );
  });

  it("treats interest-only payments as trigger-rate events and suppresses amortization math", () => {
    const balance = 500_000;
    const frequency: PaymentFrequency = "monthly";
    const periodicRate = getEffectivePeriodicRate(0.06, frequency);
    const interestOnlyPayment = Number((balance * periodicRate).toFixed(2));

    const breakdown = calculatePaymentBreakdown({
      balance,
      paymentAmount: interestOnlyPayment - 25,
      regularPaymentAmount: interestOnlyPayment - 25,
      frequency,
      annualRate: 0.06,
    });

    assert.equal(breakdown.triggerRateHit, true);
    assert.equal(breakdown.principal, 0);
    assert.equal(breakdown.remainingAmortizationMonths, 0);
  });

  it("applies extra prepayments directly against principal", () => {
    const paymentAmount = Number(
      calculatePayment(principal, annualRate, amortizationMonths, "monthly").toFixed(2)
    );
    const baseBreakdown = calculatePaymentBreakdown({
      balance: principal,
      paymentAmount,
      regularPaymentAmount: paymentAmount,
      frequency: "monthly",
      annualRate,
    });
    const boostedBreakdown = calculatePaymentBreakdown({
      balance: principal,
      paymentAmount: paymentAmount + 500,
      regularPaymentAmount: paymentAmount,
      extraPrepaymentAmount: 500,
      frequency: "monthly",
      annualRate,
    });

    assert.ok(boostedBreakdown.principal - baseBreakdown.principal >= 500 - 0.1);
    assert.equal(boostedBreakdown.interest, baseBreakdown.interest);
    assert.ok(boostedBreakdown.remainingBalance < baseBreakdown.remainingBalance);
  });
});
