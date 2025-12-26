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
import { calculatePrepaymentWithPenalty } from "@domain/calculations/prepayment-penalty";
import { db } from "@infrastructure/db/connection";
import {
  calculateSkippedPayment,
  canSkipPayment,
  countSkippedPaymentsInYear,
} from "@server-shared/calculations/payment-skipping";
import type { PaymentFrequency } from "@server-shared/calculations/mortgage";
import { adjustToBusinessDay } from "@server-shared/utils/business-days";
import type { HelocCreditLimitService } from "./heloc-credit-limit.service";
import { HelocCreditLimitService } from "./heloc-credit-limit.service";

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
    private readonly helocCreditLimitService?: HelocCreditLimitService
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
    if (payments.length === 0) {
      return undefined;
    }
    return payments.sort(
      (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    )[0];
  }

  private async getYearToDatePrepayments(
    mortgageId: string,
    paymentDate: string,
    mortgage: Mortgage
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
        `Annual prepayment limit exceeded. Max ${annualLimitPercent}% of original balance ($${(originalAmount * annualLimitPercent / 100).toFixed(2)})${carryForward > 0 ? ` plus $${carryForward.toFixed(2)} carry-forward` : ""} ($${maxAnnual.toFixed(2)} total) has already been used. Over-limit amount: $${penaltyInfo.overLimitAmount.toFixed(2)}. Estimated penalty: $${penaltyInfo.penaltyAmount.toFixed(2)} (1.5% of over-limit amount).`
      );
    }
  }

  private validateAndNormalizePayment(
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

    const validation = validateMortgagePayment({
      mortgage,
      term,
      previousPayment,
      paymentAmount,
      regularPaymentAmount,
      prepaymentAmount,
      remainingAmortizationMonths: payload.remainingAmortizationMonths,
      effectiveRateOverride, // Pass historical rate if provided
    });

    return {
      ...payload,
      principalPaid: validation.expectedPrincipal.toFixed(2),
      interestPaid: (paymentAmount - validation.expectedPrincipal).toFixed(2),
      remainingBalance: validation.expectedBalance.toFixed(2),
      triggerRateHit: validation.triggerRateHit ? 1 : 0,
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
    console.error(
      `[DEBUG] create called with payloadDate=${payload.paymentDate} termId=${payload.termId}`
    );
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

    // Adjust payment date to business day if it falls on weekend/holiday
    const paymentDateObj = new Date(payload.paymentDate);
    const adjustedDate = adjustToBusinessDay(paymentDateObj);
    const adjustedPaymentDate = adjustedDate.toISOString().split("T")[0];
    const finalPaymentDate =
      adjustedDate.getTime() !== paymentDateObj.getTime()
        ? adjustedPaymentDate
        : payload.paymentDate;

    const previousPayment = await this.getPreviousPayment(payload.termId);
    const normalizedPayload = this.validateAndNormalizePayment(
      mortgage,
      term,
      { ...payload, paymentDate: finalPaymentDate },
      previousPayment
    );
    const paymentYear = parseInt(finalPaymentDate.split("-")[0], 10);
    const yearToDate = await this.getYearToDatePrepayments(mortgageId, payload.paymentDate, mortgage);
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
        ? await this.getPreviousPayment(sortedPayments[0].termId)
        : undefined;

    // Validate all payments BEFORE creating any (fail fast)
    // Track cumulative prepayments by year to properly enforce limits within the batch
    const yearToDatePrepayments = new Map<number, number>();
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

      // Adjust payment date to business day if it falls on weekend/holiday
      const paymentDateObj = new Date(payload.paymentDate);
      const adjustedDate = adjustToBusinessDay(paymentDateObj);
      const adjustedPaymentDate = adjustedDate.toISOString().split("T")[0];
      const finalPaymentDate =
        adjustedDate.getTime() !== paymentDateObj.getTime()
          ? adjustedPaymentDate
          : payload.paymentDate;

      // Use previous payment from batch if available, otherwise from database
      // This ensures correct balance calculation for each payment in the batch
      const previousPayment = previousPaymentInBatch;

      // Validate and normalize payment (use adjusted date)
      const normalized = this.validateAndNormalizePayment(
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
      });

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
    const authorized = await this.authorizeMortgage(payment.mortgageId, userId);
    if (!authorized) {
      return false;
    }
    return this.mortgagePayments.delete(paymentId);
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
    return this.mortgagePayments.create({
      termId,
      paymentDate,
      paymentPeriodLabel: `Skipped Payment - ${new Date(paymentDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      regularPaymentAmount: regularPaymentAmount.toFixed(2),
      prepaymentAmount: "0.00",
      paymentAmount: "0.00", // No payment made
      principalPaid: "0.00", // No principal paid
      interestPaid: "0.00", // Interest accrues, not paid
      remainingBalance: skipCalculation.newBalance.toFixed(2),
      primeRate: term.primeRate,
      effectiveRate: (effectiveRate * 100).toFixed(3),
      triggerRateHit: 0,
      isSkipped: 1, // Mark as skipped
      skippedInterestAccrued: skipCalculation.interestAccrued.toFixed(2),
      remainingAmortizationMonths: skipCalculation.extendedAmortizationMonths,
      mortgageId,
    });
  }
}
