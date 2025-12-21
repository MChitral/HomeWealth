import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSkippedPayment,
  canSkipPayment,
  countSkippedPaymentsInYear,
  calculateTotalSkippedInterest,
  type PaymentFrequency,
} from "../payment-skipping";

describe("Payment Skipping Calculations", () => {
  /**
   * **Canadian Mortgage Rule:**
   * Some lenders allow borrowers to skip payments (typically 1-2 per year) with:
   * 1. Interest still accrues during the skipped period
   * 2. Balance increases (negative amortization)
   * 3. Amortization period extends
   * 4. Skipped interest is added to principal
   */

  describe("calculateSkippedPayment", () => {
    it("calculates interest accrued during skipped payment", () => {
      const currentBalance = 400000;
      const annualRate = 0.0549; // 5.49%
      const frequency: PaymentFrequency = "monthly";
      const currentAmortizationMonths = 240; // 20 years

      const result = calculateSkippedPayment(
        currentBalance,
        annualRate,
        frequency,
        currentAmortizationMonths
      );

      // Interest should be calculated for one payment period
      assert.ok(
        result.interestAccrued > 0,
        `Interest should accrue. Got: $${result.interestAccrued}`
      );

      // For monthly payments at 5.49%, interest uses effective periodic rate
      // (accounts for semi-annual compounding, not simple division)
      // The actual calculation uses getEffectivePeriodicRate which accounts for compounding
      // So we expect a value close to but not exactly (balance * rate / 12)
      const simpleMonthlyInterest = (currentBalance * annualRate) / 12;
      // Allow 5% tolerance since effective rate accounts for compounding
      const tolerance = simpleMonthlyInterest * 0.05;
      assert.ok(
        Math.abs(result.interestAccrued - simpleMonthlyInterest) < Math.max(tolerance, 50),
        `Interest should be approximately $${simpleMonthlyInterest.toFixed(2)} (±5%). Got: $${result.interestAccrued.toFixed(2)}`
      );
    });

    it("increases balance by accrued interest", () => {
      const currentBalance = 400000;
      const annualRate = 0.0549;
      const frequency: PaymentFrequency = "monthly";
      const currentAmortizationMonths = 240;

      const result = calculateSkippedPayment(
        currentBalance,
        annualRate,
        frequency,
        currentAmortizationMonths
      );

      // New balance should be old balance + interest
      const expectedBalance = currentBalance + result.interestAccrued;
      assert.ok(
        Math.abs(result.newBalance - expectedBalance) < 0.01,
        `New balance should be old balance + interest. Expected: $${expectedBalance.toFixed(2)}, Got: $${result.newBalance.toFixed(2)}`
      );

      // Balance should increase
      assert.ok(
        result.newBalance > currentBalance,
        `Balance should increase. Old: $${currentBalance}, New: $${result.newBalance}`
      );
    });

    it("extends amortization period", () => {
      const currentBalance = 400000;
      const annualRate = 0.0549;
      const frequency: PaymentFrequency = "monthly";
      const currentAmortizationMonths = 240; // 20 years

      const result = calculateSkippedPayment(
        currentBalance,
        annualRate,
        frequency,
        currentAmortizationMonths
      );

      // Amortization should extend by approximately one payment period
      // For monthly: 12 payments/year = 1 month per payment
      assert.ok(
        result.extendedAmortizationMonths >= currentAmortizationMonths,
        `Amortization should extend. Old: ${currentAmortizationMonths} months, New: ${result.extendedAmortizationMonths} months`
      );
    });

    it("works with different payment frequencies", () => {
      const currentBalance = 400000;
      const annualRate = 0.0549;
      const currentAmortizationMonths = 240;

      const frequencies: PaymentFrequency[] = ["monthly", "biweekly", "weekly"];

      for (const frequency of frequencies) {
        const result = calculateSkippedPayment(
          currentBalance,
          annualRate,
          frequency,
          currentAmortizationMonths
        );

        assert.ok(result.interestAccrued > 0, `Interest should accrue for ${frequency} frequency`);
        assert.ok(
          result.newBalance > currentBalance,
          `Balance should increase for ${frequency} frequency`
        );
      }
    });

    it("rounds amounts to nearest cent", () => {
      const result = calculateSkippedPayment(400000, 0.0549, "monthly", 240);

      // Check interest is rounded
      const interestDecimalPlaces = (result.interestAccrued.toString().split(".")[1] || "").length;
      assert.ok(
        interestDecimalPlaces <= 2,
        `Interest should be rounded to 2 decimal places. Got: ${result.interestAccrued} (${interestDecimalPlaces} places)`
      );

      // Check balance is rounded
      const balanceDecimalPlaces = (result.newBalance.toString().split(".")[1] || "").length;
      assert.ok(
        balanceDecimalPlaces <= 2,
        `Balance should be rounded to 2 decimal places. Got: ${result.newBalance} (${balanceDecimalPlaces} places)`
      );
    });
  });

  describe("canSkipPayment", () => {
    it("allows skipping if under limit", () => {
      assert.ok(canSkipPayment(0, 2), "Should allow skipping when no payments skipped yet");
      assert.ok(canSkipPayment(1, 2), "Should allow skipping when 1 payment already skipped");
    });

    it("prevents skipping if at limit", () => {
      assert.ok(!canSkipPayment(2, 2), "Should not allow skipping when at limit (2 skips)");
      assert.ok(!canSkipPayment(3, 2), "Should not allow skipping when over limit");
    });

    it("allows custom skip limits", () => {
      assert.ok(canSkipPayment(0, 1), "Should allow skipping with limit of 1");
      assert.ok(!canSkipPayment(1, 1), "Should not allow skipping when at limit of 1");
    });
  });

  describe("countSkippedPaymentsInYear", () => {
    it("counts skipped payments in a given year", () => {
      const payments = [
        { paymentDate: "2024-01-15", isSkipped: 1 },
        { paymentDate: "2024-02-15", isSkipped: 0 },
        { paymentDate: "2024-03-15", isSkipped: 1 },
        { paymentDate: "2024-04-15", isSkipped: 0 },
        { paymentDate: "2025-01-15", isSkipped: 1 },
      ];

      const count2024 = countSkippedPaymentsInYear(payments, 2024);
      assert.strictEqual(count2024, 2, "Should count 2 skipped payments in 2024");

      const count2025 = countSkippedPaymentsInYear(payments, 2025);
      assert.strictEqual(count2025, 1, "Should count 1 skipped payment in 2025");
    });

    it("handles boolean isSkipped values", () => {
      const payments = [
        { paymentDate: "2024-01-15", isSkipped: true },
        { paymentDate: "2024-02-15", isSkipped: false },
        { paymentDate: "2024-03-15", isSkipped: true },
      ];

      const count = countSkippedPaymentsInYear(payments, 2024);
      assert.strictEqual(count, 2, "Should count skipped payments with boolean values");
    });

    it("defaults to current year if year not specified", () => {
      const currentYear = new Date().getFullYear();
      const payments = [
        { paymentDate: `${currentYear}-01-15`, isSkipped: 1 },
        { paymentDate: `${currentYear}-02-15`, isSkipped: 0 },
        { paymentDate: `${currentYear}-03-15`, isSkipped: 1 },
      ];

      const count = countSkippedPaymentsInYear(payments);
      assert.strictEqual(count, 2, "Should count skipped payments in current year");
    });

    it("returns 0 if no skipped payments in year", () => {
      const payments = [
        { paymentDate: "2024-01-15", isSkipped: 0 },
        { paymentDate: "2024-02-15", isSkipped: 0 },
        { paymentDate: "2024-03-15", isSkipped: 0 },
      ];

      const count = countSkippedPaymentsInYear(payments, 2024);
      assert.strictEqual(count, 0, "Should return 0 if no skipped payments");
    });
  });

  describe("calculateTotalSkippedInterest", () => {
    it("calculates total interest from skipped payments", () => {
      const payments = [
        { skippedInterestAccrued: "1830.00" },
        { skippedInterestAccrued: "1850.50" },
        { skippedInterestAccrued: "1800.25" },
      ];

      const total = calculateTotalSkippedInterest(payments);
      const expected = 1830.0 + 1850.5 + 1800.25;

      assert.ok(
        Math.abs(total - expected) < 0.01,
        `Total should be sum of all skipped interest. Expected: $${expected.toFixed(2)}, Got: $${total.toFixed(2)}`
      );
    });

    it("handles numeric values", () => {
      const payments = [{ skippedInterestAccrued: 1830.0 }, { skippedInterestAccrued: 1850.5 }];

      const total = calculateTotalSkippedInterest(payments);
      const expected = 1830.0 + 1850.5;

      assert.ok(Math.abs(total - expected) < 0.01, "Should handle numeric values");
    });

    it("returns 0 if no skipped payments", () => {
      const payments = [{ skippedInterestAccrued: "0.00" }, { skippedInterestAccrued: "0.00" }];

      const total = calculateTotalSkippedInterest(payments);
      assert.strictEqual(total, 0, "Should return 0 if no skipped interest");
    });

    it("handles missing or null values", () => {
      const payments = [
        { skippedInterestAccrued: "1830.00" },
        { skippedInterestAccrued: null as any },
        { skippedInterestAccrued: undefined as any },
      ];

      const total = calculateTotalSkippedInterest(payments);
      assert.strictEqual(total, 1830.0, "Should ignore null/undefined values");
    });
  });

  describe("Real-World Scenarios", () => {
    it("models typical payment skip scenario", () => {
      // Scenario: $400K mortgage, 5.49% rate, monthly payments
      // Borrower skips January payment
      const currentBalance = 400000;
      const annualRate = 0.0549;
      const frequency: PaymentFrequency = "monthly";

      const result = calculateSkippedPayment(
        currentBalance,
        annualRate,
        frequency,
        240 // 20 years remaining
      );

      // Interest should be approximately one month's interest
      // Note: Uses effective periodic rate (accounts for semi-annual compounding)
      const simpleMonthlyInterest = (currentBalance * annualRate) / 12;
      const tolerance = simpleMonthlyInterest * 0.05; // 5% tolerance
      assert.ok(
        Math.abs(result.interestAccrued - simpleMonthlyInterest) < Math.max(tolerance, 50),
        `Interest should be approximately one month's interest (±5%). Expected: ~$${simpleMonthlyInterest.toFixed(2)}, Got: $${result.interestAccrued.toFixed(2)}`
      );

      // Balance should increase
      assert.ok(
        result.newBalance > currentBalance,
        "Balance should increase after skipping payment"
      );

      // Amortization should extend
      assert.ok(
        result.extendedAmortizationMonths > 240,
        "Amortization should extend after skipping payment"
      );
    });

    it("validates skip limits for calendar year", () => {
      // Scenario: Borrower has already skipped 2 payments in 2024
      const payments2024 = [
        { paymentDate: "2024-03-15", isSkipped: 1 },
        { paymentDate: "2024-06-15", isSkipped: 1 },
        { paymentDate: "2024-09-15", isSkipped: 0 },
      ];

      const skippedCount = countSkippedPaymentsInYear(payments2024, 2024);
      assert.strictEqual(skippedCount, 2, "Should count 2 skipped payments");

      // Should not be able to skip another payment
      assert.ok(!canSkipPayment(skippedCount, 2), "Should not allow skipping when at limit");
    });
  });
});
