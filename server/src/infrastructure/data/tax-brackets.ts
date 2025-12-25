/**
 * Canadian Tax Bracket Data (2025)
 * Federal and Provincial tax brackets for all provinces
 * 
 * Note: This is a simplified representation. For production use, consider:
 * - Using an external tax data API
 * - Storing in database with regular updates
 * - Including additional tax credits and deductions
 */

export interface TaxBracketData {
  province: string;
  taxYear: number;
  bracketType: "federal" | "provincial";
  minIncome: number;
  maxIncome: number | null; // null for top bracket
  taxRate: number; // as percentage (e.g., 15.00 for 15%)
}

// Federal Tax Brackets (2025)
export const federalBrackets2025: TaxBracketData[] = [
  { province: "Federal", taxYear: 2025, bracketType: "federal", minIncome: 0, maxIncome: 48535, taxRate: 15.0 },
  { province: "Federal", taxYear: 2025, bracketType: "federal", minIncome: 48535, maxIncome: 97069, taxRate: 20.5 },
  { province: "Federal", taxYear: 2025, bracketType: "federal", minIncome: 97069, maxIncome: 150473, taxRate: 26.0 },
  { province: "Federal", taxYear: 2025, bracketType: "federal", minIncome: 150473, maxIncome: 214368, taxRate: 29.0 },
  { province: "Federal", taxYear: 2025, bracketType: "federal", minIncome: 214368, maxIncome: null, taxRate: 33.0 },
];

// Provincial Tax Brackets (2025) - Simplified examples
// Note: Actual provincial rates vary significantly and should be sourced from official tax authorities

// Ontario
export const ontarioBrackets2025: TaxBracketData[] = [
  { province: "ON", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 46226, taxRate: 5.05 },
  { province: "ON", taxYear: 2025, bracketType: "provincial", minIncome: 46226, maxIncome: 92454, taxRate: 9.15 },
  { province: "ON", taxYear: 2025, bracketType: "provincial", minIncome: 92454, maxIncome: 150000, taxRate: 11.16 },
  { province: "ON", taxYear: 2025, bracketType: "provincial", minIncome: 150000, maxIncome: 220000, taxRate: 12.16 },
  { province: "ON", taxYear: 2025, bracketType: "provincial", minIncome: 220000, maxIncome: null, taxRate: 13.16 },
];

// British Columbia
export const britishColumbiaBrackets2025: TaxBracketData[] = [
  { province: "BC", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 45654, taxRate: 5.06 },
  { province: "BC", taxYear: 2025, bracketType: "provincial", minIncome: 45654, maxIncome: 91310, taxRate: 7.7 },
  { province: "BC", taxYear: 2025, bracketType: "provincial", minIncome: 91310, maxIncome: 104835, taxRate: 10.5 },
  { province: "BC", taxYear: 2025, bracketType: "provincial", minIncome: 104835, maxIncome: 127299, taxRate: 12.29 },
  { province: "BC", taxYear: 2025, bracketType: "provincial", minIncome: 127299, maxIncome: 172602, taxRate: 14.7 },
  { province: "BC", taxYear: 2025, bracketType: "provincial", minIncome: 172602, maxIncome: null, taxRate: 16.8 },
];

// Alberta
export const albertaBrackets2025: TaxBracketData[] = [
  { province: "AB", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 131220, taxRate: 10.0 },
  { province: "AB", taxYear: 2025, bracketType: "provincial", minIncome: 131220, maxIncome: 157464, taxRate: 12.0 },
  { province: "AB", taxYear: 2025, bracketType: "provincial", minIncome: 157464, maxIncome: 209952, taxRate: 13.0 },
  { province: "AB", taxYear: 2025, bracketType: "provincial", minIncome: 209952, maxIncome: 314928, taxRate: 14.0 },
  { province: "AB", taxYear: 2025, bracketType: "provincial", minIncome: 314928, maxIncome: null, taxRate: 15.0 },
];

// Quebec (different structure - simplified)
export const quebecBrackets2025: TaxBracketData[] = [
  { province: "QC", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 49275, taxRate: 14.0 },
  { province: "QC", taxYear: 2025, bracketType: "provincial", minIncome: 49275, maxIncome: 98540, taxRate: 19.0 },
  { province: "QC", taxYear: 2025, bracketType: "provincial", minIncome: 98540, maxIncome: 119910, taxRate: 24.0 },
  { province: "QC", taxYear: 2025, bracketType: "provincial", minIncome: 119910, maxIncome: null, taxRate: 25.75 },
];

// All provincial brackets (simplified - add other provinces as needed)
export const allProvincialBrackets2025: Record<string, TaxBracketData[]> = {
  ON: ontarioBrackets2025,
  BC: britishColumbiaBrackets2025,
  AB: albertaBrackets2025,
  QC: quebecBrackets2025,
  // Add other provinces: MB, NB, NL, NS, NT, NU, PE, SK, YT
  // For now, using simplified rates for other provinces
  MB: [
    { province: "MB", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 47000, taxRate: 10.8 },
    { province: "MB", taxYear: 2025, bracketType: "provincial", minIncome: 47000, maxIncome: 100000, taxRate: 12.75 },
    { province: "MB", taxYear: 2025, bracketType: "provincial", minIncome: 100000, maxIncome: null, taxRate: 17.4 },
  ],
  SK: [
    { province: "SK", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 49720, taxRate: 10.5 },
    { province: "SK", taxYear: 2025, bracketType: "provincial", minIncome: 49720, maxIncome: 142058, taxRate: 12.5 },
    { province: "SK", taxYear: 2025, bracketType: "provincial", minIncome: 142058, maxIncome: null, taxRate: 14.5 },
  ],
  NB: [
    { province: "NB", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 49958, taxRate: 9.4 },
    { province: "NB", taxYear: 2025, bracketType: "provincial", minIncome: 49958, maxIncome: 99916, taxRate: 14.5 },
    { province: "NB", taxYear: 2025, bracketType: "provincial", minIncome: 99916, maxIncome: 185064, taxRate: 16.0 },
    { province: "NB", taxYear: 2025, bracketType: "provincial", minIncome: 185064, maxIncome: null, taxRate: 19.5 },
  ],
  NS: [
    { province: "NS", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 29590, taxRate: 8.79 },
    { province: "NS", taxYear: 2025, bracketType: "provincial", minIncome: 29590, maxIncome: 59180, taxRate: 14.95 },
    { province: "NS", taxYear: 2025, bracketType: "provincial", minIncome: 59180, maxIncome: 93000, taxRate: 16.67 },
    { province: "NS", taxYear: 2025, bracketType: "provincial", minIncome: 93000, maxIncome: 150000, taxRate: 17.5 },
    { province: "NS", taxYear: 2025, bracketType: "provincial", minIncome: 150000, maxIncome: null, taxRate: 21.0 },
  ],
  NL: [
    { province: "NL", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 41457, taxRate: 8.7 },
    { province: "NL", taxYear: 2025, bracketType: "provincial", minIncome: 41457, maxIncome: 82913, taxRate: 14.5 },
    { province: "NL", taxYear: 2025, bracketType: "provincial", minIncome: 82913, maxIncome: 148027, taxRate: 15.8 },
    { province: "NL", taxYear: 2025, bracketType: "provincial", minIncome: 148027, maxIncome: 207239, taxRate: 17.3 },
    { province: "NL", taxYear: 2025, bracketType: "provincial", minIncome: 207239, maxIncome: null, taxRate: 18.3 },
  ],
  PE: [
    { province: "PE", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 32656, taxRate: 9.8 },
    { province: "PE", taxYear: 2025, bracketType: "provincial", minIncome: 32656, maxIncome: 65312, taxRate: 13.8 },
    { province: "PE", taxYear: 2025, bracketType: "provincial", minIncome: 65312, maxIncome: 105000, taxRate: 16.7 },
    { province: "PE", taxYear: 2025, bracketType: "provincial", minIncome: 105000, maxIncome: null, taxRate: 18.0 },
  ],
  NT: [
    { province: "NT", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 44896, taxRate: 5.9 },
    { province: "NT", taxYear: 2025, bracketType: "provincial", minIncome: 44896, maxIncome: 89793, taxRate: 8.6 },
    { province: "NT", taxYear: 2025, bracketType: "provincial", minIncome: 89793, maxIncome: 145906, taxRate: 12.2 },
    { province: "NT", taxYear: 2025, bracketType: "provincial", minIncome: 145906, maxIncome: null, taxRate: 14.05 },
  ],
  NU: [
    { province: "NU", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 47867, taxRate: 4.0 },
    { province: "NU", taxYear: 2025, bracketType: "provincial", minIncome: 47867, maxIncome: 95733, taxRate: 7.0 },
    { province: "NU", taxYear: 2025, bracketType: "provincial", minIncome: 95733, maxIncome: 155625, taxRate: 9.0 },
    { province: "NU", taxYear: 2025, bracketType: "provincial", minIncome: 155625, maxIncome: null, taxRate: 11.5 },
  ],
  YT: [
    { province: "YT", taxYear: 2025, bracketType: "provincial", minIncome: 0, maxIncome: 50000, taxRate: 6.4 },
    { province: "YT", taxYear: 2025, bracketType: "provincial", minIncome: 50000, maxIncome: 100000, taxRate: 9.0 },
    { province: "YT", taxYear: 2025, bracketType: "provincial", minIncome: 100000, maxIncome: 500000, taxRate: 10.9 },
    { province: "YT", taxYear: 2025, bracketType: "provincial", minIncome: 500000, maxIncome: null, taxRate: 12.8 },
  ],
};

/**
 * Get all tax brackets for a given province and year
 */
export function getTaxBrackets(province: string, taxYear: number = 2025): {
  federal: TaxBracketData[];
  provincial: TaxBracketData[];
} {
  const federal = federalBrackets2025.filter((b) => b.taxYear === taxYear);
  const provincial = allProvincialBrackets2025[province] || [];

  return { federal, provincial };
}

/**
 * Calculate marginal tax rate for a given income, province, and year
 */
export function calculateMarginalTaxRate(
  income: number,
  province: string,
  taxYear: number = 2025
): number {
  const { federal, provincial } = getTaxBrackets(province, taxYear);

  // Find federal bracket
  const federalBracket = federal.find(
    (b) => income >= b.minIncome && (b.maxIncome === null || income < b.maxIncome)
  );
  const federalRate = federalBracket?.taxRate || 0;

  // Find provincial bracket
  const provincialBracket = provincial.find(
    (b) => income >= b.minIncome && (b.maxIncome === null || income < b.maxIncome)
  );
  const provincialRate = provincialBracket?.taxRate || 0;

  return federalRate + provincialRate;
}

