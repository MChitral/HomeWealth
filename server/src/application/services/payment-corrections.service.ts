import {
  PaymentCorrectionsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import type {
  InsertPaymentCorrection,
  PaymentCorrection,
  MortgagePayment,
} from "@shared/schema";

export interface CorrectionRequest {
  paymentId: string;
  correctedAmount: number;
  reason: string;
  correctedBy?: string;
}

export class PaymentCorrectionsService {
  constructor(
    private paymentCorrectionsRepo: PaymentCorrectionsRepository,
    private mortgagePaymentsRepo: MortgagePaymentsRepository
  ) {}

  async correctPayment(
    request: CorrectionRequest
  ): Promise<{ correction: PaymentCorrection; payment: MortgagePayment }> {
    // Get the original payment
    const originalPayment = await this.mortgagePaymentsRepo.findById(request.paymentId);
    if (!originalPayment) {
      throw new Error("Payment not found");
    }

    const originalAmount = parseFloat(originalPayment.paymentAmount);

    // Create correction record
    const correctionData: InsertPaymentCorrection = {
      paymentId: request.paymentId,
      originalAmount: originalAmount.toFixed(2),
      correctedAmount: request.correctedAmount.toFixed(2),
      reason: request.reason,
      correctedBy: request.correctedBy || null,
    };

    const correction = await this.paymentCorrectionsRepo.create(correctionData);

    // Update the payment amount (this would typically trigger a recalculation)
    // For now, we'll just record the correction
    // In a full implementation, you might want to update the payment record
    // and recalculate subsequent payments

    return { correction, payment: originalPayment };
  }

  async getCorrectionsByPaymentId(paymentId: string): Promise<PaymentCorrection[]> {
    return this.paymentCorrectionsRepo.findByPaymentId(paymentId);
  }

  async getCorrectionById(id: string): Promise<PaymentCorrection | undefined> {
    return this.paymentCorrectionsRepo.findById(id);
  }

  async deleteCorrection(id: string): Promise<boolean> {
    return this.paymentCorrectionsRepo.delete(id);
  }
}

