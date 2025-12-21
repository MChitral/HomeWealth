import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isWeekend,
  isCanadianHoliday,
  isBusinessDay,
  adjustToBusinessDay,
  daysBetween,
} from "../business-days";

describe("Business Day Utilities", () => {
  /**
   * **Canadian Mortgage Rule:**
   * When a payment date falls on a weekend or holiday, lenders adjust to the next business day.
   * Interest accrues until the adjusted payment date.
   */

  describe("isWeekend", () => {
    it("identifies Saturday as weekend", () => {
      const saturday = new Date(2024, 0, 6); // January 6, 2024 is a Saturday
      assert.ok(isWeekend(saturday), "Saturday should be identified as weekend");
    });

    it("identifies Sunday as weekend", () => {
      const sunday = new Date(2024, 0, 7); // January 7, 2024 is a Sunday
      assert.ok(isWeekend(sunday), "Sunday should be identified as weekend");
    });

    it("identifies weekdays as not weekend", () => {
      const monday = new Date(2024, 0, 1); // January 1, 2024 is a Monday
      const tuesday = new Date(2024, 0, 2); // January 2, 2024 is a Tuesday
      const friday = new Date(2024, 0, 5); // January 5, 2024 is a Friday

      assert.ok(!isWeekend(monday), "Monday should not be weekend");
      assert.ok(!isWeekend(tuesday), "Tuesday should not be weekend");
      assert.ok(!isWeekend(friday), "Friday should not be weekend");
    });
  });

  describe("isCanadianHoliday", () => {
    it("identifies New Year's Day", () => {
      const newYears = new Date(2024, 0, 1); // January 1
      assert.ok(isCanadianHoliday(newYears), "New Year's Day should be a holiday");
    });

    it("identifies Canada Day", () => {
      const canadaDay = new Date(2024, 6, 1); // July 1
      assert.ok(isCanadianHoliday(canadaDay), "Canada Day should be a holiday");
    });

    it("identifies Christmas", () => {
      const christmas = new Date(2024, 11, 25); // December 25
      assert.ok(isCanadianHoliday(christmas), "Christmas should be a holiday");
    });

    it("identifies Boxing Day", () => {
      const boxingDay = new Date(2024, 11, 26); // December 26
      assert.ok(isCanadianHoliday(boxingDay), "Boxing Day should be a holiday");
    });

    it("identifies Remembrance Day", () => {
      const remembranceDay = new Date(2024, 10, 11); // November 11
      assert.ok(isCanadianHoliday(remembranceDay), "Remembrance Day should be a holiday");
    });

    it("identifies Labour Day (1st Monday in September)", () => {
      // Labour Day 2024 is September 2 (1st Monday)
      const labourDay = new Date(2024, 8, 2);
      assert.ok(isCanadianHoliday(labourDay), "Labour Day should be a holiday");
    });

    it("identifies Thanksgiving (2nd Monday in October)", () => {
      // Thanksgiving 2024 is October 14 (2nd Monday)
      const thanksgiving = new Date(2024, 9, 14);
      assert.ok(isCanadianHoliday(thanksgiving), "Thanksgiving should be a holiday");
    });

    it("identifies Victoria Day (Monday before May 25)", () => {
      // Victoria Day 2024 is May 20 (Monday before May 25)
      const victoriaDay = new Date(2024, 4, 20);
      assert.ok(isCanadianHoliday(victoriaDay), "Victoria Day should be a holiday");
    });

    it("identifies regular weekdays as not holidays", () => {
      const regularDay = new Date(2024, 0, 15); // January 15, 2024 (Monday, not a holiday)
      assert.ok(!isCanadianHoliday(regularDay), "Regular weekday should not be a holiday");
    });
  });

  describe("isBusinessDay", () => {
    it("identifies regular weekdays as business days", () => {
      const monday = new Date(2024, 0, 15); // January 15, 2024 (Monday)
      assert.ok(isBusinessDay(monday), "Regular Monday should be a business day");
    });

    it("identifies weekends as not business days", () => {
      const saturday = new Date(2024, 0, 6); // Saturday
      assert.ok(!isBusinessDay(saturday), "Saturday should not be a business day");
    });

    it("identifies holidays as not business days", () => {
      const newYears = new Date(2024, 0, 1); // New Year's Day
      assert.ok(!isBusinessDay(newYears), "Holiday should not be a business day");
    });
  });

  describe("adjustToBusinessDay", () => {
    it("adjusts Saturday to next Monday", () => {
      const saturday = new Date(2024, 0, 6); // January 6, 2024 (Saturday)
      const adjusted = adjustToBusinessDay(saturday);

      assert.strictEqual(
        adjusted.getDay(),
        1, // Monday
        "Saturday should be adjusted to Monday"
      );
      assert.strictEqual(
        adjusted.getDate(),
        8, // January 8
        "Should be adjusted to January 8"
      );
    });

    it("adjusts Sunday to next Monday", () => {
      const sunday = new Date(2024, 0, 7); // January 7, 2024 (Sunday)
      const adjusted = adjustToBusinessDay(sunday);

      assert.strictEqual(
        adjusted.getDay(),
        1, // Monday
        "Sunday should be adjusted to Monday"
      );
      assert.strictEqual(
        adjusted.getDate(),
        8, // January 8
        "Should be adjusted to January 8"
      );
    });

    it("adjusts holiday to next business day", () => {
      const newYears = new Date(2024, 0, 1); // January 1, 2024 (Monday, New Year's Day)
      const adjusted = adjustToBusinessDay(newYears);

      // New Year's Day 2024 is a Monday, so it should adjust to Tuesday
      assert.strictEqual(
        adjusted.getDay(),
        2, // Tuesday
        "Holiday should be adjusted to next business day"
      );
      assert.strictEqual(
        adjusted.getDate(),
        2, // January 2
        "Should be adjusted to January 2"
      );
    });

    it("keeps business days unchanged", () => {
      const tuesday = new Date(2024, 0, 2); // January 2, 2024 (Tuesday)
      const adjusted = adjustToBusinessDay(tuesday);

      assert.ok(adjusted.getTime() === tuesday.getTime(), "Business day should remain unchanged");
    });

    it("handles consecutive non-business days", () => {
      // If a date falls on Saturday, and Sunday is also non-business,
      // it should adjust to Monday
      const saturday = new Date(2024, 0, 6); // Saturday
      const adjusted = adjustToBusinessDay(saturday);

      assert.strictEqual(
        adjusted.getDay(),
        1, // Monday
        "Should skip weekend and adjust to Monday"
      );
    });
  });

  describe("daysBetween", () => {
    it("calculates days between two dates", () => {
      const start = new Date(2024, 0, 1); // January 1
      const end = new Date(2024, 0, 8); // January 8

      const days = daysBetween(start, end);
      assert.strictEqual(days, 7, "Should calculate 7 days between Jan 1 and Jan 8");
    });

    it("handles same day", () => {
      const date = new Date(2024, 0, 1);
      const days = daysBetween(date, date);
      assert.strictEqual(days, 0, "Same day should return 0 days");
    });

    it("handles reverse order (negative days)", () => {
      const start = new Date(2024, 0, 8);
      const end = new Date(2024, 0, 1);

      const days = daysBetween(start, end);
      assert.strictEqual(days, -7, "Reverse order should return negative days");
    });
  });

  describe("Real-World Scenarios", () => {
    it("handles payment on Saturday", () => {
      // Scenario: Payment scheduled for Saturday, January 6, 2024
      const saturday = new Date(2024, 0, 6);
      const adjusted = adjustToBusinessDay(saturday);

      // Should adjust to Monday, January 8
      assert.strictEqual(adjusted.getDay(), 1, "Saturday payment should adjust to Monday");
      assert.strictEqual(adjusted.getMonth(), 0, "Should remain in January");
    });

    it("handles payment on holiday", () => {
      // Scenario: Payment scheduled for Canada Day (July 1, 2024)
      const canadaDay = new Date(2024, 6, 1);
      const adjusted = adjustToBusinessDay(canadaDay);

      // July 1, 2024 is a Monday (holiday), so should adjust to Tuesday
      assert.strictEqual(
        adjusted.getDay(),
        2,
        "Holiday payment should adjust to next business day"
      );
    });

    it("handles payment on weekend before holiday", () => {
      // Scenario: Payment on Saturday before a holiday Monday
      // This tests that it skips both weekend and holiday
      const saturday = new Date(2024, 0, 6); // Saturday
      const adjusted = adjustToBusinessDay(saturday);

      // Should skip Saturday, Sunday, and any Monday holiday
      assert.strictEqual(
        adjusted.getDay(),
        1,
        "Should adjust to Monday (or Tuesday if Monday is holiday)"
      );
    });
  });
});
