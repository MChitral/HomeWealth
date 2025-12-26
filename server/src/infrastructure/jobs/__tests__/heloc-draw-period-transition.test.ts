import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkHelocDrawPeriodTransitions } from "../heloc-draw-period-transition";
import type { ApplicationServices } from "@application/services";
import type { HelocAccount } from "@shared/schema";

// Mock dependencies
vi.mock("@server-shared/services/prime-rate", () => ({
  fetchLatestPrimeRate: vi.fn(() => Promise.resolve({ primeRate: 7.2 })),
}));

vi.mock("@domain/calculations/heloc-payment", () => ({
  calculateHelocMinimumPayment: vi.fn((balance, rate, paymentType) => {
    if (paymentType === "interest_only") {
      return balance * (rate / 12);
    }
    // Simplified principal+interest calculation for testing
    const monthlyRate = rate / 12;
    const months = 300; // 25 years
    if (monthlyRate === 0) return balance / months;
    return (monthlyRate * balance) / (1 - Math.pow(1 + monthlyRate, -months));
  }),
}));

describe("checkHelocDrawPeriodTransitions", () => {
  let mockServices: Partial<ApplicationServices>;
  let mockHelocAccounts: HelocAccount[];
  let mockNotifications: any[];

  beforeEach(() => {
    mockNotifications = [];
    mockHelocAccounts = [];

    mockServices = {
      heloc: {
        findAll: vi.fn(() => Promise.resolve(mockHelocAccounts)),
        updateAccount: vi.fn(async (id, userId, payload) => {
          const account = mockHelocAccounts.find((a) => a.id === id);
          if (!account) return undefined;
          return { ...account, ...payload };
        }),
      },
      notifications: {
        createNotification: vi.fn(async (userId, type, title, message, metadata) => {
          const notification = {
            id: `notif-${mockNotifications.length + 1}`,
            userId,
            type,
            title,
            message,
            metadata: metadata || {},
            read: 0,
            emailSent: 0,
            createdAt: new Date(),
          };
          mockNotifications.push(notification);
          return notification;
        }),
        getNotifications: vi.fn(async (userId, options) => {
          return mockNotifications.filter((n) => n.userId === userId);
        }),
      },
    };
  });

  it("should skip HELOCs without draw period end date", async () => {
    mockHelocAccounts = [
      {
        id: "heloc-1",
        userId: "user-1",
        helocDrawPeriodEndDate: null,
        currentBalance: "10000",
        helocPaymentType: "interest_only",
        helocMinimumPayment: "60",
        interestSpread: "2.5",
      } as HelocAccount,
    ];

    await checkHelocDrawPeriodTransitions(mockServices as ApplicationServices);

    expect(mockServices.notifications?.createNotification).not.toHaveBeenCalled();
    expect(mockServices.heloc?.updateAccount).not.toHaveBeenCalled();
  });

  it("should skip HELOCs with future draw period end dates", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    mockHelocAccounts = [
      {
        id: "heloc-1",
        userId: "user-1",
        helocDrawPeriodEndDate: futureDate.toISOString().split("T")[0],
        currentBalance: "10000",
        helocPaymentType: "interest_only",
        helocMinimumPayment: "60",
        interestSpread: "2.5",
      } as HelocAccount,
    ];

    await checkHelocDrawPeriodTransitions(mockServices as ApplicationServices);

    expect(mockServices.notifications?.createNotification).not.toHaveBeenCalled();
    expect(mockServices.heloc?.updateAccount).not.toHaveBeenCalled();
  });

  it("should process HELOC with past draw period end date", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    mockHelocAccounts = [
      {
        id: "heloc-1",
        userId: "user-1",
        helocDrawPeriodEndDate: pastDate.toISOString().split("T")[0],
        currentBalance: "10000",
        helocPaymentType: "interest_only",
        helocMinimumPayment: "60",
        interestSpread: "2.5",
        creditLimit: "50000",
        maxLtvPercent: "65",
      } as HelocAccount,
    ];

    await checkHelocDrawPeriodTransitions(mockServices as ApplicationServices);

    // Should update account with new payment type and minimum payment
    expect(mockServices.heloc?.updateAccount).toHaveBeenCalledWith(
      "heloc-1",
      "user-1",
      expect.objectContaining({
        helocPaymentType: "principal_plus_interest",
        helocMinimumPayment: expect.any(String),
      })
    );

    // Should create notification
    expect(mockServices.notifications?.createNotification).toHaveBeenCalledWith(
      "user-1",
      "heloc_draw_period_transition",
      expect.stringContaining("Draw Period Ended"),
      expect.any(String),
      expect.objectContaining({
        helocAccountId: "heloc-1",
        oldPaymentType: "interest_only",
        newPaymentType: "principal_plus_interest",
      })
    );
  });

  it("should skip HELOCs with zero balance", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    mockHelocAccounts = [
      {
        id: "heloc-1",
        userId: "user-1",
        helocDrawPeriodEndDate: pastDate.toISOString().split("T")[0],
        currentBalance: "0",
        helocPaymentType: "interest_only",
        helocMinimumPayment: "0",
        interestSpread: "2.5",
      } as HelocAccount,
    ];

    await checkHelocDrawPeriodTransitions(mockServices as ApplicationServices);

    expect(mockServices.notifications?.createNotification).not.toHaveBeenCalled();
    expect(mockServices.heloc?.updateAccount).not.toHaveBeenCalled();
  });

  it("should not process the same transition twice", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    // Create existing notification for this transition
    mockNotifications.push({
      id: "notif-1",
      userId: "user-1",
      type: "heloc_draw_period_transition",
      metadata: {
        helocAccountId: "heloc-1",
        transitionDate: pastDate.toISOString().split("T")[0],
      },
    });

    mockHelocAccounts = [
      {
        id: "heloc-1",
        userId: "user-1",
        helocDrawPeriodEndDate: pastDate.toISOString().split("T")[0],
        currentBalance: "10000",
        helocPaymentType: "interest_only",
        helocMinimumPayment: "60",
        interestSpread: "2.5",
      } as HelocAccount,
    ];

    await checkHelocDrawPeriodTransitions(mockServices as ApplicationServices);

    // Should not create another notification
    expect(mockServices.notifications?.createNotification).not.toHaveBeenCalled();
    expect(mockServices.heloc?.updateAccount).not.toHaveBeenCalled();
  });

  it("should handle HELOC already in principal+interest mode", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    mockHelocAccounts = [
      {
        id: "heloc-1",
        userId: "user-1",
        helocDrawPeriodEndDate: pastDate.toISOString().split("T")[0],
        currentBalance: "10000",
        helocPaymentType: "principal_plus_interest",
        helocMinimumPayment: "80",
        interestSpread: "2.5",
      } as HelocAccount,
    ];

    await checkHelocDrawPeriodTransitions(mockServices as ApplicationServices);

    // Should still update (recalculate payment) but keep payment type
    expect(mockServices.heloc?.updateAccount).toHaveBeenCalledWith(
      "heloc-1",
      "user-1",
      expect.objectContaining({
        helocPaymentType: "principal_plus_interest",
        helocMinimumPayment: expect.any(String),
      })
    );

    // Should create notification
    expect(mockServices.notifications?.createNotification).toHaveBeenCalled();
  });

  it("should handle multiple HELOCs", async () => {
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 10);
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 5);

    mockHelocAccounts = [
      {
        id: "heloc-1",
        userId: "user-1",
        helocDrawPeriodEndDate: pastDate1.toISOString().split("T")[0],
        currentBalance: "10000",
        helocPaymentType: "interest_only",
        helocMinimumPayment: "60",
        interestSpread: "2.5",
      } as HelocAccount,
      {
        id: "heloc-2",
        userId: "user-2",
        helocDrawPeriodEndDate: pastDate2.toISOString().split("T")[0],
        currentBalance: "20000",
        helocPaymentType: "interest_only",
        helocMinimumPayment: "120",
        interestSpread: "3.0",
      } as HelocAccount,
    ];

    await checkHelocDrawPeriodTransitions(mockServices as ApplicationServices);

    // Should process both HELOCs
    expect(mockServices.heloc?.updateAccount).toHaveBeenCalledTimes(2);
    expect(mockServices.notifications?.createNotification).toHaveBeenCalledTimes(2);
  });
});

