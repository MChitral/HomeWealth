import { HelocAccountRepository, MortgagesRepository } from "@infrastructure/repositories";
import {
  calculateCreditLimit,
  recalculateCreditLimitOnPrepayment,
  recalculateCreditLimitOnHomeValueUpdate,
} from "@server-shared/calculations/heloc/credit-limit";
import { calculateAvailableCredit } from "@server-shared/calculations/heloc/available-credit";

/**
 * HELOC Credit Limit Service
 * Manages credit limit calculations and updates
 */
export class HelocCreditLimitService {
  constructor(
    private readonly helocAccounts: HelocAccountRepository,
    private readonly mortgages: MortgagesRepository
  ) {}

  /**
   * Calculate credit limit for a HELOC account
   */
  async calculateCreditLimitForAccount(helocAccountId: string): Promise<number> {
    const account = await this.helocAccounts.findById(helocAccountId);
    if (!account) {
      throw new Error("HELOC account not found");
    }

    const homeValue = Number(account.homeValueReference || 0);
    const maxLTV = Number(account.maxLtvPercent);
    let mortgageBalance = 0;

    if (account.mortgageId) {
      const mortgage = await this.mortgages.findById(account.mortgageId);
      if (mortgage) {
        mortgageBalance = Number(mortgage.currentBalance);
      }
    }

    return calculateCreditLimit(homeValue, maxLTV, mortgageBalance);
  }

  /**
   * Recalculate credit limit after prepayment
   * Called when mortgage prepayment is recorded
   */
  async recalculateCreditLimitOnPrepayment(
    mortgageId: string,
    prepaymentAmount: number
  ): Promise<void> {
    // Find all HELOC accounts linked to this mortgage
    const linkedAccounts = await this.helocAccounts.findByMortgageId(mortgageId);

    for (const account of linkedAccounts) {
      const currentCreditLimit = Number(account.creditLimit);
      const newCreditLimit = recalculateCreditLimitOnPrepayment(
        currentCreditLimit,
        prepaymentAmount
      );

      await this.helocAccounts.update(account.id, {
        creditLimit: newCreditLimit.toFixed(2),
      });
    }
  }

  /**
   * Recalculate credit limit after home value update
   */
  async recalculateCreditLimitOnHomeValueUpdate(
    userId: string,
    newHomeValue: number
  ): Promise<void> {
    // Find all HELOC accounts for this user
    const accounts = await this.helocAccounts.findByUserId(userId);

    for (const account of accounts) {
      const maxLTV = Number(account.maxLtvPercent);
      let mortgageBalance = 0;

      if (account.mortgageId) {
        const mortgage = await this.mortgages.findById(account.mortgageId);
        if (mortgage) {
          mortgageBalance = Number(mortgage.currentBalance);
        }
      }

      const newCreditLimit = recalculateCreditLimitOnHomeValueUpdate(
        newHomeValue,
        maxLTV,
        mortgageBalance
      );

      await this.helocAccounts.update(account.id, {
        creditLimit: newCreditLimit.toFixed(2),
        homeValueReference: newHomeValue.toFixed(2),
      });
    }
  }

  /**
   * Get available credit for an account
   */
  getAvailableCredit(creditLimit: number, currentBalance: number): number {
    return calculateAvailableCredit(creditLimit, currentBalance);
  }
}
