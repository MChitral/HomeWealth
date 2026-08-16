import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateActual365Interest,
  calculateInterestForBasis,
  type InterestRateSegment,
} from "../interest-accrual";

describe("mortgage interest accrual", () => {
  it("reproduces RBC's first 2025 payment across an intraperiod rate cut", () => {
    const segments: InterestRateSegment[] = [
      {
        startDate: "2025-01-02",
        endDate: "2025-01-30",
        annualRate: 0.0455,
      },
      {
        startDate: "2025-01-30",
        endDate: "2025-02-02",
        annualRate: 0.043,
      },
    ];

    assert.equal(calculateActual365Interest(294399, segments), 1131.62);
  });

  it("reproduces RBC's April 2025 split-rate interest", () => {
    const segments: InterestRateSegment[] = [
      {
        startDate: "2025-03-02",
        endDate: "2025-03-13",
        annualRate: 0.043,
      },
      {
        startDate: "2025-03-13",
        endDate: "2025-04-02",
        annualRate: 0.0405,
      },
    ];

    assert.equal(calculateActual365Interest(293499.14, segments), 1031.67);
  });

  it("keeps Canadian semi-annual periodic calculations unchanged by default", () => {
    assert.equal(
      calculateInterestForBasis({
        balance: 580000,
        basis: "canadian-semi-annual",
        annualRate: 0.0549,
        frequency: "monthly",
      }),
      2623.65
    );
  });

  it("rejects overlapping or discontinuous Actual/365 segments", () => {
    assert.throws(
      () =>
        calculateActual365Interest(294399, [
          {
            startDate: "2025-01-02",
            endDate: "2025-01-30",
            annualRate: 0.0455,
          },
          {
            startDate: "2025-01-31",
            endDate: "2025-02-02",
            annualRate: 0.043,
          },
        ]),
      /contiguous/
    );
  });
});
