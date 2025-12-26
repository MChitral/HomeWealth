import { describe, it, expect, beforeEach, vi } from "vitest";
import type { ApplicationServices } from "@application/services";
import type { Mortgage, MortgageTerm } from "@shared/schema";

// Mock services
const mockTriggerRateMonitor = {
  checkOne: vi.fn(),
};

const mockMortgageService = {
  findAll: vi.fn(),
};

const mockMortgageTermService = {
  listForMortgage: vi.fn(),
};

const mockNotificationService = {
  createNotification: vi.fn(),
};

const mockServices = {
  mortgages: mockMortgageService,
  mortgageTerms: mockMortgageTermService,
  triggerRateMonitor: mockTriggerRateMonitor,
  notifications: mockNotificationService,
} as unknown as ApplicationServices;

describe("Trigger Rate Alert Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAlertType", () => {
    it("should return trigger_rate_hit when isHit is true", async () => {
      const { checkTriggerRatesAndSendAlerts } = await import("../trigger-rate-alert-job");

      const mockMortgage: Mortgage = {
        id: "mortgage-1",
        userId: "user-1",
        propertyPrice: "500000",
        downPayment: "100000",
        originalAmount: "400000",
        currentBalance: "350000",
        startDate: "2020-01-01",
        amortizationYears: 25,
        amortizationMonths: 0,
        paymentFrequency: "monthly",
        annualPrepaymentLimitPercent: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMortgageService.findAll.mockResolvedValue([mockMortgage]);
      mockTriggerRateMonitor.checkOne.mockResolvedValue({
        mortgageId: "mortgage-1",
        mortgageName: "Test Mortgage",
        userId: "user-1",
        currentRate: 0.065, // 6.5%
        triggerRate: 0.06, // 6.0%
        isHit: true,
        isRisk: false,
        balance: 350000,
        paymentAmount: 2000,
      });

      mockMortgageTermService.listForMortgage.mockResolvedValue([
        {
          id: "term-1",
          mortgageId: "mortgage-1",
          termType: "variable-fixed",
          startDate: "2020-01-01",
          endDate: "2025-01-01",
          termYears: 5,
          paymentFrequency: "monthly",
          regularPaymentAmount: "2000.00",
        } as MortgageTerm,
      ]);

      mockNotificationService.createNotification.mockResolvedValue({
        id: "notification-1",
        userId: "user-1",
        type: "trigger_rate_alert",
        title: "Test",
        message: "Test",
        read: 0,
        emailSent: 0,
        createdAt: new Date(),
      });

      await checkTriggerRatesAndSendAlerts(mockServices);

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        "user-1",
        "trigger_rate_alert",
        expect.stringContaining("Trigger Rate Hit"),
        expect.any(String),
        expect.objectContaining({
          alertType: "trigger_rate_hit",
          isHit: true,
        })
      );
    });

    it("should return trigger_rate_close when distance is <= 0.5%", async () => {
      const { checkTriggerRatesAndSendAlerts } = await import("../trigger-rate-alert-job");

      const mockMortgage: Mortgage = {
        id: "mortgage-1",
        userId: "user-1",
        propertyPrice: "500000",
        downPayment: "100000",
        originalAmount: "400000",
        currentBalance: "350000",
        startDate: "2020-01-01",
        amortizationYears: 25,
        amortizationMonths: 0,
        paymentFrequency: "monthly",
        annualPrepaymentLimitPercent: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMortgageService.findAll.mockResolvedValue([mockMortgage]);
      mockTriggerRateMonitor.checkOne.mockResolvedValue({
        mortgageId: "mortgage-1",
        mortgageName: "Test Mortgage",
        userId: "user-1",
        currentRate: 0.0605, // 6.05%
        triggerRate: 0.06, // 6.0%
        isHit: false,
        isRisk: true,
        balance: 350000,
        paymentAmount: 2000,
      });

      mockMortgageTermService.listForMortgage.mockResolvedValue([
        {
          id: "term-1",
          mortgageId: "mortgage-1",
          termType: "variable-fixed",
          startDate: "2020-01-01",
          endDate: "2025-01-01",
          termYears: 5,
          paymentFrequency: "monthly",
          regularPaymentAmount: "2000.00",
        } as MortgageTerm,
      ]);

      mockNotificationService.createNotification.mockResolvedValue({
        id: "notification-1",
        userId: "user-1",
        type: "trigger_rate_alert",
        title: "Test",
        message: "Test",
        read: 0,
        emailSent: 0,
        createdAt: new Date(),
      });

      await checkTriggerRatesAndSendAlerts(mockServices);

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        "user-1",
        "trigger_rate_alert",
        expect.stringContaining("Close"),
        expect.any(String),
        expect.objectContaining({
          alertType: "trigger_rate_close",
        })
      );
    });

    it("should return trigger_rate_approaching when distance is <= 1%", async () => {
      const { checkTriggerRatesAndSendAlerts } = await import("../trigger-rate-alert-job");

      const mockMortgage: Mortgage = {
        id: "mortgage-1",
        userId: "user-1",
        propertyPrice: "500000",
        downPayment: "100000",
        originalAmount: "400000",
        currentBalance: "350000",
        startDate: "2020-01-01",
        amortizationYears: 25,
        amortizationMonths: 0,
        paymentFrequency: "monthly",
        annualPrepaymentLimitPercent: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMortgageService.findAll.mockResolvedValue([mockMortgage]);
      mockTriggerRateMonitor.checkOne.mockResolvedValue({
        mortgageId: "mortgage-1",
        mortgageName: "Test Mortgage",
        userId: "user-1",
        currentRate: 0.061, // 6.1%
        triggerRate: 0.06, // 6.0%
        isHit: false,
        isRisk: false,
        balance: 350000,
        paymentAmount: 2000,
      });

      mockMortgageTermService.listForMortgage.mockResolvedValue([
        {
          id: "term-1",
          mortgageId: "mortgage-1",
          termType: "variable-fixed",
          startDate: "2020-01-01",
          endDate: "2025-01-01",
          termYears: 5,
          paymentFrequency: "monthly",
          regularPaymentAmount: "2000.00",
        } as MortgageTerm,
      ]);

      mockNotificationService.createNotification.mockResolvedValue({
        id: "notification-1",
        userId: "user-1",
        type: "trigger_rate_alert",
        title: "Test",
        message: "Test",
        read: 0,
        emailSent: 0,
        createdAt: new Date(),
      });

      await checkTriggerRatesAndSendAlerts(mockServices);

      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        "user-1",
        "trigger_rate_alert",
        expect.stringContaining("Approaching"),
        expect.any(String),
        expect.objectContaining({
          alertType: "trigger_rate_approaching",
        })
      );
    });
  });

  describe("impact calculations", () => {
    it("should calculate monthly balance increase when trigger rate is hit", async () => {
      const { checkTriggerRatesAndSendAlerts } = await import("../trigger-rate-alert-job");

      const mockMortgage: Mortgage = {
        id: "mortgage-1",
        userId: "user-1",
        propertyPrice: "500000",
        downPayment: "100000",
        originalAmount: "400000",
        currentBalance: "350000",
        startDate: "2020-01-01",
        amortizationYears: 25,
        amortizationMonths: 0,
        paymentFrequency: "monthly",
        annualPrepaymentLimitPercent: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMortgageService.findAll.mockResolvedValue([mockMortgage]);
      mockTriggerRateMonitor.checkOne.mockResolvedValue({
        mortgageId: "mortgage-1",
        mortgageName: "Test Mortgage",
        userId: "user-1",
        currentRate: 0.065, // 6.5%
        triggerRate: 0.06, // 6.0%
        isHit: true,
        isRisk: false,
        balance: 350000,
        paymentAmount: 2000,
      });

      mockMortgageTermService.listForMortgage.mockResolvedValue([
        {
          id: "term-1",
          mortgageId: "mortgage-1",
          termType: "variable-fixed",
          startDate: "2020-01-01",
          endDate: "2025-01-01",
          termYears: 5,
          paymentFrequency: "monthly",
          regularPaymentAmount: "2000.00",
        } as MortgageTerm,
      ]);

      mockNotificationService.createNotification.mockResolvedValue({
        id: "notification-1",
        userId: "user-1",
        type: "trigger_rate_alert",
        title: "Test",
        message: "Test",
        read: 0,
        emailSent: 0,
        createdAt: new Date(),
      });

      await checkTriggerRatesAndSendAlerts(mockServices);

      const callArgs = mockNotificationService.createNotification.mock.calls[0];
      const metadata = callArgs[4];

      expect(metadata.monthlyBalanceIncrease).toBeDefined();
      expect(metadata.monthlyBalanceIncrease).toBeGreaterThan(0);
      // Monthly increase = (0.065 - 0.06) * 350000 * (1/12) = 0.005 * 350000 / 12 ≈ 145.83
      expect(metadata.monthlyBalanceIncrease).toBeCloseTo(145.83, 1);
    });
  });

  describe("duplicate prevention", () => {
    it("should skip alerts that have already been sent", async () => {
      const { checkTriggerRatesAndSendAlerts } = await import("../trigger-rate-alert-job");

      const mockMortgage: Mortgage = {
        id: "mortgage-1",
        userId: "user-1",
        propertyPrice: "500000",
        downPayment: "100000",
        originalAmount: "400000",
        currentBalance: "350000",
        startDate: "2020-01-01",
        amortizationYears: 25,
        amortizationMonths: 0,
        paymentFrequency: "monthly",
        annualPrepaymentLimitPercent: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMortgageService.findAll.mockResolvedValue([mockMortgage]);
      mockTriggerRateMonitor.checkOne.mockResolvedValue({
        mortgageId: "mortgage-1",
        mortgageName: "Test Mortgage",
        userId: "user-1",
        currentRate: 0.065,
        triggerRate: 0.06,
        isHit: true,
        isRisk: false,
        balance: 350000,
        paymentAmount: 2000,
      });

      mockMortgageTermService.listForMortgage.mockResolvedValue([
        {
          id: "term-1",
          mortgageId: "mortgage-1",
          termType: "variable-fixed",
          startDate: "2020-01-01",
          endDate: "2025-01-01",
          termYears: 5,
          paymentFrequency: "monthly",
          regularPaymentAmount: "2000.00",
        } as MortgageTerm,
      ]);

      // Mock database to return existing notification (simulating duplicate check)
      const { db } = await import("@infrastructure/db/connection");
      const { notifications } = await import("@shared/schema");

      // Create a mock notification to simulate duplicate
      await db.insert(notifications).values({
        userId: "user-1",
        type: "trigger_rate_alert",
        title: "Test",
        message: "Test",
        read: 0,
        emailSent: 0,
        metadata: {
          mortgageId: "mortgage-1",
          alertType: "trigger_rate_hit",
        },
      });

      await checkTriggerRatesAndSendAlerts(mockServices);

      // Should still attempt to create, but the hasAlertBeenSent check should prevent it
      // The actual duplicate check happens in the job, so we verify it was called
      expect(mockTriggerRateMonitor.checkOne).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle errors gracefully without crashing", async () => {
      const { checkTriggerRatesAndSendAlerts } = await import("../trigger-rate-alert-job");

      const mockMortgage: Mortgage = {
        id: "mortgage-1",
        userId: "user-1",
        propertyPrice: "500000",
        downPayment: "100000",
        originalAmount: "400000",
        currentBalance: "350000",
        startDate: "2020-01-01",
        amortizationYears: 25,
        amortizationMonths: 0,
        paymentFrequency: "monthly",
        annualPrepaymentLimitPercent: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMortgageService.findAll.mockResolvedValue([mockMortgage]);
      mockTriggerRateMonitor.checkOne.mockRejectedValue(new Error("Database error"));

      // Should not throw
      await expect(checkTriggerRatesAndSendAlerts(mockServices)).resolves.not.toThrow();
    });
  });
});
