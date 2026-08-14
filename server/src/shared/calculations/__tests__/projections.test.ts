import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Scenario, Mortgage, CashFlow } from "@shared/schema";
import { generateProjections } from "../projections";

const mockScenario: Scenario = {
  id: "scenario-1",
  userId: "user-1",
  name: "Surplus Test",
  description: "",
  prepaymentMonthlyPercent: 50,
  investmentMonthlyPercent: 50,
  expectedReturnRate: "6.000",
  efPriorityPercent: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockMortgage: Mortgage = {
  id: "mortgage-1",
  userId: "user-1",
  propertyPrice: "800000.00",
  downPayment: "200000.00",
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

describe("Scenario projections prepayment allocation", () => {
  it("applies prepayment percent against surplus, not entire payment", () => {
    const projections = generateProjections(
      {
        scenario: mockScenario,
        mortgage: mockMortgage,
      },
      1,
      0.05
    );

    assert.ok(projections.length > 0);
    const year1 = projections[1];
    assert.ok(year1);
    assert.ok(year1.cumulativePrepayments <= year1.cumulativePrincipal);
  });
});

const mockCashFlow: CashFlow = {
  id: "cashflow-1",
  userId: "user-1",
  monthlyIncome: "9000.00", // 108,000/yr
  extraPaycheques: 0,
  annualBonus: "0.00",
  propertyTax: "12000.00", // annual
  homeInsurance: "6000.00", // annual
  condoFees: "0.00",
  utilities: "500.00", // 6,000/yr
  groceries: "1000.00", // 12,000/yr
  dining: "500.00", // 6,000/yr
  transportation: "500.00", // 6,000/yr
  entertainment: "500.00", // 6,000/yr
  carLoan: "0.00",
  studentLoan: "0.00",
  creditCard: "0.00",
  updatedAt: new Date().toISOString(),
  // => annual surplus 108,000 - 60,000 = 48,000 => 4,000/month
};

describe("Post-payoff investment redirect", () => {
  it("redirects surplus into investments after early payoff (prepay-only scenario)", () => {
    const prepayOnly: Scenario = {
      ...mockScenario,
      prepaymentMonthlyPercent: 100,
      investmentMonthlyPercent: 0,
    };

    const projections = generateProjections(
      { scenario: prepayOnly, mortgage: mockMortgage, cashFlow: mockCashFlow },
      30,
      0.05
    );

    const year30 = projections[30];
    assert.ok(year30);
    // Mortgage must be gone well before year 30 with 100% surplus prepay
    assert.equal(year30.mortgageBalance, 0);
    // Freed-up cash flow must accumulate as investments, not vanish
    assert.ok(
      year30.investmentValue > 0,
      `expected post-payoff investments, got ${year30.investmentValue}`
    );
    // Net worth must exceed property value alone (investments on top of equity)
    assert.ok(year30.netWorth > parseFloat(mockMortgage.propertyPrice));
  });

  it("redirects the freed-up base payment after natural payoff (invest-only scenario)", () => {
    const investOnly: Scenario = {
      ...mockScenario,
      prepaymentMonthlyPercent: 0,
      investmentMonthlyPercent: 100,
    };

    const projections = generateProjections(
      { scenario: investOnly, mortgage: mockMortgage, cashFlow: mockCashFlow },
      30,
      0.05
    );

    const year30 = projections[30];
    assert.ok(year30);
    assert.equal(year30.mortgageBalance, 0); // 25yr amortization pays off by 30
    // Contributions must exceed pure surplus (4,000 x 360) because the former
    // mortgage payment is redirected for the final ~5 years
    const pureSurplusContributions = 4000 * 360;
    assert.ok(
      year30.cumulativeInvestments > pureSurplusContributions,
      `expected redirect on top of ${pureSurplusContributions}, got ${year30.cumulativeInvestments}`
    );
  });

  it("keeps prepay-heavy strategies competitive with invest-heavy at long horizons", () => {
    const prepayOnly: Scenario = {
      ...mockScenario,
      prepaymentMonthlyPercent: 100,
      investmentMonthlyPercent: 0,
    };
    const investOnly: Scenario = {
      ...mockScenario,
      prepaymentMonthlyPercent: 0,
      investmentMonthlyPercent: 100,
    };

    const prepayProj = generateProjections(
      { scenario: prepayOnly, mortgage: mockMortgage, cashFlow: mockCashFlow },
      30,
      0.05
    );
    const investProj = generateProjections(
      { scenario: investOnly, mortgage: mockMortgage, cashFlow: mockCashFlow },
      30,
      0.05
    );

    const prepayNw = prepayProj[30]!.netWorth;
    const investNw = investProj[30]!.netWorth;
    // With similar rates (5% mortgage vs 6% return), the two strategies should
    // land in the same ballpark — not differ by multiples
    assert.ok(
      prepayNw > investNw * 0.6,
      `prepay ${prepayNw} should be within range of invest ${investNw}`
    );
  });
});
