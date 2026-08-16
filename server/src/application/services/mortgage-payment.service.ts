import type { Mortgage, MortgagePayment, MortgageTerm } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
  PrimeRateHistoryRepository,
} from "@infrastructure/repositories";
import type { MortgagePaymentCreateInput, MortgagePaymentUpdateInput } from "@domain/models";
import { validateMortgagePayment } from "@server-shared/calculations/payment-validation";
import { getTermEffectiveRate } from "@server-shared/calculations/term-helpers";
import { isWithinPrepaymentLimit } from "@server-shared/calculations/mortgage";
import { calculatePrepaymentWithPenalty } from "@domain/calculations/prepayment-penalty";
import { db } from "@infrastructure/db/connection";
import {
  calculateSkippedPayment,
  canSkipPayment,
  countSkippedPaymentsInYear,
} from "@server-shared/calculations/payment-skipping";
import type { PaymentFrequency } from "@server-shared/calculations/mortgage";
import { adjustToBusinessDay } from "@server-shared/utils/business-days";
import { HelocCreditLimitService } from "./heloc-credit-limit.service";
import type { InterestRateSegment } from "@server-shared/calculations/interest-accrual";

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
    private readonly helocCreditLimitService?: HelocCreditLimitService,
    private readonly primeRateHistory?: PrimeRateHistoryRepository
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
    return this.sortPaymentsChronologically(
      await this.mortgagePayments.findByMortgageId(mortgageId)
    );
  }

  async listByTerm(termId: string, userId: string): Promise<MortgagePayment[] | undefined> {
    const term = await this.authorizeTerm(termId, userId);
    if (!term) {
      return undefined;
    }
    return this.sortPaymentsChronologically(await this.mortgagePayments.findByTermId(termId));
  }

  async getByIdForUser(paymentId: string, userId: string): Promise<MortgagePayment | undefined> {
    const payment = await this.mortgagePayments.findById(paymentId);
    if (!payment) {
      return undefined;
    }
    const authorized = await this.authorizeMortgage(payment.mortgageId, userId);
    return authorized ? payment : undefined;
  }

  private async getPreviousPayment(
    termId: string,
    paymentDate?: string
  ): Promise<MortgagePayment | undefined> {
    const payments = this.sortPaymentsChronologically(
      await this.mortgagePayments.findByTermId(termId)
    );
    if (payments.length === 0) {
      return undefined;
    }

    const latest = payments[payments.length - 1];
    if (!paymentDate) {
      return latest;
    }
    if (latest.paymentDate >= paymentDate) {
      throw new Error(
        "Payments must be logged chronologically after the latest existing payment"
      );
    }

    return latest;
  }

  private sortPaymentsChronologically(payments: MortgagePayment[]): MortgagePayment[] {
    return [...payments].sort((a, b) => {
      const byDate = new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
      if (byDate !== 0) return byDate;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  private getFinalPaymentDate(term: MortgageTerm, paymentDate: string): string {
    if (term.interestAccrualBasis === "actual-365") {
      return paymentDate;
    }

    const paymentDateObj = new Date(paymentDate);
    const adjustedDate = adjustToBusinessDay(paymentDateObj);
    return adjustedDate.toISOString().split("T")[0];
  }

  private async getActual365RateSegments(
    mortgage: Mortgage,
    term: MortgageTerm,
    paymentDate: string,
    previousPayment?: MortgagePayment,
    effectiveRateOverride?: number
  ): Promise<InterestRateSegment[] | undefined> {
    if (term.interestAccrualBasis !== "actual-365") {
      return undefined;
    }

    const startDate = previousPayment?.paymentDate ?? mortgage.startDate;
    if (paymentDate <= startDate) {
      throw new Error("Actual/365 payment date must be after the previous payment date");
    }

    const spreadPercent = Number(term.lockedSpread ?? 0);
    const fallbackEffectiveRate =
      effectiveRateOverride !== undefined
        ? effectiveRateOverride
        : getTermEffectiveRate(term) * 100;

    if (!this.primeRateHistory) {
      return [
        {
          startDate,
          endDate: paymentDate,
          annualRate: fallbackEffectiveRate / 100,
        },
      ];
    }

    const startingHistory = await this.primeRateHistory.findEffectiveAtOrBefore(startDate);
    const startingPrimeRate = startingHistory
      ? Number(startingHistory.primeRate)
      : previousPayment?.primeRate
        ? Number(previousPayment.primeRate)
        : fallbackEffectiveRate - spreadPercent;
    const history = await this.primeRateHistory.findByDateRange(startDate, paymentDate);
    const changesByDate = new Map<string, number>();
    for (const entry of history) {
      if (
        entry.effectiveDate > startDate &&
        entry.effectiveDate < paymentDate &&
        !changesByDate.has(entry.effectiveDate)
      ) {
        changesByDate.set(entry.effectiveDate, Number(entry.primeRate));
      }
    }

    const changes = Array.from(changesByDate.entries()).sort(([left], [right]) =>
      left.localeCompare(right)
    );
    const segments: InterestRateSegment[] = [];
    let segmentStart = startDate;
    let effectiveRate = (startingPrimeRate + spreadPercent) / 100;

    for (const [effectiveDate, primeRate] of changes) {
      segments.push({
        startDate: segmentStart,
        endDate: effectiveDate,
        annualRate: effectiveRate,
      });
      segmentStart = effectiveDate;
      effectiveRate = (primeRate + spreadPercent) / 100;
    }
    segments.push({
      startDate: segmentStart,
      endDate: paymentDate,
      annualRate: effectiveRate,
    });

    return segments;
  }

  private async getYearToDatePrepayments(
    mortgageId: string,
    paymentDate: string,
    mortgage: Mortgage,
    excludePaymentId?: string
  ): Promise<number> {
    const { getPrepaymentYear } = await import("@server-shared/calculations/prepayment-year");
    const payments = await this.mortgagePayments.findByMortgageId(mortgageId);
    const paymentYear = getPrepaymentYear(
      paymentDate,
      mortgage.prepaymentLimitResetDate,
      mortgage.startDate
    );

    return payments
      .filter((payment) => {
        if (excludePaymentId && payment.id === excludePaymentId) {
          return false;
        }
        const paymentYearForPayment = getPrepaymentYear(
          payment.paymentDate,
          mortgage.prepaymentLimitResetDate,
          mortgage.startDate
        );
        return paymentYearForPayment === paymentYear;
      })
      .reduce((sum, payment) => sum + Number(payment.prepaymentAmount || 0), 0);
  }

  private validatePaymentDate(mortgage: Mortgage, term: MortgageTerm, paymentDate: string): void {
    const date = new Date(paymentDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    // Payment date should not be in the future (for logged payments)
    if (date > today) {
      throw new Error("Payment date cannot be in the future");
    }

    // Payment date should not be before mortgage start date
    const mortgageStartDate = new Date(mortgage.startDate);
    if (date < mortgageStartDate) {
      throw new Error(
        `Payment date cannot be before mortgage start date (${mortgageStartDate.toISOString().split("T")[0]})`
      );
    }

    // Payment date should be within term dates
    const termStartDate = new Date(term.startDate);
    const termEndDate = new Date(term.endDate);
    if (date < termStartDate || date > termEndDate) {
      throw new Error(
        `Payment date must be within term period (${termStartDate.toISOString().split("T")[0]} to ${termEndDate.toISOString().split("T")[0]})`
      );
    }
  }

  /**
   * Enforce annual prepayment limit
   *
   * **Prepayment Limit Method:**
   * - Uses original mortgage amount (not current balance) as the base
   * - This matches the convention used by major Canadian lenders
   * - Limit resets each calendar year (January 1st)
   *
   * @throws PrepaymentLimitError if limit is exceeded
   */
  private enforcePrepaymentLimit(
    mortgage: Mortgage,
    paymentDate: string,
    prepaymentAmount: number,
    yearToDate: number
  ) {
    const annualLimitPercent = mortgage.annualPrepaymentLimitPercent ?? 20;
    const originalAmount = Number(mortgage.originalAmount);
    const carryForward = Number(mortgage.prepaymentCarryForward || 0);
    const withinLimit = isWithinPrepaymentLimit(
      prepaymentAmount,
      yearToDate,
      originalAmount,
      annualLimitPercent,
      carryForward
    );
    if (!withinLimit) {
      const maxAnnual = (originalAmount * annualLimitPercent) / 100 + carryForward;
      const availableLimit = maxAnnual - yearToDate;
      const penaltyInfo = calculatePrepaymentWithPenalty(prepaymentAmount, availableLimit, 1.5);

      throw new PrepaymentLimitError(
        `Annual prepayment limit exceeded. Max ${annualLimitPercent}% of original balance ($${((originalAmount * annualLimitPercent) / 100).toFixed(2)})${carryForward > 0 ? ` plus $${carryForward.toFixed(2)} carry-forward` : ""} ($${maxAnnual.toFixed(2)} total) has already been used. Over-limit amount: $${penaltyInfo.overLimitAmount.toFixed(2)}. Estimated penalty: $${penaltyInfo.penaltyAmount.toFixed(2)} (1.5% of over-limit amount).`
      );
    }
  }

  private async validateAndNormalizePayment(
    mortgage: Mortgage,
    term: MortgageTerm,
    payload: Omit<MortgagePaymentCreateInput, "mortgageId">,
    previousPayment?: MortgagePayment
  ) {
    const paymentAmount = Number(payload.paymentAmount);
    const regularPaymentAmount = Number(payload.regularPaymentAmount);
    const prepaymentAmount = Number(payload.prepaymentAmount);

    // Use effectiveRate from payload if provided (for historical/backfilled payments)
    // This allows validation to use historical rates instead of term's current rate
    const effectiveRateOverride = payload.effectiveRate ? Number(payload.effectiveRate) : undefined;
    const actual365RateSegments = await this.getActual365RateSegments(
      mortgage,
      term,
      payload.paymentDate,
      previousPayment,
      effectiveRateOverride
    );

    const validation = validateMortgagePayment({
      mortgage,
      term,
      previousPayment,
      paymentAmount,
      regularPaymentAmount,
      prepaymentAmount,
      remainingAmortizationMonths: payload.remainingAmortizationMonths,
      effectiveRateOverride, // Pass historical rate if provided
      actual365RateSegments,
    });

    return {
      ...payload,
      principalPaid: validation.expectedPrincipal.toFixed(2),
      interestPaid: (paymentAmount - validation.expectedPrincipal).toFixed(2),
      remainingBalance: validation.expectedBalance.toFixed(2),
      triggerRateHit: validation.triggerRateHit ? 1 : 0,
      calculationSource: "calculated" as const,
      remainingAmortizationMonths: validation.remainingAmortizationMonths,
      // Use effectiveRate from payload if provided (for historical/backfilled payments),
      // otherwise calculate from term's current rate
      // Payload rate is already in percentage format (e.g., "5.490"), so use as-is
      effectiveRate:
        effectiveRateOverride !== undefined
          ? effectiveRateOverride.toFixed(3)
          : (getTermEffectiveRate(term) * 100).toFixed(3),
    };
  }

  async create(
    mortgageId: string,
    userId: string,
    payload: Omit<MortgagePaymentCreateInput, "mortgageId">
  ): Promise<MortgagePayment | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }
    const term = await this.mortgageTerms.findById(payload.termId);
    if (!term || term.mortgageId !== mortgageId) {
      return undefined;
    }

    // Validate payment date
    this.validatePaymentDate(mortgage, term, payload.paymentDate);

    const finalPaymentDate = this.getFinalPaymentDate(term, payload.paymentDate);

    const previousPayment = await this.getPreviousPayment(payload.termId, finalPaymentDate);
    const normalizedPayload = await this.validateAndNormalizePayment(
      mortgage,
      term,
      { ...payload, paymentDate: finalPaymentDate },
      previousPayment
    );
    const yearToDate = await this.getYearToDatePrepayments(
      mortgageId,
      payload.paymentDate,
      mortgage
    );
    this.enforcePrepaymentLimit(
      mortgage,
      finalPaymentDate,
      Number(normalizedPayload.prepaymentAmount || 0),
      yearToDate
    );
    const createdPayment = await this.mortgagePayments.create({
      ...normalizedPayload,
      paymentDate: finalPaymentDate, // Use adjusted date
      mortgageId,
    });

    // Update mortgage balance after payment is created
    await this.mortgages.update(mortgageId, {
      currentBalance: normalizedPayload.remainingBalance,
    });

    // Trigger HELOC credit limit recalculation if there was a prepayment
    const prepaymentAmount = Number(normalizedPayload.prepaymentAmount || 0);
    if (prepaymentAmount > 0 && this.helocCreditLimitService) {
      try {
        await this.helocCreditLimitService.recalculateCreditLimitOnPrepayment(
          mortgageId,
          prepaymentAmount
        );
      } catch (error) {
        // Log error but don't fail the payment creation
        console.error("Failed to recalculate HELOC credit limit:", error);
      }
    }

    return createdPayment;
  }

  async createBulk(
    mortgageId: string,
    userId: string,
    payments: Array<Omit<MortgagePaymentCreateInput, "mortgageId">>
  ): Promise<{ created: number; payments: MortgagePayment[] }> {
    // Authorize mortgage first
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      throw new Error("Mortgage not found or not authorized");
    }

    // Sort payments by date to ensure chronological processing
    // This ensures each payment can reference the previous payment in the batch
    const sortedPayments = [...payments].sort(
      (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
    );

    // Get the latest existing payment once (before processing batch)
    // This will be used as the previous payment for the first payment in the batch
    const latestExistingPayment =
      sortedPayments.length > 0
        ? await this.getPreviousPayment(sortedPayments[0].termId, sortedPayments[0].paymentDate)
        : undefined;

    // Validate all payments BEFORE creating any (fail fast)
    // Track cumulative prepayments by year to properly enforce limits within the batch
    const yearToDatePrepayments = new Map<string, number>();
    const validatedPayments: Array<{
      payload: Omit<MortgagePaymentCreateInput, "mortgageId">;
      normalized: Omit<MortgagePaymentCreateInput, "mortgageId">;
      adjustedPaymentDate: string;
    }> = [];

    // Track the previous payment within the batch for proper balance calculation
    let previousPaymentInBatch: MortgagePayment | undefined = latestExistingPayment;

    for (const payload of sortedPayments) {
      // Validate term belongs to mortgage
      const term = await this.mortgageTerms.findById(payload.termId);
      if (!term || term.mortgageId !== mortgageId) {
        throw new Error(`Invalid term ID ${payload.termId} for mortgage ${mortgageId}`);
      }

      // Validate payment date
      this.validatePaymentDate(mortgage, term, payload.paymentDate);

      const finalPaymentDate = this.getFinalPaymentDate(term, payload.paymentDate);

      // Use previous payment from batch if available, otherwise from database
      // This ensures correct balance calculation for each payment in the batch
      const previousPayment = previousPaymentInBatch;

      // Validate and normalize payment (use adjusted date)
      const normalized = await this.validateAndNormalizePayment(
        mortgage,
        term,
        { ...payload, paymentDate: finalPaymentDate },
        previousPayment
      );

      // Create a mock payment object for the next iteration
      // This simulates what the payment will look like after creation
      const mockPaymentForNext: MortgagePayment = {
        id: `temp-${validatedPayments.length}`,
        mortgageId,
        termId: payload.termId,
        paymentDate: finalPaymentDate, // Use adjusted date
        paymentPeriodLabel: payload.paymentPeriodLabel || "",
        regularPaymentAmount: normalized.regularPaymentAmount,
        prepaymentAmount: normalized.prepaymentAmount || "0",
        paymentAmount: normalized.paymentAmount,
        principalPaid: normalized.principalPaid,
        interestPaid: normalized.interestPaid,
        remainingBalance: normalized.remainingBalance,
        primeRate: payload.primeRate || null,
        effectiveRate: normalized.effectiveRate,
        triggerRateHit: normalized.triggerRateHit,
        calculationSource: normalized.calculationSource,
        isSkipped: 0,
        skippedInterestAccrued: "0.00",
        remainingAmortizationMonths: normalized.remainingAmortizationMonths,
        createdAt: new Date(),
      } as MortgagePayment;

      // Update previous payment for next iteration
      previousPaymentInBatch = mockPaymentForNext;

      // Check prepayment limits - account for prepayments in this batch
      // Use adjusted date for prepayment year calculation
      // This ensures that if a date is adjusted (e.g., Dec 31 holiday → Jan 1),
      // the prepayment limit is calculated for the correct year
      const { getPrepaymentYear } = await import("@server-shared/calculations/prepayment-year");
      const adjustedPaymentYear = getPrepaymentYear(
        finalPaymentDate,
        mortgage.prepaymentLimitResetDate,
        mortgage.startDate
      );
      const existingYearToDate = await this.getYearToDatePrepayments(
        mortgageId,
        finalPaymentDate,
        mortgage
      );
      const batchYearToDate = yearToDatePrepayments.get(adjustedPaymentYear) || 0;
      const totalYearToDate = existingYearToDate + batchYearToDate;

      const prepaymentAmount = Number(normalized.prepaymentAmount || 0);
      this.enforcePrepaymentLimit(
        mortgage,
        finalPaymentDate, // Use adjusted date for limit calculation
        prepaymentAmount,
        totalYearToDate
      );

      // Update cumulative prepayments for this year in the batch (use adjusted year)
      yearToDatePrepayments.set(adjustedPaymentYear, batchYearToDate + prepaymentAmount);

      validatedPayments.push({
        payload,
        normalized,
        adjustedPaymentDate: finalPaymentDate,
      });
    }

    // Create all payments in a single transaction (all-or-nothing)
    const result = await db.transaction(async (tx) => {
      const created: MortgagePayment[] = [];
      let lastBalance = Number(mortgage.currentBalance);

      for (const { normalized, adjustedPaymentDate } of validatedPayments) {
        const payment = await this.mortgagePayments.create(
          {
            ...normalized,
            paymentDate: adjustedPaymentDate, // Use adjusted date from array
            mortgageId,
          },
          tx
        );
        created.push(payment);
        lastBalance = Number(normalized.remainingBalance);
      }

      // Update mortgage balance after all payments are created
      await this.mortgages.update(mortgageId, {
        currentBalance: lastBalance.toFixed(2),
      }, tx);

      return {
        created: created.length,
        payments: created,
      };
    });

    // Trigger HELOC credit limit recalculation if there were any prepayments
    const totalPrepayment = validatedPayments.reduce(
      (sum, { normalized }) => sum + Number(normalized.prepaymentAmount || 0),
      0
    );
    if (totalPrepayment > 0 && this.helocCreditLimitService) {
      try {
        await this.helocCreditLimitService.recalculateCreditLimitOnPrepayment(
          mortgageId,
          totalPrepayment
        );
      } catch (error) {
        // Log error but don't fail the payment creation
        console.error("Failed to recalculate HELOC credit limit:", error);
      }
    }

    return result;
  }

  async delete(paymentId: string, userId: string): Promise<boolean> {
    const payment = await this.mortgagePayments.findById(paymentId);
    if (!payment) {
      return false;
    }
    const mortgage = await this.authorizeMortgage(payment.mortgageId, userId);
    if (!mortgage) {
      return false;
    }
    if (payment.calculationSource === "statement") {
      throw new Error("Bank-statement payments cannot be deleted");
    }

    const payments = this.sortPaymentsChronologically(
      await this.mortgagePayments.findByMortgageId(payment.mortgageId)
    );
    const latest = payments[payments.length - 1];
    if (!latest || latest.id !== paymentId) {
      throw new Error("Only the latest payment can be deleted");
    }

    const previous = payments[payments.length - 2];
    const deleted = await this.mortgagePayments.delete(paymentId);
    if (!deleted) {
      return false;
    }

    await this.mortgages.update(payment.mortgageId, {
      currentBalance: previous?.remainingBalance ?? mortgage.originalAmount,
    });
    return true;
  }

  /**
   * Edit a logged payment (prepayment, regular amount, date, or period label).
   * Recalculates this payment and every later payment so balances stay consistent.
   */
  async update(
    paymentId: string,
    userId: string,
    payload: MortgagePaymentUpdateInput
  ): Promise<MortgagePayment | undefined> {
    const existing = await this.getByIdForUser(paymentId, userId);
    if (!existing) {
      return undefined;
    }
    if (existing.isSkipped) {
      throw new Error(
        "Skipped payments cannot be edited. Delete the skip and log a payment instead."
      );
    }
    if (existing.calculationSource === "statement") {
      throw new Error("Bank-statement payments cannot be edited");
    }

    const mortgage = await this.mortgages.findById(existing.mortgageId);
    if (!mortgage) {
      return undefined;
    }
    const term = await this.mortgageTerms.findById(existing.termId);
    if (!term) {
      return undefined;
    }

    const nextRegular = payload.regularPaymentAmount ?? existing.regularPaymentAmount;
    const nextPrepay = payload.prepaymentAmount ?? existing.prepaymentAmount;
    const nextDate = payload.paymentDate ?? existing.paymentDate;
    const nextLabel =
      payload.paymentPeriodLabel !== undefined
        ? payload.paymentPeriodLabel
        : existing.paymentPeriodLabel;
    const nextTotal = (Number(nextRegular) + Number(nextPrepay)).toFixed(2);

    let finalPaymentDate = nextDate;
    if (payload.paymentDate && payload.paymentDate !== existing.paymentDate) {
      this.validatePaymentDate(mortgage, term, nextDate);
      finalPaymentDate = this.getFinalPaymentDate(term, nextDate);
    }

    const yearToDate = await this.getYearToDatePrepayments(
      existing.mortgageId,
      finalPaymentDate,
      mortgage,
      existing.id
    );
    this.enforcePrepaymentLimit(mortgage, finalPaymentDate, Number(nextPrepay || 0), yearToDate);

    const allPayments = await this.mortgagePayments.findByMortgageId(existing.mortgageId);
    const originalSorted = this.sortPaymentsChronologically(allPayments);
    if (originalSorted.length === 0) {
      return undefined;
    }
    const oldIndex = originalSorted.findIndex((payment) => payment.id === paymentId);
    if (oldIndex === -1) {
      return undefined;
    }
    const chainStartBalance =
      Number(originalSorted[0].remainingBalance) + Number(originalSorted[0].principalPaid);

    const working = this.sortPaymentsChronologically(
      allPayments.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              paymentDate: finalPaymentDate,
              paymentPeriodLabel: nextLabel,
              regularPaymentAmount: Number(nextRegular).toFixed(2),
              prepaymentAmount: Number(nextPrepay).toFixed(2),
              paymentAmount: nextTotal,
            }
          : payment
      )
    );
    const newIndex = working.findIndex((payment) => payment.id === paymentId);
    const startIndex = Math.min(oldIndex, newIndex);
    if (working.slice(startIndex + 1).some((payment) => payment.calculationSource === "statement")) {
      throw new Error("Payments before bank-statement entries cannot be edited");
    }

    let previous: MortgagePayment | undefined =
      startIndex === 0
        ? ({ remainingBalance: chainStartBalance.toFixed(2) } as MortgagePayment)
        : working[startIndex - 1];

    let lastBalance = mortgage.currentBalance;
    for (const payment of working.slice(startIndex)) {
      const paymentTerm = await this.mortgageTerms.findById(payment.termId);
      if (!paymentTerm) {
        throw new Error("Term not found for payment");
      }

      if (payment.isSkipped) {
        const previousBalance = previous ? Number(previous.remainingBalance) : chainStartBalance;
        const previousAmort = previous
          ? Number(previous.remainingAmortizationMonths)
          : Number(payment.remainingAmortizationMonths);
        const skipCalculation = calculateSkippedPayment(
          previousBalance,
          Number(payment.effectiveRate) / 100,
          paymentTerm.paymentFrequency as PaymentFrequency,
          previousAmort
        );
        const updatedSkipped = await this.mortgagePayments.update(payment.id, {
          remainingBalance: skipCalculation.newBalance.toFixed(2),
          skippedInterestAccrued: skipCalculation.interestAccrued.toFixed(2),
          remainingAmortizationMonths: skipCalculation.extendedAmortizationMonths,
        });
        previous = updatedSkipped ?? payment;
        lastBalance = skipCalculation.newBalance.toFixed(2);
        continue;
      }

      const normalized = await this.validateAndNormalizePayment(
        mortgage,
        paymentTerm,
        {
          termId: payment.termId,
          paymentDate: payment.paymentDate,
          paymentPeriodLabel: payment.paymentPeriodLabel,
          regularPaymentAmount: payment.regularPaymentAmount,
          prepaymentAmount: payment.prepaymentAmount,
          paymentAmount: payment.paymentAmount,
          principalPaid: payment.principalPaid,
          interestPaid: payment.interestPaid,
          remainingBalance: payment.remainingBalance,
          primeRate: payment.primeRate,
          effectiveRate: payment.effectiveRate,
          triggerRateHit: payment.triggerRateHit,
          calculationSource: payment.calculationSource,
          isSkipped: payment.isSkipped,
          skippedInterestAccrued: payment.skippedInterestAccrued,
          remainingAmortizationMonths:
            previous?.remainingAmortizationMonths ?? payment.remainingAmortizationMonths,
        },
        previous
      );

      const updatedPayment = await this.mortgagePayments.update(payment.id, {
        paymentDate: payment.paymentDate,
        paymentPeriodLabel: payment.paymentPeriodLabel,
        regularPaymentAmount: normalized.regularPaymentAmount,
        prepaymentAmount: normalized.prepaymentAmount,
        paymentAmount: normalized.paymentAmount,
        principalPaid: normalized.principalPaid,
        interestPaid: normalized.interestPaid,
        remainingBalance: normalized.remainingBalance,
        effectiveRate: normalized.effectiveRate,
        triggerRateHit: normalized.triggerRateHit,
        remainingAmortizationMonths: normalized.remainingAmortizationMonths,
      });
      previous = updatedPayment ?? ({ ...payment, ...normalized } as MortgagePayment);
      lastBalance = normalized.remainingBalance;
    }

    await this.mortgages.update(existing.mortgageId, {
      currentBalance: lastBalance,
    });

    const prepaymentDelta = Number(nextPrepay || 0) - Number(existing.prepaymentAmount || 0);
    if (prepaymentDelta !== 0 && this.helocCreditLimitService) {
      try {
        await this.helocCreditLimitService.recalculateCreditLimitOnPrepayment(
          existing.mortgageId,
          prepaymentDelta
        );
      } catch (error) {
        console.error("Failed to recalculate HELOC credit limit:", error);
      }
    }

    return this.mortgagePayments.findById(paymentId);
  }

  /**
   * Skip a payment (with interest accrual)
   *
   * **Canadian Mortgage Rule:**
   * - Interest accrues during skipped period
   * - Balance increases (negative amortization)
   * - Amortization extends
   * - Limited to 1-2 per calendar year (lender dependent)
   *
   * @param mortgageId - Mortgage ID
   * @param termId - Term ID
   * @param userId - User ID
   * @param paymentDate - Date of the skipped payment
   * @param maxSkipsPerYear - Maximum allowed skips per year (default: 2)
   * @returns Created skipped payment record
   */
  async skipPayment(
    mortgageId: string,
    termId: string,
    userId: string,
    paymentDate: string,
    maxSkipsPerYear: number = 2
  ): Promise<MortgagePayment | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    const term = await this.mortgageTerms.findById(termId);
    if (!term || term.mortgageId !== mortgageId) {
      return undefined;
    }
    if (term.interestAccrualBasis === "actual-365") {
      throw new Error(
        "Actual/365 skipped payments require a lender statement before they can be recorded"
      );
    }

    // Validate payment date
    this.validatePaymentDate(mortgage, term, paymentDate);

    // Get previous payment to find current balance
    const previousPayment = await this.getPreviousPayment(termId);
    const currentBalance = previousPayment
      ? Number(previousPayment.remainingBalance)
      : Number(mortgage.currentBalance);

    const currentAmortizationMonths = previousPayment
      ? Number(previousPayment.remainingAmortizationMonths)
      : mortgage.amortizationYears * 12 + (mortgage.amortizationMonths ?? 0);

    // Check skip limit for the year
    const payments = await this.mortgagePayments.findByTermId(termId);
    const paymentYear = new Date(paymentDate).getFullYear();
    const skippedThisYear = countSkippedPaymentsInYear(payments, paymentYear);

    if (!canSkipPayment(skippedThisYear, maxSkipsPerYear)) {
      throw new Error(
        `Maximum skipped payments (${maxSkipsPerYear}) already reached for ${paymentYear}. Cannot skip another payment.`
      );
    }

    // Calculate skipped payment impact
    const effectiveRate = getTermEffectiveRate(term);
    const skipCalculation = calculateSkippedPayment(
      currentBalance,
      effectiveRate,
      term.paymentFrequency as PaymentFrequency,
      currentAmortizationMonths
    );

    // Get regular payment amount for reference
    const regularPaymentAmount = Number(term.regularPaymentAmount);

    // Create skipped payment record
    // For skipped payments:
    // - paymentAmount = 0 (no payment made)
    // - principalPaid = 0 (no principal paid)
    // - interestPaid = 0 (interest accrues, not paid)
    // - remainingBalance = old balance + accrued interest
    // - isSkipped = true
    // - skippedInterestAccrued = interest that accrued
    const newBalance = skipCalculation.newBalance.toFixed(2);
    const payment = await this.mortgagePayments.create({
      termId,
      paymentDate,
      paymentPeriodLabel: `Skipped Payment - ${new Date(paymentDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      regularPaymentAmount: regularPaymentAmount.toFixed(2),
      prepaymentAmount: "0.00",
      paymentAmount: "0.00", // No payment made
      principalPaid: "0.00", // No principal paid
      interestPaid: "0.00", // Interest accrues, not paid
      remainingBalance: newBalance,
      primeRate: term.primeRate,
      effectiveRate: (effectiveRate * 100).toFixed(3),
      triggerRateHit: 0,
      calculationSource: "calculated",
      isSkipped: 1, // Mark as skipped
      skippedInterestAccrued: skipCalculation.interestAccrued.toFixed(2),
      remainingAmortizationMonths: skipCalculation.extendedAmortizationMonths,
      mortgageId,
    });

    // Atomically update the mortgage's canonical balance so dashboards
    // and subsequent calculations use the post-skip balance.
    await this.mortgages.update(mortgageId, { currentBalance: newBalance });

    return payment;
  }
}
