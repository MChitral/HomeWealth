import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateTriggerRate,
  getEffectivePeriodicRate,
  isTriggerRateHit,
  type PaymentFrequency,
} from "../mortgage";

describe("Trigger Rate Calculation", () => {
  const ROUNDING_TOLERANCE = 0.01; // $0.01 tolerance for monetary calculations

  describe("calculateTriggerRate - Reverse Calculation Verification", () => {
    /**
     * Verification Test:
     * 1. Calculate trigger rate using calculateTriggerRate
     * 2. Use that trigger rate in getEffectivePeriodicRate (forward calculation)
     * 3. Multiply periodic rate by balance to get payment
     * 4. Verify it equals original paymentAmount (within tolerance)
     */
    it("verifies reverse calculation for monthly payments", () => {
      const paymentAmount = 3500.0;
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "monthly";

      // Step 1: Calculate trigger rate (reverse calculation)
      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);

      // Step 2: Use trigger rate in forward calculation
      const periodicRate = getEffectivePeriodicRate(triggerRate, frequency);

      // Step 3: Calculate payment from periodic rate
      const calculatedPayment = periodicRate * remainingBalance;

      // Step 4: Verify it matches original payment (within tolerance)
      assert.ok(
        Math.abs(calculatedPayment - paymentAmount) < ROUNDING_TOLERANCE,
        `Payment mismatch: expected ${paymentAmount}, got ${calculatedPayment}. Trigger rate: ${triggerRate}`
      );
    });

    it("verifies reverse calculation for biweekly payments", () => {
      const paymentAmount = 1750.0;
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "biweekly";

      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
      const periodicRate = getEffectivePeriodicRate(triggerRate, frequency);
      const calculatedPayment = periodicRate * remainingBalance;

      assert.ok(
        Math.abs(calculatedPayment - paymentAmount) < ROUNDING_TOLERANCE,
        `Payment mismatch: expected ${paymentAmount}, got ${calculatedPayment}. Trigger rate: ${triggerRate}`
      );
    });

    it("verifies reverse calculation for accelerated-biweekly payments", () => {
      const paymentAmount = 1750.0; // Half of monthly
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "accelerated-biweekly";

      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
      const periodicRate = getEffectivePeriodicRate(triggerRate, frequency);
      const calculatedPayment = periodicRate * remainingBalance;

      assert.ok(
        Math.abs(calculatedPayment - paymentAmount) < ROUNDING_TOLERANCE,
        `Payment mismatch: expected ${paymentAmount}, got ${calculatedPayment}. Trigger rate: ${triggerRate}`
      );
    });

    it("verifies reverse calculation for weekly payments", () => {
      const paymentAmount = 875.0;
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "weekly";

      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
      const periodicRate = getEffectivePeriodicRate(triggerRate, frequency);
      const calculatedPayment = periodicRate * remainingBalance;

      assert.ok(
        Math.abs(calculatedPayment - paymentAmount) < ROUNDING_TOLERANCE,
        `Payment mismatch: expected ${paymentAmount}, got ${calculatedPayment}. Trigger rate: ${triggerRate}`
      );
    });

    it("verifies reverse calculation for semi-monthly payments", () => {
      const paymentAmount = 1750.0;
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "semi-monthly";

      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
      const periodicRate = getEffectivePeriodicRate(triggerRate, frequency);
      const calculatedPayment = periodicRate * remainingBalance;

      assert.ok(
        Math.abs(calculatedPayment - paymentAmount) < ROUNDING_TOLERANCE,
        `Payment mismatch: expected ${paymentAmount}, got ${calculatedPayment}. Trigger rate: ${triggerRate}`
      );
    });

    it("verifies reverse calculation with different balance amounts", () => {
      const testCases = [
        { payment: 2000.0, balance: 300000.0 },
        { payment: 5000.0, balance: 750000.0 },
        { payment: 1000.0, balance: 150000.0 },
        { payment: 10000.0, balance: 1500000.0 },
      ];

      for (const testCase of testCases) {
        const triggerRate = calculateTriggerRate(testCase.payment, testCase.balance, "monthly");
        const periodicRate = getEffectivePeriodicRate(triggerRate, "monthly");
        const calculatedPayment = periodicRate * testCase.balance;

        assert.ok(
          Math.abs(calculatedPayment - testCase.payment) < ROUNDING_TOLERANCE,
          `Payment mismatch for balance ${testCase.balance}: expected ${testCase.payment}, got ${calculatedPayment}`
        );
      }
    });

    it("verifies reverse calculation with high payment-to-balance ratio", () => {
      // High payment relative to balance (aggressive payment)
      const paymentAmount = 10000.0;
      const remainingBalance = 100000.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
      const periodicRate = getEffectivePeriodicRate(triggerRate, frequency);
      const calculatedPayment = periodicRate * remainingBalance;

      assert.ok(
        Math.abs(calculatedPayment - paymentAmount) < ROUNDING_TOLERANCE,
        `High payment ratio test failed: expected ${paymentAmount}, got ${calculatedPayment}`
      );
    });

    it("verifies reverse calculation with low payment-to-balance ratio", () => {
      // Low payment relative to balance (interest-only scenario)
      const paymentAmount = 500.0;
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
      const periodicRate = getEffectivePeriodicRate(triggerRate, frequency);
      const calculatedPayment = periodicRate * remainingBalance;

      assert.ok(
        Math.abs(calculatedPayment - paymentAmount) < ROUNDING_TOLERANCE,
        `Low payment ratio test failed: expected ${paymentAmount}, got ${calculatedPayment}`
      );
    });
  });

  describe("calculateTriggerRate - Mathematical Properties", () => {
    it("returns higher trigger rate for higher payment amounts", () => {
      const balance = 500000.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate1 = calculateTriggerRate(3000.0, balance, frequency);
      const triggerRate2 = calculateTriggerRate(4000.0, balance, frequency);

      assert.ok(
        triggerRate2 > triggerRate1,
        `Higher payment should yield higher trigger rate. Got ${triggerRate1} vs ${triggerRate2}`
      );
    });

    it("returns lower trigger rate for higher balance amounts", () => {
      const payment = 3500.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate1 = calculateTriggerRate(payment, 400000.0, frequency);
      const triggerRate2 = calculateTriggerRate(payment, 600000.0, frequency);

      assert.ok(
        triggerRate2 < triggerRate1,
        `Higher balance should yield lower trigger rate. Got ${triggerRate1} vs ${triggerRate2}`
      );
    });

    it("returns positive trigger rate for valid inputs", () => {
      const payment = 3500.0;
      const balance = 500000.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate = calculateTriggerRate(payment, balance, frequency);

      assert.ok(triggerRate > 0, `Trigger rate should be positive. Got ${triggerRate}`);
      assert.ok(triggerRate < 1, `Trigger rate should be reasonable (< 100%). Got ${triggerRate}`);
    });

    it("handles edge case where payment equals balance", () => {
      const payment = 500000.0;
      const balance = 500000.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate = calculateTriggerRate(payment, balance, frequency);

      // When payment = balance, periodic rate = 1, which means very high annual rate
      assert.ok(triggerRate > 0, `Trigger rate should be positive even for edge case`);
    });
  });

  describe("isTriggerRateHit - Integration with calculateTriggerRate", () => {
    it("correctly identifies when trigger rate is hit", () => {
      const paymentAmount = 3500.0;
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "monthly";

      // Calculate trigger rate
      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);

      // Test with rate exactly at trigger rate
      const hitAtTrigger = isTriggerRateHit(
        triggerRate,
        paymentAmount,
        remainingBalance,
        frequency
      );
      assert.ok(hitAtTrigger, "Should hit trigger rate at exact trigger rate");

      // Test with rate slightly above trigger rate
      const hitAboveTrigger = isTriggerRateHit(
        triggerRate + 0.001,
        paymentAmount,
        remainingBalance,
        frequency
      );
      assert.ok(hitAboveTrigger, "Should hit trigger rate when rate is above trigger");

      // Test with rate slightly below trigger rate
      const hitBelowTrigger = isTriggerRateHit(
        triggerRate - 0.001,
        paymentAmount,
        remainingBalance,
        frequency
      );
      assert.ok(!hitBelowTrigger, "Should NOT hit trigger rate when rate is below trigger");
    });

    it("correctly identifies trigger rate for different frequencies", () => {
      const paymentAmount = 3500.0;
      const remainingBalance = 500000.0;

      const frequencies: PaymentFrequency[] = [
        "monthly",
        "biweekly",
        "accelerated-biweekly",
        "weekly",
        "accelerated-weekly",
        "semi-monthly",
      ];

      for (const frequency of frequencies) {
        // Adjust payment for frequency (approximate)
        let adjustedPayment = paymentAmount;
        if (frequency === "biweekly" || frequency === "accelerated-biweekly") {
          adjustedPayment = paymentAmount / 2;
        } else if (frequency === "weekly" || frequency === "accelerated-weekly") {
          adjustedPayment = paymentAmount / 4;
        } else if (frequency === "semi-monthly") {
          adjustedPayment = paymentAmount / 2;
        }

        const triggerRate = calculateTriggerRate(adjustedPayment, remainingBalance, frequency);

        // Verify trigger rate is hit at exact rate
        const hit = isTriggerRateHit(triggerRate, adjustedPayment, remainingBalance, frequency);
        assert.ok(
          hit,
          `Trigger rate should be hit for ${frequency} at calculated rate ${triggerRate}`
        );
      }
    });

    it("handles VRM-Fixed Payment scenario correctly", () => {
      // Scenario: VRM-Fixed Payment mortgage
      // Payment: $3,500/month (fixed)
      // Balance: $500,000
      // Current rate: 6.5% (above trigger rate)
      const paymentAmount = 3500.0;
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);

      // Test with rate above trigger (should hit)
      const currentRate = 0.065; // 6.5%
      const hit = isTriggerRateHit(currentRate, paymentAmount, remainingBalance, frequency);

      if (currentRate > triggerRate) {
        assert.ok(hit, "Should hit trigger rate when current rate exceeds trigger rate");
      } else {
        assert.ok(!hit, "Should NOT hit trigger rate when current rate is below trigger rate");
      }
    });
  });

  describe("Real-World Scenarios", () => {
    it("verifies trigger rate calculation for typical Canadian mortgage", () => {
      // Typical scenario:
      // - $500,000 mortgage
      // - $3,500/month payment
      // - Monthly frequency
      const paymentAmount = 3500.0;
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);

      // Verify reverse calculation
      const periodicRate = getEffectivePeriodicRate(triggerRate, frequency);
      const calculatedPayment = periodicRate * remainingBalance;

      assert.ok(
        Math.abs(calculatedPayment - paymentAmount) < ROUNDING_TOLERANCE,
        `Real-world scenario failed: expected ${paymentAmount}, got ${calculatedPayment}`
      );

      // Trigger rate should be reasonable (typically 6-8% for this scenario)
      assert.ok(
        triggerRate >= 0.05 && triggerRate <= 0.1,
        `Trigger rate ${triggerRate} seems unreasonable for this scenario`
      );
    });

    it("verifies trigger rate for high-balance mortgage", () => {
      // High-balance scenario:
      // - $1,000,000 mortgage
      // - $6,000/month payment
      const paymentAmount = 6000.0;
      const remainingBalance = 1000000.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);

      // Verify reverse calculation
      const periodicRate = getEffectivePeriodicRate(triggerRate, frequency);
      const calculatedPayment = periodicRate * remainingBalance;

      assert.ok(
        Math.abs(calculatedPayment - paymentAmount) < ROUNDING_TOLERANCE,
        `High-balance scenario failed: expected ${paymentAmount}, got ${calculatedPayment}`
      );
    });

    it("verifies trigger rate calculation consistency across multiple calculations", () => {
      // Test that calculating trigger rate multiple times gives same result
      const paymentAmount = 3500.0;
      const remainingBalance = 500000.0;
      const frequency: PaymentFrequency = "monthly";

      const triggerRate1 = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
      const triggerRate2 = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
      const triggerRate3 = calculateTriggerRate(paymentAmount, remainingBalance, frequency);

      assert.equal(triggerRate1, triggerRate2, "Trigger rate should be consistent");
      assert.equal(triggerRate2, triggerRate3, "Trigger rate should be consistent");
    });
  });
});
