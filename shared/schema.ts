import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  date,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
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
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),

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
    monthlyIncome: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    annualBonus: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    propertyTax: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    homeInsurance: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    condoFees: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    utilities: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    groceries: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    dining: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    transportation: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    entertainment: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    carLoan: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    studentLoan: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    creditCard: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

// Update schema - omits userId since we don't allow changing it
export const updateCashFlowSchema = insertCashFlowSchema.omit({ userId: true }).partial();

export type InsertCashFlow = z.infer<typeof insertCashFlowSchema>;
export type UpdateCashFlow = z.infer<typeof updateCashFlowSchema>;
export type CashFlow = typeof cashFlow.$inferSelect;

// Emergency Fund settings
export const emergencyFund = pgTable("emergency_fund", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  targetMonths: integer("target_months").notNull().default(6),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  monthlyContribution: decimal("monthly_contribution", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmergencyFundSchema = createInsertSchema(emergencyFund)
  .omit({ id: true, updatedAt: true })
  .extend({
    currentBalance: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    monthlyContribution: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

// Update schema - omits userId since we don't allow changing it
export const updateEmergencyFundSchema = insertEmergencyFundSchema.omit({ userId: true }).partial();

export type InsertEmergencyFund = z.infer<typeof insertEmergencyFundSchema>;
export type UpdateEmergencyFund = z.infer<typeof updateEmergencyFundSchema>;
export type EmergencyFund = typeof emergencyFund.$inferSelect;

// Mortgages - Main mortgage details
export const mortgages = pgTable("mortgages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
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
  prepaymentLimitResetDate: date("prepayment_limit_reset_date"), // Anniversary date vs calendar year (null = calendar year)
  prepaymentCarryForward: decimal("prepayment_carry_forward", { precision: 12, scale: 2 }).default("0.00"), // Unused prepayment room from previous year

  // Mortgage default insurance (for high-ratio mortgages)
  insuranceProvider: text("insurance_provider"), // "CMHC" | "Sagen" | "Genworth" | null
  insurancePremium: decimal("insurance_premium", { precision: 12, scale: 2 }),
  insuranceAddedToPrincipal: integer("insurance_added_to_principal").default(0), // boolean (0 = false, 1 = true)
  isHighRatio: integer("is_high_ratio").default(0), // boolean (0 = false, 1 = true)

  // Re-advanceable mortgage support
  isReAdvanceable: integer("is_re_advanceable").default(0), // boolean (0 = false, 1 = true)
  reAdvanceableHelocId: varchar("re_advanceable_heloc_id"), // Foreign key to heloc_accounts.id (defined after helocAccounts table)

  // Lender information (optional, for lender-specific penalty rules)
  lenderName: text("lender_name"), // e.g., "RBC", "TD", "BMO", "Scotiabank", "CIBC"

  // Mortgage portability tracking
  isPorted: integer("is_ported").default(0), // boolean (0 = false, 1 = true)
  originalMortgageId: varchar("original_mortgage_id"), // Reference to original mortgage if this is a ported mortgage

  // Open vs Closed mortgage type
  openClosedMortgageType: text("open_closed_mortgage_type"), // "open" | "closed" | null (null = closed by default)

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMortgageSchema = createInsertSchema(mortgages)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    propertyPrice: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    downPayment: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    originalAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    currentBalance: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    insurancePremium: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    insuranceAddedToPrincipal: z
      .union([z.boolean(), z.number()])
      .optional()
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    isHighRatio: z
      .union([z.boolean(), z.number()])
      .optional()
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    isReAdvanceable: z
      .union([z.boolean(), z.number()])
      .optional()
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
  });

// Update schema - omits userId and immutable fields
export const updateMortgageSchema = insertMortgageSchema.omit({ userId: true }).partial();

export type InsertMortgage = z.infer<typeof insertMortgageSchema>;
export type UpdateMortgage = z.infer<typeof updateMortgageSchema>;
export type Mortgage = typeof mortgages.$inferSelect;

// Mortgage Terms - 3-5 year term periods with locked rates
export const mortgageTerms = pgTable("mortgage_terms", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  mortgageId: varchar("mortgage_id")
    .notNull()
    .references(() => mortgages.id),
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

  // Penalty calculation method
  penaltyCalculationMethod: text("penalty_calculation_method"), // "ird_posted_rate", "ird_discounted_rate", "ird_origination_comparison", "three_month_interest", "open_mortgage", "variable_rate"

  // Variable rate cap and floor (for variable rate mortgages)
  variableRateCap: decimal("variable_rate_cap", { precision: 5, scale: 3 }), // Maximum rate increase per period
  variableRateFloor: decimal("variable_rate_floor", { precision: 5, scale: 3 }), // Minimum rate

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const mortgageTermBaseSchema = createInsertSchema(mortgageTerms)
  .omit({ id: true, createdAt: true })
  .extend({
    fixedRate: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((val) => (val == null ? null : typeof val === "number" ? val.toFixed(3) : val))
      .optional(),
    lockedSpread: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((val) => (val == null ? null : typeof val === "number" ? val.toFixed(3) : val))
      .optional(),
    primeRate: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((val) => (val == null ? null : typeof val === "number" ? val.toFixed(3) : val))
      .optional(),
    regularPaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    variableRateCap: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((val) => (val == null ? null : typeof val === "number" ? val.toFixed(3) : val))
      .optional(),
    variableRateFloor: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((val) => (val == null ? null : typeof val === "number" ? val.toFixed(3) : val))
      .optional(),
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
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  mortgageId: varchar("mortgage_id")
    .notNull()
    .references(() => mortgages.id),
  termId: varchar("term_id")
    .notNull()
    .references(() => mortgageTerms.id),
  paymentDate: date("payment_date").notNull(),

  // Payment breakdown: regular + prepayment = total
  paymentPeriodLabel: text("payment_period_label"), // e.g., "January 2025", "Payment #23", "Week 3"
  regularPaymentAmount: decimal("regular_payment_amount", { precision: 10, scale: 2 }).notNull(),
  prepaymentAmount: decimal("prepayment_amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
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
  skippedInterestAccrued: decimal("skipped_interest_accrued", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"), // Interest accrued during skip

  // Remaining amortization (in months for precision)
  remainingAmortizationMonths: integer("remaining_amortization_months").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMortgagePaymentSchema = createInsertSchema(mortgagePayments)
  .omit({ id: true, createdAt: true })
  .extend({
    regularPaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    prepaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    paymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    principalPaid: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    interestPaid: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    remainingBalance: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    primeRate: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .transform((val) => (val == null ? null : typeof val === "number" ? val.toFixed(3) : val))
      .optional(),
    effectiveRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(3) : val)),
    skippedInterestAccrued: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val))
      .optional()
      .default("0.00"),
  });
export type InsertMortgagePayment = z.infer<typeof insertMortgagePaymentSchema>;
export type MortgagePayment = typeof mortgagePayments.$inferSelect;

// Payment Corrections - Audit trail for payment reversals and adjustments
export const paymentCorrections = pgTable(
  "payment_corrections",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    paymentId: varchar("payment_id")
      .notNull()
      .references(() => mortgagePayments.id, { onDelete: "cascade" }),
    originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
    correctedAmount: decimal("corrected_amount", { precision: 10, scale: 2 }).notNull(),
    reason: text("reason").notNull(), // Reason for correction
    correctedBy: varchar("corrected_by"), // User ID who made the correction
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_payment_corrections_payment").on(table.paymentId),
    index("IDX_payment_corrections_created").on(table.createdAt),
  ]
);

export const insertPaymentCorrectionSchema = createInsertSchema(paymentCorrections)
  .omit({ id: true, createdAt: true })
  .extend({
    originalAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    correctedAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertPaymentCorrection = z.infer<typeof insertPaymentCorrectionSchema>;
export type PaymentCorrection = typeof paymentCorrections.$inferSelect;

// Payment Amount Change Events - Track when regular payment amount changes
export const paymentAmountChangeEvents = pgTable(
  "payment_amount_change_events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    mortgageId: varchar("mortgage_id")
      .notNull()
      .references(() => mortgages.id, { onDelete: "cascade" }),
    termId: varchar("term_id")
      .notNull()
      .references(() => mortgageTerms.id, { onDelete: "cascade" }),
    changeDate: date("change_date").notNull(),
    oldAmount: decimal("old_amount", { precision: 10, scale: 2 }).notNull(),
    newAmount: decimal("new_amount", { precision: 10, scale: 2 }).notNull(),
    reason: text("reason"), // Reason for the change (rate change, recast, etc.)
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_payment_amount_change_mortgage").on(table.mortgageId),
    index("IDX_payment_amount_change_term").on(table.termId),
    index("IDX_payment_amount_change_date").on(table.changeDate),
  ]
);

export const insertPaymentAmountChangeEventSchema = createInsertSchema(paymentAmountChangeEvents)
  .omit({ id: true, createdAt: true })
  .extend({
    oldAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    newAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertPaymentAmountChangeEvent = z.infer<typeof insertPaymentAmountChangeEventSchema>;
export type PaymentAmountChangeEvent = typeof paymentAmountChangeEvents.$inferSelect;

// Scenarios - Different prepayment/investment strategies
export const scenarios = pgTable("scenarios", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),

  // Prepayment strategy
  prepaymentMonthlyPercent: integer("prepayment_monthly_percent").notNull().default(50), // % of surplus to prepay

  // Investment strategy
  investmentMonthlyPercent: integer("investment_monthly_percent").notNull().default(50), // % of surplus to invest
  expectedReturnRate: decimal("expected_return_rate", { precision: 5, scale: 3 })
    .notNull()
    .default("6.000"), // 6.0%

  // Emergency fund priority
  efPriorityPercent: integer("ef_priority_percent").notNull().default(0), // % to EF before split

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertScenarioSchema = createInsertSchema(scenarios)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    expectedReturnRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(3) : val)),
  });
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;

// Prepayment Events - Lump sums, annual bonuses, one-time payments
export const prepaymentEvents = pgTable("prepayment_events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id")
    .notNull()
    .references(() => scenarios.id),
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

export const insertPrepaymentEventSchema = createInsertSchema(prepaymentEvents).omit({
  id: true,
  createdAt: true,
});
export type InsertPrepaymentEvent = z.infer<typeof insertPrepaymentEventSchema>;
export type PrepaymentEvent = typeof prepaymentEvents.$inferSelect;

// Refinancing Events - Model refinancing scenarios at renewal points
export const refinancingEvents = pgTable("refinancing_events", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id")
    .notNull()
    .references(() => scenarios.id),

  // Timing options
  refinancingYear: integer("refinancing_year"), // For year-based refinancing (nullable)
  atTermEnd: integer("at_term_end").notNull().default(0), // Boolean: 0 = false, 1 = true - for term-end based refinancing

  // Refinancing details
  newRate: decimal("new_rate", { precision: 5, scale: 3 }).notNull(), // New interest rate (e.g., 5.490)
  termType: text("term_type").notNull(), // 'fixed', 'variable-changing', 'variable-fixed'

  // Optional refinancing changes
  newAmortizationMonths: integer("new_amortization_months"), // If extending amortization (nullable)
  paymentFrequency: text("payment_frequency"), // If changing frequency (nullable)

  // Closing costs (Feature 2.3)
  closingCosts: decimal("closing_costs", { precision: 12, scale: 2 }), // Total closing costs
  legalFees: decimal("legal_fees", { precision: 12, scale: 2 }), // Legal fees breakdown
  appraisalFees: decimal("appraisal_fees", { precision: 12, scale: 2 }), // Appraisal fees
  dischargeFees: decimal("discharge_fees", { precision: 12, scale: 2 }), // Discharge fees
  otherFees: decimal("other_fees", { precision: 12, scale: 2 }), // Other fees

  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRefinancingEventSchema = createInsertSchema(refinancingEvents)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    closingCosts: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    legalFees: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    appraisalFees: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    dischargeFees: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    otherFees: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
  });
export type InsertRefinancingEvent = z.infer<typeof insertRefinancingEventSchema>;
export type RefinancingEvent = typeof refinancingEvents.$inferSelect;

// Prime Rate History - Track Bank of Canada prime rate changes
export const primeRateHistory = pgTable(
  "prime_rate_history",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    primeRate: decimal("prime_rate", { precision: 5, scale: 3 }).notNull(),
    effectiveDate: date("effective_date").notNull(),
    source: text("source").notNull().default("Bank of Canada"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_prime_rate_effective_date").on(table.effectiveDate),
    index("IDX_prime_rate_created_at").on(table.createdAt),
  ]
);

export const insertPrimeRateHistorySchema = createInsertSchema(primeRateHistory)
  .omit({ id: true, createdAt: true })
  .extend({
    primeRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(3) : val)),
  });

export type InsertPrimeRateHistory = z.infer<typeof insertPrimeRateHistorySchema>;
export type PrimeRateHistory = typeof primeRateHistory.$inferSelect;

// Market Rates - Track current market mortgage rates for IRD calculations
export const marketRates = pgTable(
  "market_rates",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    rateType: text("rate_type").notNull(), // "fixed" | "variable-changing" | "variable-fixed"
    termYears: integer("term_years").notNull(), // 1, 2, 3, 4, 5, 7, 10
    rate: decimal("rate", { precision: 5, scale: 3 }).notNull(), // e.g., 5.490
    source: text("source").notNull().default("Bank of Canada"),
    effectiveDate: date("effective_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_market_rates_type_term").on(table.rateType, table.termYears),
    index("IDX_market_rates_effective_date").on(table.effectiveDate),
    index("IDX_market_rates_created_at").on(table.createdAt),
  ]
);

export const insertMarketRateSchema = createInsertSchema(marketRates)
  .omit({ id: true, createdAt: true })
  .extend({
    rate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(3) : val)),
  });

export type InsertMarketRate = z.infer<typeof insertMarketRateSchema>;
export type MarketRate = typeof marketRates.$inferSelect;

// Notifications table
export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // "renewal_reminder" | "trigger_rate_alert" | "rate_change" | "penalty_calculated" | "blend_extend_available"
    title: text("title").notNull(),
    message: text("message").notNull(),
    read: integer("read").notNull().default(0), // boolean (0 = false, 1 = true)
    emailSent: integer("email_sent").notNull().default(0), // boolean
    emailSentAt: timestamp("email_sent_at"),
    metadata: jsonb("metadata"), // Additional data (renewal date, trigger rate, mortgage ID, etc.)
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_notifications_user_read").on(table.userId, table.read),
    index("IDX_notifications_created_at").on(table.createdAt),
    index("IDX_notifications_type").on(table.type),
    index("IDX_notifications_user_created").on(table.userId, table.createdAt),
  ]
);

export const insertNotificationSchema = createInsertSchema(notifications)
  .omit({ id: true, createdAt: true, emailSentAt: true })
  .extend({
    read: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    emailSent: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    metadata: z.record(z.any()).optional(),
  });

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Notification preferences table
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    emailEnabled: integer("email_enabled").notNull().default(1), // boolean
    inAppEnabled: integer("in_app_enabled").notNull().default(1), // boolean
    renewalReminders: integer("renewal_reminders").notNull().default(1), // boolean
    renewalReminderDays: text("renewal_reminder_days").notNull().default("180,90,30,7"), // comma-separated days
    triggerRateAlerts: integer("trigger_rate_alerts").notNull().default(1), // boolean
    triggerRateThreshold: decimal("trigger_rate_threshold", { precision: 5, scale: 3 })
      .notNull()
      .default("0.5"), // 0.5% threshold
    rateChangeAlerts: integer("rate_change_alerts").notNull().default(1), // boolean
    penaltyAlerts: integer("penalty_alerts").notNull().default(1), // boolean
    blendExtendAlerts: integer("blend_extend_alerts").notNull().default(1), // boolean
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("IDX_notification_preferences_user").on(table.userId)]
);

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences)
  .omit({ id: true, updatedAt: true })
  .extend({
    emailEnabled: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    inAppEnabled: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    renewalReminders: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    triggerRateAlerts: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    rateChangeAlerts: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    penaltyAlerts: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    blendExtendAlerts: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    prepaymentLimitAlerts: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    paymentDueReminders: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
    triggerRateThreshold: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(3) : val)),
  });

export const updateNotificationPreferencesSchema = insertNotificationPreferencesSchema.partial();

export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type UpdateNotificationPreferences = z.infer<typeof updateNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// Notification queue table for processing notifications asynchronously
export const notificationQueue = pgTable(
  "notification_queue",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    notificationId: varchar("notification_id")
      .notNull()
      .references(() => notifications.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // "pending" | "processing" | "sent" | "failed"
    retryCount: integer("retry_count").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(3),
    errorMessage: text("error_message"),
    scheduledFor: timestamp("scheduled_for").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_notification_queue_status").on(table.status),
    index("IDX_notification_queue_scheduled").on(table.scheduledFor),
  ]
);

// HELOC Accounts - Home Equity Line of Credit accounts
export const helocAccounts = pgTable(
  "heloc_accounts",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mortgageId: varchar("mortgage_id").references(() => mortgages.id, { onDelete: "set null" }),
    accountName: varchar("account_name").notNull(),
    lenderName: varchar("lender_name").notNull(),
    creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }).notNull(),
    maxLtvPercent: decimal("max_ltv_percent", { precision: 5, scale: 2 })
      .notNull()
      .default("65.00"), // e.g., 65.00
    interestSpread: decimal("interest_spread", { precision: 5, scale: 3 })
      .notNull()
      .default("0.500"), // e.g., 0.500 (Prime + 0.5%)
    currentBalance: decimal("current_balance", { precision: 12, scale: 2 })
      .notNull()
      .default("0.00"),
    homeValueReference: decimal("home_value_reference", { precision: 12, scale: 2 }), // Snapshot for credit limit calc
    accountOpeningDate: date("account_opening_date").notNull(),
    accountStatus: text("account_status").notNull().default("active"), // 'active', 'closed', 'suspended'
    isReAdvanceable: integer("is_re_advanceable").notNull().default(0), // boolean (0/1)
    
    // HELOC payment options
    helocPaymentType: text("heloc_payment_type").default("interest_only"), // "interest_only" | "principal_plus_interest"
    helocMinimumPayment: decimal("heloc_minimum_payment", { precision: 10, scale: 2 }), // Calculated minimum payment
    
    // HELOC draw period tracking
    helocDrawPeriodEndDate: date("heloc_draw_period_end_date"), // End date of draw period (after this, repayment period begins)
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_heloc_accounts_user").on(table.userId),
    index("IDX_heloc_accounts_mortgage").on(table.mortgageId),
  ]
);

export const insertHelocAccountSchema = createInsertSchema(helocAccounts)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    creditLimit: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    maxLtvPercent: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    interestSpread: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(3) : val)),
    currentBalance: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    homeValueReference: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    isReAdvanceable: z
      .union([z.boolean(), z.number()])
      .transform((val) => (val === true || val === 1 ? 1 : 0)),
  });

export const updateHelocAccountSchema = insertHelocAccountSchema.partial();

export type InsertHelocAccount = z.infer<typeof insertHelocAccountSchema>;
export type UpdateHelocAccount = z.infer<typeof updateHelocAccountSchema>;
export type HelocAccount = typeof helocAccounts.$inferSelect;

// HELOC Transactions - Borrowing, repayments, interest payments, interest accruals
export const helocTransactions = pgTable(
  "heloc_transactions",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    helocAccountId: varchar("heloc_account_id")
      .notNull()
      .references(() => helocAccounts.id, { onDelete: "cascade" }),
    transactionDate: date("transaction_date").notNull(),
    transactionType: text("transaction_type").notNull(), // 'borrowing', 'repayment', 'interest_payment', 'interest_accrual'
    transactionAmount: decimal("transaction_amount", { precision: 12, scale: 2 }).notNull(),
    balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }).notNull(),
    balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
    availableCreditBefore: decimal("available_credit_before", {
      precision: 12,
      scale: 2,
    }).notNull(),
    availableCreditAfter: decimal("available_credit_after", { precision: 12, scale: 2 }).notNull(),
    interestRate: decimal("interest_rate", { precision: 5, scale: 3 }), // Prime + spread at time of transaction
    primeRate: decimal("prime_rate", { precision: 5, scale: 3 }), // Prime rate at time of transaction
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_heloc_transactions_account").on(table.helocAccountId),
    index("IDX_heloc_transactions_date").on(table.transactionDate),
  ]
);

export const insertHelocTransactionSchema = createInsertSchema(helocTransactions)
  .omit({ id: true, createdAt: true })
  .extend({
    transactionAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    balanceBefore: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    balanceAfter: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    availableCreditBefore: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    availableCreditAfter: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    interestRate: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(3)
            : val
      ),
    primeRate: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(3)
            : val
      ),
  });

export type InsertHelocTransaction = z.infer<typeof insertHelocTransactionSchema>;
export type HelocTransaction = typeof helocTransactions.$inferSelect;

// Investments - Investment portfolio tracking
export const investments = pgTable(
  "investments",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    investmentName: varchar("investment_name").notNull(),
    investmentType: text("investment_type").notNull(), // 'stocks', 'bonds', 'etfs', 'reits', 'gics', 'other'
    purchaseDate: date("purchase_date").notNull(),
    purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull(),
    currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
    annualDividendYield: decimal("annual_dividend_yield", { precision: 5, scale: 2 }).default(
      "0.00"
    ), // e.g., 3.50%
    annualInterestRate: decimal("annual_interest_rate", { precision: 5, scale: 2 }).default("0.00"), // e.g., 4.25%
    investmentStatus: text("investment_status").notNull().default("active"), // 'active', 'sold', 'closed'
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_investments_user").on(table.userId),
    index("IDX_investments_status").on(table.investmentStatus),
  ]
);

export const insertInvestmentSchema = createInsertSchema(investments)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    purchasePrice: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    currentValue: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    annualDividendYield: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val))
      .optional()
      .default("0.00"),
    annualInterestRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val))
      .optional()
      .default("0.00"),
  });

export const updateInvestmentSchema = insertInvestmentSchema.partial();

export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type UpdateInvestment = z.infer<typeof updateInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;

// Investment Transactions - Purchase, sale, dividend, interest, capital gain transactions
export const investmentTransactions = pgTable(
  "investment_transactions",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    investmentId: varchar("investment_id")
      .notNull()
      .references(() => investments.id, { onDelete: "cascade" }),
    transactionDate: date("transaction_date").notNull(),
    transactionType: text("transaction_type").notNull(), // 'purchase', 'sale', 'dividend', 'interest', 'capital_gain'
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    quantity: decimal("quantity", { precision: 12, scale: 4 }), // For stocks/ETFs
    pricePerUnit: decimal("price_per_unit", { precision: 12, scale: 4 }), // For stocks/ETFs
    description: text("description"),
    linkedHelocTransactionId: varchar("linked_heloc_transaction_id").references(
      () => helocTransactions.id,
      { onDelete: "set null" }
    ), // For Smith Maneuver tracking
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_investment_transactions_investment").on(table.investmentId),
    index("IDX_investment_transactions_date").on(table.transactionDate),
    index("IDX_investment_transactions_heloc").on(table.linkedHelocTransactionId),
  ]
);

export const insertInvestmentTransactionSchema = createInsertSchema(investmentTransactions)
  .omit({ id: true, createdAt: true })
  .extend({
    amount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    quantity: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(4)
            : val
      ),
    pricePerUnit: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(4)
            : val
      ),
  });

export type InsertInvestmentTransaction = z.infer<typeof insertInvestmentTransactionSchema>;
export type InvestmentTransaction = typeof investmentTransactions.$inferSelect;

// Investment Income - Track dividend, interest, and capital gain income
export const investmentIncome = pgTable(
  "investment_income",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    investmentId: varchar("investment_id")
      .notNull()
      .references(() => investments.id, { onDelete: "cascade" }),
    incomeType: text("income_type").notNull(), // 'dividend', 'interest', 'capital_gain'
    incomeDate: date("income_date").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    taxYear: integer("tax_year").notNull(),
    taxTreatment: text("tax_treatment").notNull(), // 'eligible_dividend', 'non_eligible_dividend', 'interest', 'capital_gain'
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_investment_income_investment").on(table.investmentId),
    index("IDX_investment_income_date").on(table.incomeDate),
    index("IDX_investment_income_tax_year").on(table.taxYear),
  ]
);

export const insertInvestmentIncomeSchema = createInsertSchema(investmentIncome)
  .omit({ id: true, createdAt: true })
  .extend({
    amount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertInvestmentIncome = z.infer<typeof insertInvestmentIncomeSchema>;
export type InvestmentIncome = typeof investmentIncome.$inferSelect;

// Tax Brackets - Canadian federal and provincial tax brackets
export const taxBrackets = pgTable(
  "tax_brackets",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    province: varchar("province").notNull(), // 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT', 'Federal'
    taxYear: integer("tax_year").notNull(),
    bracketType: text("bracket_type").notNull(), // 'federal', 'provincial'
    minIncome: decimal("min_income", { precision: 12, scale: 2 }).notNull(),
    maxIncome: decimal("max_income", { precision: 12, scale: 2 }), // null for top bracket
    taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull(), // e.g., 15.00 for 15%
    effectiveDate: date("effective_date").notNull(),
    expiryDate: date("expiry_date"), // null for current brackets
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_tax_brackets_province_year").on(table.province, table.taxYear),
    index("IDX_tax_brackets_type").on(table.bracketType),
    index("IDX_tax_brackets_effective_date").on(table.effectiveDate),
  ]
);

export const insertTaxBracketSchema = createInsertSchema(taxBrackets)
  .omit({ id: true, createdAt: true })
  .extend({
    minIncome: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    maxIncome: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    taxRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertTaxBracket = z.infer<typeof insertTaxBracketSchema>;
export type TaxBracket = typeof taxBrackets.$inferSelect;

// Marginal Tax Rates - Cached calculations for quick lookup
export const marginalTaxRates = pgTable(
  "marginal_tax_rates",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    province: varchar("province").notNull(),
    taxYear: integer("tax_year").notNull(),
    incomeRange: text("income_range").notNull(), // e.g., "0-48535", "48535-97069", etc.
    federalRate: decimal("federal_rate", { precision: 5, scale: 2 }).notNull(),
    provincialRate: decimal("provincial_rate", { precision: 5, scale: 2 }).notNull(),
    combinedRate: decimal("combined_rate", { precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_marginal_tax_rates_province_year").on(table.province, table.taxYear),
    index("IDX_marginal_tax_rates_income_range").on(table.incomeRange),
  ]
);

export const insertMarginalTaxRateSchema = createInsertSchema(marginalTaxRates)
  .omit({ id: true, createdAt: true })
  .extend({
    federalRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    provincialRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    combinedRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertMarginalTaxRate = z.infer<typeof insertMarginalTaxRateSchema>;
export type MarginalTaxRate = typeof marginalTaxRates.$inferSelect;

// Smith Maneuver Strategies
export const smithManeuverStrategies = pgTable(
  "smith_maneuver_strategies",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    strategyName: varchar("strategy_name").notNull(),
    mortgageId: varchar("mortgage_id")
      .notNull()
      .references(() => mortgages.id, { onDelete: "cascade" }),
    helocAccountId: varchar("heloc_account_id")
      .notNull()
      .references(() => helocAccounts.id, { onDelete: "cascade" }),

    // Strategy Parameters
    prepaymentAmount: decimal("prepayment_amount", { precision: 12, scale: 2 }).notNull(),
    prepaymentFrequency: text("prepayment_frequency").notNull(), // 'monthly', 'quarterly', 'annually', 'lump_sum'
    borrowingPercentage: decimal("borrowing_percentage", { precision: 5, scale: 2 }).notNull(), // % of prepayment to borrow
    investmentAllocation: jsonb("investment_allocation"), // Investment types and allocations
    expectedReturnRate: decimal("expected_return_rate", { precision: 5, scale: 2 }).notNull(),

    // Tax Parameters
    annualIncome: decimal("annual_income", { precision: 12, scale: 2 }).notNull(),
    province: varchar("province").notNull(),
    marginalTaxRate: decimal("marginal_tax_rate", { precision: 5, scale: 2 }), // Calculated

    // Projection Parameters
    projectionYears: integer("projection_years").notNull().default(30),
    startDate: date("start_date").notNull(),

    // Status
    status: text("status").notNull().default("draft"), // 'draft', 'active', 'archived'
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("IDX_smith_maneuver_strategies_user").on(table.userId),
    index("IDX_smith_maneuver_strategies_mortgage").on(table.mortgageId),
    index("IDX_smith_maneuver_strategies_heloc").on(table.helocAccountId),
  ]
);

export const insertSmithManeuverStrategySchema = createInsertSchema(smithManeuverStrategies)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    prepaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    borrowingPercentage: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    expectedReturnRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    annualIncome: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    marginalTaxRate: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
  });

export const updateSmithManeuverStrategySchema = insertSmithManeuverStrategySchema.partial();

export type InsertSmithManeuverStrategy = z.infer<typeof insertSmithManeuverStrategySchema>;
export type UpdateSmithManeuverStrategy = z.infer<typeof updateSmithManeuverStrategySchema>;
export type SmithManeuverStrategy = typeof smithManeuverStrategies.$inferSelect;

// Smith Maneuver Transactions
export const smithManeuverTransactions = pgTable(
  "smith_maneuver_transactions",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    strategyId: varchar("strategy_id")
      .notNull()
      .references(() => smithManeuverStrategies.id, { onDelete: "cascade" }),
    transactionDate: date("transaction_date").notNull(),
    transactionType: text("transaction_type").notNull(), // 'prepayment', 'borrowing', 'investment', 'repayment'

    // Prepayment Transaction
    prepaymentAmount: decimal("prepayment_amount", { precision: 12, scale: 2 }),

    // Borrowing Transaction
    borrowingAmount: decimal("borrowing_amount", { precision: 12, scale: 2 }),
    helocBalanceAfter: decimal("heloc_balance_after", { precision: 12, scale: 2 }),
    availableCreditAfter: decimal("available_credit_after", { precision: 12, scale: 2 }),

    // Investment Transaction
    investmentAmount: decimal("investment_amount", { precision: 12, scale: 2 }),
    investmentType: text("investment_type"),
    investmentId: varchar("investment_id").references(() => investments.id, {
      onDelete: "set null",
    }),

    // Calculations
    helocInterestAccrued: decimal("heloc_interest_accrued", { precision: 12, scale: 2 }),
    taxDeduction: decimal("tax_deduction", { precision: 12, scale: 2 }),
    taxSavings: decimal("tax_savings", { precision: 12, scale: 2 }),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("IDX_smith_maneuver_transactions_strategy").on(table.strategyId),
    index("IDX_smith_maneuver_transactions_date").on(table.transactionDate),
  ]
);

export const insertSmithManeuverTransactionSchema = createInsertSchema(smithManeuverTransactions)
  .omit({ id: true, createdAt: true })
  .extend({
    prepaymentAmount: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    borrowingAmount: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    helocBalanceAfter: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    availableCreditAfter: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    investmentAmount: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    helocInterestAccrued: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    taxDeduction: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    taxSavings: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
  });

export type InsertSmithManeuverTransaction = z.infer<typeof insertSmithManeuverTransactionSchema>;
export type SmithManeuverTransaction = typeof smithManeuverTransactions.$inferSelect;

// Smith Maneuver Tax Calculations (annual summaries)
export const smithManeuverTaxCalculations = pgTable(
  "smith_maneuver_tax_calculations",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    strategyId: varchar("strategy_id")
      .notNull()
      .references(() => smithManeuverStrategies.id, { onDelete: "cascade" }),
    taxYear: integer("tax_year").notNull(),
    annualIncome: decimal("annual_income", { precision: 12, scale: 2 }).notNull(),
    province: varchar("province").notNull(),
    marginalTaxRate: decimal("marginal_tax_rate", { precision: 5, scale: 2 }).notNull(),

    // HELOC Tax Deduction
    helocInterestPaid: decimal("heloc_interest_paid", { precision: 12, scale: 2 }).notNull(),
    investmentUsePercentage: decimal("investment_use_percentage", {
      precision: 5,
      scale: 2,
    }).notNull(),
    eligibleInterest: decimal("eligible_interest", { precision: 12, scale: 2 }).notNull(),
    taxDeduction: decimal("tax_deduction", { precision: 12, scale: 2 }).notNull(),
    taxSavings: decimal("tax_savings", { precision: 12, scale: 2 }).notNull(),

    // Investment Income Tax
    investmentIncome: decimal("investment_income", { precision: 12, scale: 2 }).notNull(),
    investmentTax: decimal("investment_tax", { precision: 12, scale: 2 }).notNull(),

    // Net Tax Benefit
    netTaxBenefit: decimal("net_tax_benefit", { precision: 12, scale: 2 }).notNull(),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("IDX_smith_maneuver_tax_calculations_strategy").on(table.strategyId),
    index("IDX_smith_maneuver_tax_calculations_tax_year").on(table.taxYear),
  ]
);

export const insertSmithManeuverTaxCalculationSchema = createInsertSchema(
  smithManeuverTaxCalculations
)
  .omit({ id: true, createdAt: true })
  .extend({
    annualIncome: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    marginalTaxRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    helocInterestPaid: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    investmentUsePercentage: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    eligibleInterest: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    taxDeduction: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    taxSavings: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    investmentIncome: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    investmentTax: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    netTaxBenefit: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertSmithManeuverTaxCalculation = z.infer<
  typeof insertSmithManeuverTaxCalculationSchema
>;
export type SmithManeuverTaxCalculation = typeof smithManeuverTaxCalculations.$inferSelect;

// Smith Maneuver Comparisons
export const smithManeuverComparisons = pgTable(
  "smith_maneuver_comparisons",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    comparisonName: varchar("comparison_name").notNull(),

    // Smith Maneuver Scenario
    smithManeuverStrategyId: varchar("smith_maneuver_strategy_id")
      .notNull()
      .references(() => smithManeuverStrategies.id, { onDelete: "cascade" }),

    // Alternative Scenario
    alternativeType: text("alternative_type").notNull(), // 'direct_prepayment', 'invest_only', 'status_quo'
    alternativeParameters: jsonb("alternative_parameters"),

    // Comparison Results
    netWorthDifference: decimal("net_worth_difference", { precision: 12, scale: 2 }),
    interestPaidDifference: decimal("interest_paid_difference", { precision: 12, scale: 2 }),
    payoffTimeDifference: integer("payoff_time_difference"), // months
    riskLevelDifference: text("risk_level_difference"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("IDX_smith_maneuver_comparisons_user").on(table.userId),
    index("IDX_smith_maneuver_comparisons_strategy").on(table.smithManeuverStrategyId),
  ]
);

export const insertSmithManeuverComparisonSchema = createInsertSchema(smithManeuverComparisons)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    netWorthDifference: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
    interestPaidDifference: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
  });

export type InsertSmithManeuverComparison = z.infer<typeof insertSmithManeuverComparisonSchema>;
export type SmithManeuverComparison = typeof smithManeuverComparisons.$inferSelect;

// Recast Events - Track mortgage recast events (payment recalculation after large prepayments)
export const recastEvents = pgTable(
  "recast_events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    mortgageId: varchar("mortgage_id")
      .notNull()
      .references(() => mortgages.id, { onDelete: "cascade" }),
    termId: varchar("term_id")
      .notNull()
      .references(() => mortgageTerms.id, { onDelete: "cascade" }),
    recastDate: date("recast_date").notNull(),
    prepaymentAmount: decimal("prepayment_amount", { precision: 12, scale: 2 }).notNull(),
    previousBalance: decimal("previous_balance", { precision: 12, scale: 2 }).notNull(),
    newBalance: decimal("new_balance", { precision: 12, scale: 2 }).notNull(),
    previousPaymentAmount: decimal("previous_payment_amount", { precision: 10, scale: 2 }).notNull(),
    newPaymentAmount: decimal("new_payment_amount", { precision: 10, scale: 2 }).notNull(),
    remainingAmortizationMonths: integer("remaining_amortization_months").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_recast_events_mortgage").on(table.mortgageId),
    index("IDX_recast_events_term").on(table.termId),
    index("IDX_recast_events_date").on(table.recastDate),
  ]
);

export const insertRecastEventSchema = createInsertSchema(recastEvents)
  .omit({ id: true, createdAt: true })
  .extend({
    prepaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    previousBalance: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    newBalance: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    previousPaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    newPaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertRecastEvent = z.infer<typeof insertRecastEventSchema>;
export type RecastEvent = typeof recastEvents.$inferSelect;

// Payment Frequency Change Events - Track mid-term payment frequency changes
export const paymentFrequencyChangeEvents = pgTable(
  "payment_frequency_change_events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    mortgageId: varchar("mortgage_id")
      .notNull()
      .references(() => mortgages.id, { onDelete: "cascade" }),
    termId: varchar("term_id")
      .notNull()
      .references(() => mortgageTerms.id, { onDelete: "cascade" }),
    changeDate: date("change_date").notNull(),
    oldFrequency: text("old_frequency").notNull(),
    newFrequency: text("new_frequency").notNull(),
    oldPaymentAmount: decimal("old_payment_amount", { precision: 10, scale: 2 }).notNull(),
    newPaymentAmount: decimal("new_payment_amount", { precision: 10, scale: 2 }).notNull(),
    remainingTermMonths: integer("remaining_term_months").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_payment_frequency_change_events_mortgage").on(table.mortgageId),
    index("IDX_payment_frequency_change_events_term").on(table.termId),
    index("IDX_payment_frequency_change_events_date").on(table.changeDate),
  ]
);

export const insertPaymentFrequencyChangeEventSchema = createInsertSchema(
  paymentFrequencyChangeEvents
)
  .omit({ id: true, createdAt: true })
  .extend({
    oldPaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    newPaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertPaymentFrequencyChangeEvent = z.infer<
  typeof insertPaymentFrequencyChangeEventSchema
>;
export type PaymentFrequencyChangeEvent = typeof paymentFrequencyChangeEvents.$inferSelect;

// Mortgage Portability - Track mortgage portability events (transferring mortgages to new properties)
export const mortgagePortability = pgTable(
  "mortgage_portability",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    mortgageId: varchar("mortgage_id")
      .notNull()
      .references(() => mortgages.id, { onDelete: "cascade" }),
    portDate: date("port_date").notNull(),
    oldPropertyPrice: decimal("old_property_price", { precision: 12, scale: 2 }).notNull(),
    newPropertyPrice: decimal("new_property_price", { precision: 12, scale: 2 }).notNull(),
    portedAmount: decimal("ported_amount", { precision: 12, scale: 2 }).notNull(),
    topUpAmount: decimal("top_up_amount", { precision: 12, scale: 2 }), // Additional amount if new property is more expensive
    newMortgageId: varchar("new_mortgage_id").references(() => mortgages.id), // Reference to new mortgage if created
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_mortgage_portability_mortgage").on(table.mortgageId),
    index("IDX_mortgage_portability_new_mortgage").on(table.newMortgageId),
    index("IDX_mortgage_portability_date").on(table.portDate),
  ]
);

export const insertMortgagePortabilitySchema = createInsertSchema(mortgagePortability)
  .omit({ id: true, createdAt: true })
  .extend({
    oldPropertyPrice: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    newPropertyPrice: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    portedAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    topUpAmount: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val === null || val === undefined
          ? undefined
          : typeof val === "number"
            ? val.toFixed(2)
            : val
      ),
  });

export type InsertMortgagePortability = z.infer<typeof insertMortgagePortabilitySchema>;
export type MortgagePortability = typeof mortgagePortability.$inferSelect;

// Renewal Negotiations - Track rate negotiations during renewal process
export const renewalNegotiations = pgTable(
  "renewal_negotiations",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    mortgageId: varchar("mortgage_id")
      .notNull()
      .references(() => mortgages.id, { onDelete: "cascade" }),
    termId: varchar("term_id")
      .notNull()
      .references(() => mortgageTerms.id, { onDelete: "cascade" }),
    negotiationDate: date("negotiation_date").notNull(),
    offeredRate: decimal("offered_rate", { precision: 5, scale: 3 }), // Rate offered by lender
    negotiatedRate: decimal("negotiated_rate", { precision: 5, scale: 3 }), // Final negotiated rate
    status: text("status").notNull(), // "pending", "accepted", "rejected", "counter_offered"
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_renewal_negotiations_mortgage").on(table.mortgageId),
    index("IDX_renewal_negotiations_term").on(table.termId),
    index("IDX_renewal_negotiations_date").on(table.negotiationDate),
  ]
);

export const insertRenewalNegotiationSchema = createInsertSchema(renewalNegotiations)
  .omit({ id: true, createdAt: true })
  .extend({
    offeredRate: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val == null ? null : typeof val === "number" ? val.toFixed(3) : val
      ),
    negotiatedRate: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val == null ? null : typeof val === "number" ? val.toFixed(3) : val
      ),
  });

export type InsertRenewalNegotiation = z.infer<typeof insertRenewalNegotiationSchema>;
export type RenewalNegotiation = typeof renewalNegotiations.$inferSelect;

// Renewal History - Track completed renewals with decision data
export const renewalHistory = pgTable(
  "renewal_history",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    mortgageId: varchar("mortgage_id")
      .notNull()
      .references(() => mortgages.id, { onDelete: "cascade" }),
    termId: varchar("term_id")
      .notNull()
      .references(() => mortgageTerms.id, { onDelete: "cascade" }),
    renewalDate: date("renewal_date").notNull(),
    previousRate: decimal("previous_rate", { precision: 5, scale: 3 }).notNull(), // Rate before renewal (in decimal, e.g., 0.055 for 5.5%)
    newRate: decimal("new_rate", { precision: 5, scale: 3 }).notNull(), // Rate after renewal
    decisionType: text("decision_type").notNull(), // "stayed", "switched", "refinanced"
    lenderName: text("lender_name"),
    estimatedSavings: decimal("estimated_savings", { precision: 12, scale: 2 }), // Estimated savings over term
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_renewal_history_mortgage").on(table.mortgageId),
    index("IDX_renewal_history_term").on(table.termId),
    index("IDX_renewal_history_date").on(table.renewalDate),
  ]
);

export const insertRenewalHistorySchema = createInsertSchema(renewalHistory)
  .omit({ id: true, createdAt: true })
  .extend({
    previousRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(3) : val)),
    newRate: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(3) : val)),
    estimatedSavings: z
      .union([z.string(), z.number(), z.null(), z.undefined()])
      .optional()
      .transform((val) =>
        val == null ? null : typeof val === "number" ? val.toFixed(2) : val
      ),
  });

export type InsertRenewalHistory = z.infer<typeof insertRenewalHistorySchema>;
export type RenewalHistory = typeof renewalHistory.$inferSelect;

// Property Value History - Track property value over time for HELOC credit limit updates
export const propertyValueHistory = pgTable(
  "property_value_history",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    mortgageId: varchar("mortgage_id")
      .notNull()
      .references(() => mortgages.id, { onDelete: "cascade" }),
    valueDate: date("value_date").notNull(),
    propertyValue: decimal("property_value", { precision: 12, scale: 2 }).notNull(),
    source: text("source"), // "appraisal", "assessment", "estimate", "user_input"
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_property_value_history_mortgage").on(table.mortgageId),
    index("IDX_property_value_history_date").on(table.valueDate),
  ]
);

export const insertPropertyValueHistorySchema = createInsertSchema(propertyValueHistory)
  .omit({ id: true, createdAt: true })
  .extend({
    propertyValue: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertPropertyValueHistory = z.infer<typeof insertPropertyValueHistorySchema>;
export type PropertyValueHistory = typeof propertyValueHistory.$inferSelect;

// Mortgage Payoff - Track final mortgage payoff
export const mortgagePayoff = pgTable(
  "mortgage_payoff",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    mortgageId: varchar("mortgage_id")
      .notNull()
      .references(() => mortgages.id, { onDelete: "cascade" }),
    payoffDate: date("payoff_date").notNull(),
    finalPaymentAmount: decimal("final_payment_amount", { precision: 12, scale: 2 }).notNull(),
    remainingBalance: decimal("remaining_balance", { precision: 12, scale: 2 }).notNull(),
    penaltyAmount: decimal("penalty_amount", { precision: 12, scale: 2 }).default("0.00"),
    totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(), // finalPaymentAmount + penaltyAmount
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("IDX_mortgage_payoff_mortgage").on(table.mortgageId),
    index("IDX_mortgage_payoff_date").on(table.payoffDate),
  ]
);

export const insertMortgagePayoffSchema = createInsertSchema(mortgagePayoff)
  .omit({ id: true, createdAt: true })
  .extend({
    finalPaymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    remainingBalance: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
    penaltyAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val))
      .optional()
      .default("0.00"),
    totalCost: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "number" ? val.toFixed(2) : val)),
  });

export type InsertMortgagePayoff = z.infer<typeof insertMortgagePayoffSchema>;
export type MortgagePayoff = typeof mortgagePayoff.$inferSelect;
