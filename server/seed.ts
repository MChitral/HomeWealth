import type { IStorage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";

/**
 * Auto-seeds demo data on server startup if no scenarios exist
 */
export async function autoSeedDemoData(storage: IStorage) {
  const DEMO_USER_ID = "dev-user-123"; // Match devAuth user ID
  
  try {
    // Check if scenarios already exist
    const existing = await storage.getScenariosByUser(DEMO_USER_ID);
    if (existing.length > 0) {
      console.log(`✅ Demo data already exists (${existing.length} scenarios)`);
      return null;
    }
    
    console.log("🌱 Auto-seeding demo data on startup...");
    return await seedDemoData(storage);
  } catch (error) {
    console.error("❌ Error auto-seeding demo data:", error);
    return null;
  }
}

/**
 * Seeds demo data for the application
 * - 1 mortgage (realistic Canadian example)
 * - 2 scenarios with different strategies
 */
export async function seedDemoData(storage: IStorage) {
  const DEMO_USER_ID = "dev-user-123"; // Match devAuth user ID

  try {
    console.log("🌱 Seeding demo data...");

    // 0. Ensure demo user exists in database with specific ID
    let user = await storage.getUser(DEMO_USER_ID);
    if (!user) {
      console.log("📝 Creating demo user...");
      const result = await db.insert(users).values({
        id: DEMO_USER_ID,
        username: "devuser",
        password: "dev-password-not-used", // Not used in dev auth
      }).returning();
      user = result[0];
      console.log(`✅ Created demo user: ${user.username} (${user.id})`);
    }

    // 1. Create demo mortgage - typical Toronto condo purchase
    const mortgage = await storage.createMortgage({
      userId: DEMO_USER_ID,
      propertyPrice: "650000.00", // $650k condo
      downPayment: "65000.00", // 10% down
      originalAmount: "585000.00", // $585k mortgage
      currentBalance: "550000.00", // After some payments
      startDate: "2023-03-01",
      amortizationYears: 25,
      amortizationMonths: 0,
      paymentFrequency: "accelerated-biweekly",
      annualPrepaymentLimitPercent: 20, // 20% annual prepayment allowed
    });

    console.log(`✅ Created demo mortgage: $${mortgage.currentBalance} balance`);

    // 2. Create Scenario 1: Aggressive Prepayment Strategy
    const scenario1 = await storage.createScenario({
      userId: DEMO_USER_ID,
      name: "Aggressive Prepayment",
      description: "Focus 80% of surplus on paying down mortgage faster. Good for debt-averse individuals who prioritize becoming mortgage-free.",
      prepaymentMonthlyPercent: 80,
      investmentMonthlyPercent: 20,
      expectedReturnRate: "6.500", // Conservative investment return
      efPriorityPercent: 0, // Split surplus after EF is full
    });

    console.log(`✅ Created scenario: "${scenario1.name}" (80% prepay / 20% invest)`);

    // 3. Create Scenario 2: Balanced Investment Strategy
    const scenario2 = await storage.createScenario({
      userId: DEMO_USER_ID,
      name: "Balanced Builder",
      description: "Split surplus 50/50 between mortgage prepayment and long-term investments. Balances debt reduction with wealth accumulation.",
      prepaymentMonthlyPercent: 50,
      investmentMonthlyPercent: 50,
      expectedReturnRate: "7.000", // Moderate investment return
      efPriorityPercent: 0,
    });

    console.log(`✅ Created scenario: "${scenario2.name}" (50% prepay / 50% invest)`);

    // Optional: Add a mortgage term (current 5-year fixed term)
    const term = await storage.createMortgageTerm({
      mortgageId: mortgage.id,
      termType: "fixed",
      startDate: "2023-03-01",
      endDate: "2028-02-28",
      termYears: 5,
      fixedRate: "5.490", // Typical 2023 5-year fixed rate
      lockedSpread: null,
      paymentFrequency: "accelerated-biweekly",
      regularPaymentAmount: "1650.00", // Typical payment for $585k @ 5.49%
    });

    console.log(`✅ Created mortgage term: 5-year fixed @ ${term.fixedRate}%`);

    console.log("\n🎉 Demo data seeded successfully!");
    console.log("📊 Summary:");
    console.log(`   - 1 mortgage: $${mortgage.currentBalance} balance`);
    console.log(`   - 2 scenarios: "${scenario1.name}" and "${scenario2.name}"`);
    console.log(`   - 1 term: ${term.termYears}-year ${term.termType}`);
    
    return {
      mortgage,
      scenarios: [scenario1, scenario2],
      term,
    };
  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    throw error;
  }
}
