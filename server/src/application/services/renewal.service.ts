import { MortgagesRepository } from "../../infrastructure/repositories/mortgages.repository";
import { MortgageTermsRepository } from "../../infrastructure/repositories/mortgage-terms.repository";
import { RenewalHistoryRepository } from "../../infrastructure/repositories/renewal-history.repository";
import { calculateStandardPenalty } from "../../domain/calculations/penalty";
import type { MarketRateService } from "./market-rate.service";

export type RenewalStatus = "urgent" | "soon" | "upcoming" | "safe";

export interface RenewalInfo {
  mortgageId: string;
  daysUntilRenewal: number;
  renewalDate: string;
  status: RenewalStatus;
  currentRate: number;
  estimatedPenalty: {
    amount: number;
    method: "IRD" | "3-Month Interest";
  };
}

export interface RenewalHistoryEntry {
  id: string;
  mortgageId: string;
  termId: string;
  renewalDate: string;
  previousRate: number;
  newRate: number;
  decisionType: "stayed" | "switched" | "refinanced";
  lenderName?: string | null;
  estimatedSavings?: number | null;
  notes?: string | null;
  createdAt: Date;
}

export interface RenewalPerformance {
  totalRenewals: number;
  averageRateChange: number;
  totalEstimatedSavings: number;
  lastRenewalDate?: string;
  lastRenewalRate?: number;
}

export interface RenewalRateComparison {
  currentRate: number;
  previousRate?: number;
  rateChange?: number;
  rateChangePercent?: number;
}

export class RenewalService {
  constructor(
    private mortgagesRepo: MortgagesRepository,
    private mortgageTermsRepo: MortgageTermsRepository,
    private renewalHistoryRepo: RenewalHistoryRepository,
    private marketRateService: MarketRateService
  ) {}

  async getRenewalStatus(mortgageId: string): Promise<RenewalInfo | null> {
    const mortgage = await this.mortgagesRepo.findById(mortgageId);
    if (!mortgage) return null;

    const terms = await this.mortgageTermsRepo.findByMortgageId(mortgageId);

    // Sort terms to find the active one (start date descending)
    const sortedTerms = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    const activeTerm = sortedTerms[0];

    if (!activeTerm) return null;

    const endDate = new Date(activeTerm.endDate);
    const today = new Date();

    // Calculate days remaining
    const timeDiff = endDate.getTime() - today.getTime();
    const daysUntilRenewal = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Determine status
    let status: RenewalStatus = "safe";
    if (daysUntilRenewal <= 90)
      status = "urgent"; // < 3 months
    else if (daysUntilRenewal <= 180)
      status = "soon"; // < 6 months
    else if (daysUntilRenewal <= 365) status = "upcoming"; // < 1 year

    // Calculate Penalty (Assumption: Breaking today)
    // For MVP, we use the active term's interest rate.
    // If it's a VRM, we should ideally use the current effective rate, but for now we'll use the term's rate or derived.
    const currentRate = activeTerm.fixedRate
      ? Number(activeTerm.fixedRate) / 100
      : (Number(activeTerm.primeRate || 0) + Number(activeTerm.lockedSpread || 0)) / 100;

    // Fetch real market rate for IRD calculation
    const termType = activeTerm.termType as "fixed" | "variable-changing" | "variable-fixed";
    const termYears = activeTerm.termYears;
    const marketRate =
      (await this.marketRateService.getMarketRate(termType, termYears)) ?? currentRate; // Fallback to current rate if market rate unavailable

    // We need current balance. This is expensive to calc real-time if we don't have it handy.
    // For MVP, we'll use the mortgage's last known balance or original amount as a proxy if payments aren't up to date.
    // Ideally, we'd sum all payments.
    // Let's rely on the simple Term balance logic for now or the mortgage currentBalance field if maintained.
    const currentBalance = Number(mortgage.currentBalance);

    const penalty = calculateStandardPenalty(
      currentBalance,
      currentRate,
      marketRate,
      Math.max(0, daysUntilRenewal / 30) // Remaining months
    );

    return {
      mortgageId,
      daysUntilRenewal,
      renewalDate: activeTerm.endDate,
      status,
      currentRate: currentRate * 100,
      estimatedPenalty: {
        amount: penalty.penalty,
        method: penalty.method,
      },
    };
  }

  /**
   * Get renewal history for a mortgage
   */
  async getRenewalHistory(mortgageId: string): Promise<RenewalHistoryEntry[]> {
    const history = await this.renewalHistoryRepo.findByMortgageId(mortgageId);
    return history.map((entry) => ({
      id: entry.id,
      mortgageId: entry.mortgageId,
      termId: entry.termId,
      renewalDate: entry.renewalDate,
      previousRate: Number(entry.previousRate) * 100, // Convert to percentage
      newRate: Number(entry.newRate) * 100, // Convert to percentage
      decisionType: entry.decisionType as "stayed" | "switched" | "refinanced",
      lenderName: entry.lenderName,
      estimatedSavings: entry.estimatedSavings ? Number(entry.estimatedSavings) : null,
      notes: entry.notes,
      createdAt: entry.createdAt,
    }));
  }

  /**
   * Record a renewal decision
   */
  async recordRenewalDecision(
    mortgageId: string,
    termId: string,
    renewalDate: string,
    previousRate: number,
    newRate: number,
    decisionType: "stayed" | "switched" | "refinanced",
    lenderName?: string,
    estimatedSavings?: number,
    notes?: string
  ): Promise<RenewalHistoryEntry> {
    const history = await this.renewalHistoryRepo.create({
      mortgageId,
      termId,
      renewalDate,
      previousRate: (previousRate / 100).toFixed(3), // Store as decimal
      newRate: (newRate / 100).toFixed(3), // Store as decimal
      decisionType,
      lenderName,
      estimatedSavings: estimatedSavings ? estimatedSavings.toFixed(2) : undefined,
      notes,
    });

    return {
      id: history.id,
      mortgageId: history.mortgageId,
      termId: history.termId,
      renewalDate: history.renewalDate,
      previousRate: Number(history.previousRate) * 100,
      newRate: Number(history.newRate) * 100,
      decisionType: history.decisionType as "stayed" | "switched" | "refinanced",
      lenderName: history.lenderName,
      estimatedSavings: history.estimatedSavings ? Number(history.estimatedSavings) : null,
      notes: history.notes,
      createdAt: history.createdAt,
    };
  }

  /**
   * Compare current renewal rate with previous renewal rate
   */
  async compareRenewalRates(mortgageId: string): Promise<RenewalRateComparison> {
    const renewalStatus = await this.getRenewalStatus(mortgageId);
    if (!renewalStatus) {
      throw new Error("Mortgage renewal status not found");
    }

    const history = await this.getRenewalHistory(mortgageId);
    const lastRenewal = history[0]; // Most recent renewal (sorted by date desc)

    const currentRate = renewalStatus.currentRate;

    if (!lastRenewal) {
      return {
        currentRate,
      };
    }

    const previousRate = lastRenewal.newRate;
    const rateChange = currentRate - previousRate;
    const rateChangePercent = (rateChange / previousRate) * 100;

    return {
      currentRate,
      previousRate,
      rateChange,
      rateChangePercent,
    };
  }

  /**
   * Calculate renewal performance metrics
   */
  async calculateRenewalPerformance(mortgageId: string): Promise<RenewalPerformance> {
    const history = await this.getRenewalHistory(mortgageId);

    if (history.length === 0) {
      return {
        totalRenewals: 0,
        averageRateChange: 0,
        totalEstimatedSavings: 0,
      };
    }

    const rateChanges: number[] = [];
    let totalSavings = 0;

    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      const rateChange = entry.newRate - entry.previousRate;
      rateChanges.push(rateChange);

      if (entry.estimatedSavings !== null && entry.estimatedSavings !== undefined) {
        totalSavings += entry.estimatedSavings;
      }
    }

    const averageRateChange =
      rateChanges.reduce((sum, change) => sum + change, 0) / rateChanges.length;

    const lastRenewal = history[0];

    return {
      totalRenewals: history.length,
      averageRateChange,
      totalEstimatedSavings: totalSavings,
      lastRenewalDate: lastRenewal.renewalDate,
      lastRenewalRate: lastRenewal.newRate,
    };
  }
}
