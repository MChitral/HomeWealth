import { describe, it, mock, beforeEach } from "node:test";
import assert from "node:assert";
import { ImpactCalculator } from "../impact-calculator.service";
import { TriggerRateMonitor } from "../trigger-rate-monitor";

// Mocks
const mockMortgagesRepo = {
  findById: mock.fn(),
};
const mockPaymentsRepo = {
  findByTermId: mock.fn(),
};
const mockTriggerMonitor = {
  checkOne: mock.fn(),
} as unknown as TriggerRateMonitor;

describe("ImpactCalculator", () => {
  let service: ImpactCalculator;

  beforeEach(() => {
    service = new ImpactCalculator(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockMortgagesRepo as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockPaymentsRepo as any,
      mockTriggerMonitor
    );
    mockMortgagesRepo.findById.mock.resetCalls();
    mockPaymentsRepo.findByTermId.mock.resetCalls();
    mockTriggerMonitor.checkOne.mock.resetCalls();
  });

  it("calculates payment increase for VRM-Adjustable", async () => {
    // Setup Mortgage
    mockMortgagesRepo.findById.mock.mockImplementation(() =>
      Promise.resolve({
        id: "m1",
        currentBalance: "500000",
        amortizationMonths: 300,
      })
    );

    // No payments yet
    mockPaymentsRepo.findByTermId.mock.mockImplementation(() => Promise.resolve([]));

    // Term: Variable-Changing
    const term = {
      id: "t1",
      mortgageId: "m1",
      termType: "variable-changing",
      lockedSpread: "-0.50",
      regularPaymentAmount: "3000.00",
      paymentFrequency: "monthly",
    };

    // Old Prime: 7.20 -> Rate 6.70%
    // New Prime: 7.45 -> Rate 6.95% (+0.25%)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const impacts = await service.calculateImpacts([term as any], 7.2, 7.45);

    assert.equal(impacts.length, 1);
    assert.equal(impacts[0].impactType, "payment_increase");
    assert.ok(impacts[0].delta > 0);
    assert.ok(impacts[0].newValue > impacts[0].oldValue);
    // console.log("Payment Delta:", impacts[0].delta);
  });

  it("calculates trigger risk for VRM-Fixed", async () => {
    // Setup Mortgage
    mockMortgagesRepo.findById.mock.mockImplementation(() =>
      Promise.resolve({
        id: "m2",
      })
    );

    // Term: Variable-Fixed
    const term = {
      id: "t2",
      mortgageId: "m2",
      termType: "variable-fixed",
    };

    // Mock Trigger Monitor to return HIT
    mockTriggerMonitor.checkOne.mock.mockImplementation(() =>
      Promise.resolve({
        mortgageId: "m2",
        isHit: true,
        currentRate: 0.065,
        triggerRate: 0.06,
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const impacts = await service.calculateImpacts([term as any], 7.2, 7.45);

    assert.equal(impacts.length, 1);
    assert.equal(impacts[0].impactType, "trigger_risk");
    assert.equal(impacts[0].message, "Trigger Rate HIT");
  });
});
