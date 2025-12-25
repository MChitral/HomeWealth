import {
  SmithManeuverRepository,
  MortgagesRepository,
  HelocAccountRepository,
  HelocTransactionRepository,
} from "@infrastructure/repositories";
import { TaxCalculationService } from "./tax-calculation.service";
import { calculateCreditRoomIncrease } from "@server-shared/calculations/smith-maneuver/credit-room";
import { calculateNetBenefit } from "@server-shared/calculations/smith-maneuver/net-benefit";
import { calculateLeverageRatio, calculateInterestCoverage } from "@server-shared/calculations/smith-maneuver/risk-metrics";
import type {
  InsertSmithManeuverStrategy,
  UpdateSmithManeuverStrategy,
  InsertSmithManeuverTransaction,
} from "@shared/schema";
import { fetchLatestPrimeRate } from "@server-shared/services/prime-rate";

export interface CreateSmithManeuverStrategyParams extends Omit<InsertSmithManeuverStrategy, "userId"> {
  userId: string;
}

export interface YearlyProjection {
  year: number;
  mortgageBalance: number;
  helocBalance: number;
  investmentValue: number;
  totalPrepayments: number;
  totalBorrowings: number;
  helocInterestPaid: number;
  investmentReturns: number;
  taxSavings: number;
  netBenefit: number;
  leverageRatio: number;
  interestCoverage: number;
}

/**
 * Smith Maneuver Service
 * Business logic for Smith Maneuver strategy modeling
 */
export class SmithManeuverService {
  constructor(
    private readonly smithManeuver: SmithManeuverRepository,
    private readonly mortgages: MortgagesRepository,
    private readonly helocAccounts: HelocAccountRepository,
    private readonly helocTransactions: HelocTransactionRepository,
    private readonly taxCalculation: TaxCalculationService
  ) {}

  /**
   * Get all strategies for a user
   */
  async getStrategiesByUserId(userId: string) {
    return this.smithManeuver.findStrategiesByUserId(userId);
  }

  /**
   * Get strategy by ID (with authorization)
   */
  async getStrategyById(id: string, userId: string) {
    const strategy = await this.smithManeuver.findStrategyById(id);
    if (!strategy || strategy.userId !== userId) {
      return undefined;
    }
    return strategy;
  }

  /**
   * Create a new Smith Maneuver strategy
   */
  async createStrategy(params: CreateSmithManeuverStrategyParams) {
    // Validate mortgage and HELOC belong to user
    const mortgage = await this.mortgages.findById(params.mortgageId);
    if (!mortgage || mortgage.userId !== params.userId) {
      throw new Error("Mortgage not found or access denied");
    }

    const helocAccount = await this.helocAccounts.findById(params.helocAccountId);
    if (!helocAccount || helocAccount.userId !== params.userId) {
      throw new Error("HELOC account not found or access denied");
    }

    // Calculate marginal tax rate if not provided
    let marginalTaxRate = params.marginalTaxRate;
    if (!marginalTaxRate) {
      marginalTaxRate = await this.taxCalculation.calculateMarginalTaxRate(
        parseFloat(params.annualIncome),
        params.province,
        2025
      );
    }

    return this.smithManeuver.createStrategy({
      ...params,
      marginalTaxRate: marginalTaxRate.toString(),
    });
  }

  /**
   * Update a strategy
   */
  async updateStrategy(id: string, userId: string, payload: Partial<UpdateSmithManeuverStrategy>) {
    const strategy = await this.getStrategyById(id, userId);
    if (!strategy) {
      return undefined;
    }

    // Recalculate marginal tax rate if income or province changed
    if (payload.annualIncome || payload.province) {
      const annualIncome = payload.annualIncome
        ? parseFloat(payload.annualIncome)
        : parseFloat(strategy.annualIncome);
      const province = payload.province || strategy.province;
      const marginalTaxRate = await this.taxCalculation.calculateMarginalTaxRate(
        annualIncome,
        province,
        2025
      );
      payload.marginalTaxRate = marginalTaxRate.toString();
    }

    return this.smithManeuver.updateStrategy(id, payload);
  }

  /**
   * Delete a strategy
   */
  async deleteStrategy(id: string, userId: string) {
    const strategy = await this.getStrategyById(id, userId);
    if (!strategy) {
      return false;
    }
    return this.smithManeuver.deleteStrategy(id);
  }

  /**
   * Calculate credit room increase from prepayment
   */
  calculateCreditRoomIncrease(
    prepaymentAmount: number,
    mortgageBalance: number,
    homeValue: number,
    maxLtvPercent: number
  ): number {
    return calculateCreditRoomIncrease(prepaymentAmount, mortgageBalance, homeValue, maxLtvPercent);
  }

  /**
   * Validate borrowing amount against available credit
   */
  validateBorrowing(borrowingAmount: number, availableCredit: number): {
    valid: boolean;
    error?: string;
  } {
    if (borrowingAmount <= 0) {
      return { valid: false, error: "Borrowing amount must be positive" };
    }
    if (borrowingAmount > availableCredit) {
      return {
        valid: false,
        error: `Borrowing amount (${borrowingAmount}) exceeds available credit (${availableCredit})`,
      };
    }
    return { valid: true };
  }

  /**
   * Calculate HELOC interest for a period
   */
  async calculateHelocInterest(
    helocBalance: number,
    primeRate: number,
    spread: number,
    days: number
  ): Promise<number> {
    const annualRate = (primeRate + spread) / 100;
    const dailyRate = annualRate / 365;
    return helocBalance * dailyRate * days;
  }

  /**
   * Calculate tax deduction for HELOC interest
   */
  async calculateTaxDeduction(
    helocInterest: number,
    investmentUsePercent: number,
    marginalTaxRate: number
  ) {
    return this.taxCalculation.calculateTaxDeduction(
      helocInterest,
      investmentUsePercent,
      marginalTaxRate
    );
  }

  /**
   * Calculate net benefit
   */
  calculateNetBenefit(
    investmentReturns: number,
    investmentTax: number,
    helocInterest: number,
    taxSavings: number
  ): number {
    return calculateNetBenefit(investmentReturns, investmentTax, helocInterest, taxSavings);
  }

  /**
   * Get transactions for a strategy
   */
  async getTransactionsByStrategyId(strategyId: string, userId: string) {
    const strategy = await this.getStrategyById(strategyId, userId);
    if (!strategy) {
      return [];
    }
    return this.smithManeuver.findTransactionsByStrategyId(strategyId);
  }

  /**
   * Get tax calculations for a strategy
   */
  async getTaxCalculationsByStrategyId(strategyId: string, userId: string) {
    const strategy = await this.getStrategyById(strategyId, userId);
    if (!strategy) {
      return [];
    }
    return this.smithManeuver.findTaxCalculationsByStrategyId(strategyId);
  }

  /**
   * Generate projections for a strategy
   * Simplified version - full implementation would require complex month-by-month modeling
   */
  async projectStrategy(strategyId: string, userId: string, years: number = 30): Promise<YearlyProjection[]> {
    const strategy = await this.getStrategyById(strategyId, userId);
    if (!strategy) {
      throw new Error("Strategy not found");
    }

    const mortgage = await this.mortgages.findById(strategy.mortgageId);
    if (!mortgage) {
      throw new Error("Mortgage not found");
    }

    const helocAccount = await this.helocAccounts.findById(strategy.helocAccountId);
    if (!helocAccount) {
      throw new Error("HELOC account not found");
    }

    const projections: YearlyProjection[] = [];
    let mortgageBalance = parseFloat(mortgage.currentBalance);
    let helocBalance = parseFloat(helocAccount.currentBalance);
    let investmentValue = 0;
    let totalPrepayments = 0;
    let totalBorrowings = 0;

    const prepaymentAmount = parseFloat(strategy.prepaymentAmount);
    const borrowingPercent = parseFloat(strategy.borrowingPercentage);
    const expectedReturnRate = parseFloat(strategy.expectedReturnRate);
    const marginalTaxRate = parseFloat(strategy.marginalTaxRate || "0");
    const homeValue = parseFloat(mortgage.propertyPrice);
    const maxLtv = parseFloat(helocAccount.maxLtvPercent);

    // Get prime rate
    const primeRate = await fetchLatestPrimeRate();
    const helocRate = primeRate + parseFloat(helocAccount.interestSpread);

    for (let year = 1; year <= years; year++) {
      // Calculate annual prepayment based on frequency
      let annualPrepayment = 0;
      switch (strategy.prepaymentFrequency) {
        case "monthly":
          annualPrepayment = prepaymentAmount * 12;
          break;
        case "quarterly":
          annualPrepayment = prepaymentAmount * 4;
          break;
        case "annually":
          annualPrepayment = prepaymentAmount;
          break;
        case "lump_sum":
          annualPrepayment = year === 1 ? prepaymentAmount : 0;
          break;
      }

      totalPrepayments += annualPrepayment;
      mortgageBalance -= annualPrepayment;

      // Calculate credit room increase
      const creditRoomIncrease = this.calculateCreditRoomIncrease(
        annualPrepayment,
        mortgageBalance + annualPrepayment,
        homeValue,
        maxLtv
      );

      // Calculate borrowing amount
      const borrowingAmount = (annualPrepayment * borrowingPercent) / 100;
      totalBorrowings += borrowingAmount;
      helocBalance += borrowingAmount;
      investmentValue += borrowingAmount;

      // Calculate HELOC interest (annual)
      const helocInterestPaid = helocBalance * (helocRate / 100);

      // Calculate investment returns
      const investmentReturns = investmentValue * (expectedReturnRate / 100);

      // Calculate tax savings
      const taxDeductionResult = await this.calculateTaxDeduction(
        helocInterestPaid,
        100, // Assuming 100% investment use
        marginalTaxRate
      );
      const taxSavings = taxDeductionResult.taxSavings;

      // Calculate investment tax (simplified - assuming capital gains)
      const investmentTaxResult = await this.taxCalculation.calculateInvestmentIncomeTax(
        investmentReturns,
        "capital_gain",
        strategy.province,
        marginalTaxRate
      );
      const investmentTax = investmentTaxResult.taxAmount;

      // Calculate net benefit
      const netBenefit = this.calculateNetBenefit(
        investmentReturns,
        investmentTax,
        helocInterestPaid,
        taxSavings
      );

      // Calculate risk metrics
      const leverageRatio = calculateLeverageRatio(helocBalance, investmentValue);
      const interestCoverage = calculateInterestCoverage(investmentReturns, helocInterestPaid);

      projections.push({
        year,
        mortgageBalance: Math.max(0, mortgageBalance),
        helocBalance,
        investmentValue,
        totalPrepayments,
        totalBorrowings,
        helocInterestPaid,
        investmentReturns,
        taxSavings,
        netBenefit,
        leverageRatio,
        interestCoverage,
      });

      // Update investment value with returns
      investmentValue += investmentReturns;
    }

    return projections;
  }
}

