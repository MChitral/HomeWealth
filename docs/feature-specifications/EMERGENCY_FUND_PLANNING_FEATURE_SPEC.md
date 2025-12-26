# Emergency Fund Planning Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Emergency fund planning is a critical financial foundation that provides security and stability before pursuing mortgage prepayments or investments. An emergency fund protects against unexpected expenses and income loss, avoiding high-interest debt. The Emergency Fund Planning feature provides:

- **Target Setting:** Set emergency fund target based on months of expenses
- **Progress Tracking:** Track current balance toward target
- **Integration with Scenarios:** Emergency fund contributions prioritized in scenario planning
- **Financial Security:** Foundation for mortgage strategy (build emergency fund before aggressive prepayments)
- **Peace of Mind:** Financial safety net for unexpected expenses or job loss

### Market Context

**Canadian Emergency Fund Market:**

- **Recommended Target:** 3-6 months of essential expenses (most people)
- **Extended Target:** 6-12 months (self-employed, variable income)
- **Industry Standard:** Most financial advisors recommend emergency fund before aggressive investing
- **Average Emergency Fund:** $5,000-$15,000 (varies by income and expenses)

**Industry Statistics:**

- Only 40-50% of Canadians have emergency fund
- Average emergency fund: 2-3 months of expenses (below recommendation)
- Recommended amount: $10,000-$30,000+ (3-6 months × $3,000-$5,000 monthly expenses)
- Emergency fund should cover: Fixed expenses + variable essential expenses (not discretionary)

**Strategic Importance:**

- Emergency fund is foundation for mortgage strategy
- Most advisors recommend building emergency fund before aggressive prepayments
- Emergency fund prevents high-interest debt in emergencies
- Integration with scenario planning essential (priority allocation)

### Strategic Positioning

- **Foundation Feature:** Emergency fund planning is foundational to financial security
- **User Value:** Financial safety net provides peace of mind and security
- **Integration Value:** Integrates with scenario planning, cash flow, and projections
- **Educational Opportunity:** Raises awareness of emergency fund importance

---

## Domain Overview

### Emergency Fund Fundamentals

**Emergency Fund** is cash set aside to cover unexpected expenses or income loss. It serves as a financial safety net to avoid high-interest debt (credit cards, loans) during emergencies.

**Key Characteristics:**

1. **Purpose:**
   - Cover unexpected expenses (medical, home repairs, car repairs)
   - Provide income replacement during job loss
   - Avoid high-interest debt in emergencies
   - Provide financial security and peace of mind

2. **Emergency Fund Benefits:**
   - **Financial Security:** Covers expenses during emergencies
   - **Avoid Debt:** Prevents high-interest credit card debt (20%+ interest)
   - **Peace of Mind:** Reduces financial anxiety
   - **Foundation:** Enables other financial goals (prepayments, investments)

3. **Emergency Fund Strategy:**
   - Build emergency fund first (before aggressive prepayments/investments)
   - Maintain target balance (replenish if used)
   - Keep in accessible account (high-interest savings account)
   - Only use for true emergencies

### Target Amount Calculation

**What Is Target Amount?**

The **target amount** is the total emergency fund goal, calculated as a multiple of monthly essential expenses.

**Calculation:**

```
Target Amount = Monthly Essential Expenses × Target Months

Where:
  Monthly Essential Expenses = Fixed Expenses + Variable Essential Expenses
  Fixed Expenses = Property Tax + Home Insurance + Condo Fees + Utilities
  Variable Essential Expenses = Groceries + Transportation (essential spending)
  Target Months = User-selected target (typically 3-12 months)
```

**Key Points:**

- Target based on **essential expenses** (not discretionary expenses like dining, entertainment)
- Typical target: 3-6 months (standard), 6-12 months (self-employed)
- Target can be customized by user (1-12 months)
- Target amount recalculated when expenses change

**Example:**

```
Monthly Essential Expenses:
  Fixed Expenses: $800 (property tax + insurance + utilities)
  Variable Essential: $1,200 (groceries + transportation)
  Total: $2,000/month

Target Months: 6 months
Target Amount: $2,000 × 6 = $12,000
```

### Target Months Recommendations

**Standard Recommendation: 3-6 Months**

- **3 Months:** Minimum safety net (acceptable for stable employment)
- **6 Months:** Standard recommendation (most people)
- **9-12 Months:** Extended target (self-employed, variable income, high job risk)

**Factors Affecting Target:**

1. **Employment Stability:**
   - Stable employment: 3-6 months
   - Variable income: 6-12 months
   - Self-employed: 6-12 months

2. **Financial Obligations:**
   - High debt payments: 6+ months
   - Single income household: 6+ months
   - Multiple dependents: 6+ months

3. **Risk Tolerance:**
   - Conservative: 6-12 months
   - Moderate: 3-6 months
   - Aggressive: 3 months (minimum)

**Default:** 6 months (standard recommendation)

### Progress Tracking

**What Is Progress Tracking?**

Progress tracking shows how much of the target amount has been saved and how much remains.

**Calculation:**

```
Progress Percent = (Current Balance / Target Amount) × 100

Remaining Amount = Target Amount - Current Balance
```

**Key Points:**

- Progress shown as percentage (0-100%)
- Progress shown as amount (current balance vs target)
- Visual progress indicator (progress bar)
- Updates automatically when balance or target changes

**Example:**

```
Target Amount: $12,000
Current Balance: $4,500

Progress Percent = ($4,500 / $12,000) × 100 = 37.5%
Remaining Amount = $12,000 - $4,500 = $7,500

Visual: 37.5% progress bar, "$4,500 / $12,000"
```

### Monthly Contribution

**What Is Monthly Contribution?**

**Monthly contribution** is the amount allocated to the emergency fund each month. This can be:
- Fixed amount (user-specified)
- Percentage of monthly surplus (from scenarios)
- Priority allocation (before prepayments/investments)

**Integration with Scenarios:**

In scenario planning, monthly surplus can be allocated with priority:
1. **Emergency Fund Priority:** % of surplus allocated to emergency fund first
2. **Remaining Surplus:** Remaining amount split between prepayments and investments

**Example:**

```
Monthly Surplus: $1,500
Emergency Fund Priority: 20%

Emergency Fund Contribution = $1,500 × 0.20 = $300/month
Remaining Surplus = $1,500 - $300 = $1,200/month
(Remaining allocated to prepayments and investments)
```

### Essential Expenses Calculation

**What Are Essential Expenses?**

**Essential expenses** are the minimum expenses needed to survive during an emergency (excluding discretionary spending).

**Essential Expenses Include:**

1. **Fixed Housing Expenses:**
   - Property tax
   - Home insurance
   - Condo fees
   - Utilities (essential services)

2. **Variable Essential Expenses:**
   - Groceries (essential food)
   - Transportation (essential commuting)

**Essential Expenses Exclude:**

- Dining out (discretionary)
- Entertainment (discretionary)
- Debt payments (may be paused or reduced during emergency)
- Mortgage payment (may be paused or reduced during emergency)

**Calculation:**

```
Essential Expenses = Fixed Expenses + Variable Essential Expenses

Fixed Expenses = Property Tax + Home Insurance + Condo Fees + Utilities
Variable Essential Expenses = Groceries + Transportation
```

**Note:** In the current implementation, essential expenses use fixed expenses + variable expenses (simplified). Future enhancement could distinguish essential vs discretionary variable expenses.

### Integration with Scenario Planning

**How Emergency Fund Integrates:**

1. **Priority Allocation:**
   - Scenarios can allocate % of surplus to emergency fund first
   - Emergency fund priority allocated before prepayments/investments
   - Remaining surplus split between prepayments and investments

2. **Target Achievement:**
   - Contributions continue until target reached
   - After target reached, contributions stop (or can continue to maintain)
   - Excess allocated to prepayments/investments

3. **Projections:**
   - Emergency fund balance tracked in yearly projections
   - Emergency fund value included in net worth calculations
   - Emergency fund growth shown over time

**Scenario Configuration:**

```
Scenario Allocation:
  Emergency Fund Priority: 20% (of monthly surplus)
  Prepayment: 40% (of remaining surplus)
  Investment: 40% (of remaining surplus)

Monthly Surplus: $1,500
Emergency Fund Contribution: $1,500 × 0.20 = $300
Remaining Surplus: $1,200
Prepayment: $1,200 × 0.40 = $480
Investment: $1,200 × 0.40 = $480
```

---

## User Personas & Use Cases

### Persona 1: Security Seeker (Wants Financial Safety)

**Profile:**
- Values financial security and peace of mind
- Wants to build emergency fund before aggressive strategies
- Prefers conservative approach
- Needs financial safety net

**Use Cases:**
- Set emergency fund target (6-12 months)
- Track current balance and progress
- View target amount and remaining amount
- Monitor progress toward goal

**Pain Points Addressed:**
- Uncertainty about emergency fund target
- Need for financial security
- Wanting to track progress
- Need for peace of mind

### Persona 2: Strategic Planner (Builds Foundation First)

**Profile:**
- Plans mortgage strategy comprehensively
- Wants to build emergency fund before prepayments
- Values foundation-first approach
- Needs emergency fund in scenarios

**Use Cases:**
- Set emergency fund target
- Configure emergency fund priority in scenarios
- View emergency fund in projections
- Track emergency fund growth over time

**Pain Points Addressed:**
- Need for emergency fund in strategy planning
- Wanting to prioritize emergency fund
- Need for integration with scenarios
- Uncertainty about allocation strategy

### Persona 3: Optimizer (Maximizes Efficiency)

**Profile:**
- Wants to optimize financial strategy
- Balances emergency fund with prepayments
- Values efficiency in allocation
- Needs to see trade-offs

**Use Cases:**
- Set emergency fund target
- Compare scenarios with/without emergency fund priority
- Optimize allocation between emergency fund and prepayments
- View emergency fund impact on projections

**Pain Points Addressed:**
- Need for allocation optimization
- Wanting to see trade-offs
- Need for scenario comparison
- Uncertainty about optimal allocation

---

## Feature Requirements

### Data Model Requirements

**Emergency Fund Table:**

- `id` (UUID, primary key)
- `userId` (foreign key to users, one per user)
- `targetMonths` (integer, default: 6) - Target coverage in months (1-12)
- `currentBalance` (decimal 10,2, default: 0) - Current emergency fund balance
- `monthlyContribution` (decimal 10,2, default: 0) - Monthly contribution amount (optional, for tracking)
- `updatedAt` (timestamp)

### Business Logic Requirements

**Target Amount Calculation:**

1. **Essential Expenses:**
   - Get cash flow data (if available)
   - Calculate fixed expenses: `propertyTax + homeInsurance + condoFees + utilities`
   - Calculate variable essential expenses: `groceries + transportation`
   - Total essential expenses: `fixedExpenses + variableEssentialExpenses`

2. **Target Amount:**
   ```
   Target Amount = Monthly Essential Expenses × Target Months
   ```

3. **Progress Calculation:**
   ```
   Progress Percent = (Current Balance / Target Amount) × 100
   Remaining Amount = Target Amount - Current Balance
   ```

**Emergency Fund Management:**

- One emergency fund record per user
- Create emergency fund (if doesn't exist)
- Update emergency fund (modify target months, current balance, monthly contribution)
- Get emergency fund (by user ID)

**Integration with Cash Flow:**

- Essential expenses calculated from cash flow data
- Target amount updates when cash flow changes
- Monthly contribution can come from cash flow surplus (via scenarios)

### Calculation Requirements

**Essential Expenses Calculation:**

```typescript
function calculateEssentialExpenses(cashFlow: CashFlow | null): number {
  if (!cashFlow) return 0;
  
  const fixedExpenses = 
    Number(cashFlow.propertyTax || 0) +
    Number(cashFlow.homeInsurance || 0) +
    Number(cashFlow.condoFees || 0) +
    Number(cashFlow.utilities || 0);
  
  const variableEssentialExpenses =
    Number(cashFlow.groceries || 0) +
    Number(cashFlow.transportation || 0);
  
  return fixedExpenses + variableEssentialExpenses;
}
```

**Target Amount Calculation:**

```typescript
function calculateTargetAmount(
  monthlyEssentialExpenses: number,
  targetMonths: number
): number {
  return monthlyEssentialExpenses * targetMonths;
}
```

**Progress Calculation:**

```typescript
function calculateProgress(
  currentBalance: number,
  targetAmount: number
): { percent: number; remaining: number } {
  const percent = targetAmount > 0 
    ? (currentBalance / targetAmount) * 100 
    : 0;
  const remaining = Math.max(0, targetAmount - currentBalance);
  
  return {
    percent: Math.min(100, Math.max(0, percent)),
    remaining
  };
}
```

### Validation Requirements

**Target Months Validation:**

- Target months: 1-12 (reasonable range)
- Default: 6 months (standard recommendation)

**Current Balance Validation:**

- Current balance: Non-negative (≥ 0)
- Can be zero (starting from scratch)

**Monthly Contribution Validation:**

- Monthly contribution: Non-negative (≥ 0)
- Can be zero (no fixed contribution, allocated via scenarios)

**Business Rules:**

- One emergency fund record per user (unique constraint)
- All amounts stored as decimals (precision: 10, scale: 2)
- Currency: Canadian dollars (CAD)
- Target amount recalculated when cash flow or target months change

### Integration Requirements

**Cash Flow Integration:**

- Essential expenses calculated from cash flow
- Target amount uses cash flow essential expenses
- Monthly contribution can come from cash flow surplus

**Scenario Planning Integration:**

- Emergency fund priority allocation (% of surplus)
- Emergency fund contributions in projections
- Emergency fund value tracked in yearly projections
- Emergency fund included in net worth calculations

**Projection Integration:**

- Emergency fund balance tracked over time
- Emergency fund contributions applied monthly
- Emergency fund growth shown in projections
- Emergency fund value included in net worth

---

## User Stories & Acceptance Criteria

### Epic: Emergency Fund Management

**Story 1: Create Emergency Fund Profile**
- **As a** homeowner
- **I want to** create my emergency fund profile
- **So that** I can set target and track progress

**Acceptance Criteria:**
- ✅ Emergency fund creation form with fields
- ✅ Target months input (1-12 months)
- ✅ Current balance input (non-negative)
- ✅ Monthly contribution input (optional, non-negative)
- ✅ Validation: Target months 1-12, amounts non-negative
- ✅ Emergency fund saved to database

**Story 2: Update Emergency Fund Profile**
- **As a** homeowner
- **I want to** update my emergency fund profile
- **So that** I can adjust target or update balance

**Acceptance Criteria:**
- ✅ Update form with existing emergency fund values
- ✅ All fields editable
- ✅ Partial updates supported
- ✅ Validation: Target months 1-12, amounts non-negative
- ✅ Emergency fund updated in database

**Story 3: View Emergency Fund Summary**
- **As a** homeowner
- **I want to** view my emergency fund summary
- **So that** I can see target, progress, and remaining amount

**Acceptance Criteria:**
- ✅ Summary displays target months
- ✅ Summary displays target amount (calculated from essential expenses)
- ✅ Summary displays current balance
- ✅ Summary displays progress percent and remaining amount
- ✅ Visual progress indicator (progress bar)
- ✅ Summary clearly formatted

### Epic: Target Calculation

**Story 4: Calculate Target Amount**
- **As a** system
- **I want to** calculate target amount from essential expenses
- **So that** I can show accurate target based on expenses

**Acceptance Criteria:**
- ✅ Essential expenses calculated from cash flow (fixed + variable essential)
- ✅ Target amount calculated correctly (essential expenses × target months)
- ✅ Target amount updates when cash flow changes
- ✅ Target amount updates when target months change
- ✅ Target amount displayed in summary

**Story 5: Calculate Progress**
- **As a** system
- **I want to** calculate progress toward target
- **So that** I can show how much has been saved

**Acceptance Criteria:**
- ✅ Progress percent calculated correctly (current balance / target amount)
- ✅ Remaining amount calculated correctly (target amount - current balance)
- ✅ Progress displayed as percentage (0-100%)
- ✅ Progress displayed visually (progress bar)
- ✅ Remaining amount displayed

### Epic: Integration with Scenarios

**Story 6: Emergency Fund Priority in Scenarios**
- **As a** homeowner
- **I want to** allocate surplus to emergency fund with priority
- **So that** I can build emergency fund before prepayments

**Acceptance Criteria:**
- ✅ Scenario configuration includes emergency fund priority percent
- ✅ Monthly surplus allocated to emergency fund first (priority %)
- ✅ Remaining surplus allocated to prepayments and investments
- ✅ Emergency fund contributions tracked in projections
- ✅ Contributions stop when target reached (optional)

**Story 7: Emergency Fund in Projections**
- **As a** system
- **I want to** track emergency fund in projections
- **So that** I can show emergency fund growth over time

**Acceptance Criteria:**
- ✅ Emergency fund balance tracked in yearly projections
- ✅ Emergency fund contributions applied monthly
- ✅ Emergency fund value included in net worth calculations
- ✅ Emergency fund growth shown in projection charts
- ✅ Emergency fund status shown in scenario metrics

---

## Technical Implementation Notes

### API Endpoints

**Emergency Fund Management:**
- `GET /api/emergency-fund` - Get emergency fund for user
  - Returns: `EmergencyFund | null`

- `POST /api/emergency-fund` - Create emergency fund
  - Body: `EmergencyFundCreateInput` (targetMonths, currentBalance, monthlyContribution)
  - Returns: `EmergencyFund`

- `PATCH /api/emergency-fund/:id` - Update emergency fund
  - Body: `EmergencyFundUpdateInput` (partial fields)
  - Returns: `EmergencyFund`

### Database Schema

**Emergency Fund Table:**
```sql
CREATE TABLE emergency_fund (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) UNIQUE,
  target_months INTEGER NOT NULL DEFAULT 6,
  current_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  monthly_contribution DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IDX_emergency_fund_user ON emergency_fund(user_id);
```

### Service Layer

**EmergencyFundService:**
- `getByUserId(userId): Promise<EmergencyFund | undefined>`
  - Gets emergency fund for user (one per user)

- `create(userId, payload): Promise<EmergencyFund>`
  - Creates emergency fund for user

- `update(userId, id, payload): Promise<EmergencyFund | undefined>`
  - Updates emergency fund (partial update supported)

### Frontend Components

**EmergencyFundFeature:**
- Main emergency fund feature component
- Manages form state and calculations
- Displays all sections (target, calculator, education)

**EmergencyFundTargetCard:**
- Component for emergency fund target and balance
- Fields: target months, current balance, monthly contribution
- Displays: target amount, progress, remaining amount

**EmergencyFundCalculatorCard:**
- Component for essential expenses calculation
- Shows: fixed expenses, variable expenses, monthly essential expenses
- Helps user understand target amount calculation

**EmergencyFundProgress:**
- Component displaying progress toward target
- Visual progress bar
- Progress percent and remaining amount

**EmergencyFundEducation:**
- Educational content about emergency funds
- Benefits of emergency funds
- Recommendations and best practices

### Data Flow

**Emergency Fund Creation/Update Flow:**
1. User opens emergency fund page
2. Form loads existing emergency fund (if exists) or empty form
3. Essential expenses calculated from cash flow (if available)
4. Target amount calculated (essential expenses × target months)
5. Progress calculated (current balance vs target amount)
6. User enters/updates target months, balance, contribution
7. Target amount and progress update in real-time
8. User clicks "Save"
9. Frontend sends POST/PATCH to `/api/emergency-fund`
10. Backend: Creates or updates emergency fund
11. Returns saved emergency fund
12. Frontend displays success message

**Emergency Fund Integration Flow (Scenarios):**
1. User creates/updates scenario with emergency fund priority
2. Monthly surplus calculated from cash flow
3. Emergency fund contribution = surplus × priority percent
4. Remaining surplus = surplus - emergency fund contribution
5. Remaining surplus allocated to prepayments and investments
6. Emergency fund balance tracked in projections
7. Emergency fund value included in net worth

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Target Months Edge Cases:**

1. **Target Months = 0:**
   - Invalid (must be ≥ 1)
   - Validation prevents
   - Handle gracefully: Return error

2. **Target Months > 12:**
   - Valid scenario (conservative users)
   - Could extend validation limit
   - Handle gracefully: Allow or cap at 12

**Essential Expenses Edge Cases:**

1. **No Cash Flow Data:**
   - Essential expenses = 0
   - Target amount = 0
   - Handle gracefully: Show message "Enter cash flow data to calculate target"

2. **Zero Essential Expenses:**
   - All expenses = 0
   - Target amount = 0
   - Handle gracefully: Show message or default target

3. **Cash Flow Updates:**
   - Target amount should update when cash flow changes
   - Handle gracefully: Recalculate target amount

**Balance Edge Cases:**

1. **Current Balance > Target Amount:**
   - Already exceeded target
   - Progress = 100%+
   - Handle gracefully: Show 100% progress, "Target achieved"

2. **Current Balance = 0:**
   - Starting from scratch
   - Progress = 0%
   - Valid scenario

3. **Negative Balance:**
   - Invalid (should not occur)
   - Validation prevents
   - Handle gracefully: Return error

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid emergency fund data, validation errors
- **401 Unauthorized:** User not authenticated
- **404 Not Found:** Emergency fund not found (for update)
- **500 Internal Server Error:** Database error, unexpected error

**Frontend Error Handling:**

- Display user-friendly error messages
- Show validation errors for invalid inputs
- Handle network errors gracefully
- Show helpful messages when cash flow data missing
- Log errors for debugging

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero expenses, zero target, etc.)
- Return appropriate error messages
- Use safe defaults where appropriate
- Log calculation errors for debugging

---

## Testing Considerations

### Unit Tests

**Essential Expenses Calculation Tests:**
- `calculateEssentialExpenses()`: Basic calculation
- `calculateEssentialExpenses()`: No cash flow data (returns 0)
- `calculateEssentialExpenses()`: Zero expenses
- `calculateEssentialExpenses()`: All expense categories

**Target Amount Calculation Tests:**
- `calculateTargetAmount()`: Basic calculation
- `calculateTargetAmount()`: Different target months
- `calculateTargetAmount()`: Zero essential expenses (returns 0)

**Progress Calculation Tests:**
- `calculateProgress()`: Basic progress (normal case)
- `calculateProgress()`: Zero balance (0% progress)
- `calculateProgress()`: Balance = target (100% progress)
- `calculateProgress()`: Balance > target (100% progress, remaining = 0)

### Integration Tests

**Emergency Fund API:**
- Create emergency fund with valid data
- Create emergency fund with invalid data (error)
- Update emergency fund with partial data
- Get emergency fund for user
- One emergency fund per user constraint

**Cash Flow Integration:**
- Target amount calculated from cash flow
- Target amount updates when cash flow changes
- Essential expenses calculated correctly

### End-to-End Tests

**Emergency Fund Management E2E:**
1. User opens emergency fund page
2. User enters target months and current balance
3. Target amount calculated from cash flow (if available)
4. Progress calculated and displayed
5. User saves emergency fund
6. Emergency fund persisted
7. User returns to page and sees saved data

**Emergency Fund Integration E2E:**
1. User creates/updates emergency fund
2. User creates scenario with emergency fund priority
3. Monthly surplus allocated to emergency fund
4. Emergency fund balance tracked in projections
5. Emergency fund value included in net worth

---

## Future Enhancements

### Known Limitations

1. **Essential vs Discretionary Expenses:**
   - Currently uses all variable expenses (groceries + transportation)
   - Could distinguish essential vs discretionary (dining, entertainment excluded)
   - Future enhancement: More granular essential expense calculation

2. **Monthly Contribution:**
   - Currently tracked but not automatically allocated
   - Allocation happens via scenarios (priority percent)
   - Could add automatic monthly contribution tracking

3. **Emergency Fund Usage:**
   - Currently no tracking of emergency fund usage (withdrawals)
   - Could add transaction tracking
   - Could track when emergency fund is used and needs replenishment

### Potential Improvements

**Enhanced Tracking:**
- Emergency fund transaction history
- Withdrawal tracking (when emergency fund is used)
- Replenishment reminders (if balance drops below target)
- Emergency fund growth trends over time

**Advanced Features:**
- Emergency fund contribution calculator (time to target)
- Emergency fund interest earnings (if in savings account)
- Emergency fund withdrawal scenarios
- Emergency fund recommendations based on income/expenses

**Integration Enhancements:**
- Emergency fund alerts (when target achieved, when below threshold)
- Emergency fund optimization recommendations
- Emergency fund in dashboard summary
- Integration with savings account tracking (future)

---

**End of Feature Specification**

