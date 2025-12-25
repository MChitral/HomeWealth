import {
  MortgagesRepository,
  HelocAccountRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import { calculateCreditLimit } from "@server-shared/calculations/heloc/credit-limit";
import { calculateAvailableCredit } from "@server-shared/calculations/heloc/available-credit";
import type { Mortgage, HelocAccount } from "@shared/schema";

/**
 * Re-advanceable Mortgage Service
 * Handles automatic credit room updates for re-advanceable mortgages
 */
export class ReAdvanceableMortgageService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly helocAccounts: HelocAccountRepository,
    private readonly mortgagePayments: MortgagePaymentsRepository
  ) {}

  /**
   * Mark a mortgage as re-advanceable and link it to a HELOC account
   */
  async markMortgageAsReAdvanceable(
    mortgageId: string,
    userId: string,
    helocAccountId: string
  ): Promise<{ mortgage: Mortgage; helocAccount: HelocAccount } | undefined> {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || mortgage.userId !== userId) {
      return undefined;
    }

    const helocAccount = await this.helocAccounts.findById(helocAccountId);
    if (!helocAccount || helocAccount.userId !== userId) {
      return undefined;
    }

    // Update mortgage to mark as re-advanceable
    const updatedMortgage = await this.mortgages.update(mortgageId, {
      isReAdvanceable: 1,
      reAdvanceableHelocId: helocAccountId,
    });

    // Update HELOC account to mark as re-advanceable
    const updatedHelocAccount = await this.helocAccounts.update(helocAccountId, {
      isReAdvanceable: 1,
      mortgageId: mortgageId,
    });

    if (!updatedMortgage || !updatedHelocAccount) {
      return undefined;
    }

    // Recalculate credit room
    await this.updateCreditRoomOnPayment(mortgageId);

    return {
      mortgage: updatedMortgage,
      helocAccount: updatedHelocAccount,
    };
  }

  /**
   * Calculate current credit room for a re-advanceable mortgage
   * Credit Room = (Home Value × Maximum LTV) - Remaining Mortgage Balance
   */
  async calculateCreditRoom(mortgageId: string): Promise<number | undefined> {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || !mortgage.isReAdvanceable) {
      return undefined;
    }

    const helocAccountId = mortgage.reAdvanceableHelocId;
    if (!helocAccountId) {
      return undefined;
    }

    const helocAccount = await this.helocAccounts.findById(helocAccountId);
    if (!helocAccount) {
      return undefined;
    }

    const homeValue = Number(helocAccount.homeValueReference || mortgage.propertyPrice);
    const maxLTV = Number(helocAccount.maxLtvPercent);
    const mortgageBalance = Number(mortgage.currentBalance);

    return calculateCreditLimit(homeValue, maxLTV, mortgageBalance);
  }

  /**
   * Update credit room after a mortgage payment that reduces principal
   * This is called automatically when principal-reducing transactions occur
   */
  async updateCreditRoomOnPayment(mortgageId: string): Promise<void> {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || !mortgage.isReAdvanceable) {
      return;
    }

    const helocAccountId = mortgage.reAdvanceableHelocId;
    if (!helocAccountId) {
      return;
    }

    const helocAccount = await this.helocAccounts.findById(helocAccountId);
    if (!helocAccount) {
      return;
    }

    // Calculate new credit room
    const homeValue = Number(helocAccount.homeValueReference || mortgage.propertyPrice);
    const maxLTV = Number(helocAccount.maxLtvPercent);
    const mortgageBalance = Number(mortgage.currentBalance);
    const newCreditLimit = calculateCreditLimit(homeValue, maxLTV, mortgageBalance);

    // Update HELOC credit limit
    await this.helocAccounts.update(helocAccountId, {
      creditLimit: newCreditLimit.toFixed(2),
    });
  }

  /**
   * Get credit room history for a re-advanceable mortgage
   * Returns credit room snapshots from payment history
   */
  async getCreditRoomHistory(mortgageId: string): Promise<
    Array<{
      date: string;
      mortgageBalance: number;
      creditRoom: number;
      availableCredit: number;
    }>
  > {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || !mortgage.isReAdvanceable) {
      return [];
    }

    const helocAccountId = mortgage.reAdvanceableHelocId;
    if (!helocAccountId) {
      return [];
    }

    const helocAccount = await this.helocAccounts.findById(helocAccountId);
    if (!helocAccount) {
      return [];
    }

    const payments = await this.mortgagePayments.findByMortgageId(mortgageId);
    const homeValue = Number(helocAccount.homeValueReference || mortgage.propertyPrice);
    const maxLTV = Number(helocAccount.maxLtvPercent);
    const helocBalance = Number(helocAccount.currentBalance);

    // Create history from payment records
    const history = payments
      .filter((payment) => Number(payment.principalPaid) > 0) // Only principal-reducing payments
      .map((payment) => {
        const mortgageBalance = Number(payment.remainingBalance);
        const creditRoom = calculateCreditLimit(homeValue, maxLTV, mortgageBalance);
        const availableCredit = calculateAvailableCredit(creditRoom, helocBalance);

        return {
          date: payment.paymentDate,
          mortgageBalance,
          creditRoom,
          availableCredit,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return history;
  }

  /**
   * Get current credit room information
   */
  async getCurrentCreditRoom(mortgageId: string): Promise<{
    creditRoom: number;
    availableCredit: number;
    mortgageBalance: number;
    helocBalance: number;
  } | null> {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || !mortgage.isReAdvanceable) {
      return null;
    }

    const helocAccountId = mortgage.reAdvanceableHelocId;
    if (!helocAccountId) {
      return null;
    }

    const helocAccount = await this.helocAccounts.findById(helocAccountId);
    if (!helocAccount) {
      return null;
    }

    const homeValue = Number(helocAccount.homeValueReference || mortgage.propertyPrice);
    const maxLTV = Number(helocAccount.maxLtvPercent);
    const mortgageBalance = Number(mortgage.currentBalance);
    const helocBalance = Number(helocAccount.currentBalance);

    const creditRoom = calculateCreditLimit(homeValue, maxLTV, mortgageBalance);
    const availableCredit = calculateAvailableCredit(creditRoom, helocBalance);

    return {
      creditRoom,
      availableCredit,
      mortgageBalance,
      helocBalance,
    };
  }
}

