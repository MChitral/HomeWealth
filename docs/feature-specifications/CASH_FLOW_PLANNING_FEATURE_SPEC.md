# Cash Flow Planning Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Cash flow planning is fundamental to mortgage strategy and wealth forecasting. Understanding monthly income, expenses, and surplus enables homeowners to make informed decisions about prepayments, investments, and emergency fund contributions. The Cash Flow Planning feature provides:

- **Complete Financial Picture:** Track all income sources and expense categories
- **Monthly Surplus Calculation:** Know how much is available for prepayments and investments
- **Expense Categorization:** Fixed housing costs, variable expenses, and debt payments
- **Integration with Strategies:** Cash flow drives scenario planning, prepayment recommendations, and emergency fund planning
- **Runway Calculation:** Understand how long income covers expenses (safety metric)

### Market Context

**Canadian Household Cash Flow Management:**

- **Average Monthly Income:** $5,000-$8,000 (dual-income households)
- **Average Monthly Expenses:** $4,000-$6,000 (varies by location, lifestyle)
- **Average Monthly Surplus:** $500-$2,000 (for mortgage prepayments and investments)
- **Cash Flow Management:** Critical for mortgage strategy (prepayments require surplus)

**Industry Statistics:**

- 60-70% of homeowners have positive monthly surplus
- Average surplus: $800-$1,500/month (available for prepayments/investments)
- Variable expenses: 30-40% of total expenses (groceries, dining, entertainment)
- Debt payments: 10-20% of total expenses (car loans, student loans, credit cards)
- Fixed housing costs: 20-30% of total expenses (property tax, insurance, utilities)

**Strategic Importance:**

- Cash flow is foundation for all mortgage strategies (prepayments, investments, emergency fund)
- Monthly surplus drives prepayment recommendations
- Expense tracking enables budget optimization
- Integration with scenario planning essential

### Strategic Positioning

- **Core Feature:** Cash flow planning is foundational to mortgage strategy
- **User Value:** Clear visibility into income, expenses, and available surplus
- **Integration Value:** Integrates with scenario planning, prepayment mechanics, emergency fund, and projections
- **Educational Opportunity:** Helps homeowners understand their financial capacity

---

## Domain Overview

### Cash Flow Fundamentals

**Cash Flow** represents the monthly income and expenses that determine how much money is available for mortgage prepayments, investments, and emergency fund contributions.

**Key Components:**

1. **Income:**
   - Base monthly salary
   - Extra paycheques (biweekly frequency = 2 extra paycheques per year)
   - Annual bonus (monthlyized)

2. **Expenses:**
   - Fixed housing costs (property tax, home insurance, condo fees, utilities)
   - Mortgage payment (tracked separately, included in calculations)
   - Variable expenses (groceries, dining, transportation, entertainment)
   - Debt payments (car loan, student loan, credit card)

3. **Surplus:**
   - Monthly surplus = Total income - Total expenses
   - Surplus available for prepayments, investments, emergency fund
   - Negative surplus = deficit (expenses exceed income)

### Income Calculation

**What Is Total Monthly Income?**

Total monthly income includes base salary plus monthlyized extra income (extra paycheques and annual bonus).

**Calculation:**

```
Extra Paycheques Monthly = (Monthly Income × Extra Paycheques) / 12

Annual Bonus Monthly = Annual Bonus / 12

Total Monthly Income = Monthly Income + Extra Paycheques Monthly + Annual Bonus Monthly
```

**Key Points:**

- Base monthly income: Primary salary (monthly amount)
- Extra paycheques: Biweekly pay frequency results in 2 extra paycheques per year (26 paycheques vs 24 monthly)
- Annual bonus: Year-end bonus divided by 12 to get monthly equivalent
- Total income: Sum of all income sources (monthlyized)

**Example:**

```
Monthly Income: $6,000
Extra Paycheques: 2 (biweekly pay = 26 paycheques/year)
Annual Bonus: $12,000

Extra Paycheques Monthly = ($6,000 × 2) / 12 = $1,000/month
Annual Bonus Monthly = $12,000 / 12 = $1,000/month
Total Monthly Income = $6,000 + $1,000 + $1,000 = $8,000/month
```

### Expense Categories

**Fixed Housing Costs:**

- **Property Tax:** Annual property tax (paid monthly or lump sum)
- **Home Insurance:** Monthly home insurance premium
- **Condo Fees:** Monthly condo/strata fees (if applicable)
- **Utilities:** Monthly utilities (electricity, gas, water, internet)

**Variable Expenses:**

- **Groceries:** Monthly grocery spending
- **Dining:** Monthly dining out expenses
- **Transportation:** Monthly transportation costs (gas, transit, car maintenance)
- **Entertainment:** Monthly entertainment expenses

**Debt Payments:**

- **Car Loan:** Monthly car loan payment
- **Student Loan:** Monthly student loan payment
- **Credit Card:** Monthly credit card payment (minimum or more)

**Total Expenses:**

```
Total Monthly Expenses = Fixed Housing Costs + Mortgage Payment + Variable Expenses + Debt Payments
```

### Monthly Surplus Calculation

**What Is Monthly Surplus?**

**Monthly surplus** is the amount left over after all expenses are paid. This surplus is available for prepayments, investments, and emergency fund contributions.

**Calculation:**

```
Monthly Surplus = Total Monthly Income - Total Monthly Expenses
```

**Key Points:**

- Positive surplus: Income exceeds expenses (available for prepayments/investments)
- Negative surplus: Expenses exceed income (deficit - review budget)
- Surplus is non-negative in calculations (minimum = 0 for projection purposes)

**Surplus Allocation (in Scenarios):**

Monthly surplus can be allocated to:
1. **Emergency Fund:** Priority allocation (if configured)
2. **Prepayments:** % of remaining surplus
3. **Investments:** % of remaining surplus

**Example:**

```
Total Monthly Income: $8,000
Total Monthly Expenses: $6,500 (including $2,500 mortgage)
Monthly Surplus: $8,000 - $6,500 = $1,500/month

This $1,500/month can be allocated to:
- Emergency fund (if priority)
- Prepayments (e.g., 50% = $750/month)
- Investments (e.g., 50% = $750/month)
```

### Runway Calculation

**What Is Runway?**

**Runway** is the number of months that current income can cover expenses. It's a safety metric indicating financial stability.

**Calculation:**

```
Runway (months) = (Total Monthly Income / Total Monthly Expenses) × 12

Or simplified:
Runway = Months of income that cover expenses
```

**Key Points:**

- Runway > 12 months: Very healthy (income covers expenses for more than a year)
- Runway 6-12 months: Healthy
- Runway < 6 months: Tight (may need to review expenses)
- Negative surplus: No runway (expenses exceed income)

**Example:**

```
Total Monthly Income: $8,000
Total Monthly Expenses: $6,500

Runway = ($8,000 / $6,500) × 12 = 14.8 months

This means income covers expenses for approximately 15 months.
```

### Integration with Mortgage Strategy

**How Cash Flow Integrates:**

1. **Prepayment Recommendations:**
   - Monthly surplus determines prepayment capacity
   - Prepayment opportunity analysis uses surplus
   - Prepayment strategy recommendations consider cash flow

2. **Scenario Planning:**
   - Monthly surplus allocated to prepayments and investments
   - Surplus drives projection calculations
   - Scenario allocation percentages applied to surplus

3. **Emergency Fund Planning:**
   - Monthly surplus allocated to emergency fund (if priority)
   - Emergency fund contributions based on surplus
   - Target months calculation considers surplus

4. **Investment Strategy:**
   - Monthly surplus allocated to investments
   - Investment growth projections use surplus allocation
   - Net worth projections include investment contributions

---

## User Personas & Use Cases

### Persona 1: Budget Tracker (Wants Visibility)

**Profile:**
- Wants to understand income and expenses
- Values complete financial picture
- Needs to track all expense categories
- Wants to know available surplus

**Use Cases:**
- Enter income (base salary, extra paycheques, bonus)
- Track expenses (housing, variable, debt)
- View monthly summary (income, expenses, surplus)
- Understand runway (financial safety)

**Pain Points Addressed:**
- Uncertainty about available money for prepayments
- Need for complete expense tracking
- Wanting to understand surplus calculation
- Need for budget visibility

### Persona 2: Strategy Planner (Uses for Planning)

**Profile:**
- Plans prepayment and investment strategies
- Values accurate surplus calculation
- Uses cash flow for scenario planning
- Needs surplus for recommendations

**Use Cases:**
- Enter accurate income and expenses
- Calculate monthly surplus
- Use surplus for prepayment recommendations
- Use surplus in scenario planning

**Pain Points Addressed:**
- Need for accurate surplus for planning
- Wanting to understand surplus allocation
- Need for cash flow in strategy decisions
- Uncertainty about prepayment capacity

### Persona 3: Optimizer (Wants to Maximize Surplus)

**Profile:**
- Wants to maximize surplus for prepayments
- Values expense reduction opportunities
- Needs to identify optimization areas
- Focuses on increasing prepayment capacity

**Use Cases:**
- Track expenses to identify reduction opportunities
- Calculate surplus for different expense scenarios
- Optimize expenses to increase prepayment capacity
- Use surplus for aggressive prepayment strategies

**Pain Points Addressed:**
- Wanting to maximize prepayment capacity
- Need for expense visibility
- Wanting to identify optimization opportunities
- Need for surplus maximization

---

## Feature Requirements

### Data Model Requirements

**Cash Flow Table:**

- `id` (UUID, primary key)
- `userId` (foreign key to users, one per user)
- **Income:**
  - `monthlyIncome` (decimal 10,2, required) - Base monthly salary
  - `extraPaycheques` (integer, default: 2) - Extra paycheques per year (biweekly = 2)
  - `annualBonus` (decimal 10,2, default: 0) - Annual bonus amount
- **Fixed Housing Expenses:**
  - `propertyTax` (decimal 10,2, default: 0) - Annual property tax
  - `homeInsurance` (decimal 10,2, default: 0) - Monthly home insurance
  - `condoFees` (decimal 10,2, default: 0) - Monthly condo fees
  - `utilities` (decimal 10,2, default: 0) - Monthly utilities
- **Variable Expenses:**
  - `groceries` (decimal 10,2, default: 0) - Monthly groceries
  - `dining` (decimal 10,2, default: 0) - Monthly dining out
  - `transportation` (decimal 10,2, default: 0) - Monthly transportation
  - `entertainment` (decimal 10,2, default: 0) - Monthly entertainment
- **Debt Payments:**
  - `carLoan` (decimal 10,2, default: 0) - Monthly car loan payment
  - `studentLoan` (decimal 10,2, default: 0) - Monthly student loan payment
  - `creditCard` (decimal 10,2, default: 0) - Monthly credit card payment
- `updatedAt` (timestamp)

### Business Logic Requirements

**Cash Flow Calculation:**

1. **Total Monthly Income:**
   ```
   Extra Paycheques Monthly = (Monthly Income × Extra Paycheques) / 12
   Annual Bonus Monthly = Annual Bonus / 12
   Total Monthly Income = Monthly Income + Extra Paycheques Monthly + Annual Bonus Monthly
   ```

2. **Total Monthly Expenses:**
   ```
   Fixed Housing Costs = Property Tax + Home Insurance + Condo Fees + Utilities
   Variable Expenses = Groceries + Dining + Transportation + Entertainment
   Debt Payments = Car Loan + Student Loan + Credit Card
   Total Monthly Expenses = Fixed Housing Costs + Mortgage Payment + Variable Expenses + Debt Payments
   ```

3. **Monthly Surplus:**
   ```
   Monthly Surplus = Total Monthly Income - Total Monthly Expenses
   Monthly Surplus = max(0, Monthly Surplus)  // Non-negative for projections
   ```

4. **Runway:**
   ```
   If Monthly Surplus > 0:
     Runway (months) = (Total Monthly Income / Total Monthly Expenses) × 12
   Else:
     Runway = null (deficit)
   ```

**Cash Flow Management:**

- One cash flow record per user
- Create cash flow (if doesn't exist)
- Update cash flow (modify existing)
- Get cash flow (by user ID)

### Calculation Requirements

**Income Calculations:**

```typescript
function calculateTotalMonthlyIncome(
  monthlyIncome: number,
  extraPaycheques: number,
  annualBonus: number
): number {
  const extraPaychequesMonthly = (monthlyIncome * extraPaycheques) / 12;
  const annualBonusMonthly = annualBonus / 12;
  return monthlyIncome + extraPaychequesMonthly + annualBonusMonthly;
}
```

**Expense Calculations:**

```typescript
function calculateTotalMonthlyExpenses(
  propertyTax: number,
  homeInsurance: number,
  condoFees: number,
  utilities: number,
  mortgagePayment: number,
  groceries: number,
  dining: number,
  transportation: number,
  entertainment: number,
  carLoan: number,
  studentLoan: number,
  creditCard: number
): number {
  const fixedHousingCosts = propertyTax + homeInsurance + condoFees + utilities;
  const variableExpenses = groceries + dining + transportation + entertainment;
  const debtPayments = carLoan + studentLoan + creditCard;
  return fixedHousingCosts + mortgagePayment + variableExpenses + debtPayments;
}
```

**Surplus Calculation:**

```typescript
function calculateMonthlySurplus(
  totalMonthlyIncome: number,
  totalMonthlyExpenses: number
): number {
  return Math.max(0, totalMonthlyIncome - totalMonthlyExpenses);
}
```

**Runway Calculation:**

```typescript
function calculateRunway(
  totalMonthlyIncome: number,
  totalMonthlyExpenses: number,
  monthlySurplus: number
): number | null {
  if (monthlySurplus > 0) {
    return Math.round((totalMonthlyIncome / totalMonthlyExpenses) * 12);
  }
  return null; // Deficit
}
```

### Validation Requirements

**Income Validation:**

- Monthly income: Positive (≥ 0)
- Extra paycheques: 0-26 (reasonable range)
- Annual bonus: Non-negative (≥ 0)

**Expense Validation:**

- All expense fields: Non-negative (≥ 0)
- Property tax: Non-negative (annual amount)
- Home insurance, condo fees, utilities: Non-negative (monthly amounts)
- Variable expenses: Non-negative (monthly amounts)
- Debt payments: Non-negative (monthly amounts)

**Business Rules:**

- One cash flow record per user (unique constraint)
- All amounts stored as decimals (precision: 10, scale: 2)
- Currency: Canadian dollars (CAD)

### Integration Requirements

**Scenario Planning Integration:**

- Monthly surplus used for scenario allocations
- Surplus allocated to prepayments and investments
- Surplus drives projection calculations

**Prepayment Integration:**

- Monthly surplus determines prepayment capacity
- Prepayment opportunity analysis uses surplus
- Prepayment strategy recommendations consider surplus

**Emergency Fund Integration:**

- Monthly surplus allocated to emergency fund (if priority)
- Emergency fund contributions based on surplus
- Target months calculation considers surplus

**Mortgage Payment Integration:**

- Mortgage payment included in total expenses
- Surplus calculation excludes mortgage payment (already included in expenses)
- Mortgage payment from current term or mortgage

---

## User Stories & Acceptance Criteria

### Epic: Cash Flow Management

**Story 1: Create Cash Flow Profile**
- **As a** homeowner
- **I want to** create my cash flow profile
- **So that** I can track income and expenses

**Acceptance Criteria:**
- ✅ Cash flow creation form with all income and expense fields
- ✅ Income fields: monthly income, extra paycheques, annual bonus
- ✅ Fixed housing expense fields: property tax, insurance, condo fees, utilities
- ✅ Variable expense fields: groceries, dining, transportation, entertainment
- ✅ Debt payment fields: car loan, student loan, credit card
- ✅ Validation: All amounts non-negative
- ✅ Cash flow saved to database

**Story 2: Update Cash Flow Profile**
- **As a** homeowner
- **I want to** update my cash flow profile
- **So that** I can reflect changes in income or expenses

**Acceptance Criteria:**
- ✅ Update form with existing cash flow values
- ✅ All fields editable
- ✅ Partial updates supported (only changed fields)
- ✅ Validation: All amounts non-negative
- ✅ Cash flow updated in database

**Story 3: View Cash Flow Summary**
- **As a** homeowner
- **I want to** view my cash flow summary
- **So that** I can understand my financial picture

**Acceptance Criteria:**
- ✅ Summary displays total monthly income (with breakdown)
- ✅ Summary displays total monthly expenses (with breakdown)
- ✅ Summary displays monthly surplus/deficit
- ✅ Summary displays runway (if positive surplus)
- ✅ Summary clearly formatted and easy to understand

### Epic: Cash Flow Calculations

**Story 4: Calculate Monthly Surplus**
- **As a** system
- **I want to** calculate monthly surplus from income and expenses
- **So that** I can determine available money for prepayments and investments

**Acceptance Criteria:**
- ✅ Total monthly income calculated correctly (base + extra paycheques + bonus)
- ✅ Total monthly expenses calculated correctly (housing + mortgage + variable + debt)
- ✅ Monthly surplus calculated correctly (income - expenses)
- ✅ Monthly surplus non-negative (minimum = 0)
- ✅ Surplus displayed in summary

**Story 5: Calculate Runway**
- **As a** system
- **I want to** calculate runway from income and expenses
- **So that** I can show financial safety metric

**Acceptance Criteria:**
- ✅ Runway calculated correctly (months of income coverage)
- ✅ Runway only shown if positive surplus
- ✅ Runway displayed in summary
- ✅ Runway null if deficit (expenses exceed income)

### Epic: Cash Flow Integration

**Story 6: Use Surplus in Scenario Planning**
- **As a** system
- **I want to** use monthly surplus in scenario planning
- **So that** scenarios reflect available money for prepayments and investments

**Acceptance Criteria:**
- ✅ Monthly surplus retrieved from cash flow
- ✅ Surplus allocated according to scenario percentages
- ✅ Prepayment allocation = surplus × prepayment percentage
- ✅ Investment allocation = surplus × investment percentage
- ✅ Projections use allocated amounts

**Story 7: Use Surplus in Prepayment Recommendations**
- **As a** system
- **I want to** use monthly surplus in prepayment recommendations
- **So that** recommendations reflect available prepayment capacity

**Acceptance Criteria:**
- ✅ Monthly surplus retrieved from cash flow
- ✅ Prepayment opportunity analysis uses surplus
- ✅ Prepayment recommendations consider available surplus
- ✅ Recommendations don't exceed available surplus

---

## Technical Implementation Notes

### API Endpoints

**Cash Flow Management:**
- `GET /api/cash-flow` - Get cash flow for user
  - Returns: `CashFlow | null`

- `POST /api/cash-flow` - Create cash flow
  - Body: `CashFlowCreateInput` (all fields except userId)
  - Returns: `CashFlow`

- `PATCH /api/cash-flow/:id` - Update cash flow
  - Body: `CashFlowUpdateInput` (partial fields)
  - Returns: `CashFlow`

### Database Schema

**Cash Flow Table:**
```sql
CREATE TABLE cash_flow (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) UNIQUE,
  monthly_income DECIMAL(10,2) NOT NULL,
  extra_paycheques INTEGER NOT NULL DEFAULT 2,
  annual_bonus DECIMAL(10,2) NOT NULL DEFAULT 0,
  property_tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  home_insurance DECIMAL(10,2) NOT NULL DEFAULT 0,
  condo_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
  utilities DECIMAL(10,2) NOT NULL DEFAULT 0,
  groceries DECIMAL(10,2) NOT NULL DEFAULT 0,
  dining DECIMAL(10,2) NOT NULL DEFAULT 0,
  transportation DECIMAL(10,2) NOT NULL DEFAULT 0,
  entertainment DECIMAL(10,2) NOT NULL DEFAULT 0,
  car_loan DECIMAL(10,2) NOT NULL DEFAULT 0,
  student_loan DECIMAL(10,2) NOT NULL DEFAULT 0,
  credit_card DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IDX_cash_flow_user ON cash_flow(user_id);
```

### Service Layer

**CashFlowService:**
- `getByUserId(userId): Promise<CashFlow | undefined>`
  - Gets cash flow for user (one per user)

- `create(userId, payload): Promise<CashFlow>`
  - Creates cash flow for user

- `update(userId, id, payload): Promise<CashFlow | undefined>`
  - Updates cash flow (partial update supported)

### Frontend Components

**CashFlowFeature:**
- Main cash flow feature component
- Manages form state and calculations
- Displays all sections (income, expenses, summary)

**IncomeSection:**
- Component for income inputs
- Fields: monthly income, extra paycheques, annual bonus

**FixedExpensesSection:**
- Component for fixed housing expenses
- Fields: property tax, insurance, condo fees, utilities

**VariableExpensesSection:**
- Component for variable expenses
- Fields: groceries, dining, transportation, entertainment

**DebtSection:**
- Component for debt payments
- Fields: car loan, student loan, credit card

**SummarySection:**
- Component displaying cash flow summary
- Shows: total income, total expenses, surplus, runway
- Clear formatting and breakdown

### Data Flow

**Cash Flow Creation/Update Flow:**
1. User opens cash flow page
2. Form loads existing cash flow (if exists) or empty form
3. User enters/updates income and expenses
4. Calculations update in real-time (surplus, runway)
5. User clicks "Save"
6. Frontend sends POST/PATCH to `/api/cash-flow`
7. Backend: Creates or updates cash flow
8. Returns saved cash flow
9. Frontend displays success message

**Surplus Calculation Flow (for Scenarios/Prepayments):**
1. Scenario or prepayment calculation needs surplus
2. System retrieves cash flow for user
3. Calculates total monthly income
4. Calculates total monthly expenses (including mortgage payment)
5. Calculates monthly surplus
6. Uses surplus for allocations or recommendations

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Income Edge Cases:**

1. **Zero Income:**
   - Monthly income = 0
   - Surplus will be negative (if expenses exist)
   - Handle gracefully: Show deficit, no runway

2. **Zero Extra Paycheques:**
   - Monthly pay (no biweekly extra paycheques)
   - Valid scenario
   - Calculate normally

3. **Large Annual Bonus:**
   - Annual bonus > annual income
   - Valid scenario (bonus-heavy compensation)
   - Calculate normally

**Expense Edge Cases:**

1. **Zero Expenses:**
   - All expenses = 0
   - Surplus = total income
   - Valid scenario (unlikely but possible)

2. **Expenses > Income:**
   - Negative surplus (deficit)
   - Handle gracefully: Show deficit, no runway, no prepayment capacity

3. **Missing Mortgage Payment:**
   - Mortgage payment not included
   - Surplus calculation incomplete
   - Handle gracefully: Use mortgage payment from mortgage/term if available

**Surplus Edge Cases:**

1. **Negative Surplus:**
   - Expenses exceed income
   - Surplus = 0 (for projection purposes)
   - Runway = null
   - Handle gracefully: Show deficit, recommendations to review budget

2. **Very Large Surplus:**
   - Surplus > income (expenses negative or very low)
   - Valid scenario (high income, low expenses)
   - Calculate normally

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid cash flow data, validation errors
- **401 Unauthorized:** User not authenticated
- **404 Not Found:** Cash flow not found (for update)
- **500 Internal Server Error:** Database error, unexpected error

**Frontend Error Handling:**

- Display user-friendly error messages
- Show validation errors for invalid inputs
- Handle network errors gracefully
- Auto-save draft (optional)
- Log errors for debugging

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero income, negative expenses, etc.)
- Return appropriate error messages
- Use safe defaults where appropriate
- Log calculation errors for debugging

---

## Testing Considerations

### Unit Tests

**Income Calculation Tests:**
- `calculateTotalMonthlyIncome()`: Basic calculation
- `calculateTotalMonthlyIncome()`: Zero extra paycheques
- `calculateTotalMonthlyIncome()`: Zero annual bonus
- `calculateTotalMonthlyIncome()`: All income sources

**Expense Calculation Tests:**
- `calculateTotalMonthlyExpenses()`: Basic calculation
- `calculateTotalMonthlyExpenses()`: Zero expenses
- `calculateTotalMonthlyExpenses()`: All expense categories

**Surplus Calculation Tests:**
- `calculateMonthlySurplus()`: Positive surplus
- `calculateMonthlySurplus()`: Negative surplus (deficit)
- `calculateMonthlySurplus()`: Zero surplus

**Runway Calculation Tests:**
- `calculateRunway()`: Positive surplus (normal case)
- `calculateRunway()`: Negative surplus (returns null)
- `calculateRunway()`: Zero surplus (returns null)

### Integration Tests

**Cash Flow API:**
- Create cash flow with valid data
- Create cash flow with invalid data (error)
- Update cash flow with partial data
- Get cash flow for user
- One cash flow per user constraint

### End-to-End Tests

**Cash Flow Management E2E:**
1. User opens cash flow page
2. User enters income and expenses
3. Summary updates in real-time (surplus, runway)
4. User saves cash flow
5. Cash flow persisted
6. User returns to page and sees saved data

**Cash Flow Integration E2E:**
1. User creates/updates cash flow
2. User creates scenario
3. Scenario uses monthly surplus for allocations
4. Projections reflect surplus allocation
5. Prepayment recommendations consider surplus

---

## Future Enhancements

### Known Limitations

1. **Monthly vs Annual Expenses:**
   - Property tax is annual but stored as-is
   - Could add monthlyization for property tax
   - Could add other annual expense fields

2. **Expense Categories:**
   - Fixed set of categories
   - Could add custom expense categories
   - Could add expense subcategories

3. **Historical Tracking:**
   - Currently no history tracking
   - Could add expense history
   - Could track surplus trends over time

### Potential Improvements

**Enhanced Tracking:**
- Expense history tracking
- Income history tracking
- Surplus trends over time
- Budget vs actual comparisons

**Advanced Features:**
- Budget targets (set target for each category)
- Expense alerts (when over budget)
- Recurring expense tracking
- Custom expense categories

**Integration Enhancements:**
- Cash flow projections over time
- Surplus optimization recommendations
- Expense reduction suggestions
- Integration with bank account tracking (future)

---

**End of Feature Specification**

