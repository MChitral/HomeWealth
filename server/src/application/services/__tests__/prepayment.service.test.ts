import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert";
import { PrepaymentService } from "../prepayment.service";
import { CashFlow, Mortgage, MortgagePayment } from "@shared/schema";
import {
  CashFlowRepository,
  MortgagesRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";

// Mock repositories
const mockCashFlowRepo = {
  findByUserId: mock.fn(),
} as unknown as CashFlowRepository;

const mockMortgageRepo = {
  findById: mock.fn(),
} as unknown as MortgagesRepository;

const mockMortgagePaymentRepo = {
  findByMortgageId: mock.fn(),
} as unknown as MortgagePaymentsRepository;

describe("PrepaymentService", () => {
  let service: PrepaymentService;

  beforeEach(() => {
    // Reset mocks
    (mockCashFlowRepo.findByUserId as any).mock.resetCalls();
    (mockMortgageRepo.findById as any).mock.resetCalls();
    (mockMortgagePaymentRepo.findByMortgageId as any).mock.resetCalls();

    service = new PrepaymentService(mockCashFlowRepo, mockMortgageRepo, mockMortgagePaymentRepo);
  });

  describe("calculateSurplus", () => {
    it("should correctly calculate surplus", () => {
      const cashFlow = {
        monthlyIncome: "5000",
        propertyTax: "300",
        homeInsurance: "100",
        condoFees: "0",
        utilities: "200",
        groceries: "500",
        dining: "200",
        transportation: "100",
        entertainment: "100",
        carLoan: "300",
        studentLoan: "0",
        creditCard: "200",
      } as CashFlow;

      // Income (5000) - Expenses (1500) - Debt (500) = 3000
      const surplus = service.calculateSurplus(cashFlow);
      assert.strictEqual(surplus, 3000);
    });

    it("should return 0 if expenses exceed income", () => {
      const cashFlow = {
        monthlyIncome: "1000",
        propertyTax: "500",
        homeInsurance: "500",
        condoFees: "500",
        utilities: "0", // Total expenses 1500
        groceries: "0",
        dining: "0",
        transportation: "0",
        entertainment: "0",
        carLoan: "0",
        studentLoan: "0",
        creditCard: "0",
      } as CashFlow;

      const surplus = service.calculateSurplus(cashFlow);
      assert.strictEqual(surplus, 0);
    });
  });

  describe("calculatePrepaymentRoom", () => {
    it("should correctly calculate remaining room", () => {
      const mortgage = {
        originalAmount: "500000",
        annualPrepaymentLimitPercent: 20,
      } as Mortgage;

      const payments = [
        { prepaymentAmount: "10000" },
        { prepaymentAmount: "5000" },
      ] as MortgagePayment[];

      // Limit: 500k * 20% = 100k
      // Used: 15k
      // Remaining: 85k
      const result = service.calculatePrepaymentRoom(mortgage, payments);

      assert.strictEqual(result.limit, 100000);
      assert.strictEqual(result.used, 15000);
      assert.strictEqual(result.remaining, 85000);
    });
  });

  describe("getPrepaymentOpportunity", () => {
    it("should return recommendation to focus on cash flow if no surplus", async () => {
      (mockCashFlowRepo.findByUserId as any).mock.mockImplementation(() =>
        Promise.resolve({
          monthlyIncome: "1000",
          propertyTax: "5000", // Negative flow
          homeInsurance: "0",
          condoFees: "0",
          utilities: "0",
          groceries: "0",
          dining: "0",
          transportation: "0",
          entertainment: "0",
          carLoan: "0",
          studentLoan: "0",
          creditCard: "0",
        })
      );
      (mockMortgageRepo.findById as any).mock.mockImplementation(() =>
        Promise.resolve({
          id: "m1",
          originalAmount: "500000",
          annualPrepaymentLimitPercent: 20,
        })
      );
      (mockMortgagePaymentRepo.findByMortgageId as any).mock.mockImplementation(() =>
        Promise.resolve([])
      );

      const result = await service.getPrepaymentOpportunity("u1", "m1");
      assert.strictEqual(result?.monthlySurplus, 0);
      assert.ok(result?.recommendation.includes("Focus on improving cash flow"));
    });

    it("should return recommendation to prepay if surplus exists", async () => {
      (mockCashFlowRepo.findByUserId as any).mock.mockImplementation(() =>
        Promise.resolve({
          monthlyIncome: "5000",
          propertyTax: "0",
          homeInsurance: "0",
          condoFees: "0",
          utilities: "0",
          groceries: "0",
          dining: "0",
          transportation: "0",
          entertainment: "0",
          carLoan: "0",
          studentLoan: "0",
          creditCard: "0",
        })
      );
      (mockMortgageRepo.findById as any).mock.mockImplementation(() =>
        Promise.resolve({
          id: "m1",
          originalAmount: "500000",
          annualPrepaymentLimitPercent: 20,
        })
      );
      (mockMortgagePaymentRepo.findByMortgageId as any).mock.mockImplementation(() =>
        Promise.resolve([])
      );

      const result = await service.getPrepaymentOpportunity("u1", "m1");
      assert.strictEqual(result?.monthlySurplus, 5000);
      assert.ok(result?.recommendation.includes("Consider setting up a recurring prepayment"));
    });
  });
});
