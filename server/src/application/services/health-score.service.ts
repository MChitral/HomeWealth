import { MortgagesRepository } from "../../infrastructure/repositories/mortgages.repository";
import { MortgageTermsRepository } from "../../infrastructure/repositories/mortgage-terms.repository";

import {
  HealthScoreEngine,
  HealthScoreInput,
  HealthScoreResult,
} from "../../domain/health/health-score.engine";
import { MarketRateService } from "./market-rate.service";

export class HealthScoreService {
  private engine: HealthScoreEngine;

  constructor(
    private mortgagesRepo: MortgagesRepository,
    private termsRepo: MortgageTermsRepository,
    private marketRateService: MarketRateService
  ) {
    this.engine = new HealthScoreEngine();
  }

  async calculateHealthScore(mortgageId: string): Promise<HealthScoreResult | null> {
    const mortgage = await this.mortgagesRepo.findById(mortgageId);
    if (!mortgage) return null;

    const terms = await this.termsRepo.findByMortgageId(mortgageId);
    const activeTerm = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];

    if (!activeTerm) return null;

    // Determine Logic Variables
    const balance = parseFloat(mortgage.currentBalance);
    const originalBalance = parseFloat(mortgage.originalAmount); // approximation if not in term

    // Rates
    let currentRate = 0;
    if (activeTerm.termType === "fixed" && activeTerm.fixedRate) {
      currentRate = parseFloat(activeTerm.fixedRate) / 100;
    } else if (activeTerm.primeRate && activeTerm.lockedSpread) {
      // ideally we get current prime from PrimeRateService, but for now use term snapshot or
      // better yet, we should inject PrimeRateService to get REAL current rate
      // For MVP, simplifying to term snapshot + spread if current prime not available
      currentRate = (parseFloat(activeTerm.primeRate) + parseFloat(activeTerm.lockedSpread)) / 100;
    }

    // Trigger Rate Calculation (for VRM-Fixed Payment only)
    let triggerRate: number | null = null;
    if (activeTerm.termType === "variable-fixed") {
      // Trigger Rate = (Payment * Frequency) / Balance
      // We need annual payment amount
      const paymentAmt = parseFloat(activeTerm.regularPaymentAmount);
      let frequency = 12; // default monthly
      if (activeTerm.paymentFrequency.includes("biweekly")) frequency = 26;
      if (activeTerm.paymentFrequency.includes("weekly")) frequency = 52;
      if (activeTerm.paymentFrequency === "semi-monthly") frequency = 24;

      const annualPayment = paymentAmt * frequency;
      // Trigger rate is when Interest Cost = Payment Amount
      // Interest Cost = Balance * Rate
      // So Rate = Payment / Balance
      if (balance > 0) {
        triggerRate = annualPayment / balance;
      }
    }

    // Market Rate (Benchmark)
    const marketRate = await this.marketRateService.getBestRate("5-year-fixed"); // Simple benchmark

    // Prepayment Usage
    // Mortgage has annual prepayment limit percent (e.g. 20%)
    // Limit = Original Principal * Percent
    const limitPercent = mortgage.annualPrepaymentLimitPercent || 20;
    const prepaymentLimit = parseFloat(mortgage.originalAmount) * (limitPercent / 100);
    const prepaymentUsed = 0; // Placeholder until PrepaymentEvent repo is connected here

    // Months to Renewal
    const today = new Date();
    const endDate = new Date(activeTerm.endDate);
    const monthsToRenewal = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);

    const input: HealthScoreInput = {
      mortgageBalance: balance,
      originalBalance: originalBalance,
      currentRate,
      marketRate,
      triggerRate,
      monthsToRenewal,
      annualPrepaymentLimit: prepaymentLimit,
      prepaymentUsed,
    };

    return this.engine.calculate(input);
  }
}
