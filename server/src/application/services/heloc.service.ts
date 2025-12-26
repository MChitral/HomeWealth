import {
  HelocAccountRepository,
  HelocTransactionRepository,
  MortgagesRepository,
} from "@infrastructure/repositories";
import type {
  HelocAccountCreateInput,
  HelocAccountUpdateInput,
  HelocTransactionCreateInput,
} from "@domain/models";
import { calculateCreditLimit } from "@server-shared/calculations/heloc/credit-limit";
import { calculateAvailableCredit } from "@server-shared/calculations/heloc/available-credit";
import { fetchLatestPrimeRate } from "@server-shared/services/prime-rate";
import { HelocCreditLimitService } from "./heloc-credit-limit.service";
import { HelocInterestService } from "./heloc-interest.service";
import { calculateHelocMinimumPayment } from "@domain/calculations/heloc-payment";

/**
 * HELOC Service
 * Main business logic for HELOC account management
 */
export class HelocService {
  private creditLimitService: HelocCreditLimitService;
  private interestService: HelocInterestService;

  constructor(
    private readonly helocAccounts: HelocAccountRepository,
    private readonly helocTransactions: HelocTransactionRepository,
    private readonly mortgages: MortgagesRepository
  ) {
    this.creditLimitService = new HelocCreditLimitService(helocAccounts, mortgages);
    this.interestService = new HelocInterestService();
  }

  /**
   * Get all HELOC accounts (for system jobs)
   */
  async findAll() {
    return this.helocAccounts.findAll();
  }

  /**
   * Get all HELOC accounts for a user
   */
  async getAccountsByUserId(userId: string) {
    return this.helocAccounts.findByUserId(userId);
  }

  /**
   * Get HELOC account by ID (with authorization)
   */
  async getAccountById(id: string, userId: string) {
    const account = await this.helocAccounts.findById(id);
    if (!account || account.userId !== userId) {
      return undefined;
    }
    return account;
  }

  /**
   * Create a new HELOC account
   */
  async createAccount(userId: string, payload: Omit<HelocAccountCreateInput, "userId">) {
    // Calculate credit limit if home value and mortgage are provided
    let creditLimit = Number(payload.creditLimit || 0);

    if (payload.mortgageId && payload.homeValueReference) {
      const mortgage = await this.mortgages.findById(payload.mortgageId);
      if (mortgage) {
        creditLimit = calculateCreditLimit(
          Number(payload.homeValueReference),
          Number(payload.maxLtvPercent || 65),
          Number(mortgage.currentBalance)
        );
      }
    }

    // Calculate minimum payment if balance and rate are available
    let minimumPayment: string | undefined;
    if (payload.currentBalance && payload.interestSpread) {
      const { primeRate } = await fetchLatestPrimeRate();
      const annualRate = (primeRate + Number(payload.interestSpread)) / 100;
      const paymentType = (payload.helocPaymentType || "interest_only") as "interest_only" | "principal_plus_interest";
      const minPayment = calculateHelocMinimumPayment(
        Number(payload.currentBalance || 0),
        annualRate,
        paymentType
      );
      minimumPayment = minPayment.toFixed(2);
    }

    const account = await this.helocAccounts.create({
      ...payload,
      userId,
      creditLimit: creditLimit.toFixed(2),
      homeValueReference: payload.homeValueReference || undefined,
      helocMinimumPayment: minimumPayment,
    });

    return account;
  }

  /**
   * Update HELOC account
   */
  async updateAccount(
    id: string,
    userId: string,
    payload: Partial<HelocAccountUpdateInput>
  ) {
    const account = await this.getAccountById(id, userId);
    if (!account) {
      return undefined;
    }

    // Recalculate minimum payment if balance, rate, or payment type changed
    if (payload.currentBalance !== undefined || payload.interestSpread !== undefined || payload.helocPaymentType !== undefined) {
      const balance = Number(payload.currentBalance ?? account.currentBalance);
      const spread = Number(payload.interestSpread ?? account.interestSpread);
      const paymentType = (payload.helocPaymentType ?? account.helocPaymentType ?? "interest_only") as "interest_only" | "principal_plus_interest";
      
      if (balance > 0 && spread !== undefined) {
        const { primeRate } = await fetchLatestPrimeRate();
        const annualRate = (primeRate + spread) / 100;
        const minPayment = calculateHelocMinimumPayment(balance, annualRate, paymentType);
        payload.helocMinimumPayment = minPayment.toFixed(2);
      }
    }

    // Recalculate credit limit if home value or mortgage balance changed
    if (payload.homeValueReference || payload.mortgageId) {
      const homeValue = Number(payload.homeValueReference || account.homeValueReference || 0);
      const maxLTV = Number(payload.maxLtvPercent || account.maxLtvPercent);
      const mortgageId = payload.mortgageId || account.mortgageId;

      let mortgageBalance = 0;
      if (mortgageId) {
        const mortgage = await this.mortgages.findById(mortgageId);
        if (mortgage) {
          mortgageBalance = Number(mortgage.currentBalance);
        }
      }

      const newCreditLimit = calculateCreditLimit(homeValue, maxLTV, mortgageBalance);
      payload.creditLimit = newCreditLimit.toFixed(2);
    }

    return this.helocAccounts.update(id, payload);
  }

  /**
   * Delete HELOC account
   */
  async deleteAccount(id: string, userId: string): Promise<boolean> {
    const account = await this.getAccountById(id, userId);
    if (!account) {
      return false;
    }

    return this.helocAccounts.delete(id);
  }

  /**
   * Record a borrowing transaction
   */
  async recordBorrowing(
    accountId: string,
    userId: string,
    amount: number,
    transactionDate: string,
    description?: string
  ) {
    const account = await this.getAccountById(accountId, userId);
    if (!account) {
      throw new Error("HELOC account not found");
    }

    // Check if draw period has ended
    if (account.helocDrawPeriodEndDate) {
      const drawPeriodEnd = new Date(account.helocDrawPeriodEndDate);
      const transactionDateObj = new Date(transactionDate);
      if (transactionDateObj > drawPeriodEnd) {
        throw new Error(
          `Cannot borrow: Draw period ended on ${drawPeriodEnd.toLocaleDateString()}. HELOC is now in repayment period.`
        );
      }
    }

    const creditLimit = Number(account.creditLimit);
    const currentBalance = Number(account.currentBalance);
    const availableCredit = calculateAvailableCredit(creditLimit, currentBalance);

    if (amount > availableCredit) {
      throw new Error(`Borrowing amount exceeds available credit. Available: $${availableCredit.toFixed(2)}`);
    }

    // Get current prime rate
    const { primeRate } = await fetchLatestPrimeRate();
    const spread = Number(account.interestSpread);
    const interestRate = primeRate + spread;

    const newBalance = currentBalance + amount;
    const newAvailableCredit = calculateAvailableCredit(creditLimit, newBalance);

    const transaction: HelocTransactionCreateInput = {
      helocAccountId: accountId,
      transactionDate,
      transactionType: "borrowing",
      transactionAmount: amount.toFixed(2),
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      availableCreditBefore: availableCredit.toFixed(2),
      availableCreditAfter: newAvailableCredit.toFixed(2),
      interestRate: interestRate.toFixed(3),
      primeRate: primeRate.toFixed(3),
      description,
    };

    const createdTransaction = await this.helocTransactions.create(transaction);

    // Update account balance
    await this.helocAccounts.update(accountId, {
      currentBalance: newBalance.toFixed(2),
    });

    return createdTransaction;
  }

  /**
   * Record a payment transaction
   */
  async recordPayment(
    accountId: string,
    userId: string,
    amount: number,
    transactionDate: string,
    paymentType: "interest_only" | "interest_principal" | "full",
    description?: string
  ) {
    const account = await this.getAccountById(accountId, userId);
    if (!account) {
      throw new Error("HELOC account not found");
    }

    const creditLimit = Number(account.creditLimit);
    const currentBalance = Number(account.currentBalance);
    const availableCredit = calculateAvailableCredit(creditLimit, currentBalance);

    // Get current prime rate
    const { primeRate } = await fetchLatestPrimeRate();
    const spread = Number(account.interestSpread);
    const interestRate = primeRate + spread;

    let newBalance = currentBalance;
    if (paymentType === "full") {
      newBalance = 0;
    } else if (paymentType === "interest_principal") {
      // Calculate interest portion first
      const daysInMonth = new Date(
        new Date(transactionDate).getFullYear(),
        new Date(transactionDate).getMonth() + 1,
        0
      ).getDate();
      const interestPortion = this.interestService.calculateMonthlyInterest(
        currentBalance,
        primeRate,
        spread,
        daysInMonth
      );

      if (amount < interestPortion) {
        throw new Error(`Payment amount must be at least the interest portion: $${interestPortion.toFixed(2)}`);
      }

      const principalPortion = amount - interestPortion;
      newBalance = Math.max(0, currentBalance - principalPortion);
    }
    // For interest_only, balance doesn't change

    const newAvailableCredit = calculateAvailableCredit(creditLimit, newBalance);

    const transaction: HelocTransactionCreateInput = {
      helocAccountId: accountId,
      transactionDate,
      transactionType: "repayment",
      transactionAmount: amount.toFixed(2),
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      availableCreditBefore: availableCredit.toFixed(2),
      availableCreditAfter: newAvailableCredit.toFixed(2),
      interestRate: interestRate.toFixed(3),
      primeRate: primeRate.toFixed(3),
      description,
    };

    const createdTransaction = await this.helocTransactions.create(transaction);

    // Update account balance
    await this.helocAccounts.update(accountId, {
      currentBalance: newBalance.toFixed(2),
    });

    return createdTransaction;
  }

  /**
   * Get transaction history for an account
   */
  async getTransactions(accountId: string, userId: string) {
    const account = await this.getAccountById(accountId, userId);
    if (!account) {
      return undefined;
    }

    return this.helocTransactions.findByAccountId(accountId);
  }

  /**
   * Recalculate credit limit for an account
   */
  async recalculateCreditLimit(accountId: string, userId: string) {
    const account = await this.getAccountById(accountId, userId);
    if (!account) {
      return undefined;
    }

    const newCreditLimit = await this.creditLimitService.calculateCreditLimitForAccount(accountId);
    return this.helocAccounts.update(accountId, {
      creditLimit: newCreditLimit.toFixed(2),
    });
  }
}

