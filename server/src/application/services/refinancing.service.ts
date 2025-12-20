import { MortgagesRepository } from "../../infrastructure/repositories/mortgages.repository";
import { MortgageTermsRepository } from "../../infrastructure/repositories/mortgage-terms.repository";
import { MarketRateService } from "./market-rate.service";
import { calculateStandardPenalty } from "../../domain/calculations/penalty";
import { calculateRefinanceBenefit, RefinanceResult } from "../../domain/calculations/refinance";

export interface RefinanceAnalysis {
  currentRate: number;
  marketRate: number;
  marketRateType: "fixed" | "variable";
  penalty: number;
  monthlySavings: number;
  breakEvenMonths: number;
  isBeneficial: boolean;
  totalTermSavings: number;
}

export class RefinancingService {
  constructor(
    private mortgagesRepo: MortgagesRepository,
    private termsRepo: MortgageTermsRepository,
    private marketRateService: MarketRateService
  ) {}

  async analyzeRefinanceOpportunity(mortgageId: string): Promise<RefinanceAnalysis | null> {
    const mortgage = await this.mortgagesRepo.findById(mortgageId);
    if (!mortgage) return null;

    const terms = await this.termsRepo.findByMortgageId(mortgageId);
    // Sort by start date descending to get active term
    const activeTerm = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];

    if (!activeTerm) return null;

    // 1. Get Data
    const marketRates = await this.marketRateService.getMarketRates();
    const currentRate = activeTerm.fixedRate
      ? parseFloat(activeTerm.fixedRate) / 100
      : (parseFloat(activeTerm.primeRate || "0") + parseFloat(activeTerm.lockedSpread || "0")) /
        100;
    const balance = parseFloat(mortgage.currentBalance);

    // Determine remaining months in TERM (for penalty and logic)
    const today = new Date();
    const endDate = new Date(activeTerm.endDate);
    const remainingTermMonths = Math.max(
      0,
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );

    // Remaining Amortization (approx from data or defaulting to 25 years if new)
    // In a real app we'd track remaining amortization precisely.
    // For MVP, using mortgage.amortizationMonths or calculating from start.
    const amortizationMonths = mortgage.amortizationMonths || 300;

    // 2. Calculate Penalty
    // For comparison rate in IRD, we should use a posted rate.
    // MVP: Using currentRate as comparison -> result is usually 3-month interest.
    const penalty = calculateStandardPenalty(
      balance,
      currentRate,
      currentRate,
      remainingTermMonths
    );

    // 3. Compare against best market option (assuming Fixed 5Yr is usually the target provided)
    // We could compare against both, but let's pick the one with better spread.
    const targetRate = marketRates.fixed5Yr / 100; // Convert to decimal

    const benefit = calculateRefinanceBenefit(
      balance,
      currentRate,
      targetRate,
      amortizationMonths,
      remainingTermMonths,
      penalty.penalty
    );

    return {
      currentRate: currentRate * 100, // Return as percentage for UI
      marketRate: marketRates.fixed5Yr,
      marketRateType: "fixed",
      penalty: penalty.penalty,
      monthlySavings: benefit.monthlySavings,
      breakEvenMonths: benefit.breakEvenMonths,
      isBeneficial: benefit.isBeneficial,
      totalTermSavings: benefit.totalTermSavings,
    };
  }
}
