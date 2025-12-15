/**
 * Utility function to format amortization years into a human-readable string
 * @param years - The amortization period in years (can be a decimal)
 * @returns Formatted string like "25 yr", "10 mo", or "25 yr 6 mo"
 */
export function formatAmortization(years: number | string | null | undefined): string {
  // Handle invalid inputs
  if (years == null || years === undefined || years === "") {
    return "-";
  }

  // Convert to number if string
  const yearsNum = typeof years === "string" ? parseFloat(years) : years;

  // Validate it's a valid number
  if (!Number.isFinite(yearsNum) || yearsNum < 0) {
    return "-";
  }

  const wholeYears = Math.floor(yearsNum);
  const months = Math.round((yearsNum - wholeYears) * 12);

  if (months === 0) {
    return `${wholeYears} yr`;
  }
  if (wholeYears === 0) {
    return `${months} mo`;
  }
  return `${wholeYears} yr ${months} mo`;
}
