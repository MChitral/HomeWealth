import type { Mortgage, MortgageTerm, RecastEvent } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
  RecastEventsRepository,
} from "@infrastructure/repositories";
import { calculateRecastPayment, type RecastResult } from "@domain/calculations/recast";
import { getTermEffectiveRate } from "@server-shared/calculations/term-helpers";
import type { PaymentFrequency } from "@server-shared/calculations/mortgage";

export interface RecastCalculationInput {
  mortgageId: string;
  prepaymentAmount: number;
  recastDate?: string; // Optional, defaults to today
}

export interface RecastCalculationResult extends RecastResult {
  canRecast: boolean;
  message?: string;
}

export class RecastService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly mortgagePayments: MortgagePaymentsRepository,
    private readonly recastEvents: RecastEventsRepository
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
    // Find the term that is currently active (today is between start and end date)
    const activeTerm = sortedTerms.find((term) => {
      const startDate = new Date(term.startDate);
      const endDate = new Date(term.endDate);
      return today >= startDate && today <= endDate;
    });

    // If no active term, return the most recent term
    return activeTerm || sortedTerms[0];
  }

  private async getCurrentBalance(mortgage: Mortgage, termId: string): Promise<number> {
    // Get the latest payment for this term to find current balance
    const payments = await this.mortgagePayments.findByTermId(termId);
    if (payments.length > 0) {
      const lastPayment = payments.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )[0];
      return Number(lastPayment.remainingBalance);
    }

    // If no payments, use mortgage currentBalance
    return Number(mortgage.currentBalance);
  }

  private async getCurrentPaymentAmount(term: MortgageTerm): Promise<number> {
    return Number(term.regularPaymentAmount);
  }

  /**
   * Calculate recast impact without applying it
   */
  async calculateRecast(
    mortgageId: string,
    userId: string,
    input: RecastCalculationInput
  ): Promise<RecastCalculationResult | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    const activeTerm = await this.getActiveTerm(mortgageId);
    if (!activeTerm) {
      return {
        previousBalance: 0,
        newBalance: 0,
        previousPaymentAmount: 0,
        newPaymentAmount: 0,
        paymentReduction: 0,
        remainingAmortizationMonths: 0,
        canRecast: false,
        message: "No active term found for this mortgage",
      };
    }

    // Get current balance and payment amount
    const currentBalance = await this.getCurrentBalance(mortgage, activeTerm.id);
    const currentPaymentAmount = await this.getCurrentPaymentAmount(activeTerm);

    // Validate prepayment amount
    if (input.prepaymentAmount <= 0) {
      return {
        previousBalance: currentBalance,
        newBalance: currentBalance,
        previousPaymentAmount: currentPaymentAmount,
        newPaymentAmount: currentPaymentAmount,
        paymentReduction: 0,
        remainingAmortizationMonths: mortgage.amortizationMonths || 0,
        canRecast: false,
        message: "Prepayment amount must be greater than zero",
      };
    }

    if (input.prepaymentAmount >= currentBalance) {
      return {
        previousBalance: currentBalance,
        newBalance: 0,
        previousPaymentAmount: currentPaymentAmount,
        newPaymentAmount: 0,
        paymentReduction: currentPaymentAmount,
        remainingAmortizationMonths: 0,
        canRecast: false,
        message: "Prepayment amount cannot exceed current balance",
      };
    }

    // Get remaining amortization
    const payments = await this.mortgagePayments.findByTermId(activeTerm.id);
    let remainingAmortizationMonths = mortgage.amortizationMonths || 300;
    if (payments.length > 0) {
      const lastPayment = payments.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )[0];
      remainingAmortizationMonths = lastPayment.remainingAmortizationMonths;
    }

    // Get effective interest rate
    const effectiveRate = getTermEffectiveRate(activeTerm);
    const paymentFrequency = activeTerm.paymentFrequency as PaymentFrequency;

    try {
      // Calculate recast
      const recastResult = calculateRecastPayment(
        currentBalance,
        input.prepaymentAmount,
        effectiveRate,
        remainingAmortizationMonths,
        paymentFrequency,
        currentPaymentAmount
      );

      return {
        ...recastResult,
        canRecast: true,
      };
    } catch (error) {
      return {
        previousBalance: currentBalance,
        newBalance: currentBalance,
        previousPaymentAmount: currentPaymentAmount,
        newPaymentAmount: currentPaymentAmount,
        paymentReduction: 0,
        remainingAmortizationMonths,
        canRecast: false,
        message: error instanceof Error ? error.message : "Failed to calculate recast",
      };
    }
  }

  /**
   * Apply recast to mortgage (update payment amount and create recast event)
   */
  async applyRecast(
    mortgageId: string,
    userId: string,
    input: RecastCalculationInput
  ): Promise<{ recastEvent: RecastEvent; updatedTerm: MortgageTerm | undefined } | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    // Calculate recast first
    const calculation = await this.calculateRecast(mortgageId, userId, input);
    if (!calculation || !calculation.canRecast) {
      throw new Error(calculation?.message || "Cannot apply recast");
    }

    const activeTerm = await this.getActiveTerm(mortgageId);
    if (!activeTerm) {
      throw new Error("No active term found");
    }

    const recastDate = input.recastDate || new Date().toISOString().split("T")[0];

    // Create recast event
    const recastEvent = await this.recastEvents.create({
      mortgageId,
      termId: activeTerm.id,
      recastDate,
      prepaymentAmount: input.prepaymentAmount.toFixed(2),
      previousBalance: calculation.previousBalance.toFixed(2),
      newBalance: calculation.newBalance.toFixed(2),
      previousPaymentAmount: calculation.previousPaymentAmount.toFixed(2),
      newPaymentAmount: calculation.newPaymentAmount.toFixed(2),
      remainingAmortizationMonths: calculation.remainingAmortizationMonths,
      description: `Recast after prepayment of $${input.prepaymentAmount.toFixed(2)}`,
    });

    // Update mortgage current balance
    await this.mortgages.update(mortgageId, {
      currentBalance: calculation.newBalance.toFixed(2),
    });

    // Update term payment amount
    const updatedTerm = await this.mortgageTerms.update(activeTerm.id, {
      regularPaymentAmount: calculation.newPaymentAmount.toFixed(2),
    });

    return { recastEvent, updatedTerm };
  }

  /**
   * Get recast history for a mortgage
   */
  async getRecastHistory(mortgageId: string, userId: string): Promise<RecastEvent[] | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    return this.recastEvents.findByMortgageId(mortgageId);
  }
}
