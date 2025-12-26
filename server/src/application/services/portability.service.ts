import type { Mortgage, MortgageTerm } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePortabilityRepository,
} from "@infrastructure/repositories";
import {
  calculatePortability,
  calculateBlendedRate,
  type PortabilityResult,
} from "@domain/calculations/portability";
import { getTermEffectiveRate } from "@server-shared/calculations/term-helpers";

export interface PortabilityCalculationInput {
  mortgageId: string;
  newPropertyPrice: number;
  portDate?: string; // Optional, defaults to today
}

export interface PortabilityCalculationResult extends PortabilityResult {
  canPort: boolean;
  message?: string;
}

export class PortabilityService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly mortgagePortability: MortgagePortabilityRepository
  ) {}

  private async authorizeMortgage(mortgageId: string, userId: string) {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || mortgage.userId !== userId) {
      return undefined;
    }
    return mortgage;
  }

  private async getActiveTerm(mortgageId: string): Promise<MortgageTerm | undefined> {
    const terms = await this.mortgageTerms.findByMortgageId(mortgageId);
    if (terms.length === 0) {
      return undefined;
    }

    // Sort by start date descending to get the most recent/active term
    const sortedTerms = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const today = new Date();
    // Find the term that is currently active
    const activeTerm = sortedTerms.find((term) => {
      const startDate = new Date(term.startDate);
      const endDate = new Date(term.endDate);
      return today >= startDate && today <= endDate;
    });

    return activeTerm || sortedTerms[0];
  }

  /**
   * Calculate portability options without applying
   */
  async calculatePortability(
    mortgageId: string,
    userId: string,
    input: PortabilityCalculationInput
  ): Promise<PortabilityCalculationResult | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    const activeTerm = await this.getActiveTerm(mortgageId);
    if (!activeTerm) {
      return {
        oldPropertyPrice: Number(mortgage.propertyPrice),
        newPropertyPrice: input.newPropertyPrice,
        portedAmount: 0,
        topUpAmount: 0,
        requiresTopUp: false,
        canPort: false,
        message: "No active term found for this mortgage",
      };
    }

    // Validate inputs
    if (input.newPropertyPrice <= 0) {
      return {
        oldPropertyPrice: Number(mortgage.propertyPrice),
        newPropertyPrice: input.newPropertyPrice,
        portedAmount: 0,
        topUpAmount: 0,
        requiresTopUp: false,
        canPort: false,
        message: "New property price must be greater than zero",
      };
    }

    const currentBalance = Number(mortgage.currentBalance);
    const originalAmount = Number(mortgage.originalAmount);
    const oldPropertyPrice = Number(mortgage.propertyPrice);

    try {
      // Calculate portability
      const result = calculatePortability(
        currentBalance,
        originalAmount,
        oldPropertyPrice,
        input.newPropertyPrice
      );

      // If top-up is required, calculate blended rate
      let blendedRate: number | undefined;
      if (result.requiresTopUp && activeTerm) {
        const currentRate = getTermEffectiveRate(activeTerm);
        // For top-up, assume same rate (in reality, this would be a new rate)
        // This is a simplification - actual implementation would fetch market rate
        blendedRate = currentRate;
      }

      return {
        ...result,
        blendedRate,
        canPort: true,
      };
    } catch (error) {
      return {
        oldPropertyPrice,
        newPropertyPrice: input.newPropertyPrice,
        portedAmount: 0,
        topUpAmount: 0,
        requiresTopUp: false,
        canPort: false,
        message: error instanceof Error ? error.message : "Failed to calculate portability",
      };
    }
  }

  /**
   * Apply portability (create portability event and optionally new mortgage)
   */
  async applyPortability(
    mortgageId: string,
    userId: string,
    input: PortabilityCalculationInput
  ): Promise<{ portabilityEvent: any; newMortgage?: Mortgage } | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    // Calculate portability first
    const calculation = await this.calculatePortability(mortgageId, userId, input);
    if (!calculation || !calculation.canPort) {
      throw new Error(calculation?.message || "Cannot apply portability");
    }

    const portDate = input.portDate || new Date().toISOString().split("T")[0];
    const oldPropertyPrice = Number(mortgage.propertyPrice);

    // Create portability event
    const portabilityEvent = await this.mortgagePortability.create({
      mortgageId,
      portDate,
      oldPropertyPrice: oldPropertyPrice.toFixed(2),
      newPropertyPrice: input.newPropertyPrice.toFixed(2),
      portedAmount: calculation.portedAmount.toFixed(2),
      topUpAmount: calculation.requiresTopUp ? calculation.topUpAmount.toFixed(2) : undefined,
      description: `Mortgage ported from property worth $${oldPropertyPrice.toLocaleString()} to property worth $${input.newPropertyPrice.toLocaleString()}`,
    });

    // Mark original mortgage as ported
    await this.mortgages.update(mortgageId, {
      isPorted: 1,
    });

    // If top-up is required, we would typically create a new mortgage
    // For now, we'll just update the existing mortgage with new property price
    // In a full implementation, you might create a new mortgage record
    if (calculation.requiresTopUp) {
      // Update mortgage with new property price
      await this.mortgages.update(mortgageId, {
        propertyPrice: input.newPropertyPrice.toFixed(2),
        currentBalance: (calculation.portedAmount + calculation.topUpAmount).toFixed(2),
      });
    } else {
      // Just update property price
      await this.mortgages.update(mortgageId, {
        propertyPrice: input.newPropertyPrice.toFixed(2),
      });
    }

    return { portabilityEvent };
  }

  /**
   * Get portability history for a mortgage
   */
  async getPortabilityHistory(mortgageId: string, userId: string): Promise<any[] | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    return this.mortgagePortability.findByMortgageId(mortgageId);
  }
}
