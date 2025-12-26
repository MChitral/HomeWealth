import type { RenewalService } from "./renewal.service";
import type { RefinancingService } from "./refinancing.service";
import type { MarketRateService } from "./market-rate.service";
import type { MortgagesRepository } from "@infrastructure/repositories/mortgages.repository";
import type { MortgageTermsRepository } from "@infrastructure/repositories/mortgage-terms.repository";

export interface RenewalRecommendation {
  recommendation: "stay" | "switch" | "refinance" | "consider_switching";
  reasoning: string;
  confidence: "high" | "medium" | "low";
  stayWithCurrentLender?: {
    estimatedRate: number;
    estimatedPenalty: number;
    estimatedMonthlyPayment: number;
  };
  switchLender?: {
    estimatedRate: number;
    estimatedPenalty: number;
    estimatedClosingCosts: number;
    estimatedMonthlyPayment: number;
    breakEvenMonths: number;
  };
  refinance?: {
    estimatedRate: number;
    estimatedPenalty: number;
    estimatedClosingCosts: number;
    estimatedMonthlyPayment: number;
    monthlySavings: number;
    breakEvenMonths: number;
  };
}

export class RenewalRecommendationService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly renewalService: RenewalService,
    private readonly refinancingService: RefinancingService,
    private readonly marketRateService: MarketRateService
  ) {}

  /**
   * Generate renewal recommendation based on current mortgage terms and market conditions
   */
  async generateRecommendation(mortgageId: string): Promise<RenewalRecommendation | null> {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage) return null;

    const terms = await this.mortgageTerms.findByMortgageId(mortgageId);
    const sortedTerms = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    const currentTerm = sortedTerms[0];
    if (!currentTerm) return null;

    const renewalStatus = await this.renewalService.getRenewalStatus(mortgageId);
    if (!renewalStatus) return null;

    // Get current rate
    const currentRate = renewalStatus.currentRate / 100; // Convert to decimal

    // Get market rate for renewal
    const termType = currentTerm.termType as "fixed" | "variable-changing" | "variable-fixed";
    const termYears = currentTerm.termYears;
    const marketRate =
      (await this.marketRateService.getMarketRate(termType, termYears)) ?? currentRate;

    // Calculate estimated new payment based on market rate
    const currentBalance = Number(mortgage.currentBalance);
    const amortizationMonths = mortgage.amortizationMonths || 300;
    const currentPayment = Number(currentTerm.regularPaymentAmount);

    // Estimate new payment with market rate (simplified calculation)
    const estimatedNewRate = marketRate;
    const monthlyRate = estimatedNewRate / 12;
    const estimatedNewPayment =
      monthlyRate === 0
        ? currentBalance / amortizationMonths
        : (monthlyRate * currentBalance) / (1 - Math.pow(1 + monthlyRate, -amortizationMonths));

    // Get refinancing analysis
    const refinanceAnalysis = await this.refinancingService.analyzeRefinanceOpportunity(mortgageId);
    const penalty = renewalStatus.estimatedPenalty.amount;
    const closingCosts = 1500; // Default estimate for switching lenders

    // Calculate break-even for switching (penalty + closing costs vs savings)
    const monthlySavingsSwitch = currentPayment - estimatedNewPayment;
    const totalCostSwitch = penalty + closingCosts;
    const breakEvenMonthsSwitch =
      monthlySavingsSwitch > 0 ? totalCostSwitch / monthlySavingsSwitch : Infinity;

    // Build recommendation
    const rateDifference = (marketRate - currentRate) * 100; // Percentage points

    let recommendation: "stay" | "switch" | "refinance" | "consider_switching";
    let reasoning: string;
    let confidence: "high" | "medium" | "low" = "medium";

    // Decision logic
    if (
      refinanceAnalysis &&
      refinanceAnalysis.isBeneficial &&
      refinanceAnalysis.breakEvenMonths < 24
    ) {
      recommendation = "refinance";
      reasoning = `Refinancing is beneficial with ${refinanceAnalysis.monthlySavings.toFixed(2)}/month savings and ${refinanceAnalysis.breakEvenMonths.toFixed(1)} month break-even. You'll save approximately $${refinanceAnalysis.totalTermSavings.toFixed(2)} over the term.`;
      confidence = refinanceAnalysis.breakEvenMonths < 12 ? "high" : "medium";
    } else if (rateDifference < -0.25) {
      // Market rates are significantly lower (>0.25% lower)
      if (breakEvenMonthsSwitch < 24) {
        recommendation = "switch";
        reasoning = `Market rates are ${Math.abs(rateDifference).toFixed(2)}% lower than your current rate. Switching lenders could save you $${monthlySavingsSwitch.toFixed(2)}/month with a ${breakEvenMonthsSwitch.toFixed(1)} month break-even period.`;
        confidence = breakEvenMonthsSwitch < 12 ? "high" : "medium";
      } else {
        recommendation = "consider_switching";
        reasoning = `Market rates are ${Math.abs(rateDifference).toFixed(2)}% lower, but switching costs (penalty + closing) make the break-even period ${breakEvenMonthsSwitch.toFixed(1)} months. Consider staying if you plan to move soon.`;
        confidence = "low";
      }
    } else if (rateDifference > 0.25) {
      // Market rates are significantly higher (>0.25% higher)
      recommendation = "stay";
      reasoning = `Market rates are ${rateDifference.toFixed(2)}% higher than your current rate. Your current rate is favorable - staying with your current lender is recommended.`;
      confidence = "high";
    } else {
      // Rates are similar (within 0.25%)
      recommendation = "stay";
      reasoning = `Market rates are similar to your current rate (${rateDifference > 0 ? "+" : ""}${rateDifference.toFixed(2)}%). Staying with your current lender avoids penalties and closing costs.`;
      confidence = "medium";
    }

    const result: RenewalRecommendation = {
      recommendation,
      reasoning,
      confidence,
      stayWithCurrentLender: {
        estimatedRate: marketRate * 100,
        estimatedPenalty: 0, // No penalty for staying
        estimatedMonthlyPayment: estimatedNewPayment,
      },
      switchLender: {
        estimatedRate: marketRate * 100,
        estimatedPenalty: penalty,
        estimatedClosingCosts: closingCosts,
        estimatedMonthlyPayment: estimatedNewPayment,
        breakEvenMonths: breakEvenMonthsSwitch,
      },
    };

    if (refinanceAnalysis) {
      result.refinance = {
        estimatedRate: refinanceAnalysis.marketRate * 100,
        estimatedPenalty: refinanceAnalysis.penalty,
        estimatedClosingCosts: refinanceAnalysis.closingCosts,
        estimatedMonthlyPayment: currentPayment - refinanceAnalysis.monthlySavings,
        monthlySavings: refinanceAnalysis.monthlySavings,
        breakEvenMonths: refinanceAnalysis.breakEvenMonths,
      };
    }

    return result;
  }
}
