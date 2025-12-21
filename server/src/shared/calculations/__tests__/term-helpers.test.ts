import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MortgageTerm } from "@shared/schema";
import { getTermEffectiveRate, shouldUpdatePaymentAmount } from "../term-helpers";

const baseTerm: MortgageTerm = {
  id: "term-1",
  mortgageId: "mortgage-1",
  termType: "fixed",
  startDate: "2024-01-01",
  endDate: "2029-01-01",
  termYears: 5,
  fixedRate: "5.490",
  lockedSpread: null,
  primeRate: null,
  paymentFrequency: "monthly",
  regularPaymentAmount: "2500.00",
  createdAt: new Date().toISOString(),
};

describe("term helper calculations", () => {
  it("calculates effective rate for fixed terms", () => {
    const rate = getTermEffectiveRate(baseTerm);
    // Use approximate equality due to floating point precision
    assert.ok(Math.abs(rate - 0.0549) < 0.0001, `Rate should be approximately 0.0549, got ${rate}`);
  });

  it("calculates effective rate for variable terms using prime + spread", () => {
    const variableTerm: MortgageTerm = {
      ...baseTerm,
      termType: "variable-changing",
      fixedRate: null,
      lockedSpread: "-0.800",
      primeRate: "6.450",
    };
    const rate = getTermEffectiveRate(variableTerm);
    assert.equal(rate, (6.45 - 0.8) / 100);
  });

  it("detects when payment amounts remain fixed", () => {
    const vrmFixed: MortgageTerm = {
      ...baseTerm,
      termType: "variable-fixed",
      fixedRate: null,
      lockedSpread: "-1.000",
      primeRate: "6.750",
    };
    assert.equal(shouldUpdatePaymentAmount(baseTerm), true);
    assert.equal(shouldUpdatePaymentAmount(vrmFixed), false);
  });
});
