import {
  InvestmentRepository,
  InvestmentTransactionRepository,
  InvestmentIncomeRepository,
} from "@infrastructure/repositories";
import type {
  InsertInvestment,
  UpdateInvestment,
  InsertInvestmentTransaction,
  InsertInvestmentIncome,
} from "@shared/schema";

/**
 * Investment Service
 * Business logic for investment portfolio management
 */
export class InvestmentService {
  constructor(
    private readonly investments: InvestmentRepository,
    private readonly investmentTransactions: InvestmentTransactionRepository,
    private readonly investmentIncome: InvestmentIncomeRepository
  ) {}

  /**
   * Get all investments for a user
   */
  async getInvestmentsByUserId(userId: string) {
    return this.investments.findByUserId(userId);
  }

  /**
   * Get investment by ID (with authorization)
   */
  async getInvestmentById(id: string, userId: string) {
    const investment = await this.investments.findById(id);
    if (!investment || investment.userId !== userId) {
      return undefined;
    }
    return investment;
  }

  /**
   * Create a new investment
   */
  async createInvestment(userId: string, payload: Omit<InsertInvestment, "userId">) {
    return this.investments.create({
      ...payload,
      userId,
    });
  }

  /**
   * Update an investment
   */
  async updateInvestment(id: string, userId: string, payload: Partial<UpdateInvestment>) {
    const investment = await this.getInvestmentById(id, userId);
    if (!investment) {
      return undefined;
    }
    return this.investments.update(id, payload);
  }

  /**
   * Delete an investment
   */
  async deleteInvestment(id: string, userId: string) {
    const investment = await this.getInvestmentById(id, userId);
    if (!investment) {
      return false;
    }
    return this.investments.delete(id);
  }

  /**
   * Get transactions for an investment
   */
  async getTransactionsByInvestmentId(investmentId: string, userId: string) {
    const investment = await this.investments.findById(investmentId);
    if (!investment || investment.userId !== userId) {
      return [];
    }
    return this.investmentTransactions.findByInvestmentId(investmentId);
  }

  /**
   * Record an investment transaction
   */
  async recordTransaction(
    investmentId: string,
    userId: string,
    payload: InsertInvestmentTransaction
  ) {
    const investment = await this.getInvestmentById(investmentId, userId);
    if (!investment) {
      return undefined;
    }
    return this.investmentTransactions.create({
      ...payload,
      investmentId,
    });
  }

  /**
   * Get income records for an investment
   */
  async getIncomeByInvestmentId(investmentId: string, userId: string) {
    const investment = await this.investments.findById(investmentId);
    if (!investment || investment.userId !== userId) {
      return [];
    }
    return this.investmentIncome.findByInvestmentId(investmentId);
  }

  /**
   * Get income records by tax year
   */
  async getIncomeByTaxYear(investmentId: string, userId: string, taxYear: number) {
    const investment = await this.investments.findById(investmentId);
    if (!investment || investment.userId !== userId) {
      return [];
    }
    return this.investmentIncome.findByInvestmentIdAndTaxYear(investmentId, taxYear);
  }

  /**
   * Record investment income
   */
  async recordIncome(investmentId: string, userId: string, payload: InsertInvestmentIncome) {
    const investment = await this.getInvestmentById(investmentId, userId);
    if (!investment) {
      return undefined;
    }
    return this.investmentIncome.create({
      ...payload,
      investmentId,
    });
  }

  /**
   * Get all income for a user by tax year
   */
  async getIncomeByUserIdAndTaxYear(userId: string, taxYear: number) {
    return this.investmentIncome.findByUserIdAndTaxYear(userId, taxYear);
  }
}
