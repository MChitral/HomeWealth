import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, date, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Cash Flow - User's monthly income and expenses
export const cashFlow = pgTable("cash_flow", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Income
  monthlyIncome: decimal("monthly_income", { precision: 10, scale: 2 }).notNull(),
  extraPaycheques: integer("extra_paycheques").notNull().default(2),
  annualBonus: decimal("annual_bonus", { precision: 10, scale: 2 }).notNull().default("0"),
  
  // Fixed Housing Expenses
  propertyTax: decimal("property_tax", { precision: 10, scale: 2 }).notNull().default("0"),
  homeInsurance: decimal("home_insurance", { precision: 10, scale: 2 }).notNull().default("0"),
  condoFees: decimal("condo_fees", { precision: 10, scale: 2 }).notNull().default("0"),
  utilities: decimal("utilities", { precision: 10, scale: 2 }).notNull().default("0"),
  
  // Variable Expenses
  groceries: decimal("groceries", { precision: 10, scale: 2 }).notNull().default("0"),
  dining: decimal("dining", { precision: 10, scale: 2 }).notNull().default("0"),
  transportation: decimal("transportation", { precision: 10, scale: 2 }).notNull().default("0"),
  entertainment: decimal("entertainment", { precision: 10, scale: 2 }).notNull().default("0"),
  
  // Other Debt
  carLoan: decimal("car_loan", { precision: 10, scale: 2 }).notNull().default("0"),
  studentLoan: decimal("student_loan", { precision: 10, scale: 2 }).notNull().default("0"),
  creditCard: decimal("credit_card", { precision: 10, scale: 2 }).notNull().default("0"),
  
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCashFlowSchema = createInsertSchema(cashFlow)
  .omit({ id: true, updatedAt: true })
  .extend({
    monthlyIncome: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    annualBonus: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    propertyTax: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    homeInsurance: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    condoFees: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    utilities: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    groceries: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    dining: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    transportation: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    entertainment: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    carLoan: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    studentLoan: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    creditCard: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
  });

// Update schema - omits userId since we don't allow changing it
export const updateCashFlowSchema = insertCashFlowSchema.omit({ userId: true }).partial();

export type InsertCashFlow = z.infer<typeof insertCashFlowSchema>;
export type UpdateCashFlow = z.infer<typeof updateCashFlowSchema>;
export type CashFlow = typeof cashFlow.$inferSelect;

// Emergency Fund settings
export const emergencyFund = pgTable("emergency_fund", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetMonths: integer("target_months").notNull().default(6),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  monthlyContribution: decimal("monthly_contribution", { precision: 10, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmergencyFundSchema = createInsertSchema(emergencyFund)
  .omit({ id: true, updatedAt: true })
  .extend({
    currentBalance: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    monthlyContribution: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
  });

// Update schema - omits userId since we don't allow changing it
export const updateEmergencyFundSchema = insertEmergencyFundSchema.omit({ userId: true }).partial();

export type InsertEmergencyFund = z.infer<typeof insertEmergencyFundSchema>;
export type UpdateEmergencyFund = z.infer<typeof updateEmergencyFundSchema>;
export type EmergencyFund = typeof emergencyFund.$inferSelect;

// Mortgages - Main mortgage details
export const mortgages = pgTable("mortgages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  propertyPrice: decimal("property_price", { precision: 12, scale: 2 }).notNull(),
  downPayment: decimal("down_payment", { precision: 12, scale: 2 }).notNull(),
  originalAmount: decimal("original_amount", { precision: 12, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).notNull(),
  startDate: date("start_date").notNull(),
  amortizationYears: integer("amortization_years").notNull(),
  amortizationMonths: integer("amortization_months").notNull().default(0),
  paymentFrequency: text("payment_frequency").notNull(), // monthly, biweekly, accelerated-biweekly, semi-monthly, weekly, accelerated-weekly
  
  // Canadian lender prepayment constraints
  annualPrepaymentLimitPercent: integer("annual_prepayment_limit_percent").notNull().default(20), // 10-20% typical
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMortgageSchema = createInsertSchema(mortgages)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    propertyPrice: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    downPayment: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    originalAmount: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    currentBalance: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
  });

// Update schema - omits userId and immutable fields
export const updateMortgageSchema = insertMortgageSchema.omit({ userId: true }).partial();

export type InsertMortgage = z.infer<typeof insertMortgageSchema>;
export type UpdateMortgage = z.infer<typeof updateMortgageSchema>;
export type Mortgage = typeof mortgages.$inferSelect;

// Mortgage Terms - 3-5 year term periods with locked rates
export const mortgageTerms = pgTable("mortgage_terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mortgageId: varchar("mortgage_id").notNull().references(() => mortgages.id),
  termType: text("term_type").notNull(), // fixed, variable-changing, variable-fixed
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  termYears: integer("term_years").notNull(),
  
  // For fixed rate terms
  fixedRate: decimal("fixed_rate", { precision: 5, scale: 3 }), // e.g., 5.490
  
  // For variable rate terms
  lockedSpread: decimal("locked_spread", { precision: 5, scale: 3 }), // e.g., -0.800
  primeRate: decimal("prime_rate", { precision: 5, scale: 3 }), // store BoC prime snapshot at term creation
  
  paymentFrequency: text("payment_frequency").notNull(), // monthly, biweekly, accelerated-biweekly, semi-monthly, weekly, accelerated-weekly
  regularPaymentAmount: decimal("regular_payment_amount", { precision: 10, scale: 2 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const mortgageTermBaseSchema = createInsertSchema(mortgageTerms)
  .omit({ id: true, createdAt: true })
  .extend({
    fixedRate: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform((val) => 
      val == null ? null : (typeof val === 'number' ? val.toFixed(3) : val)
    ).optional(),
    lockedSpread: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform((val) => 
      val == null ? null : (typeof val === 'number' ? val.toFixed(3) : val)
    ).optional(),
    primeRate: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform((val) => 
      val == null ? null : (typeof val === 'number' ? val.toFixed(3) : val)
    ).optional(),
    regularPaymentAmount: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
  });

export const insertMortgageTermSchema = mortgageTermBaseSchema.superRefine((data, ctx) => {
    const type = data.termType;
    const hasFixedRate = data.fixedRate != null && data.fixedRate !== "";
    const hasSpread = data.lockedSpread != null && data.lockedSpread !== "";
    const hasPrime = data.primeRate != null && data.primeRate !== "";

    if (type === "fixed") {
      if (!hasFixedRate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed terms require a fixedRate value",
          path: ["fixedRate"],
        });
      }
      if (hasSpread) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed terms cannot include a locked spread",
          path: ["lockedSpread"],
        });
      }
    } else {
      if (!hasSpread) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Variable terms require a locked spread",
          path: ["lockedSpread"],
        });
      }
      if (!hasPrime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Variable terms require a prime rate snapshot",
          path: ["primeRate"],
        });
      }
      if (hasFixedRate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Variable terms cannot include a fixedRate",
          path: ["fixedRate"],
        });
      }
    }
  });

// Update schema - omits mortgageId since we don't allow changing it
export const updateMortgageTermSchema = mortgageTermBaseSchema
  .omit({ mortgageId: true })
  .partial()
  .superRefine((data, ctx) => {
    if (!data.termType) {
      return;
    }
    const type = data.termType;
    const hasFixedRate = data.fixedRate != null && data.fixedRate !== "";
    const hasSpread = data.lockedSpread != null && data.lockedSpread !== "";
    const hasPrime = data.primeRate != null && data.primeRate !== "";

    if (type === "fixed") {
      if (hasSpread) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed terms cannot include a locked spread",
          path: ["lockedSpread"],
        });
      }
    } else {
      if (hasFixedRate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Variable terms cannot include a fixedRate",
          path: ["fixedRate"],
        });
      }
      if (!hasPrime && hasSpread) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Variable terms require a prime rate snapshot",
          path: ["primeRate"],
        });
      }
    }
  });

export type InsertMortgageTerm = z.infer<typeof insertMortgageTermSchema>;
export type UpdateMortgageTerm = z.infer<typeof updateMortgageTermSchema>;
export type MortgageTerm = typeof mortgageTerms.$inferSelect;

// Mortgage Payments - Historical payment records
export const mortgagePayments = pgTable("mortgage_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mortgageId: varchar("mortgage_id").notNull().references(() => mortgages.id),
  termId: varchar("term_id").notNull().references(() => mortgageTerms.id),
  paymentDate: date("payment_date").notNull(),
  
  // Payment breakdown: regular + prepayment = total
  paymentPeriodLabel: text("payment_period_label"), // e.g., "January 2025", "Payment #23", "Week 3"
  regularPaymentAmount: decimal("regular_payment_amount", { precision: 10, scale: 2 }).notNull(),
  prepaymentAmount: decimal("prepayment_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(), // Total = regular + prepayment
  
  principalPaid: decimal("principal_paid", { precision: 10, scale: 2 }).notNull(),
  interestPaid: decimal("interest_paid", { precision: 10, scale: 2 }).notNull(),
  remainingBalance: decimal("remaining_balance", { precision: 12, scale: 2 }).notNull(),
  
  // For variable rate tracking
  primeRate: decimal("prime_rate", { precision: 5, scale: 3 }),
  effectiveRate: decimal("effective_rate", { precision: 5, scale: 3 }).notNull(),
  
  // Trigger rate tracking (VRM-Fixed Payment only)
  triggerRateHit: integer("trigger_rate_hit").notNull().default(0), // boolean as 0/1
  
  // Payment skipping (Canadian lender feature)
  isSkipped: integer("is_skipped").notNull().default(0), // boolean as 0/1 - indicates payment was skipped
  skippedInterestAccrued: decimal("skipped_interest_accrued", { precision: 10, scale: 2 }).notNull().default("0.00"), // Interest accrued during skip
  
  // Remaining amortization (in months for precision)
  remainingAmortizationMonths: integer("remaining_amortization_months").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMortgagePaymentSchema = createInsertSchema(mortgagePayments)
  .omit({ id: true, createdAt: true })
  .extend({
    regularPaymentAmount: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    prepaymentAmount: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    paymentAmount: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    principalPaid: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    interestPaid: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    remainingBalance: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ),
    primeRate: z.union([z.string(), z.number(), z.null(), z.undefined()]).transform((val) => 
      val == null ? null : (typeof val === 'number' ? val.toFixed(3) : val)
    ).optional(),
    effectiveRate: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(3) : val
    ),
    skippedInterestAccrued: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(2) : val
    ).optional().default("0.00"),
  });
export type InsertMortgagePayment = z.infer<typeof insertMortgagePaymentSchema>;
export type MortgagePayment = typeof mortgagePayments.$inferSelect;

// Scenarios - Different prepayment/investment strategies
export const scenarios = pgTable("scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  
  // Prepayment strategy
  prepaymentMonthlyPercent: integer("prepayment_monthly_percent").notNull().default(50), // % of surplus to prepay
  
  // Investment strategy
  investmentMonthlyPercent: integer("investment_monthly_percent").notNull().default(50), // % of surplus to invest
  expectedReturnRate: decimal("expected_return_rate", { precision: 5, scale: 3 }).notNull().default("6.000"), // 6.0%
  
  // Emergency fund priority
  efPriorityPercent: integer("ef_priority_percent").notNull().default(0), // % to EF before split
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertScenarioSchema = createInsertSchema(scenarios)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    expectedReturnRate: z.union([z.string(), z.number()]).transform((val) => 
      typeof val === 'number' ? val.toFixed(3) : val
    ),
  });
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

// Prepayment Events - Lump sums, annual bonuses, one-time payments
export const prepaymentEvents = pgTable("prepayment_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").notNull().references(() => scenarios.id),
  eventType: text("event_type").notNull(), // annual, one-time, payment-increase
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Payment-indexed start control (critical for all payment frequencies)
  startPaymentNumber: integer("start_payment_number").notNull().default(1), // Which payment to start prepayments
  
  // For annual events
  recurrenceMonth: integer("recurrence_month"), // 1-12, which month each year (e.g., March for tax refund)
  
  // For one-time events  
  oneTimeYear: integer("one_time_year"), // year offset from mortgage start
  
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPrepaymentEventSchema = createInsertSchema(prepaymentEvents).omit({ id: true, createdAt: true });
export type InsertPrepaymentEvent = z.infer<typeof insertPrepaymentEventSchema>;
export type PrepaymentEvent = typeof prepaymentEvents.$inferSelect;

// Prime Rate History - Track Bank of Canada prime rate changes
export const primeRateHistory = pgTable("prime_rate_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  primeRate: decimal("prime_rate", { precision: 5, scale: 3 }).notNull(),
  effectiveDate: date("effective_date").notNull(),
  source: text("source").notNull().default("Bank of Canada"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("IDX_prime_rate_effective_date").on(table.effectiveDate),
  index("IDX_prime_rate_created_at").on(table.createdAt),
]);

export const insertPrimeRateHistorySchema = createInsertSchema(primeRateHistory)
  .omit({ id: true, createdAt: true })
  .extend({
    primeRate: z.union([z.string(), z.number()]).transform((val) =>
      typeof val === 'number' ? val.toFixed(3) : val
    ),
  });

export type InsertPrimeRateHistory = z.infer<typeof insertPrimeRateHistorySchema>;
export type PrimeRateHistory = typeof primeRateHistory.$inferSelect;
