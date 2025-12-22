import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateAmortizationSchedule, type PaymentFrequency } from "../mortgage";

describe("Semi-Monthly Date Alignment", () => {
  it("aligns payments to 1st and 15th of each month", () => {
    const principal = 500000;
    const annualRate = 0.05;
    const amortizationMonths = 300;
    const frequency: PaymentFrequency = "semi-monthly";
    const startDate = new Date(2023, 10, 1); // Start on 1st (year, month (0-indexed), day)

    const schedule = generateAmortizationSchedule(
      principal,
      annualRate,
      amortizationMonths,
      frequency,
      startDate,
      [],
      [],
      24 // Generate 24 payments (12 months)
    );

    // First payment uses the start date (1st)
    assert.equal(schedule.payments[0].paymentDate.getDate(), 1, "First payment should be on 1st");
    assert.equal(
      schedule.payments[0].paymentDate.getMonth(),
      10, // November (0-indexed)
      "First payment should be in November"
    );

    // Second payment should be on 15th of same month (aligned)
    assert.equal(
      schedule.payments[1].paymentDate.getDate(),
      15,
      "Second payment should be on 15th"
    );
    assert.equal(
      schedule.payments[1].paymentDate.getMonth(),
      10,
      "Second payment should still be in November"
    );

    // Third payment should be on 1st of next month (aligned)
    assert.equal(
      schedule.payments[2].paymentDate.getDate(),
      1,
      "Third payment should be on 1st of next month"
    );
    assert.equal(
      schedule.payments[2].paymentDate.getMonth(),
      11, // December
      "Third payment should be in December"
    );

    // Fourth payment should be on 15th of December
    assert.equal(
      schedule.payments[3].paymentDate.getDate(),
      15,
      "Fourth payment should be on 15th"
    );
    assert.equal(
      schedule.payments[3].paymentDate.getMonth(),
      11,
      "Fourth payment should be in December"
    );
  });

  it("handles start date on 15th correctly", () => {
    const principal = 500000;
    const annualRate = 0.05;
    const amortizationMonths = 300;
    const frequency: PaymentFrequency = "semi-monthly";
    const startDate = new Date(2023, 10, 15); // Start on 15th (Nov 2023)

    const schedule = generateAmortizationSchedule(
      principal,
      annualRate,
      amortizationMonths,
      frequency,
      startDate,
      [],
      [],
      6
    );

    // First payment uses the start date (15th)
    assert.equal(
      schedule.payments[0].paymentDate.getDate(),
      15,
      "First payment should be on 15th when starting on 15th"
    );

    // Second payment should align to 1st of next month
    // The advancePaymentDate function will align it
    const secondPaymentDate = schedule.payments[1].paymentDate;
    // Since we're on 15th, next payment should be 1st of next month
    assert.equal(secondPaymentDate.getDate(), 1, "Second payment should be on 1st of next month");
    assert.equal(
      secondPaymentDate.getMonth(),
      11, // December
      "Second payment should be in December"
    );
  });

  it("handles start date between 1st and 15th", () => {
    const principal = 500000;
    const annualRate = 0.05;
    const amortizationMonths = 300;
    const frequency: PaymentFrequency = "semi-monthly";
    const startDate = new Date(2023, 10, 10); // Start on 10th (Nov 2023)

    const schedule = generateAmortizationSchedule(
      principal,
      annualRate,
      amortizationMonths,
      frequency,
      startDate,
      [],
      [],
      6
    );

    // First payment uses the start date (10th), but subsequent payments align
    // Second payment should align to 15th of same month
    assert.equal(
      schedule.payments[1].paymentDate.getDate(),
      15,
      "Second payment should align to 15th when starting mid-month"
    );
    assert.equal(
      schedule.payments[1].paymentDate.getMonth(),
      10, // Still November
      "Second payment should still be in November"
    );

    // Third payment should be on 1st of next month
    assert.equal(
      schedule.payments[2].paymentDate.getDate(),
      1,
      "Third payment should be on 1st of next month"
    );
  });

  it("handles start date after 15th", () => {
    const principal = 500000;
    const annualRate = 0.05;
    const amortizationMonths = 300;
    const frequency: PaymentFrequency = "semi-monthly";
    const startDate = new Date(2023, 10, 20); // Start on 20th (Nov 2023)

    const schedule = generateAmortizationSchedule(
      principal,
      annualRate,
      amortizationMonths,
      frequency,
      startDate,
      [],
      [],
      6
    );

    // First payment uses the start date (20th), but subsequent payments align
    // Second payment should align to 1st of next month
    assert.equal(
      schedule.payments[1].paymentDate.getDate(),
      1,
      "Second payment should align to 1st of next month when starting after 15th"
    );
    assert.equal(
      schedule.payments[1].paymentDate.getMonth(),
      11, // December
      "Second payment should be in December"
    );

    // Third payment should be on 15th of February
    assert.equal(schedule.payments[2].paymentDate.getDate(), 15, "Third payment should be on 15th");
    assert.equal(
      schedule.payments[2].paymentDate.getMonth(),
      11,
      "Third payment should be in December"
    );
  });
});
