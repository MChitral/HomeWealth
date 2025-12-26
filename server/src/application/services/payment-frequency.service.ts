import type { Mortgage, MortgageTerm, PaymentFrequencyChangeEvent } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  PaymentFrequencyChangeEventsRepository,
} from "@infrastructure/repositories";
import {
  calculatePaymentForFrequency,
  type PaymentFrequencyChangeResult,
} from "@domain/calculations/payment-frequency";
import { getTermEffectiveRate } from "@server-shared/calculations/term-helpers";
import type { PaymentFrequency } from "@server-shared/calculations/mortgage";

export interface PaymentFrequencyChangeInput {
  mortgageId: string;
  termId: string;
  newFrequency: PaymentFrequency;
  changeDate?: string; // Optional, defaults to today
}

export interface PaymentFrequencyChangeCalculationResult extends PaymentFrequencyChangeResult {
  canChange: boolean;
  message?: string;
}

export class PaymentFrequencyService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly paymentFrequencyChangeEvents: PaymentFrequencyChangeEventsRepository
  ) {}

  private async authorizeMortgage(mortgageId: string, userId: string) {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || mortgage.userId !== userId) {
      return undefined;
    }
    return mortgage;
  }

  private async getCurrentBalance(mortgage: Mortgage, _termId: string): Promise<number> {
    // For simplicity, use mortgage currentBalance
    // In a real implementation, you'd get the latest payment balance
    return Number(mortgage.currentBalance);
  }

  /**
   * Calculate payment frequency change impact without applying it
   */
  async calculateFrequencyChangeImpact(
    mortgageId: string,
    termId: string,
    userId: string,
    newFrequency: PaymentFrequency
  ): Promise<PaymentFrequencyChangeCalculationResult | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    const term = await this.mortgageTerms.findById(termId);
    if (!term || term.mortgageId !== mortgageId) {
      return {
        oldFrequency: mortgage.paymentFrequency as PaymentFrequency,
        newFrequency,
        oldPaymentAmount: 0,
        newPaymentAmount: 0,
        paymentDifference: 0,
        remainingTermMonths: 0,
        canChange: false,
        message: "Term not found or does not belong to this mortgage",
      };
    }

    const currentBalance = await this.getCurrentBalance(mortgage, termId);
    const currentPaymentAmount = Number(term.regularPaymentAmount);
    const oldFrequency = term.paymentFrequency as PaymentFrequency;

    // Validate that frequency is actually changing
    if (oldFrequency === newFrequency) {
      return {
        oldFrequency,
        newFrequency,
        oldPaymentAmount: currentPaymentAmount,
        newPaymentAmount: currentPaymentAmount,
        paymentDifference: 0,
        remainingTermMonths: mortgage.amortizationMonths || 0,
        canChange: false,
        message: "New frequency must be different from current frequency",
      };
    }

    // Get effective interest rate
    const effectiveRate = getTermEffectiveRate(term);

    // Get remaining amortization (simplified - in real app, calculate from payments)
    const remainingTermMonths = mortgage.amortizationMonths || 300;

    try {
      // Calculate new payment amount
      const result = calculatePaymentForFrequency(
        currentBalance,
        effectiveRate,
        remainingTermMonths,
        oldFrequency,
        newFrequency,
        currentPaymentAmount
      );

      return {
        ...result,
        canChange: true,
      };
    } catch (error) {
      return {
        oldFrequency,
        newFrequency,
        oldPaymentAmount: currentPaymentAmount,
        newPaymentAmount: currentPaymentAmount,
        paymentDifference: 0,
        remainingTermMonths,
        canChange: false,
        message: error instanceof Error ? error.message : "Failed to calculate frequency change",
      };
    }
  }

  /**
   * Apply payment frequency change (update term and create event)
   */
  async applyFrequencyChange(
    mortgageId: string,
    termId: string,
    userId: string,
    input: PaymentFrequencyChangeInput
  ): Promise<
    { changeEvent: PaymentFrequencyChangeEvent; updatedTerm: MortgageTerm | undefined } | undefined
  > {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    // Calculate change first
    const calculation = await this.calculateFrequencyChangeImpact(
      mortgageId,
      termId,
      userId,
      input.newFrequency
    );
    if (!calculation || !calculation.canChange) {
      throw new Error(calculation?.message || "Cannot apply frequency change");
    }

    const term = await this.mortgageTerms.findById(termId);
    if (!term) {
      throw new Error("Term not found");
    }

    const changeDate = input.changeDate || new Date().toISOString().split("T")[0];

    // Calculate remaining term months
    const today = new Date();
    const endDate = new Date(term.endDate);
    const remainingTermMonths = Math.max(
      0,
      Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    );

    // Create frequency change event
    const changeEvent = await this.paymentFrequencyChangeEvents.create({
      mortgageId,
      termId,
      changeDate,
      oldFrequency: calculation.oldFrequency,
      newFrequency: calculation.newFrequency,
      oldPaymentAmount: calculation.oldPaymentAmount.toFixed(2),
      newPaymentAmount: calculation.newPaymentAmount.toFixed(2),
      remainingTermMonths,
      description: `Payment frequency changed from ${calculation.oldFrequency} to ${calculation.newFrequency}`,
    });

    // Update term payment frequency and amount
    const updatedTerm = await this.mortgageTerms.update(termId, {
      paymentFrequency: calculation.newFrequency,
      regularPaymentAmount: calculation.newPaymentAmount.toFixed(2),
    });

    // Update mortgage payment frequency
    await this.mortgages.update(mortgageId, {
      paymentFrequency: calculation.newFrequency,
    });

    return { changeEvent, updatedTerm };
  }

  /**
   * Get payment frequency change history for a mortgage
   */
  async getFrequencyChangeHistory(
    mortgageId: string,
    userId: string
  ): Promise<PaymentFrequencyChangeEvent[] | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    return this.paymentFrequencyChangeEvents.findByMortgageId(mortgageId);
  }
}
