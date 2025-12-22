import { MortgageTerm, Mortgage } from "@shared/schema";
import { calculatePayment, type PaymentFrequency } from "@server-shared/calculations/mortgage";
import { TriggerRateMonitor } from "./trigger-rate-monitor";
import { MortgagesRepository, MortgagePaymentsRepository } from "@infrastructure/repositories";

export interface ImpactResult {
  termId: string;
  mortgageId: string;
  impactType: "payment_increase" | "trigger_risk";
  oldValue: number;
  newValue: number;
  delta: number;
  message: string;
}

export class ImpactCalculator {
  // Simple in-memory cache for MVP. In production, use Redis or DB table `calculated_impacts`.
  private impactCache = new Map<string, ImpactResult>();

  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgagePayments: MortgagePaymentsRepository,
    private readonly triggerMonitor: TriggerRateMonitor
  ) {}

  /**
   * Get the latest calculated impact for a mortgage
   */
  getLatestImpact(mortgageId: string): ImpactResult | undefined {
    // Look for impact where mortgageId matches
    // Since cache is by termId (maybe?), let's iterate or change key.
    // A mortgage usually has one active term.
    const impacts = Array.from(this.impactCache.values());
    for (const impact of impacts) {
      if (impact.mortgageId === mortgageId) {
        return impact;
      }
    }
    return undefined;
  }

  /**
   * Simulate an impact for a specific mortgage (for MVP verification/demo)
   */
  async simulateImpact(
    _mortgageId: string,
    _oldRate: number,
    _newRate: number
  ): Promise<ImpactResult | null> {
    // MVP: Simulation logic is not yet implemented.
    // Use the explicit calculateImpacts flow for now.
    return null;
  }

  /**
   * Calculate impact for a list of updated VRM terms
   */
  async calculateImpacts(
    terms: MortgageTerm[],
    oldPrimeRate: number,
    newPrimeRate: number
  ): Promise<ImpactResult[]> {
    const results: ImpactResult[] = [];

    for (const term of terms) {
      try {
        const impact = await this.calculateTermImpact(term, oldPrimeRate, newPrimeRate);
        if (impact) {
          results.push(impact);
          this.impactCache.set(term.id, impact); // Cache it
        }
      } catch (error) {
        console.error(`Error calculating impact for term ${term.id}:`, error);
      }
    }

    return results;
  }

  private async calculateTermImpact(
    term: MortgageTerm,
    oldPrime: number,
    newPrime: number
  ): Promise<ImpactResult | null> {
    const mortgage = await this.mortgages.findById(term.mortgageId);
    if (!mortgage) return null;

    // 1. VRM - Adjustable Payment (Variable-Changing)
    if (term.termType === "variable-changing") {
      return this.calculatePaymentImpact(term, mortgage, oldPrime, newPrime);
    }

    // 2. VRM - Fixed Payment (Variable-Fixed)
    if (term.termType === "variable-fixed") {
      return this.calculateTriggerImpact(term, mortgage, newPrime);
    }

    return null;
  }

  private async calculatePaymentImpact(
    term: MortgageTerm,
    mortgage: Mortgage,
    oldPrime: number,
    newPrime: number
  ): Promise<ImpactResult> {
    // Re-calculate payment with new rate
    // New Rate = New Prime + Spread
    const spread = Number(term.lockedSpread ?? 0);
    const newRateDecimal = (newPrime + spread) / 100;

    // Need current balance
    const balance = await this.getCurrentBalance(mortgage, term.id);

    // Remaining amortization
    const remainingMonths = Math.max(1, mortgage.amortizationMonths); // Simplified: usually tracked in payments

    // Calculate new payment
    // Note: In reality, we need remaining amortization from last payment
    const newPayment = calculatePayment(
      balance,
      newRateDecimal,
      remainingMonths,
      term.paymentFrequency as PaymentFrequency
    );

    const oldPayment = Number(term.regularPaymentAmount);
    const delta = newPayment - oldPayment;

    return {
      termId: term.id,
      mortgageId: mortgage.id,
      impactType: "payment_increase",
      oldValue: oldPayment,
      newValue: newPayment,
      delta,
      message: `Your payment will increase by $${delta.toFixed(2)}`,
    };
  }

  private async calculateTriggerImpact(
    term: MortgageTerm,
    mortgage: Mortgage,
    _newPrime: number
  ): Promise<ImpactResult | null> {
    // Check new trigger status
    // Reuse TriggerRateMonitor logic?
    // TriggerMonitor.checkOne returns status. We need before/after?
    // Actually, just knowing the "New Distance to Trigger" is valuable.

    const alert = await this.triggerMonitor.checkOne(mortgage.id);

    if (alert) {
      return {
        termId: term.id,
        mortgageId: mortgage.id,
        impactType: "trigger_risk",
        oldValue: 0, // Not tracking old
        newValue: alert.currentRate,
        delta: 0,
        message: alert.isHit ? "Trigger Rate HIT" : "Approaching Trigger Rate",
      };
    }

    return null;
  }

  private async getCurrentBalance(mortgage: Mortgage, termId: string): Promise<number> {
    const payments = await this.mortgagePayments.findByTermId(termId);
    if (payments.length > 0) {
      const lastPayment = payments.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )[0];
      return Number(lastPayment.remainingBalance);
    }
    return Number(mortgage.currentBalance ?? mortgage.originalAmount);
  }
}
