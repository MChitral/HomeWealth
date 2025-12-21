import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateBlendedRate,
  calculateBlendAndExtend,
  calculateExtendedAmortization,
  type BlendAndExtendInput,
} from "../blend-and-extend";

describe("Blend-and-Extend Calculations", () => {
  /**
   * **Canadian Mortgage Rule:**
   * Blend-and-extend is a renewal option where:
   * 1. The new rate is "blended" between the old rate and current market rate
   * 2. The amortization period can be extended (e.g., 20 years remaining → 25 years)
   * 3. This helps borrowers lower payments by extending the term
   */

  describe("calculateBlendedRate", () => {
    it("calculates blended rate as weighted average", () => {
      const oldRate = 0.0549; // 5.49%
      const newMarketRate = 0.065; // 6.50%
      const remainingTermMonths = 12; // 1 year remaining
      const newTermMonths = 60; // 5-year new term

      const blendedRate = calculateBlendedRate(
        oldRate,
        newMarketRate,
        remainingTermMonths,
        newTermMonths
      );

      // Weight: 12 / (12 + 60) = 0.1667
      // Expected: 0.0549 * 0.1667 + 0.0650 * 0.8333 = 0.0628
      const expectedWeight = remainingTermMonths / (remainingTermMonths + newTermMonths);
      const expectedRate = oldRate * expectedWeight + newMarketRate * (1 - expectedWeight);

      assert.ok(
        Math.abs(blendedRate - expectedRate) < 0.001,
        `Blended rate should be weighted average. Expected: ${expectedRate}, Got: ${blendedRate}`
      );
    });

    it("gives more weight to old rate when more time remains", () => {
      const oldRate = 0.05; // 5%
      const newMarketRate = 0.07; // 7%
      const newTermMonths = 60;

      // More time remaining = more weight to old rate
      const blendedRate1 = calculateBlendedRate(oldRate, newMarketRate, 36, newTermMonths); // 3 years remaining
      const blendedRate2 = calculateBlendedRate(oldRate, newMarketRate, 12, newTermMonths); // 1 year remaining

      // More time remaining should result in lower blended rate (closer to old rate)
      assert.ok(
        blendedRate1 < blendedRate2,
        `More time remaining should result in lower blended rate. 36mo: ${blendedRate1}, 12mo: ${blendedRate2}`
      );
    });

    it("rounds to 3 decimal places", () => {
      const blendedRate = calculateBlendedRate(0.0549, 0.065, 12, 60);

      // Should have at most 3 decimal places
      const decimalPlaces = (blendedRate.toString().split(".")[1] || "").length;
      assert.ok(
        decimalPlaces <= 3,
        `Blended rate should be rounded to 3 decimal places. Got: ${blendedRate} (${decimalPlaces} decimal places)`
      );
    });

    it("handles edge case: no time remaining", () => {
      const blendedRate = calculateBlendedRate(0.0549, 0.065, 0, 60);

      // No time remaining = should be close to new market rate
      assert.ok(
        Math.abs(blendedRate - 0.065) < 0.001,
        `No time remaining should result in new market rate. Expected: 0.0650, Got: ${blendedRate}`
      );
    });
  });

  describe("calculateExtendedAmortization", () => {
    it("defaults to original amortization if not specified", () => {
      const remaining = 240; // 20 years
      const original = 300; // 25 years

      const extended = calculateExtendedAmortization(remaining, original);

      assert.strictEqual(extended, original, "Should default to original amortization");
    });

    it("allows extending beyond original amortization", () => {
      const remaining = 240; // 20 years
      const original = 300; // 25 years
      const extendTo = 360; // 30 years

      const extended = calculateExtendedAmortization(remaining, original, extendTo);

      assert.strictEqual(extended, extendTo, "Should allow extending beyond original amortization");
    });

    it("throws error if extended period is less than remaining", () => {
      const remaining = 240; // 20 years
      const original = 300; // 25 years
      const extendTo = 200; // Less than remaining

      assert.throws(
        () => calculateExtendedAmortization(remaining, original, extendTo),
        /cannot be less than remaining/
      );
    });

    it("throws error if extended period exceeds 30 years", () => {
      const remaining = 240;
      const original = 300;
      const extendTo = 400; // > 30 years (360 months)

      assert.throws(
        () => calculateExtendedAmortization(remaining, original, extendTo),
        /exceeds maximum allowed/
      );
    });
  });

  describe("calculateBlendAndExtend", () => {
    it("calculates blend-and-extend with extended amortization", () => {
      const input: BlendAndExtendInput = {
        oldRate: 0.0549, // 5.49%
        newMarketRate: 0.065, // 6.50%
        remainingBalance: 400000,
        remainingTermMonths: 12,
        originalAmortizationMonths: 300, // 25 years
        remainingAmortizationMonths: 240, // 20 years remaining
        extendedAmortizationMonths: 300, // Extend back to 25 years
        frequency: "monthly",
      };

      const result = calculateBlendAndExtend(input);

      // Verify blended rate is calculated
      assert.ok(
        result.blendedRate > input.oldRate && result.blendedRate < input.newMarketRate,
        `Blended rate should be between old and new rates. Got: ${result.blendedRate}`
      );

      // Verify payment is calculated
      assert.ok(
        result.newPaymentAmount > 0,
        `New payment amount should be positive. Got: ${result.newPaymentAmount}`
      );

      // Verify comparison payments
      assert.ok(
        result.marketRatePaymentAmount > result.newPaymentAmount,
        "Market rate payment should be higher than blended rate payment"
      );
    });

    it("produces lower payment with extended amortization", () => {
      const input: BlendAndExtendInput = {
        oldRate: 0.0549,
        newMarketRate: 0.065,
        remainingBalance: 400000,
        remainingTermMonths: 12,
        originalAmortizationMonths: 300,
        remainingAmortizationMonths: 240, // 20 years remaining
        extendedAmortizationMonths: 300, // Extend to 25 years
        frequency: "monthly",
      };

      const result = calculateBlendAndExtend(input);

      // Payment with extended amortization should be lower than with remaining
      // (longer term = lower payment)
      assert.ok(
        result.newPaymentAmount < result.oldRatePaymentAmount,
        "Extended amortization should produce lower payment"
      );
    });

    it("calculates interest savings vs market rate", () => {
      const input: BlendAndExtendInput = {
        oldRate: 0.0549,
        newMarketRate: 0.065,
        remainingBalance: 400000,
        remainingTermMonths: 12,
        originalAmortizationMonths: 300,
        remainingAmortizationMonths: 240,
        extendedAmortizationMonths: 300,
        frequency: "monthly",
      };

      const result = calculateBlendAndExtend(input);

      // Interest savings should be positive (blended rate < market rate)
      assert.ok(
        result.interestSavingsPerPayment > 0,
        `Interest savings should be positive. Got: ${result.interestSavingsPerPayment}`
      );

      // Should equal the difference between market and blended payments
      const expectedSavings = result.marketRatePaymentAmount - result.newPaymentAmount;
      assert.ok(
        Math.abs(result.interestSavingsPerPayment - expectedSavings) < 0.01,
        `Interest savings should equal payment difference. Expected: ${expectedSavings}, Got: ${result.interestSavingsPerPayment}`
      );
    });

    it("works with different payment frequencies", () => {
      const baseInput: Omit<BlendAndExtendInput, "frequency"> = {
        oldRate: 0.0549,
        newMarketRate: 0.065,
        remainingBalance: 400000,
        remainingTermMonths: 12,
        originalAmortizationMonths: 300,
        remainingAmortizationMonths: 240,
        extendedAmortizationMonths: 300,
      };

      const frequencies = ["monthly", "biweekly", "accelerated-biweekly"] as const;

      for (const frequency of frequencies) {
        const result = calculateBlendAndExtend({
          ...baseInput,
          frequency,
        });

        assert.ok(
          result.newPaymentAmount > 0,
          `Payment should be positive for ${frequency}. Got: ${result.newPaymentAmount}`
        );
      }
    });

    it("handles scenario: extending beyond original amortization", () => {
      const input: BlendAndExtendInput = {
        oldRate: 0.0549,
        newMarketRate: 0.065,
        remainingBalance: 400000,
        remainingTermMonths: 12,
        originalAmortizationMonths: 300, // 25 years
        remainingAmortizationMonths: 240, // 20 years remaining
        extendedAmortizationMonths: 360, // Extend to 30 years
        frequency: "monthly",
      };

      const result = calculateBlendAndExtend(input);

      // Payment with 30-year amortization should be lower than with 25-year
      assert.ok(result.newPaymentAmount > 0, "Payment should be positive");

      // Verify it's using the extended amortization (30 years)
      // Payment with 30 years should be lower than with 25 years
      const result25Years = calculateBlendAndExtend({
        ...input,
        extendedAmortizationMonths: 300, // 25 years
      });

      assert.ok(
        result.newPaymentAmount < result25Years.newPaymentAmount,
        "30-year amortization should produce lower payment than 25-year"
      );
    });
  });

  describe("Real-World Scenarios", () => {
    it("models typical blend-and-extend renewal", () => {
      // Scenario: $500K mortgage, 5 years into 25-year amortization
      // Old rate: 5.49%, New market rate: 6.50%
      // Extend back to 25 years (from 20 remaining)
      const input: BlendAndExtendInput = {
        oldRate: 0.0549,
        newMarketRate: 0.065,
        remainingBalance: 450000, // After 5 years
        remainingTermMonths: 12, // 1 year left in term
        originalAmortizationMonths: 300, // 25 years
        remainingAmortizationMonths: 240, // 20 years remaining
        extendedAmortizationMonths: 300, // Extend to 25 years
        frequency: "monthly",
      };

      const result = calculateBlendAndExtend(input);

      // Blended rate should be between old and new
      assert.ok(
        result.blendedRate > 0.0549 && result.blendedRate < 0.065,
        `Blended rate should be between old (5.49%) and new (6.50%). Got: ${(result.blendedRate * 100).toFixed(3)}%`
      );

      // Payment should be reasonable for $450K mortgage
      assert.ok(
        result.newPaymentAmount >= 2000 && result.newPaymentAmount <= 3500,
        `Payment should be reasonable. Got: $${result.newPaymentAmount.toFixed(2)}`
      );

      // Should save money vs market rate
      assert.ok(result.interestSavingsPerPayment > 0, "Should save money vs market rate");
    });
  });
});
