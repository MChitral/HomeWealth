import {
  PaymentAmountChangeEventsRepository,
  MortgageTermsRepository,
} from "@infrastructure/repositories";
import type {
  InsertPaymentAmountChangeEvent,
  PaymentAmountChangeEvent,
} from "@shared/schema";

export interface PaymentAmountChangeRequest {
  mortgageId: string;
  termId: string;
  changeDate: string;
  oldAmount: number;
  newAmount: number;
  reason?: string;
}

export class PaymentAmountChangeService {
  constructor(
    private paymentAmountChangeEventsRepo: PaymentAmountChangeEventsRepository,
    private mortgageTermsRepo: MortgageTermsRepository
  ) {}

  async recordPaymentAmountChange(
    request: PaymentAmountChangeRequest
  ): Promise<{ event: PaymentAmountChangeEvent; termUpdated: boolean }> {
    // Create the change event
    const eventData: InsertPaymentAmountChangeEvent = {
      mortgageId: request.mortgageId,
      termId: request.termId,
      changeDate: request.changeDate,
      oldAmount: request.oldAmount.toFixed(2),
      newAmount: request.newAmount.toFixed(2),
      reason: request.reason || null,
    };

    const event = await this.paymentAmountChangeEventsRepo.create(eventData);

    // Update the term's regular payment amount
    const termUpdated = await this.mortgageTermsRepo.update(request.termId, {
      regularPaymentAmount: request.newAmount.toFixed(2),
    });

    return { event, termUpdated: !!termUpdated };
  }

  async getPaymentAmountChangeHistory(
    mortgageId: string
  ): Promise<PaymentAmountChangeEvent[]> {
    return this.paymentAmountChangeEventsRepo.findByMortgageId(mortgageId);
  }

  async getPaymentAmountChangeHistoryByTerm(
    termId: string
  ): Promise<PaymentAmountChangeEvent[]> {
    return this.paymentAmountChangeEventsRepo.findByTermId(termId);
  }

  async getPaymentAmountChangeEvent(
    id: string
  ): Promise<PaymentAmountChangeEvent | undefined> {
    return this.paymentAmountChangeEventsRepo.findById(id);
  }
}

