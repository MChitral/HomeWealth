import { MortgagesRepository } from "../../infrastructure/repositories/mortgages.repository";
import { MortgageTermsRepository } from "../../infrastructure/repositories/mortgage-terms.repository";
import { MarketRateService } from "./market-rate.service";
import { calculateStandardPenalty } from "../../domain/calculations/penalty";
import { calculateRefinanceBenefit } from "../../domain/calculations/refinance";

export interface RefinanceAnalysis {
  currentRate: number;
  marketRate: number;
  marketRateType: "fixed" | "variable";
  penalty: number;
  closingCosts: number;
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

  async analyzeRefinanceOpportunity(
    mortgageId: string,
    closingCosts?: {
      total?: number;
      legalFees?: number;
      appraisalFees?: number;
      dischargeFees?: number;
      otherFees?: number;
    }
  ): Promise<RefinanceAnalysis | null> {
    const mortgage = await this.mortgagesRepo.findById(mortgageId);
    if (!mortgage) return null;

    const terms = await this.termsRepo.findByMortgageId(mortgageId);
    // Sort by start date descending to get active term
    const activeTerm = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];

    if (!activeTerm) return null;

    // 1. Get Data
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

    // 2. Get market rate for IRD calculation
    const termType = activeTerm.termType as "fixed" | "variable-changing" | "variable-fixed";
    const termYears = activeTerm.termYears;
    const marketRateForPenalty =
      (await this.marketRateService.getMarketRate(termType, termYears)) ?? currentRate;

    // 3. Calculate Penalty using real market rate
    const penalty = calculateStandardPenalty(
      balance,
      currentRate,
      marketRateForPenalty,
      remainingTermMonths
    );

    // 4. Compare against best market option (assuming Fixed 5Yr is usually the target provided)
    // We could compare against both, but let's pick the one with better spread.
    const targetRate = (await this.marketRateService.getMarketRate("fixed", 5)) ?? currentRate;

    // Calculate closing costs: use provided total, or sum of breakdown, or default
    let totalClosingCosts = 0;
    if (closingCosts?.total !== undefined && closingCosts.total > 0) {
      totalClosingCosts = closingCosts.total;
    } else if (
      closingCosts?.legalFees ||
      closingCosts?.appraisalFees ||
      closingCosts?.dischargeFees ||
      closingCosts?.otherFees
    ) {
      // Sum up breakdown if provided
      totalClosingCosts =
        (closingCosts.legalFees || 0) +
        (closingCosts.appraisalFees || 0) +
        (closingCosts.dischargeFees || 0) +
        (closingCosts.otherFees || 0);
    } else {
      // Default closing costs estimate (typical closing costs in Canada)
      totalClosingCosts = 1500;
    }

    const benefit = calculateRefinanceBenefit(
      balance,
      currentRate,
      targetRate,
      amortizationMonths,
      remainingTermMonths,
      penalty.penalty,
      totalClosingCosts
    );

    return {
      currentRate: currentRate * 100, // Return as percentage for UI
      marketRate: targetRate * 100, // Return as percentage for UI
      marketRateType: "fixed",
      penalty: penalty.penalty,
      closingCosts: totalClosingCosts,
      monthlySavings: benefit.monthlySavings,
      breakEvenMonths: benefit.breakEvenMonths,
      isBeneficial: benefit.isBeneficial,
      totalTermSavings: benefit.totalTermSavings,
    };
  }
}
