import { CashFlow, Mortgage, MortgagePayment } from "@shared/schema";
import {
  CashFlowRepository,
  MortgagesRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";

export interface PrepaymentOpportunity {
  yearlyLimit: number;
  usedAmount: number;
  remainingRoom: number;
  monthlySurplus: number;
  recommendation: string;
}

export class PrepaymentService {
  constructor(
    private cashFlowRepository: CashFlowRepository,
    private mortgageRepository: MortgagesRepository,
    private mortgagePaymentRepository: MortgagePaymentsRepository
  ) {}

  async getPrepaymentOpportunity(
    userId: string,
    mortgageId: string
  ): Promise<PrepaymentOpportunity | null> {
    const cashFlow = await this.cashFlowRepository.findByUserId(userId);
    const mortgage = await this.mortgageRepository.findById(mortgageId);

    if (!mortgage) return null;

    // Calc surplus (default to 0 if no cashFlow record)
    const monthlySurplus = cashFlow ? this.calculateSurplus(cashFlow) : 0;

    // Calc room
    const { getPrepaymentYear } = await import("@server-shared/calculations/prepayment-year");
    const payments = await this.mortgagePaymentRepository.findByMortgageId(mortgageId);
    const today = new Date().toISOString().split("T")[0];
    const currentPrepaymentYear = getPrepaymentYear(
      today,
      mortgage.prepaymentLimitResetDate,
      mortgage.startDate
    );

    // Filter for current prepayment year (anniversary or calendar)
    const currentYearPayments = payments.filter((p: MortgagePayment) => {
      const paymentYear = getPrepaymentYear(
        p.paymentDate,
        mortgage.prepaymentLimitResetDate,
        mortgage.startDate
      );
      return paymentYear === currentPrepaymentYear;
    });

    const { limit, used, remaining } = this.calculatePrepaymentRoom(mortgage, currentYearPayments);

    return {
      yearlyLimit: limit,
      usedAmount: used,
      remainingRoom: remaining,
      monthlySurplus,
      recommendation: this.generateRecommendation(monthlySurplus, remaining),
    };
  }

  calculateSurplus(cashFlow: CashFlow): number {
    const income = Number(cashFlow.monthlyIncome);

    const expenses =
      Number(cashFlow.propertyTax) +
      Number(cashFlow.homeInsurance) +
      Number(cashFlow.condoFees) +
      Number(cashFlow.utilities) +
      Number(cashFlow.groceries) +
      Number(cashFlow.dining) +
      Number(cashFlow.transportation) +
      Number(cashFlow.entertainment);

    const debt =
      Number(cashFlow.carLoan) + Number(cashFlow.studentLoan) + Number(cashFlow.creditCard);

    return Math.max(0, income - expenses - debt);
  }

  calculatePrepaymentRoom(
    mortgage: Mortgage,
    currentYearPayments: MortgagePayment[]
  ): { limit: number; used: number; remaining: number; carryForward: number } {
    const percent = mortgage.annualPrepaymentLimitPercent || 20; // Default 20%
    const annualLimit = Number(mortgage.originalAmount) * (percent / 100);
    const carryForward = Number(mortgage.prepaymentCarryForward || 0);

    // Available limit includes carry-forward from previous year
    const limit = annualLimit + carryForward;

    const used = currentYearPayments.reduce((sum, p) => sum + Number(p.prepaymentAmount || 0), 0);

    const remaining = Math.max(0, limit - used);

    return { limit, used, remaining, carryForward };
  }

  private generateRecommendation(surplus: number, remainingRoom: number): string {
    if (surplus <= 0) {
      return "Focus on improving cash flow before making prepayments.";
    }

    if (remainingRoom <= 0) {
      return "You have maximized your prepayment privileges for the year. Consider investing surplus.";
    }

    if (surplus > 0) {
      const annualPotential = surplus * 12;
      if (annualPotential > remainingRoom) {
        return `You have $${surplus.toFixed(0)}/mo surplus. You can maximize your prepayment limit in ${(remainingRoom / surplus).toFixed(1)} months.`;
      } else {
        return `You have $${surplus.toFixed(0)}/mo surplus. Consider setting up a recurring prepayment to save on interest.`;
      }
    }

    return "Consider making a prepayment to save on interest.";
  }
}
