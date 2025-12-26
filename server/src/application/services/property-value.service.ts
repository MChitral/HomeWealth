import type { Mortgage } from "@shared/schema";
import {
  MortgagesRepository,
  PropertyValueHistoryRepository,
  HelocAccountRepository,
} from "@infrastructure/repositories";
import { HelocCreditLimitService } from "./heloc-credit-limit.service";
import type { NotificationService } from "./notification.service";

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
    private readonly helocCreditLimitService?: HelocCreditLimitService,
    private readonly helocAccounts?: HelocAccountRepository,
    private readonly notificationService?: NotificationService
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
    let previousCreditLimit = 0;
    let newCreditLimit = 0;

    if (this.helocCreditLimitService && this.helocAccounts) {
      try {
        // Get HELOC accounts for this mortgage
        const helocAccounts = await this.helocAccounts.findByMortgageId(mortgageId);

        for (const helocAccount of helocAccounts) {
          previousCreditLimit = Number(helocAccount.creditLimit);

          // Recalculate credit limit
          await this.helocCreditLimitService.recalculateCreditLimit(mortgageId);

          // Get updated HELOC account to check new limit
          const updatedAccount = await this.helocAccounts.findById(helocAccount.id);
          if (updatedAccount) {
            newCreditLimit = Number(updatedAccount.creditLimit);

            // Check if credit limit increased and send notification
            if (newCreditLimit > previousCreditLimit && this.notificationService) {
              const increase = newCreditLimit - previousCreditLimit;
              await this.notificationService.createNotification(
                mortgage.userId,
                "heloc_credit_limit_increase",
                "HELOC Credit Limit Increased",
                `Your HELOC credit limit has increased by ${increase.toFixed(2)} due to property value update. New limit: ${newCreditLimit.toFixed(2)}.`,
                {
                  mortgageId,
                  helocAccountId: helocAccount.id,
                  previousLimit: previousCreditLimit,
                  newLimit: newCreditLimit,
                  increase: increase,
                  propertyValue: input.propertyValue,
                }
              );
            }
          }
        }
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
  async getPropertyValueHistory(mortgageId: string, userId: string): Promise<any[] | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    return this.propertyValueHistory.findByMortgageId(mortgageId);
  }

  /**
   * Get latest property value
   */
  async getLatestPropertyValue(mortgageId: string, userId: string): Promise<any | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    return this.propertyValueHistory.getLatestByMortgageId(mortgageId);
  }

  /**
   * Get property value trend analysis
   */
  async getPropertyValueTrend(
    mortgageId: string,
    userId: string,
    timeRangeMonths: number = 24
  ): Promise<
    | {
        history: any[];
        averageGrowthRate: number; // Annual percentage
        trendDirection: "increasing" | "decreasing" | "stable";
        projectedValue?: number;
        growthRatePercent: number;
      }
    | undefined
  > {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    const history = await this.propertyValueHistory.findByMortgageId(mortgageId);

    if (history.length === 0) {
      return {
        history: [],
        averageGrowthRate: 0,
        trendDirection: "stable",
        growthRatePercent: 0,
      };
    }

    // Sort by date (oldest first)
    const sortedHistory = history.sort(
      (a, b) => new Date(a.valueDate).getTime() - new Date(b.valueDate).getTime()
    );

    // Filter by time range if specified
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - timeRangeMonths);
    const filteredHistory = sortedHistory.filter(
      (entry) => new Date(entry.valueDate) >= cutoffDate
    );

    if (filteredHistory.length < 2) {
      // Need at least 2 data points for trend analysis
      return {
        history: filteredHistory,
        averageGrowthRate: 0,
        trendDirection: "stable",
        growthRatePercent: 0,
      };
    }

    // Calculate growth rates between consecutive entries
    const growthRates: number[] = [];
    for (let i = 1; i < filteredHistory.length; i++) {
      const prevValue = Number(filteredHistory[i - 1].propertyValue);
      const currValue = Number(filteredHistory[i].propertyValue);
      const prevDate = new Date(filteredHistory[i - 1].valueDate);
      const currDate = new Date(filteredHistory[i].valueDate);

      const monthsDiff =
        (currDate.getFullYear() - prevDate.getFullYear()) * 12 +
        (currDate.getMonth() - prevDate.getMonth());

      if (monthsDiff > 0 && prevValue > 0) {
        // Calculate annualized growth rate
        const totalGrowth = (currValue - prevValue) / prevValue;
        const annualGrowthRate = (Math.pow(1 + totalGrowth, 12 / monthsDiff) - 1) * 100;
        growthRates.push(annualGrowthRate);
      }
    }

    // Calculate average growth rate
    const averageGrowthRate =
      growthRates.length > 0
        ? growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length
        : 0;

    // Determine trend direction
    let trendDirection: "increasing" | "decreasing" | "stable" = "stable";
    if (averageGrowthRate > 1) {
      trendDirection = "increasing";
    } else if (averageGrowthRate < -1) {
      trendDirection = "decreasing";
    }

    // Calculate projected value (1 year from latest entry)
    const latestEntry = filteredHistory[filteredHistory.length - 1];
    const latestValue = Number(latestEntry.propertyValue);
    const projectedValue =
      averageGrowthRate > 0 ? latestValue * (1 + averageGrowthRate / 100) : undefined;

    return {
      history: filteredHistory,
      averageGrowthRate,
      trendDirection,
      projectedValue,
      growthRatePercent: averageGrowthRate,
    };
  }

  /**
   * Calculate projected property value
   */
  async calculateProjectedValue(
    mortgageId: string,
    userId: string,
    monthsAhead: number = 12
  ): Promise<number | undefined> {
    const trend = await this.getPropertyValueTrend(mortgageId, userId);
    if (!trend || !trend.history.length) {
      return undefined;
    }

    const latestEntry = trend.history[trend.history.length - 1];
    const latestValue = Number(latestEntry.propertyValue);

    if (trend.averageGrowthRate === 0) {
      return latestValue;
    }

    // Project value: P * (1 + r/12)^n where r is annual rate and n is months
    const monthlyGrowthRate = trend.averageGrowthRate / 100 / 12;
    return latestValue * Math.pow(1 + monthlyGrowthRate, monthsAhead);
  }
}
