import type { MortgageTerm, Mortgage } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import type { MortgageTermCreateInput, MortgageTermUpdateInput } from "@domain/models";
import { fetchLatestPrimeRate } from "@server-shared/services/prime-rate";
import { getTermEffectiveRate, shouldUpdatePaymentAmount } from "@server-shared/calculations/term-helpers";
import { calculatePayment, calculateTriggerRate, isTriggerRateHit, type PaymentFrequency } from "@server-shared/calculations/mortgage";

export class MortgageTermService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly mortgagePayments: MortgagePaymentsRepository,
  ) {}

  private async authorizeMortgage(mortgageId: string, userId: string) {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || mortgage.userId !== userId) {
      return undefined;
    }
    return mortgage;
  }

  private async authorizeTerm(termId: string, userId: string) {
    const term = await this.mortgageTerms.findById(termId);
    if (!term) {
      return undefined;
    }
    return (await this.authorizeMortgage(term.mortgageId, userId)) ? term : undefined;
  }

  async getByIdForUser(termId: string, userId: string): Promise<{ term: MortgageTerm; mortgage: Mortgage } | undefined> {
    const term = await this.mortgageTerms.findById(termId);
    if (!term) {
      return undefined;
    }
    const mortgage = await this.authorizeMortgage(term.mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }
    return { term, mortgage };
  }

  async listForMortgage(mortgageId: string, userId: string): Promise<MortgageTerm[] | undefined> {
    const authorized = await this.authorizeMortgage(mortgageId, userId);
    if (!authorized) {
      return undefined;
    }
    return this.mortgageTerms.findByMortgageId(mortgageId);
  }

  async create(
    mortgageId: string,
    userId: string,
    payload: Omit<MortgageTermCreateInput, "mortgageId">,
  ): Promise<MortgageTerm | undefined> {
    const authorized = await this.authorizeMortgage(mortgageId, userId);
    if (!authorized) {
      return undefined;
    }

    // Validate term dates
    const newStartDate = new Date(payload.startDate);
    const newEndDate = new Date(payload.endDate);
    
    // Validate end date is after start date (check this first)
    if (newEndDate <= newStartDate) {
      throw new Error("Term end date must be after start date");
    }
    
    // Validate term length: Canadian mortgage terms are typically 3-5 years
    const termLengthYears = (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (termLengthYears < 2.5 || termLengthYears > 6) {
      throw new Error(
        `Term length must be between 3-5 years (Canadian convention). Current term is ${termLengthYears.toFixed(1)} years.`
      );
    }

    // Validate term dates don't overlap with existing terms
    const existingTerms = await this.mortgageTerms.findByMortgageId(mortgageId);

    for (const existingTerm of existingTerms) {
      const existingStart = new Date(existingTerm.startDate);
      const existingEnd = new Date(existingTerm.endDate);

      // Check for overlap: new term overlaps if it starts before existing ends AND ends after existing starts
      if (newStartDate < existingEnd && newEndDate > existingStart) {
        throw new Error(
          `Term dates overlap with existing term (${existingStart.toISOString().split('T')[0]} to ${existingEnd.toISOString().split('T')[0]})`
        );
      }
    }

    return this.mortgageTerms.create({
      ...payload,
      mortgageId,
    });
  }

  async update(
    termId: string,
    userId: string,
    payload: Partial<Omit<MortgageTermUpdateInput, "mortgageId">>,
  ): Promise<MortgageTerm | undefined> {
    const term = await this.authorizeTerm(termId, userId);
    if (!term) {
      return undefined;
    }

    // Validate term dates don't overlap with other existing terms (excluding this one)
    if (payload.startDate || payload.endDate) {
      const existingTerms = await this.mortgageTerms.findByMortgageId(term.mortgageId);
      const newStartDate = payload.startDate ? new Date(payload.startDate) : new Date(term.startDate);
      const newEndDate = payload.endDate ? new Date(payload.endDate) : new Date(term.endDate);
      
      // Validate end date is after start date (check this first)
      if (newEndDate <= newStartDate) {
        throw new Error("Term end date must be after start date");
      }
      
      // Validate term length: Canadian mortgage terms are typically 3-5 years
      const termLengthYears = (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (termLengthYears < 2.5 || termLengthYears > 6) {
        throw new Error(
          `Term length must be between 3-5 years (Canadian convention). Current term is ${termLengthYears.toFixed(1)} years.`
        );
      }

      for (const existingTerm of existingTerms) {
        // Skip the term being updated
        if (existingTerm.id === termId) {
          continue;
        }

        const existingStart = new Date(existingTerm.startDate);
        const existingEnd = new Date(existingTerm.endDate);

        // Check for overlap
        if (newStartDate < existingEnd && newEndDate > existingStart) {
          throw new Error(
            `Updated term dates overlap with existing term (${existingStart.toISOString().split('T')[0]} to ${existingEnd.toISOString().split('T')[0]})`
          );
        }
      }
    }

    return this.mortgageTerms.update(termId, payload);
  }

  async delete(termId: string, userId: string): Promise<boolean> {
    const term = await this.authorizeTerm(termId, userId);
    if (!term) {
      return false;
    }
    await this.mortgagePayments.deleteByTermId(termId);
    return this.mortgageTerms.delete(termId);
  }

  /**
   * Recalculate payment for a variable rate mortgage term when prime rate changes
   * 
   * For VRM-Changing: Recalculates payment amount based on new rate
   * For VRM-Fixed: Keeps payment same but checks if trigger rate has been hit
   * 
   * @param termId - Term ID to recalculate
   * @param userId - User ID for authorization
   * @param forcePrimeRate - Optional: Force a specific prime rate (for testing)
   * @returns Updated term with new rate and payment (if applicable)
   */
  async recalculatePayment(
    termId: string,
    userId: string,
    forcePrimeRate?: number
  ): Promise<{ term: MortgageTerm; triggerRateHit?: boolean; newPaymentAmount?: number } | undefined> {
    const term = await this.authorizeTerm(termId, userId);
    if (!term) {
      return undefined;
    }

    // Only variable rate mortgages need recalculation
    if (term.termType === "fixed") {
      throw new Error("Cannot recalculate payment for fixed rate mortgage");
    }

    const mortgage = await this.mortgages.findById(term.mortgageId);
    if (!mortgage) {
      return undefined;
    }

    // Fetch latest prime rate (or use forced rate)
    let newPrimeRate: number;
    if (forcePrimeRate !== undefined) {
      newPrimeRate = forcePrimeRate;
    } else {
      try {
        const { primeRate } = await fetchLatestPrimeRate();
        newPrimeRate = primeRate;
      } catch (error) {
        throw new Error("Failed to fetch latest prime rate from Bank of Canada");
      }
    }

    // Update term with new prime rate
    const updatedTerm = await this.mortgageTerms.update(termId, {
      primeRate: newPrimeRate.toFixed(3),
    });

    if (!updatedTerm) {
      return undefined;
    }

    const frequency = term.paymentFrequency as PaymentFrequency;
    const amortizationMonths = (mortgage.amortizationYears * 12) + (mortgage.amortizationMonths ?? 0);
    
    // Get current balance (from latest payment or mortgage current balance)
    const payments = await this.mortgagePayments.findByTermId(termId);
    const latestPayment = payments.length > 0
      ? payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0]
      : null;
    
    const currentBalance = latestPayment
      ? Number(latestPayment.remainingBalance)
      : Number(mortgage.currentBalance);

    const newEffectiveRate = getTermEffectiveRate(updatedTerm);
    const result: { term: MortgageTerm; triggerRateHit?: boolean; newPaymentAmount?: number } = {
      term: updatedTerm,
    };

    if (shouldUpdatePaymentAmount(updatedTerm)) {
      // VRM-Changing: Recalculate payment amount
      const newPaymentAmount = calculatePayment(
        currentBalance,
        newEffectiveRate,
        amortizationMonths,
        frequency
      );
      
      // Update term with new payment amount
      const finalTerm = await this.mortgageTerms.update(termId, {
        regularPaymentAmount: newPaymentAmount.toFixed(2),
      });
      
      if (finalTerm) {
        result.term = finalTerm;
        result.newPaymentAmount = newPaymentAmount;
      }
    } else {
      // VRM-Fixed: Payment stays same, but check trigger rate
      const currentPaymentAmount = Number(term.regularPaymentAmount);
      const triggerRate = calculateTriggerRate(currentPaymentAmount, currentBalance, frequency);
      const triggerRateHit = isTriggerRateHit(newEffectiveRate, currentPaymentAmount, currentBalance, frequency);
      
      result.triggerRateHit = triggerRateHit;
    }

    return result;
  }

  /**
   * Change payment frequency for a mortgage term
   * 
   * Canadian Mortgage Rule:
   * - Frequency changes are allowed but require payment recalculation
   * - Some lenders charge fees for frequency changes (not tracked here)
   * - Payment amount is recalculated based on:
   *   - Current balance
   *   - Current interest rate
   *   - Remaining amortization period
   *   - New payment frequency
   * 
   * @param termId - Term ID to change frequency for
   * @param userId - User ID for authorization
   * @param newFrequency - New payment frequency
   * @returns Updated term with new frequency and payment amount
   */
  async changePaymentFrequency(
    termId: string,
    userId: string,
    newFrequency: PaymentFrequency
  ): Promise<{ term: MortgageTerm; newPaymentAmount: number } | undefined> {
    const term = await this.authorizeTerm(termId, userId);
    if (!term) {
      return undefined;
    }

    const mortgage = await this.mortgages.findById(term.mortgageId);
    if (!mortgage) {
      return undefined;
    }

    // Get current balance (from latest payment or mortgage current balance)
    const payments = await this.mortgagePayments.findByTermId(termId);
    const latestPayment = payments.length > 0
      ? payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0]
      : null;
    
    const currentBalance = latestPayment
      ? Number(latestPayment.remainingBalance)
      : Number(mortgage.currentBalance);

    // Get current effective rate
    const currentRate = getTermEffectiveRate(term);

    // Calculate remaining amortization
    // Use original amortization minus time elapsed, or use remaining amortization from latest payment
    const amortizationYears = mortgage.amortizationYears;
    const amortizationMonths = (amortizationYears * 12) + (mortgage.amortizationMonths ?? 0);
    
    let remainingAmortizationMonths = amortizationMonths;
    if (latestPayment && latestPayment.remainingAmortizationMonths && latestPayment.remainingAmortizationMonths > 0) {
      // Use remaining amortization from latest payment if available
      remainingAmortizationMonths = latestPayment.remainingAmortizationMonths;
    } else {
      // Estimate remaining amortization based on time elapsed
      const mortgageStartDate = new Date(mortgage.startDate);
      const currentDate = latestPayment ? new Date(latestPayment.paymentDate) : new Date();
      const monthsElapsed = (currentDate.getFullYear() - mortgageStartDate.getFullYear()) * 12 +
        (currentDate.getMonth() - mortgageStartDate.getMonth());
      remainingAmortizationMonths = Math.max(1, amortizationMonths - monthsElapsed);
    }

    // Calculate new payment amount for the new frequency
    const newPaymentAmount = calculatePayment(
      currentBalance,
      currentRate,
      remainingAmortizationMonths,
      newFrequency
    );

    // Update term with new frequency and payment amount
    const updatedTerm = await this.mortgageTerms.update(termId, {
      paymentFrequency: newFrequency,
      regularPaymentAmount: newPaymentAmount.toFixed(2),
    });

    if (!updatedTerm) {
      return undefined;
    }

    return {
      term: updatedTerm,
      newPaymentAmount,
    };
  }
}

