import {
  MortgagePayoffRepository,
  MortgagesRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import type { InsertMortgagePayoff, MortgagePayoff } from "@shared/schema";

export interface MortgagePayoffRequest {
  mortgageId: string;
  payoffDate: string;
  finalPaymentAmount: number;
  remainingBalance: number;
  penaltyAmount?: number;
  notes?: string;
}

export class MortgagePayoffService {
  constructor(
    private mortgagePayoffRepo: MortgagePayoffRepository,
    private mortgagesRepo: MortgagesRepository,
    private mortgagePaymentsRepo: MortgagePaymentsRepository
  ) {}

  async recordPayoff(request: MortgagePayoffRequest): Promise<{
    payoff: MortgagePayoff;
    mortgageUpdated: boolean;
  }> {
    // Verify mortgage exists
    const mortgage = await this.mortgagesRepo.findById(request.mortgageId);
    if (!mortgage) {
      throw new Error("Mortgage not found");
    }

    // Calculate total cost
    const penaltyAmount = request.penaltyAmount || 0;
    const totalCost = request.finalPaymentAmount + penaltyAmount;

    // Create payoff record
    const payoffData: InsertMortgagePayoff = {
      mortgageId: request.mortgageId,
      payoffDate: request.payoffDate,
      finalPaymentAmount: request.finalPaymentAmount.toFixed(2),
      remainingBalance: request.remainingBalance.toFixed(2),
      penaltyAmount: penaltyAmount.toFixed(2),
      totalCost: totalCost.toFixed(2),
      notes: request.notes || null,
    };

    const payoff = await this.mortgagePayoffRepo.create(payoffData);

    // Update mortgage balance to 0 and mark as paid off (if status field exists)
    // For now, we'll just set balance to 0
    const mortgageUpdated = await this.mortgagesRepo.update(request.mortgageId, {
      currentBalance: "0.00",
    });

    return { payoff, mortgageUpdated: !!mortgageUpdated };
  }

  async getPayoffHistory(mortgageId: string): Promise<MortgagePayoff[]> {
    return this.mortgagePayoffRepo.findByMortgageId(mortgageId);
  }

  async getPayoffById(id: string): Promise<MortgagePayoff | undefined> {
    return this.mortgagePayoffRepo.findById(id);
  }

  async deletePayoff(id: string): Promise<boolean> {
    return this.mortgagePayoffRepo.delete(id);
  }
}

