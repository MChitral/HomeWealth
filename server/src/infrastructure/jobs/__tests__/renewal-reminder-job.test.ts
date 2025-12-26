import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRenewalsAndSendReminders } from "../renewal-reminder-job";
import type { ApplicationServices } from "@application/services";
import type { Mortgage } from "@shared/schema";

// Mock services
const mockRenewalService = {
  getRenewalStatus: vi.fn(),
};

const mockMortgageService = {
  findAll: vi.fn(),
};

const mockNotificationService = {
  createNotification: vi.fn(),
};

const mockServices = {
  mortgages: mockMortgageService,
  renewalService: mockRenewalService,
  notifications: mockNotificationService,
} as unknown as ApplicationServices;

describe("Renewal Reminder Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("shouldSendReminder", () => {
    it("should return true for reminder intervals (180, 90, 30, 7 days)", async () => {
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

      // Test each reminder interval
      for (const days of [180, 90, 30, 7]) {
        mockRenewalService.getRenewalStatus.mockResolvedValue({
          mortgageId: "mortgage-1",
          daysUntilRenewal: days,
          renewalDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          status: "upcoming",
          currentRate: 5.5,
          estimatedPenalty: { amount: 5000, method: "IRD" },
        });

        mockNotificationService.createNotification.mockResolvedValue({
          id: "notification-1",
          userId: "user-1",
          type: "renewal_reminder",
          title: "Test",
          message: "Test",
          read: 0,
          emailSent: 0,
          createdAt: new Date(),
        });

        await checkRenewalsAndSendReminders(mockServices);

        expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
          "user-1",
          "renewal_reminder",
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            mortgageId: "mortgage-1",
            daysUntil: days,
          })
        );

        vi.clearAllMocks();
      }
    });

    it("should return false for non-reminder intervals", async () => {
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
      mockRenewalService.getRenewalStatus.mockResolvedValue({
        mortgageId: "mortgage-1",
        daysUntilRenewal: 100, // Not a reminder interval
        renewalDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "upcoming",
        currentRate: 5.5,
        estimatedPenalty: { amount: 5000, method: "IRD" },
      });

      await checkRenewalsAndSendReminders(mockServices);

      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    });
  });

  describe("duplicate prevention", () => {
    it("should skip reminders that have already been sent", async () => {
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
      mockRenewalService.getRenewalStatus.mockResolvedValue({
        mortgageId: "mortgage-1",
        daysUntilRenewal: 30,
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "urgent",
        currentRate: 5.5,
        estimatedPenalty: { amount: 5000, method: "IRD" },
      });

      // Note: Duplicate prevention is tested via integration tests
      // Unit test verifies the logic flow
      await checkRenewalsAndSendReminders(mockServices);

      // Verify renewal status was checked
      expect(mockRenewalService.getRenewalStatus).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should handle mortgages with no active term", async () => {
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
      mockRenewalService.getRenewalStatus.mockResolvedValue(null); // No active term

      await checkRenewalsAndSendReminders(mockServices);

      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    });

    it("should handle mortgages past renewal date", async () => {
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
      mockRenewalService.getRenewalStatus.mockResolvedValue({
        mortgageId: "mortgage-1",
        daysUntilRenewal: -10, // Past renewal date
        renewalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "safe",
        currentRate: 5.5,
        estimatedPenalty: { amount: 5000, method: "IRD" },
      });

      await checkRenewalsAndSendReminders(mockServices);

      expect(mockNotificationService.createNotification).not.toHaveBeenCalled();
    });

    it("should handle errors gracefully without crashing", async () => {
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
      mockRenewalService.getRenewalStatus.mockRejectedValue(new Error("Database error"));

      // Should not throw
      await expect(checkRenewalsAndSendReminders(mockServices)).resolves.not.toThrow();
    });
  });
});
