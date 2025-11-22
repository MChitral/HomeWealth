import type { Repositories } from "@infrastructure/repositories";
import { db } from "@infrastructure/db/connection";
import { users } from "@shared/schema";

const DEMO_USER_ID = "dev-user-123";

export async function autoSeedDemoData(repositories: Repositories) {
  try {
    const existing = await repositories.scenarios.findByUserId(DEMO_USER_ID);
    if (existing.length > 0) {
      console.log(`✅ Demo data already exists (${existing.length} scenarios)`);
      return null;
    }

    console.log("🌱 Auto-seeding demo data on startup...");
    return await seedDemoData(repositories);
  } catch (error) {
    console.error("❌ Error auto-seeding demo data:", error);
    return null;
  }
}

export async function seedDemoData(repositories: Repositories) {
  try {
    console.log("🌱 Seeding demo data...");

    let user = await repositories.users.getUser(DEMO_USER_ID);
    if (!user) {
      console.log("📝 Creating demo user...");
      user = await repositories.users.upsertUser({
        id: DEMO_USER_ID,
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
      });
      console.log(`✅ Created demo user: ${user.firstName} ${user.lastName} (${user.id})`);
    }

    const mortgage = await repositories.mortgages.create({
      userId: DEMO_USER_ID,
      propertyPrice: "650000.00",
      downPayment: "65000.00",
      originalAmount: "585000.00",
      currentBalance: "550000.00",
      startDate: "2023-03-01",
      amortizationYears: 25,
      amortizationMonths: 0,
      paymentFrequency: "accelerated-biweekly",
      annualPrepaymentLimitPercent: 20,
    });

    console.log(`✅ Created demo mortgage: $${mortgage.currentBalance} balance`);

    const scenario1 = await repositories.scenarios.create({
      userId: DEMO_USER_ID,
      name: "Aggressive Prepayment",
      description:
        "Focus 80% of surplus on paying down mortgage faster. Good for debt-averse individuals who prioritize becoming mortgage-free.",
      prepaymentMonthlyPercent: 80,
      investmentMonthlyPercent: 20,
      expectedReturnRate: "6.500",
      efPriorityPercent: 0,
    });

    console.log(`✅ Created scenario: "${scenario1.name}" (80% prepay / 20% invest)`);

    const scenario2 = await repositories.scenarios.create({
      userId: DEMO_USER_ID,
      name: "Balanced Builder",
      description:
        "Split surplus 50/50 between mortgage prepayment and long-term investments. Balances debt reduction with wealth accumulation.",
      prepaymentMonthlyPercent: 50,
      investmentMonthlyPercent: 50,
      expectedReturnRate: "7.000",
      efPriorityPercent: 0,
    });

    console.log(`✅ Created scenario: "${scenario2.name}" (50% prepay / 50% invest)`);

    const term = await repositories.mortgageTerms.create({
      mortgageId: mortgage.id,
      termType: "fixed",
      startDate: "2023-03-01",
      endDate: "2028-02-28",
      termYears: 5,
      fixedRate: "5.490",
      lockedSpread: null,
      paymentFrequency: "accelerated-biweekly",
      regularPaymentAmount: "1650.00",
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

