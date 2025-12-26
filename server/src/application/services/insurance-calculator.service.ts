/**
 * Insurance Calculator Service
 * Calculates mortgage default insurance premiums for high-ratio mortgages
 * Supports CMHC, Sagen, and Genworth providers
 */

export type InsuranceProvider = "CMHC" | "Sagen" | "Genworth";

export type PremiumPaymentType = "upfront" | "added-to-principal";

export interface InsuranceCalculationInput {
  propertyPrice: number;
  downPayment: number;
  provider: InsuranceProvider;
  mliSelectDiscount?: 0 | 10 | 20 | 30; // Percentage discount
  premiumPaymentType?: PremiumPaymentType;
}

export interface InsuranceCalculationResult {
  mortgageAmount: number;
  ltvRatio: number;
  premiumRate: number; // Percentage
  premiumAmount: number;
  premiumAfterDiscount: number;
  totalMortgageAmount: number; // If premium added to principal
  isHighRatio: boolean;
  provider: InsuranceProvider;
  breakdown: {
    basePremium: number;
    discountAmount: number;
    finalPremium: number;
  };
}

/**
 * Premium rate tables by provider
 * Rates are percentages of mortgage amount
 * Note: Rates should be verified with current official sources
 */
const PREMIUM_RATE_TABLES: Record<InsuranceProvider, Record<string, number>> = {
  CMHC: {
    "65-75": 0.6, // 0.60% of mortgage amount
    "75-80": 1.7,
    "80-85": 2.4,
    "85-90": 2.8,
    "90-95": 3.1,
    "95-100": 4.0,
  },
  Sagen: {
    "65-75": 0.6,
    "75-80": 1.7,
    "80-85": 2.4,
    "85-90": 2.8,
    "90-95": 3.1,
    "95-100": 4.0,
  },
  Genworth: {
    "65-75": 0.6,
    "75-80": 1.7,
    "80-85": 2.4,
    "85-90": 2.8,
    "90-95": 3.1,
    "95-100": 4.0,
  },
};

/**
 * Get premium rate for a given LTV ratio and provider
 */
function getPremiumRateForLTV(ltvRatio: number, provider: InsuranceProvider): number {
  const rateTable = PREMIUM_RATE_TABLES[provider];

  // LTV boundaries: exclusive on lower, inclusive on upper
  if (ltvRatio <= 75.0) {
    return rateTable["65-75"];
  } else if (ltvRatio <= 80.0) {
    return rateTable["75-80"];
  } else if (ltvRatio <= 85.0) {
    return rateTable["80-85"];
  } else if (ltvRatio <= 90.0) {
    return rateTable["85-90"];
  } else if (ltvRatio <= 95.0) {
    return rateTable["90-95"];
  } else if (ltvRatio <= 100.0) {
    return rateTable["95-100"];
  }

  // LTV > 100% is invalid for insurance
  throw new Error(
    `Invalid LTV ratio: ${ltvRatio}%. LTV must be between 65% and 100% for mortgage insurance.`
  );
}

/**
 * Calculate mortgage default insurance premium
 */
export class InsuranceCalculatorService {
  /**
   * Calculate insurance premium for a mortgage
   */
  calculate(input: InsuranceCalculationInput): InsuranceCalculationResult {
    const {
      propertyPrice,
      downPayment,
      provider,
      mliSelectDiscount = 0,
      premiumPaymentType = "upfront",
    } = input;

    // Validate inputs
    if (propertyPrice <= 0) {
      throw new Error("Property price must be greater than zero");
    }

    if (downPayment < 0) {
      throw new Error("Down payment cannot be negative");
    }

    if (downPayment >= propertyPrice) {
      throw new Error("Down payment cannot be greater than or equal to property price");
    }

    // Calculate mortgage amount and LTV
    const mortgageAmount = propertyPrice - downPayment;
    const ltvRatio = (mortgageAmount / propertyPrice) * 100;

    // Check if high-ratio mortgage (down payment < 20% = LTV > 80%)
    const downPaymentPercent = (downPayment / propertyPrice) * 100;
    const isHighRatio = downPaymentPercent < 20.0; // Insurance required for down payment < 20%

    // If not high-ratio, return result indicating no insurance needed
    if (!isHighRatio) {
      return {
        mortgageAmount,
        ltvRatio,
        premiumRate: 0,
        premiumAmount: 0,
        premiumAfterDiscount: 0,
        totalMortgageAmount: mortgageAmount,
        isHighRatio: false,
        provider,
        breakdown: {
          basePremium: 0,
          discountAmount: 0,
          finalPremium: 0,
        },
      };
    }

    // Validate LTV is within insurance range (65% - 100%)
    if (ltvRatio < 65.0) {
      throw new Error(
        `LTV ratio ${ltvRatio.toFixed(2)}% is below the minimum 65% for mortgage insurance`
      );
    }

    if (ltvRatio > 100.0) {
      throw new Error(`LTV ratio ${ltvRatio.toFixed(2)}% exceeds 100%`);
    }

    // Get premium rate based on LTV
    const premiumRate = getPremiumRateForLTV(ltvRatio, provider);

    // Calculate base premium
    const basePremium = mortgageAmount * (premiumRate / 100);

    // Apply MLI Select discount
    const discountAmount = basePremium * (mliSelectDiscount / 100);
    const finalPremium = basePremium - discountAmount;

    // Calculate total mortgage amount if premium is added to principal
    const totalMortgageAmount =
      premiumPaymentType === "added-to-principal" ? mortgageAmount + finalPremium : mortgageAmount;

    return {
      mortgageAmount,
      ltvRatio: Number(ltvRatio.toFixed(2)),
      premiumRate: Number(premiumRate.toFixed(2)),
      premiumAmount: Number(basePremium.toFixed(2)),
      premiumAfterDiscount: Number(finalPremium.toFixed(2)),
      totalMortgageAmount: Number(totalMortgageAmount.toFixed(2)),
      isHighRatio: true,
      provider,
      breakdown: {
        basePremium: Number(basePremium.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        finalPremium: Number(finalPremium.toFixed(2)),
      },
    };
  }

  /**
   * Compare premiums across all providers
   */
  compareProviders(
    propertyPrice: number,
    downPayment: number,
    mliSelectDiscount?: 0 | 10 | 20 | 30,
    premiumPaymentType?: PremiumPaymentType
  ): Record<InsuranceProvider, InsuranceCalculationResult> {
    const providers: InsuranceProvider[] = ["CMHC", "Sagen", "Genworth"];
    const results: Record<string, InsuranceCalculationResult> = {};

    for (const provider of providers) {
      try {
        results[provider] = this.calculate({
          propertyPrice,
          downPayment,
          provider,
          mliSelectDiscount,
          premiumPaymentType,
        });
      } catch (error) {
        // If calculation fails for a provider, skip it
        console.error(`Failed to calculate premium for ${provider}:`, error);
      }
    }

    return results as Record<InsuranceProvider, InsuranceCalculationResult>;
  }

  /**
   * Get premium rate table for a provider
   */
  getPremiumRateTable(provider: InsuranceProvider): Record<string, number> {
    return { ...PREMIUM_RATE_TABLES[provider] };
  }
}
