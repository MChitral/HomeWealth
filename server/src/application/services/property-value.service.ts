import type { Mortgage } from "@shared/schema";
import {
  MortgagesRepository,
  PropertyValueHistoryRepository,
} from "@infrastructure/repositories";
import { HelocCreditLimitService } from "./heloc-credit-limit.service";

export interface PropertyValueUpdateInput {
  mortgageId: string;
  propertyValue: number;
  valueDate?: string; // Optional, defaults to today
  source?: string; // "appraisal", "assessment", "estimate", "user_input"
  notes?: string;
}

export class PropertyValueService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly propertyValueHistory: PropertyValueHistoryRepository,
    private readonly helocCreditLimitService?: HelocCreditLimitService
  ) {}

  private async authorizeMortgage(mortgageId: string, userId: string) {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || mortgage.userId !== userId) {
      return undefined;
    }
    return mortgage;
  }

  /**
   * Update property value and create history entry
   */
  async updatePropertyValue(
    mortgageId: string,
    userId: string,
    input: PropertyValueUpdateInput
  ): Promise<{ valueHistory: any; updatedMortgage: Mortgage | undefined } | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    if (input.propertyValue <= 0) {
      throw new Error("Property value must be greater than zero");
    }

    const valueDate = input.valueDate || new Date().toISOString().split("T")[0];

    // Create property value history entry
    const valueHistory = await this.propertyValueHistory.create({
      mortgageId,
      valueDate,
      propertyValue: input.propertyValue.toFixed(2),
      source: input.source || "user_input",
      notes: input.notes,
    });

    // Update mortgage property price
    const updatedMortgage = await this.mortgages.update(mortgageId, {
      propertyPrice: input.propertyValue.toFixed(2),
    });

    // Recalculate HELOC credit limits if HELOC exists
    if (this.helocCreditLimitService) {
      try {
        await this.helocCreditLimitService.recalculateCreditLimit(mortgageId);
      } catch (error) {
        // Log error but don't fail the update
        console.error("Failed to recalculate HELOC credit limit:", error);
      }
    }

    return { valueHistory, updatedMortgage };
  }

  /**
   * Get property value history for a mortgage
   */
  async getPropertyValueHistory(
    mortgageId: string,
    userId: string
  ): Promise<any[] | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    return this.propertyValueHistory.findByMortgageId(mortgageId);
  }

  /**
   * Get latest property value
   */
  async getLatestPropertyValue(
    mortgageId: string,
    userId: string
  ): Promise<any | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    return this.propertyValueHistory.getLatestByMortgageId(mortgageId);
  }
}

