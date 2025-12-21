import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Scenario, Mortgage } from "@shared/schema";
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
