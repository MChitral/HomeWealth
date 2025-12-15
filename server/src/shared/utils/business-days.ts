/**
 * Business Day Utilities for Canadian Mortgages
 *
 * **Canadian Mortgage Rule:**
 * When a payment date falls on a weekend or holiday, lenders adjust to the next business day.
 * Interest accrues until the adjusted payment date.
 *
 * **Federal Holidays (Canada):**
 * - New Year's Day (January 1)
 * - Good Friday (varies)
 * - Easter Monday (varies)
 * - Victoria Day (Monday before May 25)
 * - Canada Day (July 1)
 * - Labour Day (1st Monday in September)
 * - Thanksgiving (2nd Monday in October)
 * - Remembrance Day (November 11)
 * - Christmas (December 25)
 * - Boxing Day (December 26)
 */

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a Canadian federal holiday
 *
 * Note: This is a simplified version. For production, consider using a library
 * like `date-holidays` or maintaining a comprehensive holiday calendar.
 */
export function isCanadianHoliday(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();

  // New Year's Day (January 1)
  if (month === 0 && day === 1) return true;

  // Good Friday (varies - simplified: Friday before Easter)
  // Easter calculation is complex, so we'll use a simplified approach
  // For production, use a proper Easter calculation library
  const easter = calculateEaster(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  if (isSameDay(date, goodFriday)) return true;

  // Easter Monday (Monday after Easter)
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  if (isSameDay(date, easterMonday)) return true;

  // Victoria Day (Monday before May 25)
  const victoriaDay = getVictoriaDay(year);
  if (isSameDay(date, victoriaDay)) return true;

  // Canada Day (July 1)
  if (month === 6 && day === 1) return true;

  // Labour Day (1st Monday in September)
  const labourDay = getLabourDay(year);
  if (isSameDay(date, labourDay)) return true;

  // Thanksgiving (2nd Monday in October)
  const thanksgiving = getThanksgiving(year);
  if (isSameDay(date, thanksgiving)) return true;

  // Remembrance Day (November 11)
  if (month === 10 && day === 11) return true;

  // Christmas (December 25)
  if (month === 11 && day === 25) return true;

  // Boxing Day (December 26)
  if (month === 11 && day === 26) return true;

  return false;
}

/**
 * Check if two dates are the same day (ignoring time)
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Calculate Easter Sunday for a given year (using anonymous Gregorian algorithm)
 *
 * This is a simplified implementation. For production, consider using a library.
 */
function calculateEaster(year: number): Date {
  // Anonymous Gregorian algorithm
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Get Victoria Day (Monday before May 25) for a given year
 */
function getVictoriaDay(year: number): Date {
  // Victoria Day is the Monday before May 25
  const may25 = new Date(year, 4, 25); // May = month 4
  const dayOfWeek = may25.getDay();

  // If May 25 is Monday (1), Victoria Day is May 25
  // If May 25 is Tuesday (2), Victoria Day is May 24 (Monday)
  // etc.
  const daysToSubtract = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const victoriaDay = new Date(may25);
  victoriaDay.setDate(may25.getDate() - daysToSubtract);

  return victoriaDay;
}

/**
 * Get Labour Day (1st Monday in September) for a given year
 */
function getLabourDay(year: number): Date {
  const september1 = new Date(year, 8, 1); // September = month 8
  const dayOfWeek = september1.getDay();

  // If Sept 1 is Monday (1), Labour Day is Sept 1
  // If Sept 1 is Tuesday (2), Labour Day is Sept 7 (next Monday)
  // etc.
  const daysToAdd = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const labourDay = new Date(september1);
  labourDay.setDate(september1.getDate() + daysToAdd);

  return labourDay;
}

/**
 * Get Thanksgiving (2nd Monday in October) for a given year
 */
function getThanksgiving(year: number): Date {
  const october1 = new Date(year, 9, 1); // October = month 9
  const dayOfWeek = october1.getDay();

  // Find first Monday in October
  const daysToAdd = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const firstMonday = new Date(october1);
  firstMonday.setDate(october1.getDate() + daysToAdd);

  // Second Monday is 7 days later
  const secondMonday = new Date(firstMonday);
  secondMonday.setDate(firstMonday.getDate() + 7);

  return secondMonday;
}

/**
 * Check if a date is a business day (not weekend and not holiday)
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isCanadianHoliday(date);
}

/**
 * Adjust a payment date to the next business day if it falls on a weekend or holiday
 *
 * **Canadian Mortgage Rule:**
 * - If payment date is Saturday/Sunday → move to next Monday
 * - If payment date is a holiday → move to next business day
 * - Interest accrues until the adjusted payment date
 *
 * @param date - Original payment date
 * @returns Adjusted payment date (next business day if needed)
 */
export function adjustToBusinessDay(date: Date): Date {
  const adjusted = new Date(date);

  // Keep moving forward until we find a business day
  while (!isBusinessDay(adjusted)) {
    adjusted.setDate(adjusted.getDate() + 1);
  }

  return adjusted;
}

/**
 * Calculate the number of days between two dates (for interest accrual)
 *
 * @param startDate - Start date
 * @param endDate - End date (adjusted payment date)
 * @returns Number of days (can be fractional for partial days)
 */
export function daysBetween(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return diffTime / (1000 * 60 * 60 * 24); // Convert to days
}
