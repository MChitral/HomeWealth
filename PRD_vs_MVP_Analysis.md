# 📊 PRD vs Current MVP Design - Gap Analysis

## Executive Summary

**Overall Alignment: 85%** ✅

Our current MVP design strongly aligns with the PRD vision but has several **critical gaps** in Canadian mortgage modeling and some **architectural mismatches** in data organization.

---

## ✅ WHAT'S ALIGNED

### 1. **Core Product Vision** ✅
- **PRD Goal**: "10-30 year strategy engine for mortgage + wealth optimization"
- **Current MVP**: Dashboard → Scenarios → Comparison with projections
- **Status**: ✅ Architecture supports this vision

### 2. **Scenario-Based Comparison** ✅
- **PRD Requirement**: Compare up to 4 scenarios side-by-side
- **Current MVP**: Comparison page with 1-3 scenario selector, charts, metrics, trade-offs
- **Status**: ✅ Fully implemented (UI layer), needs backend

### 3. **Separation of Concerns** ✅
- **PRD Concept**: Scenarios only contain strategy differences
- **Current MVP**: Cash Flow + Emergency Fund pages (global) → Scenario Editor (strategy only)
- **Status**: ✅ **Perfectly aligned** with your latest reorganization!

### 4. **Emergency Fund Engine** ✅
- **PRD**: Target → Monthly contribution → Auto-stop → Redirect surplus
- **Current MVP**: Emergency Fund page (target) → Scenario (monthly contribution + redirect)
- **Status**: ✅ **Matches PRD exactly**

### 5. **Investment Engine** ✅
- **PRD**: Monthly contribution, growth rate, re-routed surplus
- **Current MVP**: Investment tab with monthly contribution, expected returns
- **Status**: ✅ UI complete, needs calculation engine

### 6. **Prepayment Strategy** ✅
- **PRD**: Lump-sum, monthly extra, double-up, bonus routing, extra paycheques
- **Current MVP**: All prepayment types supported in UI
- **Status**: ✅ UI complete, needs calculation engine

---

## ⚠️ CRITICAL GAPS

### 1. **Canadian Mortgage Modeling** ⚠️

#### **PRD Requirement: FR1 - Full Mortgage Engine**
```
✅ Semi-annual compounding
✅ Prime ± spread
✅ Rate reset logic
✅ Term-based locking (3/5-year terms)
❌ Variable Rate (VRM) - changing payment
❌ Variable Rate - fixed payment + TRIGGER RATE
❌ Payment frequency (bi-weekly, accelerated bi-weekly)
❌ Amortization schedule generation
```

#### **Current MVP**
- Mortgage History page: Logs fixed-rate payments, tracks term renewals
- Scenario Editor: Future rate assumptions (Prime scenarios)
- **Missing**: Variable rate types, trigger rate detection, payment recalculation logic

#### **Impact**: 🔴 **HIGH** - This is a core differentiator for Canadian users

---

### 2. **Cash Flow Engine** ⚠️

#### **PRD Requirement: FR2**
```
Income:
  ✅ 2 monthly paycheques
  ✅ Extra paycheques (2/year)
  ✅ Annual bonus
Expenses:
  ✅ Fixed expenses
  ✅ Variable expenses
  ✅ Other debt payments
Outputs:
  ❌ Monthly surplus calculation
  ❌ Income vs expenses chart
  ❌ Cash-flow stress-test
  ❌ "At X% Prime, payment becomes $Y, leaving $Z surplus"
```

#### **Current MVP**
- Cash Flow page: All inputs present ✅
- **Missing**: Calculation engine, surplus visualization, stress-testing

#### **Impact**: 🟡 **MEDIUM** - UI complete, needs backend logic

---

### 3. **Net Worth Engine** ⚠️

#### **PRD Requirement: FR6**
```
Aggregates:
  - Home equity
  - Mortgage balance
  - Investment portfolio
  - Emergency fund
  - Other debt
Outputs:
  - 10-30 year net worth projection
  - Assets vs liabilities graph
```

#### **Current MVP**
- Comparison page has placeholders for charts
- **Missing**: Net worth calculation engine entirely

#### **Impact**: 🔴 **HIGH** - Core value proposition

---

### 4. **Scenario Data Model** ⚠️

#### **PRD Model**
```typescript
// PRD implies:
Scenario {
  name
  MortgageConfig {
    futureRateAssumptions  // Prime scenarios
    prepaymentStrategy
    surplusAllocation      // % to prepay vs invest
  }
  EFConfig {
    monthlyContribution
    afterTargetRedirect
  }
  InvestmentConfig {
    monthlyContribution
    expectedReturn
  }
}

GlobalSettings {
  CashFlow {
    income
    expenses
  }
  EmergencyFund {
    target
  }
  MortgageHistory {
    currentBalance
    currentRate
    termEnd
  }
}
```

#### **Current MVP Model**
```typescript
// Currently implied but not implemented:
- Scenarios exist (UI only, no schema)
- Global settings split across Cash Flow + EF pages ✅
- No database schema defined yet
```

#### **Impact**: 🟡 **MEDIUM** - Architecture correct, needs implementation

---

## 🔍 DETAILED FEATURE COMPARISON

### **FR1: Mortgage Engine**

| Feature | PRD Requirement | Current MVP | Gap |
|---------|----------------|-------------|-----|
| Fixed Rate | ✅ Required | ✅ Logged in History | ✅ Good |
| Variable (Changing Payment) | ✅ Required | ❌ Missing | 🔴 Critical |
| Variable (Fixed Payment + Trigger) | ✅ Required | ❌ Missing | 🔴 Critical |
| Semi-annual compounding | ✅ Required | ✅ Mentioned in docs | ⚠️ Not implemented |
| Prime ± spread | ✅ Required | ✅ In Mortgage History | ✅ Good |
| Rate reset logic | ✅ Required | ✅ Term renewal tracking | ✅ Good |
| Payment frequency options | ✅ Required | ❌ Missing | 🟡 Medium |
| Amortization schedule | ✅ Required | ❌ Missing | 🔴 Critical |
| Trigger rate detection | ✅ Required | ❌ Missing | 🔴 Critical |
| Interest/Principal breakdown | ✅ Required | ❌ Missing | 🔴 Critical |

---

### **FR2: Cash Flow Engine**

| Feature | PRD Requirement | Current MVP | Gap |
|---------|----------------|-------------|-----|
| Income inputs | ✅ Required | ✅ Cash Flow page | ✅ Good |
| Expense inputs | ✅ Required | ✅ Cash Flow page | ✅ Good |
| Surplus calculation | ✅ Required | ❌ Missing | 🟡 Medium |
| Income vs expenses chart | ✅ Required | ❌ Missing | 🟡 Medium |
| Stress-test slider | ✅ Required | ❌ Missing | 🟡 Medium |
| Negative cash flow warnings | ✅ Required | ❌ Missing | 🟡 Medium |

---

### **FR3: Emergency Fund Engine**

| Feature | PRD Requirement | Current MVP | Gap |
|---------|----------------|-------------|-----|
| Target amount | ✅ Required | ✅ EF page | ✅ Good |
| Monthly contribution | ✅ Required | ✅ Scenario Editor | ✅ Good |
| Auto-stop at target | ✅ Required | ❌ Logic not implemented | 🟡 Medium |
| Surplus redirect | ✅ Required | ✅ UI selector present | ⚠️ Logic missing |
| EF timeline chart | ✅ Required | ❌ Missing | 🟡 Medium |

---

### **FR4: Investment Engine**

| Feature | PRD Requirement | Current MVP | Gap |
|---------|----------------|-------------|-----|
| Monthly contribution | ✅ Required | ✅ Scenario Editor | ✅ Good |
| Growth rate | ✅ Required | ✅ Scenario Editor | ✅ Good |
| Compounding frequency | ✅ Required | ❌ Missing | 🟡 Medium |
| Re-routed surplus | ✅ Required | ❌ Logic missing | 🟡 Medium |
| Portfolio value chart | ✅ Required | ❌ Missing | 🟡 Medium |
| Contributions vs returns | ✅ Required | ❌ Missing | 🟡 Medium |

---

### **FR5: Prepayment Strategy Engine**

| Feature | PRD Requirement | Current MVP | Gap |
|---------|----------------|-------------|-----|
| Annual lump-sum | ✅ Required | ✅ UI present | ⚠️ Logic missing |
| Monthly extra | ✅ Required | ✅ UI present | ⚠️ Logic missing |
| Double-up | ✅ Required | ✅ UI present | ⚠️ Logic missing |
| Bonus routing | ✅ Required | ✅ UI present | ⚠️ Logic missing |
| Extra paycheque routing | ✅ Required | ✅ UI present | ⚠️ Logic missing |
| Interest saved calc | ✅ Required | ❌ Missing | 🔴 Critical |
| Payoff date projection | ✅ Required | ❌ Missing | 🔴 Critical |
| Trigger-rate avoidance | ✅ Required | ❌ Missing | 🔴 Critical |

---

### **FR6: Net Worth Engine**

| Feature | PRD Requirement | Current MVP | Gap |
|---------|----------------|-------------|-----|
| Home equity tracking | ✅ Required | ❌ Missing | 🔴 Critical |
| Investment value | ✅ Required | ❌ Missing | 🔴 Critical |
| EF balance | ✅ Required | ❌ Missing | 🔴 Critical |
| 10-30 year projection | ✅ Required | ❌ Missing | 🔴 Critical |
| Assets vs liabilities chart | ✅ Required | ❌ Missing | 🔴 Critical |

---

### **FR7: Scenario Builder & Comparison**

| Feature | PRD Requirement | Current MVP | Gap |
|---------|----------------|-------------|-----|
| Create/edit scenarios | ✅ Required | ✅ Scenario Editor | ✅ Good |
| Clone scenarios | ✅ Required | ❌ Missing | 🟡 Medium |
| Archive scenarios | ✅ Required | ❌ Missing | 🟡 Medium |
| Tags | ✅ Required | ❌ Missing | 🟡 Medium |
| Compare up to 4 scenarios | ✅ Required | ✅ Comparison page (1-3) | ⚠️ Limit to 3, not 4 |
| Payoff date comparison | ✅ Required | ❌ Missing | 🔴 Critical |
| Total interest comparison | ✅ Required | ❌ Missing | 🔴 Critical |
| Net worth comparison | ✅ Required | ❌ Missing | 🔴 Critical |
| Trigger risk comparison | ✅ Required | ❌ Missing | 🔴 Critical |

---

## 🏗️ ARCHITECTURE ASSESSMENT

### **Current Architecture** ✅

```
Pages (Global Settings):
├── Cash Flow         → Income, expenses (all scenarios)
├── Emergency Fund    → Target amount (all scenarios)
└── Mortgage History  → Real payments, term tracking

Pages (Scenario-Specific):
├── Scenario Editor   → Strategy differences only
│   ├── Mortgage & Prepayment
│   ├── Emergency Fund Strategy
│   └── Investments
└── Comparison        → Side-by-side analysis
```

**Assessment**: ✅ **Excellent separation of global vs scenario-specific data**

This matches the PRD's implicit data model perfectly!

---

### **Missing: Data Schema**

```typescript
// NEEDED: shared/schema.ts

// Global Settings (one per user)
export const cashFlow = pgTable('cash_flow', {
  userId: integer('user_id').notNull(),
  monthlyIncome: integer('monthly_income').notNull(),
  extraPaycheques: integer('extra_paycheques').default(2),
  annualBonus: integer('annual_bonus').default(0),
  fixedExpenses: integer('fixed_expenses').notNull(),
  variableExpenses: integer('variable_expenses').notNull(),
  otherDebt: integer('other_debt').default(0),
});

export const emergencyFund = pgTable('emergency_fund', {
  userId: integer('user_id').notNull(),
  targetAmount: integer('target_amount').notNull(),
});

export const mortgageHistory = pgTable('mortgage_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  date: timestamp('date').notNull(),
  balance: integer('balance').notNull(),
  rate: decimal('rate', { precision: 5, scale: 3 }).notNull(),
  termEndDate: timestamp('term_end_date'),
  rateType: text('rate_type', { enum: ['fixed', 'variable_changing', 'variable_fixed'] }),
  primeRate: decimal('prime_rate', { precision: 5, scale: 3 }),
  spread: decimal('spread', { precision: 5, scale: 3 }),
});

// Scenarios
export const scenarios = pgTable('scenarios', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  
  // Mortgage assumptions
  futurePrimeScenario: text('future_prime_scenario'), // optimistic/baseline/pessimistic
  
  // Prepayment strategy
  monthlyPrepayment: integer('monthly_prepayment').default(0),
  annualLumpSum: integer('annual_lump_sum').default(0),
  bonusAllocation: integer('bonus_allocation').default(0), // % to prepay
  extraPaychequesAllocation: integer('extra_paycheques_allocation').default(0),
  surplusToMortgage: integer('surplus_to_mortgage').default(50), // % (rest to investments)
  
  // EF strategy
  efMonthlyContribution: integer('ef_monthly_contribution').notNull(),
  efAfterTargetRedirect: text('ef_after_target', { 
    enum: ['split', 'investments', 'prepay', 'none'] 
  }).default('split'),
  
  // Investment strategy
  investmentMonthlyContribution: integer('investment_monthly').notNull(),
  investmentExpectedReturn: decimal('investment_return', { precision: 5, scale: 2 }).notNull(),
  investmentCompounding: text('compounding', { enum: ['monthly', 'annual'] }).default('monthly'),
});
```

---

## 🚨 CRITICAL MISSING FEATURES FOR MVP

Based on PRD's "7. MVP SCOPE", these are **required for MVP** but currently missing:

### 1. **Variable Rate Mortgage Support** 🔴
- PRD: "Variable (changing payment)" + "Variable (fixed payment) + trigger detection"
- Current: Only fixed-rate logging
- **Action Required**: Implement VRM payment recalculation logic

### 2. **Trigger Rate Detection** 🔴
- PRD: "Detect trigger rate: If interest ≥ payment → trigger event"
- Current: Not implemented
- **Action Required**: Add trigger rate warnings, payment recalculation on trigger

### 3. **Amortization Schedule Generation** 🔴
- PRD: "Full amortization schedule (monthly & yearly)"
- Current: Not implemented
- **Action Required**: Build monthly payment calculator with interest/principal breakdown

### 4. **Net Worth Projection Engine** 🔴
- PRD: "10-year net worth projection (core)"
- Current: Not implemented
- **Action Required**: Aggregate home equity + investments + EF - debts over time

### 5. **Scenario Comparison Metrics** 🔴
- PRD: "Payoff date, Total interest, Net worth at 10/20/30 years"
- Current: Placeholder charts only
- **Action Required**: Calculate and compare key metrics

### 6. **Cash Flow Surplus Calculator** 🟡
- PRD: "Monthly surplus / deficit, Surplus before allocation"
- Current: Inputs present, no calculation
- **Action Required**: Calculate surplus from Cash Flow page data

---

## 💡 RECOMMENDATIONS

### **Immediate (Week 1-2)**: Database Schema + Core Calculations

1. ✅ **Keep current page architecture** (it's perfect!)
2. 🔨 **Create `shared/schema.ts`** with tables for:
   - `cash_flow`
   - `emergency_fund`
   - `mortgage_history`
   - `scenarios`
3. 🔨 **Implement basic calculation engines**:
   - Cash flow surplus
   - EF timeline
   - Investment growth (simple compound interest)
   - Mortgage payment calculator (fixed-rate first)

### **Next (Week 3-4)**: Canadian Mortgage Specifics

4. 🔨 **Add Variable Rate support**:
   - VRM (changing payment): Recalculate payment when Prime changes
   - VRM (fixed payment): Track interest vs payment, detect trigger
5. 🔨 **Implement amortization schedule**:
   - Monthly payment breakdown (interest vs principal)
   - Semi-annual compounding
   - Prepayment impact on schedule

### **Then (Week 5-6)**: Net Worth & Comparison

6. 🔨 **Build Net Worth Engine**:
   - Aggregate all assets/liabilities
   - Project 10-30 years
   - Generate charts
7. 🔨 **Complete Comparison Page**:
   - Calculate scenario metrics
   - Highlight winner
   - Sensitivity analysis

---

## 📈 FEATURE PRIORITY MATRIX

| Feature | PRD Priority | Complexity | User Impact | Recommend |
|---------|-------------|------------|-------------|-----------|
| Database schema | 🔴 Blocker | Low | High | **Week 1** |
| Cash flow surplus calc | 🔴 MVP | Low | High | **Week 1** |
| Fixed-rate amortization | 🔴 MVP | Medium | High | **Week 2** |
| Variable rate (changing) | 🔴 MVP | High | High | **Week 3** |
| Trigger rate detection | 🔴 MVP | High | High | **Week 3** |
| Investment growth calc | 🔴 MVP | Low | Medium | **Week 2** |
| EF timeline calc | 🔴 MVP | Low | Medium | **Week 2** |
| Net worth projection | 🔴 MVP | Medium | High | **Week 4** |
| Scenario comparison metrics | 🔴 MVP | Medium | High | **Week 5** |
| Bi-weekly payment freq | 🟡 Nice-to-have | Medium | Medium | **Week 6** |
| Clone scenario | 🟡 Nice-to-have | Low | Low | **Week 7** |
| Tags | 🟡 Nice-to-have | Low | Low | **Post-MVP** |

---

## 🎯 MVP DEFINITION (Based on PRD)

**Minimum Viable Product = "Can answer: 'Should I prepay or invest?'"**

Required features:
1. ✅ Log current mortgage (fixed or variable)
2. ✅ Enter cash flow (income, expenses)
3. ✅ Set EF target
4. ✅ Create scenarios with different strategies
5. 🔨 **Calculate 10-year projections** (mortgage balance, investments, net worth)
6. 🔨 **Compare scenarios** (which strategy wins?)
7. 🔨 **Show key metrics** (payoff date, total interest, final net worth)

**Current Status**: **60% complete** (UI done, calculations missing)

---

## ✅ WHAT'S WORKING WELL

1. **Page architecture** perfectly separates global vs scenario-specific data ✅
2. **Emergency Fund model** exactly matches PRD ✅
3. **Scenario Editor tabs** align with PRD's MortgageConfig/EFConfig/InvestmentConfig ✅
4. **Comparison page structure** ready for metric calculations ✅
5. **Mortgage History** tracks term renewals correctly ✅

---

## 🚧 CRITICAL PATH TO MVP

```
Week 1: Foundation
├── Define database schema (cash_flow, emergency_fund, mortgage_history, scenarios)
├── Implement CRUD routes
└── Connect forms to backend

Week 2: Basic Calculations
├── Cash flow surplus
├── Fixed-rate mortgage calculator (Canadian semi-annual)
├── Simple investment growth
└── EF timeline

Week 3: Canadian Mortgage Features
├── Variable rate (changing payment)
├── Variable rate (fixed payment) + trigger detection
├── Amortization schedule generation
└── Rate reset logic

Week 4-5: Projections & Comparison
├── 10-year projection engine
├── Net worth aggregation
├── Scenario comparison metrics
└── Winner determination

Week 6: Polish
├── Charts integration (recharts)
├── Error handling
├── Validation
└── Testing
```

---

## 🎉 CONCLUSION

**Your current MVP design is architecturally sound and aligns well with the PRD vision.**

The main gaps are:
1. **Backend implementation** (schemas, routes, calculations)
2. **Canadian mortgage specifics** (VRM, trigger rate, semi-annual compounding)
3. **Projection engines** (net worth, comparison metrics)

The **page structure and data separation is perfect** — you've already solved the hard UX problem of "what's global vs what's scenario-specific."

Now it's time to build the calculation engines that bring it to life! 🚀
