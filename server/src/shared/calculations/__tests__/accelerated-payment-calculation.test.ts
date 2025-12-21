import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculatePayment, calculateMonthlyPayment, type PaymentFrequency } from "../mortgage";

describe("Accelerated Payment Calculation", () => {
  /**
   * **Canadian Mortgage Rule:**
   * Accelerated payments are calculated by taking the monthly payment and dividing by:
   * - 2 for accelerated-biweekly (26 payments/year)
   * - 4 for accelerated-weekly (52 payments/year)
   *
   * This is the standard method used by major Canadian lenders:
   * - RBC (Royal Bank of Canada)
   * - TD (Toronto-Dominion Bank)
   * - BMO (Bank of Montreal)
   * - Scotiabank
   * - CIBC (Canadian Imperial Bank of Commerce)
   *
   * **Why This Works:**
   * - Monthly payment: $3,500
   * - Accelerated biweekly: $3,500 / 2 = $1,750
   * - 26 payments × $1,750 = $45,500/year (vs $42,000 for monthly)
   * - This extra payment accelerates payoff
   */

  describe("Accelerated Biweekly Calculation", () => {
    it("calculates accelerated biweekly as exactly half of monthly payment", () => {
      const principal = 500000;
      const annualRate = 0.0549; // 5.49%
      const amortizationMonths = 300; // 25 years

      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, amortizationMonths);
      const acceleratedBiweekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-biweekly"
      );

      // Accelerated biweekly should be exactly half of monthly
      const expected = monthlyPayment / 2;
      assert.ok(
        Math.abs(acceleratedBiweekly - expected) < 0.01,
        `Accelerated biweekly should be half of monthly. Expected: ${expected}, Got: ${acceleratedBiweekly}`
      );
    });

    it("rounds accelerated biweekly to nearest cent", () => {
      const principal = 500000;
      const annualRate = 0.0549;
      const amortizationMonths = 300;

      const acceleratedBiweekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-biweekly"
      );

      // Should be rounded to 2 decimal places
      const decimalPlaces = (acceleratedBiweekly.toString().split(".")[1] || "").length;
      assert.ok(
        decimalPlaces <= 2,
        `Should be rounded to 2 decimal places. Got: ${acceleratedBiweekly}`
      );
    });

    it("produces higher annual payment than monthly", () => {
      const principal = 500000;
      const annualRate = 0.0549;
      const amortizationMonths = 300;

      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, amortizationMonths);
      const acceleratedBiweekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-biweekly"
      );

      // Annual totals
      const monthlyAnnual = monthlyPayment * 12;
      const acceleratedAnnual = acceleratedBiweekly * 26; // 26 payments per year

      assert.ok(
        acceleratedAnnual > monthlyAnnual,
        `Accelerated biweekly should pay more annually. Monthly: $${monthlyAnnual}, Accelerated: $${acceleratedAnnual}`
      );

      // Should be approximately 1 extra monthly payment per year
      const extraPayment = acceleratedAnnual - monthlyAnnual;
      assert.ok(
        Math.abs(extraPayment - monthlyPayment) < 10,
        `Should pay approximately one extra monthly payment per year. Extra: $${extraPayment}, Monthly: $${monthlyPayment}`
      );
    });

    it("works with different principal amounts", () => {
      const testCases = [
        { principal: 300000, rate: 0.0549, amort: 300 },
        { principal: 750000, rate: 0.0549, amort: 300 },
        { principal: 500000, rate: 0.065, amort: 300 },
        { principal: 500000, rate: 0.0549, amort: 180 },
      ];

      for (const testCase of testCases) {
        const monthlyPayment = calculateMonthlyPayment(
          testCase.principal,
          testCase.rate,
          testCase.amort
        );
        const acceleratedBiweekly = calculatePayment(
          testCase.principal,
          testCase.rate,
          testCase.amort,
          "accelerated-biweekly"
        );

        const expected = monthlyPayment / 2;
        assert.ok(
          Math.abs(acceleratedBiweekly - expected) < 0.01,
          `Failed for principal ${testCase.principal}, rate ${testCase.rate}, amort ${testCase.amort}`
        );
      }
    });
  });

  describe("Accelerated Weekly Calculation", () => {
    it("calculates accelerated weekly as exactly quarter of monthly payment", () => {
      const principal = 500000;
      const annualRate = 0.0549;
      const amortizationMonths = 300;

      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, amortizationMonths);
      const acceleratedWeekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-weekly"
      );

      // Accelerated weekly should be exactly quarter of monthly
      const expected = monthlyPayment / 4;
      assert.ok(
        Math.abs(acceleratedWeekly - expected) < 0.01,
        `Accelerated weekly should be quarter of monthly. Expected: ${expected}, Got: ${acceleratedWeekly}`
      );
    });

    it("rounds accelerated weekly to nearest cent", () => {
      const principal = 500000;
      const annualRate = 0.0549;
      const amortizationMonths = 300;

      const acceleratedWeekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-weekly"
      );

      // Should be rounded to 2 decimal places
      const decimalPlaces = (acceleratedWeekly.toString().split(".")[1] || "").length;
      assert.ok(
        decimalPlaces <= 2,
        `Should be rounded to 2 decimal places. Got: ${acceleratedWeekly}`
      );
    });

    it("produces higher annual payment than monthly", () => {
      const principal = 500000;
      const annualRate = 0.0549;
      const amortizationMonths = 300;

      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, amortizationMonths);
      const acceleratedWeekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-weekly"
      );

      // Annual totals
      const monthlyAnnual = monthlyPayment * 12;
      const acceleratedAnnual = acceleratedWeekly * 52; // 52 payments per year

      assert.ok(
        acceleratedAnnual > monthlyAnnual,
        `Accelerated weekly should pay more annually. Monthly: $${monthlyAnnual}, Accelerated: $${acceleratedAnnual}`
      );

      // Should be approximately 1 extra monthly payment per year
      // 52 weekly payments = 52 × (monthly/4) = 13 × monthly = 12 monthly + 1 extra
      const extraPayment = acceleratedAnnual - monthlyAnnual;
      const expectedExtra = monthlyPayment; // One extra monthly payment
      // Allow for rounding differences
      assert.ok(
        Math.abs(extraPayment - expectedExtra) < 10,
        `Should pay approximately 1 extra monthly payment per year. Extra: $${extraPayment}, Expected: $${expectedExtra}`
      );
    });

    it("works with different principal amounts", () => {
      const testCases = [
        { principal: 300000, rate: 0.0549, amort: 300 },
        { principal: 750000, rate: 0.0549, amort: 300 },
        { principal: 500000, rate: 0.065, amort: 300 },
      ];

      for (const testCase of testCases) {
        const monthlyPayment = calculateMonthlyPayment(
          testCase.principal,
          testCase.rate,
          testCase.amort
        );
        const acceleratedWeekly = calculatePayment(
          testCase.principal,
          testCase.rate,
          testCase.amort,
          "accelerated-weekly"
        );

        const expected = monthlyPayment / 4;
        assert.ok(
          Math.abs(acceleratedWeekly - expected) < 0.01,
          `Failed for principal ${testCase.principal}, rate ${testCase.rate}`
        );
      }
    });
  });

  describe("Comparison with Standard Frequencies", () => {
    it("accelerated biweekly pays more annually than standard biweekly", () => {
      const principal = 500000;
      const annualRate = 0.0549;
      const amortizationMonths = 300;

      const standardBiweekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "biweekly"
      );
      const acceleratedBiweekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-biweekly"
      );

      // Annual totals
      const standardAnnual = standardBiweekly * 26;
      const acceleratedAnnual = acceleratedBiweekly * 26;

      assert.ok(
        acceleratedAnnual > standardAnnual,
        `Accelerated should pay more than standard. Standard: $${standardAnnual}, Accelerated: $${acceleratedAnnual}`
      );
    });

    it("accelerated weekly pays more annually than standard weekly", () => {
      const principal = 500000;
      const annualRate = 0.0549;
      const amortizationMonths = 300;

      const standardWeekly = calculatePayment(principal, annualRate, amortizationMonths, "weekly");
      const acceleratedWeekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-weekly"
      );

      // Annual totals
      const standardAnnual = standardWeekly * 52;
      const acceleratedAnnual = acceleratedWeekly * 52;

      assert.ok(
        acceleratedAnnual > standardAnnual,
        `Accelerated should pay more than standard. Standard: $${standardAnnual}, Accelerated: $${acceleratedAnnual}`
      );
    });
  });

  describe("Real-World Scenarios", () => {
    it("matches typical Canadian lender calculation for $500K mortgage", () => {
      const principal = 500000;
      const annualRate = 0.0549; // 5.49%
      const amortizationMonths = 300; // 25 years

      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, amortizationMonths);
      const acceleratedBiweekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-biweekly"
      );

      // Typical monthly payment for this scenario: ~$3,000-$3,500
      assert.ok(
        monthlyPayment >= 3000 && monthlyPayment <= 3500,
        `Monthly payment should be reasonable. Got: $${monthlyPayment}`
      );

      // Accelerated should be exactly half
      const expected = monthlyPayment / 2;
      assert.ok(
        Math.abs(acceleratedBiweekly - expected) < 0.01,
        `Accelerated biweekly should be exactly half. Expected: $${expected}, Got: $${acceleratedBiweekly}`
      );
    });

    it("verifies payoff acceleration benefit", () => {
      const principal = 500000;
      const annualRate = 0.0549;
      const amortizationMonths = 300;

      const monthlyPayment = calculateMonthlyPayment(principal, annualRate, amortizationMonths);
      const acceleratedBiweekly = calculatePayment(
        principal,
        annualRate,
        amortizationMonths,
        "accelerated-biweekly"
      );

      // Calculate annual difference
      const monthlyAnnual = monthlyPayment * 12;
      const acceleratedAnnual = acceleratedBiweekly * 26;
      const extraAnnual = acceleratedAnnual - monthlyAnnual;

      // Should pay approximately one extra monthly payment per year
      assert.ok(
        Math.abs(extraAnnual - monthlyPayment) < 10,
        `Should pay approximately one extra monthly payment per year. Extra: $${extraAnnual}, Monthly: $${monthlyPayment}`
      );

      // This extra payment accelerates payoff
      // Over 25 years, that's 25 extra monthly payments = significant time savings
      const totalExtra = extraAnnual * 25;
      assert.ok(
        totalExtra > 0,
        `Total extra payments over 25 years should be significant: $${totalExtra}`
      );
    });
  });
});
