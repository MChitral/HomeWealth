// Touched for tsx refresh
import type { Mortgage, MortgageTerm } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import { calculateTriggerRate, type PaymentFrequency } from "@server-shared/calculations/mortgage";

export interface TriggerRateAlert {
  mortgageId: string;
  mortgageName: string; // "Property Name"
  userId: string;
  currentRate: number;
  triggerRate: number;
  isHit: boolean;
  isRisk: boolean; // Within 0.5%
  balance: number;
  paymentAmount: number;
}

export class TriggerRateMonitor {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly mortgagePayments: MortgagePaymentsRepository
  ) {}

  /**
   * Check all active mortgages for trigger rate risks
   */
  async checkAll(): Promise<TriggerRateAlert[]> {
    const allMortgages = await this.mortgages.findAll();
    const alerts: TriggerRateAlert[] = [];

    for (const mortgage of allMortgages) {
      try {
        const alert = await this.checkOne(mortgage.id);
        if (alert) {
          alerts.push(alert);
        }
      } catch (error) {
        // Log error but continue
        console.error(`Error checking trigger rate for mortgage ${mortgage.id}:`, error);
      }
    }

    return alerts;
  }

  /**
   * Check a single mortgage for trigger rate status
   */
  async checkOne(mortgageId: string): Promise<TriggerRateAlert | null> {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage) return null;

    // 1. Get Active Term
    const terms = await this.mortgageTerms.findByMortgageId(mortgageId);
    const activeTerm = this.findActiveTerm(terms);

    if (!activeTerm) return null;
    if (activeTerm.termType !== "variable-fixed") return null;

    // 2. Get Current Balance
    const balance = await this.getCurrentBalance(mortgage, activeTerm.id);

    // 3. Calculate Trigger Rate
    const frequency = activeTerm.paymentFrequency as PaymentFrequency;
    const paymentAmount = Number(activeTerm.regularPaymentAmount);
    const triggerRate = calculateTriggerRate(paymentAmount, balance, frequency);

    // 4. Check Risk
    // Calculate current rate from Prime + Spread (since it's variable-fixed)
    // activeTerm.primeRate should be the current prime rate (updated by scheduler)
    const prime = Number(activeTerm.primeRate ?? 0);
    const spread = Number(activeTerm.lockedSpread ?? 0);
    const currentRatePercent = prime + spread;
    const currentRateDecimal = currentRatePercent / 100;

    const isHit = currentRateDecimal >= triggerRate;
    const isRisk = !isHit && currentRateDecimal >= triggerRate - 0.005;

    if (isHit || isRisk) {
      return {
        mortgageId: mortgage.id,
        mortgageName: "Mortgage",
        userId: mortgage.userId,
        currentRate: currentRateDecimal,
        triggerRate,
        isHit,
        isRisk,
        balance,
        paymentAmount,
      };
    }

    return null;
  }

  private findActiveTerm(terms: MortgageTerm[]): MortgageTerm | undefined {
    const now = new Date();
    return terms.find((t) => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return now >= start && now <= end;
    });
  }

  private async getCurrentBalance(mortgage: Mortgage, termId: string): Promise<number> {
    // Get last payment to find balance
    const payments = await this.mortgagePayments.findByTermId(termId);
    if (payments.length > 0) {
      // Sort desc by date
      const lastPayment = payments.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )[0];
      return Number(lastPayment.remainingBalance);
    }

    // If no payments yet, use mortgage start balance or current balance field
    // But terms might be later.
    // Usually mortgage.currentBalance is updated?
    // Let's fallback to mortgage.currentBalance if available, or principal.
    return Number(mortgage.currentBalance ?? mortgage.originalAmount);
  }
}
