import { describe, it, mock } from "node:test";
import assert from "node:assert";
import {
  calculateThreeMonthInterestPenalty,
  calculateIRDPenalty,
  calculateStandardPenalty,
  calculatePenaltyByMethod,
  calculateOpenMortgagePenalty,
} from "@domain/calculations/penalty";

describe("Penalty Calculator API", () => {
  describe("Penalty Calculation Functions", () => {
    it("should calculate 3-month interest penalty correctly", () => {
      // $100,000 balance at 5% rate
      // Annual interest = 5,000
      // 3 months = 5,000 * (3/12) = 1,250
      const penalty = calculateThreeMonthInterestPenalty(100000, 0.05);
      assert.ok(Math.abs(penalty - 1250) < 0.1);
    });

    it("should calculate IRD penalty when current rate > market rate", () => {
      // Balance: $100,000
      // Current Rate: 5%
      // Market Rate: 3%
      // Remaining: 2 years (24 months)
      // Difference: 2%
      // Loss per year = $100,000 * 0.02 = $2,000
      // Total IRD = $2,000 * 2 = $4,000
      const ird = calculateIRDPenalty(100000, 0.05, 0.03, 24);
      assert.ok(Math.abs(ird - 4000) < 0.1);
    });

    it("should return 0 IRD if market rate >= current rate", () => {
      // Market rate higher (6%) vs current (5%) -> No loss for lender
      const ird = calculateIRDPenalty(100000, 0.05, 0.06, 24);
      assert.strictEqual(ird, 0);
    });

    it("should return greater of IRD or 3-month interest", () => {
      // When IRD is higher
      const result1 = calculateStandardPenalty(100000, 0.05, 0.03, 24);
      assert.strictEqual(result1.method, "IRD");
      assert.ok(result1.penalty > 0);

      // When 3-month interest is higher
      const result2 = calculateStandardPenalty(100000, 0.05, 0.05, 6);
      assert.strictEqual(result2.method, "3-Month Interest");
      assert.ok(result2.penalty > 0);
    });

    it("should handle edge cases", () => {
      // Zero balance
      const penalty1 = calculateThreeMonthInterestPenalty(0, 0.05);
      assert.strictEqual(penalty1, 0);

      // Zero rate
      const penalty2 = calculateThreeMonthInterestPenalty(100000, 0);
      assert.strictEqual(penalty2, 0);

      // Negative balance (should return 0)
      const penalty3 = calculateThreeMonthInterestPenalty(-100000, 0.05);
      assert.strictEqual(penalty3, 0);

      // Zero remaining months
      const ird = calculateIRDPenalty(100000, 0.05, 0.03, 0);
      assert.strictEqual(ird, 0);
    });

    it("should return 0 penalty for open mortgages", () => {
      const result = calculatePenaltyByMethod(
        "open_mortgage",
        100000, // balance
        0.05, // currentRate
        0.03, // comparisonRate
        24, // remainingMonths
        "fixed" // termType
      );

      assert.strictEqual(result.penalty, 0);
      assert.strictEqual(result.method, "Open Mortgage");
    });

    it("should calculate penalty correctly for closed mortgages", () => {
      // Closed mortgage should use normal calculation
      const result = calculatePenaltyByMethod(
        null, // no method specified (standard calculation)
        100000,
        0.05,
        0.03,
        24,
        "fixed"
      );

      assert.ok(result.penalty > 0);
      assert.ok(result.method === "IRD" || result.method === "3-Month Interest");
    });
  });
});

