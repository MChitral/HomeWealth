/**
 * Utility function to format amortization years into a human-readable string
 * @param years - The amortization period in years (can be a decimal)
 * @returns Formatted string like "25 yr", "10 mo", or "25 yr 6 mo"
 */
export function formatAmortization(years: number): string {
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);
  if (months === 0) {
    return `${wholeYears} yr`;
  }
  if (wholeYears === 0) {
    return `${months} mo`;
  }
  return `${wholeYears} yr ${months} mo`;
}

