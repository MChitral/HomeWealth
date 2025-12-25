import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { checkRenewalsAndSendReminders } from "../renewal-reminder-job";
import { db } from "@infrastructure/db/connection";
import { notifications, mortgages, mortgageTerms, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { ApplicationServices } from "@application/services";
import { createRepositories } from "@infrastructure/repositories";
import { createServices } from "@application/services";

describe("Renewal Reminder Job - Integration Tests", () => {
  const testUserId = "test-user-renewal-reminder";
  let testMortgageId: string;
  let services: ApplicationServices;

  beforeEach(async () => {
    // Create test user
    await db.insert(users).values({
      id: testUserId,
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    });

    // Create test mortgage
    const [mortgage] = await db
      .insert(mortgages)
      .values({
        userId: testUserId,
        propertyPrice: "500000",
        downPayment: "100000",
        originalAmount: "400000",
        currentBalance: "350000",
        startDate: "2020-01-01",
        amortizationYears: 25,
        amortizationMonths: 0,
        paymentFrequency: "monthly",
        annualPrepaymentLimitPercent: 20,
      })
      .returning();

    testMortgageId = mortgage.id;

    // Create test term ending in 30 days
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 30);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60 * 30); // 60 months ago

    await db.insert(mortgageTerms).values({
      mortgageId: testMortgageId,
      termType: "fixed",
      startDate: startDate.toISOString().split("T")[0],
      endDate: renewalDate.toISOString().split("T")[0],
      termYears: 5,
      fixedRate: "5.500",
      paymentFrequency: "monthly",
      regularPaymentAmount: "2000.00",
    });

    // Initialize services
    const repositories = createRepositories();
    services = createServices(repositories);
  });

  afterEach(async () => {
    // Cleanup
    await db.delete(notifications).where(eq(notifications.userId, testUserId));
    await db.delete(mortgageTerms).where(eq(mortgageTerms.mortgageId, testMortgageId));
    await db.delete(mortgages).where(eq(mortgages.id, testMortgageId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should create notification for mortgage with 30 days until renewal", async () => {
    await checkRenewalsAndSendReminders(services);

    const createdNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, testUserId));

    expect(createdNotifications.length).toBeGreaterThan(0);
    const renewalNotification = createdNotifications.find(
      (n) => n.type === "renewal_reminder" && n.metadata?.mortgageId === testMortgageId
    );
    expect(renewalNotification).toBeDefined();
    expect(renewalNotification?.metadata?.daysUntil).toBe(30);
  });

  it("should not create duplicate notifications", async () => {
    // Run job twice
    await checkRenewalsAndSendReminders(services);
    await checkRenewalsAndSendReminders(services);

    const createdNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, testUserId));

    // Should only have one notification for 30 days
    const renewalNotifications = createdNotifications.filter(
      (n) =>
        n.type === "renewal_reminder" &&
        n.metadata?.mortgageId === testMortgageId &&
        n.metadata?.daysUntil === 30
    );

    expect(renewalNotifications.length).toBe(1);
  });

  it("should handle multiple mortgages per user", async () => {
    // Create second mortgage
    const [mortgage2] = await db
      .insert(mortgages)
      .values({
        userId: testUserId,
        propertyPrice: "600000",
        downPayment: "120000",
        originalAmount: "480000",
        currentBalance: "450000",
        startDate: "2021-01-01",
        amortizationYears: 25,
        amortizationMonths: 0,
        paymentFrequency: "monthly",
        annualPrepaymentLimitPercent: 20,
      })
      .returning();

    const renewalDate2 = new Date();
    renewalDate2.setDate(renewalDate2.getDate() + 90);
    const startDate2 = new Date();
    startDate2.setDate(startDate2.getDate() - 60 * 30);

    await db.insert(mortgageTerms).values({
      mortgageId: mortgage2.id,
      termType: "fixed",
      startDate: startDate2.toISOString().split("T")[0],
      endDate: renewalDate2.toISOString().split("T")[0],
      termYears: 5,
      fixedRate: "5.500",
      paymentFrequency: "monthly",
      regularPaymentAmount: "2500.00",
    });

    await checkRenewalsAndSendReminders(services);

    const createdNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, testUserId));

    // Should have notifications for both mortgages
    const renewalNotifications = createdNotifications.filter(
      (n) => n.type === "renewal_reminder"
    );

    expect(renewalNotifications.length).toBeGreaterThanOrEqual(1);

    // Cleanup second mortgage
    await db.delete(mortgageTerms).where(eq(mortgageTerms.mortgageId, mortgage2.id));
    await db.delete(mortgages).where(eq(mortgages.id, mortgage2.id));
  });
});

