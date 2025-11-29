import type { Mortgage, MortgagePayment, MortgageTerm } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import type { MortgagePaymentCreateInput } from "@domain/models";
import { validateMortgagePayment } from "@server-shared/calculations/payment-validation";
import { getTermEffectiveRate } from "@server-shared/calculations/term-helpers";
import { isWithinPrepaymentLimit } from "@server-shared/calculations/mortgage";

class PrepaymentLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrepaymentLimitError";
  }
}

export class MortgagePaymentService {
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

  async listByMortgage(mortgageId: string, userId: string): Promise<MortgagePayment[] | undefined> {
    const authorized = await this.authorizeMortgage(mortgageId, userId);
    if (!authorized) {
      return undefined;
    }
    return this.mortgagePayments.findByMortgageId(mortgageId);
  }

  async listByTerm(termId: string, userId: string): Promise<MortgagePayment[] | undefined> {
    const term = await this.authorizeTerm(termId, userId);
    if (!term) {
      return undefined;
    }
    return this.mortgagePayments.findByTermId(termId);
  }

  private async getPreviousPayment(termId: string): Promise<MortgagePayment | undefined> {
    const payments = await this.mortgagePayments.findByTermId(termId);
    return payments.sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    )[0];
  }

  private async getYearToDatePrepayments(mortgageId: string, year: number): Promise<number> {
    const payments = await this.mortgagePayments.findByMortgageId(mortgageId);
    return payments
      .filter((payment) => new Date(payment.paymentDate).getFullYear() === year)
      .reduce((sum, payment) => sum + Number(payment.prepaymentAmount || 0), 0);
  }

  private enforcePrepaymentLimit(
    mortgage: Mortgage,
    paymentDate: string,
    prepaymentAmount: number,
    yearToDate: number,
  ) {
    const annualLimitPercent = mortgage.annualPrepaymentLimitPercent ?? 20;
    const originalAmount = Number(mortgage.originalAmount);
    const withinLimit = isWithinPrepaymentLimit(
      prepaymentAmount,
      yearToDate,
      originalAmount,
      annualLimitPercent,
    );
    if (!withinLimit) {
      const maxAnnual = (originalAmount * annualLimitPercent) / 100;
      throw new PrepaymentLimitError(
        `Annual prepayment limit exceeded. Max ${annualLimitPercent}% of original balance ($${maxAnnual.toFixed(
          2,
        )}) has already been used.`,
      );
    }
  }

  private validateAndNormalizePayment(
    mortgage: Mortgage,
    term: MortgageTerm,
    payload: Omit<MortgagePaymentCreateInput, "mortgageId">,
    previousPayment?: MortgagePayment,
  ) {
    const paymentAmount = Number(payload.paymentAmount);
    const regularPaymentAmount = Number(payload.regularPaymentAmount);
    const prepaymentAmount = Number(payload.prepaymentAmount);

    const validation = validateMortgagePayment({
      mortgage,
      term,
      previousPayment,
      paymentAmount,
      regularPaymentAmount,
      prepaymentAmount,
      remainingAmortizationMonths: payload.remainingAmortizationMonths,
    });

    return {
      ...payload,
      principalPaid: validation.expectedPrincipal.toFixed(2),
      interestPaid: (paymentAmount - validation.expectedPrincipal).toFixed(2),
      remainingBalance: validation.expectedBalance.toFixed(2),
      triggerRateHit: validation.triggerRateHit ? 1 : 0,
      remainingAmortizationMonths: validation.remainingAmortizationMonths,
      effectiveRate: (validation.triggerRateHit
        ? getTermEffectiveRate(term)
        : getTermEffectiveRate(term)
      ).toFixed(3),
    };
  }

  async create(
    mortgageId: string,
    userId: string,
    payload: Omit<MortgagePaymentCreateInput, "mortgageId">,
  ): Promise<MortgagePayment | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }
    const term = await this.mortgageTerms.findById(payload.termId);
    if (!term || term.mortgageId !== mortgageId) {
      return undefined;
    }
    const previousPayment = await this.getPreviousPayment(payload.termId);
    const normalizedPayload = this.validateAndNormalizePayment(
      mortgage,
      term,
      payload,
      previousPayment,
    );
    const paymentYear = new Date(payload.paymentDate).getFullYear();
    const yearToDate = await this.getYearToDatePrepayments(mortgageId, paymentYear);
    this.enforcePrepaymentLimit(
      mortgage,
      payload.paymentDate,
      Number(normalizedPayload.prepaymentAmount || 0),
      yearToDate,
    );
    return this.mortgagePayments.create({
      ...normalizedPayload,
      mortgageId,
    });
  }

  async delete(paymentId: string, userId: string): Promise<boolean> {
    const payment = await this.mortgagePayments.findById(paymentId);
    if (!payment) {
      return false;
    }
    const authorized = await this.authorizeMortgage(payment.mortgageId, userId);
    if (!authorized) {
      return false;
    }
    return this.mortgagePayments.delete(paymentId);
  }
}

