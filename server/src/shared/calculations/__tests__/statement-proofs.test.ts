import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  deriveHomelineSplit,
  proveOpeningBalance,
  proveStatementPayment,
} from "../statement-proofs";

describe("statement proofs", () => {
  it("derives July 2026 Homeline principal and interest from the balance chain", () => {
    const split = deriveHomelineSplit({
      priorRemaining: "283778.21",
      remainingBalance: "282105.53",
      paymentAmount: "2500.69",
      regularPaymentAmount: "1500.69",
    });

    assert.equal(split.principalPaid, "1672.68");
    assert.equal(split.interestPaid, "828.01");
    assert.equal(split.prepaymentAmount, "1000.00");
    assert.equal(split.isMissed, 0);
    assert.equal(
      proveStatementPayment({
        paymentAmount: "2500.69",
        remainingBalance: "282105.53",
        priorRemaining: "283778.21",
        ...split,
      }).ok,
      true
    );
  });

  it("marks a $0 unchanged-balance month as missed", () => {
    const split = deriveHomelineSplit({
      priorRemaining: "289351.24",
      remainingBalance: "289351.24",
      paymentAmount: "0.00",
      regularPaymentAmount: "1500.69",
    });
    assert.equal(split.isMissed, 1);
    assert.equal(split.principalPaid, "0.00");
  });

  it("blocks an opening-balance mismatch unless overridden", () => {
    assert.equal(
      proveOpeningBalance({ expectedOpening: "283778.21", actualOpening: "282105.53" }).ok,
      false
    );
    assert.equal(
      proveOpeningBalance({
        expectedOpening: "283778.21",
        actualOpening: "282105.53",
        override: true,
      }).ok,
      true
    );
  });
});
