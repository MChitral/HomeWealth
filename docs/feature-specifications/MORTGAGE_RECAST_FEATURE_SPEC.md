# Mortgage Recast Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Mortgage recast is a powerful option that allows homeowners to reduce their monthly payment after making large prepayments, without extending their amortization period. The Mortgage Recast feature provides:

- **Payment Reduction:** Lower monthly payments after large prepayments
- **Flexibility:** Maintain same amortization period while reducing payment burden
- **Financial Relief:** Free up monthly cash flow for other priorities
- **Opportunity Detection:** Automated alerts when recast opportunities exist
- **Impact Analysis:** Calculate recast impact before applying

### Market Context

**Canadian Mortgage Recast Market:**

- **Recast Definition:** Lender recalculates payment based on new (lower) balance after large prepayment
- **Common Triggers:** Large lump sum prepayments (>10% of original balance), property sales, inheritances
- **Availability:** Most lenders offer recast (some charge fee, typically $200-$500)
- **Minimum Threshold:** Typically requires prepayment of at least 10% of original mortgage amount

**Industry Statistics:**

- Average recast payment reduction: 10-20% (varies by prepayment size)
- Typical recast threshold: $10,000-$50,000+ prepayment
- Recast usage: Only 5-10% of eligible homeowners use recast (many unaware of option)
- Recast can free up $200-$800/month in cash flow

**Strategic Importance:**

- Recast is valuable option that many homeowners don't know about
- Payment reduction provides immediate financial relief
- Opportunity detection drives user engagement
- Integrates with prepayment workflow

### Strategic Positioning

- **Premium Feature:** Recast functionality differentiates from basic mortgage calculators
- **User Value:** Immediate payment reduction provides tangible benefit
- **Integration Value:** Integrates with prepayment mechanics and payment tracking
- **Educational Opportunity:** Raises awareness of recast option

---

## Domain Overview

### Recast Fundamentals

**Mortgage Recast** occurs when a large prepayment is made and the lender recalculates the monthly payment based on the new (lower) balance, while keeping the same amortization period.

**Key Characteristics:**

1. **When Recast Occurs:**
   - After large prepayment (typically ≥10% of original balance)
   - At borrower's request (lender approval required)
   - Payment amount decreases, amortization stays same

2. **Recast Benefits:**
   - **Lower Payment:** Monthly payment reduced based on new balance
   - **Same Amortization:** Original amortization period maintained
   - **Cash Flow Relief:** Frees up monthly cash for other uses
   - **No Penalty:** Typically no penalty for recast (different from refinancing)

3. **Recast Requirements:**
   - Large prepayment (threshold varies by lender, typically ≥10% of original)
   - Lender approval (some lenders charge fee)
   - Cannot recast if balance too small (minimal balance threshold)

### Recast Calculation

**What Is Recast Calculation?**

Recast calculation determines the new payment amount after applying a prepayment, based on:
- New balance (current balance - prepayment)
- Current interest rate
- Remaining amortization period
- Payment frequency

**Calculation Formula:**

```
New Balance = Current Balance - Prepayment Amount

New Payment = calculatePayment(
  New Balance,
  Current Interest Rate,
  Remaining Amortization Months,
  Payment Frequency
)

Payment Reduction = Current Payment - New Payment
```

**Key Points:**

- New payment calculated from new balance (not current payment)
- Remaining amortization period unchanged
- Interest rate unchanged (same as current term)
- Payment frequency unchanged

**Example:**

```
Current Balance: $400,000
Prepayment: $50,000
New Balance: $350,000

Current Payment: $2,500/month
Interest Rate: 5.49%
Remaining Amortization: 240 months (20 years)

New Payment: ~$2,187/month (calculated from $350,000)
Payment Reduction: ~$313/month (12.5% reduction)
```

### Recast vs Refinancing

**Key Differences:**

1. **Recast:**
   - Payment reduction only
   - Same interest rate
   - Same amortization period
   - No closing costs (may have fee)
   - No penalty (if within prepayment limits)
   - Lender approval required

2. **Refinancing:**
   - Rate and payment changes
   - New interest rate (can be higher or lower)
   - Can change amortization period
   - Closing costs apply ($1,000-$2,500)
   - Penalty may apply (if breaking term early)
   - New term/mortgage agreement

**When to Use Recast:**

- Large prepayment made
- Want payment reduction without rate change
- Don't want to extend amortization
- Want to avoid closing costs/penalties

**When to Use Refinancing:**

- Want to change interest rate
- Want to change amortization period
- Need to borrow more (cash-out)
- Want different term length

### Recast Opportunity Detection

**What Triggers Recast Opportunity?**

A recast opportunity exists when:
- Large prepayment has been made (typically ≥10% of original balance)
- Remaining balance is substantial (can still benefit from recast)
- Remaining amortization is significant (payment reduction meaningful)

**Opportunity Criteria:**

1. **Prepayment Threshold:**
   - Year-to-date prepayments ≥ 10% of original mortgage amount
   - Or single prepayment ≥ 10% of original amount

2. **Balance Condition:**
   - Current balance significantly lower than original
   - Balance reduction ≥ 10% of original amount

3. **Amortization Condition:**
   - Remaining amortization ≥ 12 months (minimum for meaningful reduction)

**Detection Process:**

- Scheduled job runs weekly
- Checks all mortgages for large prepayments
- Calculates potential payment reduction
- Creates notification if opportunity exists
- Prevents duplicate notifications (one per prepayment year)

### Recast Workflow

**Standard Workflow:**

1. **Large Prepayment Made:**
   - User makes large prepayment
   - System detects recast opportunity
   - Notification sent to user

2. **Calculate Recast Impact:**
   - User opens recast dialog
   - Enters prepayment amount (or uses detected amount)
   - System calculates new payment and reduction
   - User reviews impact

3. **Apply Recast:**
   - User confirms recast application
   - System creates recast event
   - Mortgage balance updated
   - Term payment amount updated
   - Recast event recorded

4. **Payment Updates:**
   - Future payments use new (lower) payment amount
   - Amortization schedule recalculated
   - Interest savings calculated

### Canadian Lender Conventions

**Recast Availability:**

- **Major Lenders:** Most offer recast (RBC, TD, BMO, Scotiabank, CIBC)
- **Requirements:** Vary by lender (prepayment threshold, fee)
- **Fees:** Some lenders charge fee ($200-$500), others free

**Common Thresholds:**

- Minimum prepayment: 10% of original amount
- Some lenders: 15-20% of original amount
- Others: Fixed dollar amount (e.g., $10,000 minimum)

**Fee Structure:**

- Some lenders: Free recast
- Others: Fee per recast ($200-$500)
- Some: Fee waived for large prepayments

**Process:**

1. Borrower requests recast (after large prepayment)
2. Lender verifies prepayment made
3. Lender calculates new payment
4. New payment applied (typically next payment cycle)
5. Amortization schedule updated

---

## User Personas & Use Cases

### Persona 1: Cash Flow Seeker (Wants Payment Relief)

**Profile:**
- Made large prepayment (bonus, inheritance, property sale)
- Wants to reduce monthly payment burden
- Needs more monthly cash flow
- Not interested in refinancing (wants to keep current rate)

**Use Cases:**
- Receive recast opportunity notification
- Calculate recast impact (payment reduction)
- Apply recast to reduce monthly payment
- See updated payment amount

**Pain Points Addressed:**
- Uncertainty about recast option
- Wanting to understand payment reduction
- Need for cash flow relief after large prepayment
- Wanting to avoid refinancing costs/penalties

### Persona 2: Strategic Planner (Prepayment + Recast)

**Profile:**
- Plans to make large prepayment
- Wants to understand recast impact before prepaying
- Values payment reduction benefit
- Strategic about prepayment timing

**Use Cases:**
- Calculate recast impact before making prepayment
- Compare prepayment scenarios (with/without recast)
- Plan prepayment strategy to maximize recast benefit
- Apply recast after making prepayment

**Pain Points Addressed:**
- Uncertainty about recast impact before prepaying
- Wanting to plan prepayment strategy
- Need for impact analysis
- Wanting to maximize recast benefit

### Persona 3: Opportunity Seeker (Automated Detection)

**Profile:**
- Has made large prepayments over time
- May not be aware of recast option
- Wants to be notified of opportunities
- Values automated detection

**Use Cases:**
- Receive automated recast opportunity notification
- Review opportunity details (payment reduction estimate)
- Calculate exact recast impact
- Apply recast if beneficial

**Pain Points Addressed:**
- Lack of awareness about recast option
- Need for proactive opportunity detection
- Wanting to maximize benefits of prepayments
- Uncertainty about recast eligibility

---

## Feature Requirements

### Data Model Requirements

**Recast Events Table:**

- `id` (UUID, primary key)
- `mortgageId` (foreign key to mortgages, cascade delete)
- `termId` (foreign key to mortgageTerms, cascade delete)
- `recastDate` (date, required) - Date recast was applied
- `prepaymentAmount` (decimal 12,2, required) - Prepayment amount that triggered recast
- `previousBalance` (decimal 12,2, required) - Balance before prepayment
- `newBalance` (decimal 12,2, required) - Balance after prepayment
- `previousPaymentAmount` (decimal 10,2, required) - Payment before recast
- `newPaymentAmount` (decimal 10,2, required) - Payment after recast
- `remainingAmortizationMonths` (integer, required) - Remaining amortization at recast
- `description` (text, optional) - Event description
- `createdAt` (timestamp)

**Indexes:**
- Index on `mortgageId` for quick lookup
- Index on `termId` for term-based queries
- Index on `recastDate` for date-based queries

### Business Logic Requirements

**Recast Calculation:**

1. **Inputs:**
   - Mortgage ID
   - Prepayment amount
   - Optional: Recast date (defaults to today)

2. **Process:**
   - Fetch mortgage and active term
   - Get current balance (from latest payment or mortgage)
   - Get current payment amount
   - Get remaining amortization months
   - Get effective interest rate
   - Get payment frequency
   - Validate prepayment amount (> 0, < current balance)
   - Calculate new balance: `currentBalance - prepaymentAmount`
   - Calculate new payment: `calculatePayment(newBalance, rate, amortization, frequency)`
   - Calculate payment reduction: `currentPayment - newPayment`
   - Return recast result

3. **Outputs:**
   - Previous balance
   - New balance
   - Previous payment amount
   - New payment amount
   - Payment reduction
   - Remaining amortization months
   - Can recast flag (true/false)
   - Message (if cannot recast)

**Recast Application:**

1. **Pre-conditions:**
   - Recast calculation successful (`canRecast = true`)
   - User authorized for mortgage
   - Active term exists

2. **Process:**
   - Calculate recast (verify can recast)
   - Create recast event record
   - Update mortgage `currentBalance` to new balance
   - Update term `regularPaymentAmount` to new payment
   - Return recast event and updated term

3. **Post-conditions:**
   - Recast event saved to database
   - Mortgage balance updated
   - Term payment amount updated
   - Future payments use new payment amount

**Recast History:**

1. **Fetch History:**
   - Get all recast events for mortgage
   - Sort by recast date (newest first)
   - Return event list

2. **History Display:**
   - Show recast date
   - Show prepayment amount
   - Show payment reduction
   - Show before/after payment amounts
   - Show before/after balances

**Recast Opportunity Detection:**

1. **Detection Criteria:**
   - Year-to-date prepayments ≥ 10% of original amount
   - Balance reduction ≥ 10% of original amount
   - Remaining amortization ≥ 12 months
   - No recent recast opportunity notification

2. **Detection Process:**
   - Scheduled job runs weekly
   - For each mortgage:
     - Calculate year-to-date prepayments
     - Check if ≥ 10% threshold
     - Check if balance reduction ≥ 10%
     - Check if notification already sent (this prepayment year)
     - If eligible, create notification

3. **Notification Content:**
   - Title: "Recast Opportunity Available"
   - Message: Prepayment amount, estimated payment reduction
   - Metadata: Mortgage ID, term ID, prepayment details

### Calculation Requirements

**Recast Payment Calculation:**

```typescript
function calculateRecastPayment(
  currentBalance: number,
  prepaymentAmount: number,
  annualRate: number,
  remainingAmortizationMonths: number,
  paymentFrequency: PaymentFrequency,
  currentPaymentAmount: number
): RecastResult {
  // Validate inputs
  if (currentBalance <= 0) throw new Error("Balance must be > 0");
  if (prepaymentAmount <= 0) throw new Error("Prepayment must be > 0");
  if (prepaymentAmount >= currentBalance) throw new Error("Prepayment cannot exceed balance");
  if (remainingAmortizationMonths <= 0) throw new Error("Amortization must be > 0");
  
  // Calculate new balance
  const newBalance = currentBalance - prepaymentAmount;
  
  // Edge case: Balance very small or zero
  if (newBalance < 0.01) {
    return {
      previousBalance: currentBalance,
      newBalance: 0,
      previousPaymentAmount: currentPaymentAmount,
      newPaymentAmount: 0,
      paymentReduction: currentPaymentAmount,
      remainingAmortizationMonths: 0
    };
  }
  
  // Calculate new payment
  const newPaymentAmount = calculatePayment(
    newBalance,
    annualRate,
    remainingAmortizationMonths,
    paymentFrequency
  );
  
  // Calculate payment reduction
  const paymentReduction = currentPaymentAmount - newPaymentAmount;
  
  return {
    previousBalance: currentBalance,
    newBalance,
    previousPaymentAmount: currentPaymentAmount,
    newPaymentAmount,
    paymentReduction,
    remainingAmortizationMonths
  };
}
```

**Payment Calculation (Standard):**

Uses standard mortgage payment formula:
```
Payment = (Balance × MonthlyRate × (1 + MonthlyRate)^Months) / ((1 + MonthlyRate)^Months - 1)

Where:
  MonthlyRate = AnnualRate / PaymentsPerYear
  Months = Remaining Amortization Months
  PaymentsPerYear = Based on payment frequency (12 for monthly, 26 for biweekly, etc.)
```

### Validation Requirements

**Prepayment Amount Validation:**

- Must be positive (> 0)
- Must be less than current balance (< currentBalance)
- Should be significant (≥ 10% of original for recast to be beneficial)

**Recast Eligibility Validation:**

- Active term must exist
- Current balance must be > 0
- Remaining amortization must be > 0
- Prepayment amount must meet threshold (≥ 10% of original, lender-dependent)

**Balance Validation:**

- Current balance must be positive
- New balance must be ≥ 0 (can be zero if prepayment pays off mortgage)

### Integration Requirements

**Mortgage Integration:**

- Fetches mortgage and active term
- Updates mortgage `currentBalance` after recast
- Updates term `regularPaymentAmount` after recast

**Payment Integration:**

- Future payments use new (recasted) payment amount
- Payment tracking reflects payment change
- Payment amount change event recorded (optional)

**Prepayment Integration:**

- Recast triggered by large prepayments
- Prepayment amounts tracked for opportunity detection
- Year-to-date prepayments used for threshold check

**Notification Integration:**

- Recast opportunity notifications sent when threshold met
- Notification preferences checked (if applicable)
- Deduplication prevents multiple notifications

---

## User Stories & Acceptance Criteria

### Epic: Recast Calculation

**Story 1: Calculate Recast Impact**
- **As a** homeowner
- **I want to** calculate recast impact before applying
- **So that** I can see payment reduction before committing

**Acceptance Criteria:**
- ✅ Recast calculation form with prepayment amount input
- ✅ Calculate button triggers calculation
- ✅ Results show: previous balance, new balance, previous payment, new payment, payment reduction
- ✅ Results show: remaining amortization months
- ✅ Can recast flag displayed (true/false)
- ✅ Error message displayed if cannot recast

**Story 2: View Recast Calculation Results**
- **As a** homeowner
- **I want to** see detailed recast calculation results
- **So that** I can understand the impact

**Acceptance Criteria:**
- ✅ Previous and new balance displayed clearly
- ✅ Previous and new payment amounts displayed
- ✅ Payment reduction amount and percentage displayed
- ✅ Remaining amortization months shown
- ✅ Results clearly formatted and easy to understand

### Epic: Recast Application

**Story 3: Apply Recast**
- **As a** homeowner
- **I want to** apply recast to my mortgage
- **So that** my payment amount is reduced

**Acceptance Criteria:**
- ✅ Apply button available after calculation
- ✅ Confirmation step before applying
- ✅ Recast applied successfully
- ✅ Mortgage balance updated to new balance
- ✅ Term payment amount updated to new payment
- ✅ Recast event created and saved

**Story 4: View Recast History**
- **As a** homeowner
- **I want to** view my recast history
- **So that** I can see past recast events

**Acceptance Criteria:**
- ✅ Recast history list displayed
- ✅ History sorted by date (newest first)
- ✅ Each event shows: date, prepayment amount, payment reduction, before/after amounts
- ✅ History accessible from mortgage details

### Epic: Recast Opportunity Detection

**Story 5: Receive Recast Opportunity Notification**
- **As a** homeowner
- **I want to** receive notification when recast opportunity exists
- **So that** I don't miss recast benefits

**Acceptance Criteria:**
- ✅ Notification created when large prepayment made (≥10% threshold)
- ✅ Notification includes prepayment amount and estimated payment reduction
- ✅ Notification links to recast calculation
- ✅ No duplicate notifications (one per prepayment year)
- ✅ Notification preferences respected

**Story 6: View Recast Opportunity Details**
- **As a** homeowner
- **I want to** see details about recast opportunity
- **So that** I can evaluate if recast makes sense

**Acceptance Criteria:**
- ✅ Opportunity details show prepayment amount
- ✅ Estimated payment reduction shown
- ✅ Link to calculate exact recast impact
- ✅ Link to apply recast

---

## Technical Implementation Notes

### API Endpoints

**Recast Calculation:**
- `POST /api/mortgages/:id/recast/calculate` - Calculate recast impact
  - Body: `{ prepaymentAmount: number, recastDate?: string }`
  - Returns: `RecastCalculationResult` (previousBalance, newBalance, previousPayment, newPayment, paymentReduction, remainingAmortizationMonths, canRecast, message)

**Recast Application:**
- `POST /api/mortgages/:id/recast/apply` - Apply recast
  - Body: `{ prepaymentAmount: number, recastDate?: string }`
  - Returns: `{ recastEvent, updatedTerm }`

**Recast History:**
- `GET /api/mortgages/:id/recast/history` - Get recast history
  - Returns: `RecastEvent[]` (sorted by date, newest first)

### Database Schema

**Recast Events Table:**
```sql
CREATE TABLE recast_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  mortgage_id VARCHAR NOT NULL REFERENCES mortgages(id) ON DELETE CASCADE,
  term_id VARCHAR NOT NULL REFERENCES mortgage_terms(id) ON DELETE CASCADE,
  recast_date DATE NOT NULL,
  prepayment_amount DECIMAL(12,2) NOT NULL,
  previous_balance DECIMAL(12,2) NOT NULL,
  new_balance DECIMAL(12,2) NOT NULL,
  previous_payment_amount DECIMAL(10,2) NOT NULL,
  new_payment_amount DECIMAL(10,2) NOT NULL,
  remaining_amortization_months INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IDX_recast_events_mortgage ON recast_events(mortgage_id);
CREATE INDEX IDX_recast_events_term ON recast_events(term_id);
CREATE INDEX IDX_recast_events_date ON recast_events(recast_date);
```

### Service Layer

**RecastService:**
- `calculateRecast(mortgageId, userId, input): Promise<RecastCalculationResult | undefined>`
  - Calculates recast impact without applying
  - Returns calculation result with canRecast flag

- `applyRecast(mortgageId, userId, input): Promise<{ recastEvent, updatedTerm } | undefined>`
  - Applies recast (updates balance and payment)
  - Creates recast event
  - Returns recast event and updated term

- `getRecastHistory(mortgageId, userId): Promise<RecastEvent[] | undefined>`
  - Gets all recast events for mortgage
  - Returns sorted list (newest first)

**Recast Calculation Functions:**
- `calculateRecastPayment(currentBalance, prepaymentAmount, annualRate, remainingAmortizationMonths, paymentFrequency, currentPaymentAmount): RecastResult`
  - Core recast calculation
  - Returns new balance, new payment, payment reduction

### Scheduled Jobs

**Recast Opportunity Check Job:**
- Runs weekly
- Checks all mortgages for large prepayments
- Creates notifications when threshold met (≥10% of original)
- Prevents duplicate notifications (one per prepayment year)
- Integrated with notification service

### Frontend Components

**RecastDialog:**
- Dialog component for recast calculation and application
- Form for prepayment amount input
- Calculate button
- Results display (before/after amounts, reduction)
- Apply button (after calculation)
- Success/error handling

**RecastHistory:**
- Component displaying recast event history
- List of past recast events
- Event details (date, amounts, reduction)
- Sorted by date (newest first)

**RecastResults:**
- Component displaying recast calculation results
- Before/after comparison
- Payment reduction highlight
- Clear formatting

### Data Flow

**Recast Calculation Flow:**
1. User opens recast dialog
2. User enters prepayment amount
3. User clicks "Calculate"
4. Frontend sends POST to `/api/mortgages/:id/recast/calculate`
5. Backend: `RecastService.calculateRecast()`
   - Fetches mortgage and active term
   - Gets current balance and payment
   - Calculates new balance and payment
   - Returns calculation result
6. Frontend displays results
7. User reviews impact

**Recast Application Flow:**
1. User reviews calculation results
2. User clicks "Apply Recast"
3. Frontend sends POST to `/api/mortgages/:id/recast/apply`
4. Backend: `RecastService.applyRecast()`
   - Calculates recast (verifies can recast)
   - Creates recast event
   - Updates mortgage balance
   - Updates term payment amount
5. Returns recast event and updated term
6. Frontend displays success message
7. Mortgage data refreshed (new payment amount)

**Recast Opportunity Detection Flow:**
1. Scheduled job runs weekly
2. For each mortgage:
   - Calculates year-to-date prepayments
   - Checks if ≥ 10% threshold
   - Checks if notification already sent
   - If eligible, creates notification
3. User receives notification
4. User clicks notification → opens recast dialog

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Prepayment Amount Edge Cases:**

1. **Prepayment = Current Balance:**
   - Mortgage paid off completely
   - New balance = 0, new payment = 0
   - Can recast = false (mortgage paid off)
   - Handle gracefully: Return paid-off result

2. **Prepayment > Current Balance:**
   - Invalid input
   - Validation prevents (prepayment must be < current balance)
   - Handle gracefully: Return error message

3. **Prepayment = 0:**
   - Invalid input
   - Validation prevents (prepayment must be > 0)
   - Handle gracefully: Return error message

4. **Very Small Prepayment:**
   - Prepayment < 10% of original (may not meet lender threshold)
   - Can still calculate recast
   - Warning message (may not meet lender requirements)

5. **Very Small New Balance:**
   - New balance < $1 (essentially paid off)
   - New payment = 0
   - Can recast = false (mortgage paid off)
   - Handle gracefully: Return paid-off result

**Balance Edge Cases:**

1. **Zero Current Balance:**
   - Should not occur (mortgage already paid off)
   - Handle gracefully: Return error (cannot recast paid-off mortgage)

2. **Negative Balance:**
   - Should not occur
   - Validation prevents
   - Handle gracefully: Return error

**Amortization Edge Cases:**

1. **Zero Remaining Amortization:**
   - Should not occur
   - Validation prevents
   - Handle gracefully: Return error

2. **Very Small Remaining Amortization:**
   - Remaining amortization < 12 months
   - Recast may not be beneficial
   - Calculate anyway (user decision)

**Payment Edge Cases:**

1. **New Payment = 0:**
   - Balance paid off completely
   - Valid result
   - Can recast = false (mortgage paid off)

2. **New Payment > Current Payment:**
   - Should not occur (balance decreased, payment should decrease)
   - Indicates calculation error
   - Handle gracefully: Log error, return error message

**Term Edge Cases:**

1. **No Active Term:**
   - Term expired or not found
   - Can recast = false
   - Error message: "No active term found"

2. **Multiple Active Terms:**
   - Should not occur (system should prevent)
   - Handle gracefully: Use most recent term

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid prepayment amount, invalid input
- **401 Unauthorized:** User not authenticated
- **404 Not Found:** Mortgage not found, no active term
- **500 Internal Server Error:** Calculation error, unexpected error

**Frontend Error Handling:**

- Display user-friendly error messages
- Show loading states during calculation/application
- Handle network errors gracefully
- Validate inputs before submission
- Log errors for debugging

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero balance, zero amortization, etc.)
- Return appropriate error messages
- Use safe defaults where appropriate
- Log calculation errors for debugging

**Opportunity Detection Error Handling:**

- Handle missing mortgage/term gracefully
- Skip mortgages with errors (continue with others)
- Log errors for debugging
- Prevent notification spam (deduplication)

---

## Testing Considerations

### Unit Tests

**Recast Calculation Tests:**
- `calculateRecastPayment()`: Basic calculation (normal case)
- `calculateRecastPayment()`: Edge case - prepayment = balance (payoff)
- `calculateRecastPayment()`: Edge case - very small new balance
- `calculateRecastPayment()`: Validation - prepayment > balance (error)
- `calculateRecastPayment()`: Validation - prepayment = 0 (error)
- `calculateRecastPayment()`: Validation - balance = 0 (error)

**RecastService Tests:**
- `calculateRecast()`: Complete calculation flow
- `calculateRecast()`: No active term (error)
- `calculateRecast()`: Invalid prepayment amount (error)
- `applyRecast()`: Complete application flow
- `applyRecast()`: Cannot recast (error)
- `getRecastHistory()`: Returns history sorted by date

### Integration Tests

**Recast Calculation API:**
- Calculate recast with valid prepayment
- Calculate recast with invalid prepayment (error)
- Calculate recast without active term (error)
- Verify calculation results accuracy

**Recast Application API:**
- Apply recast successfully
- Verify mortgage balance updated
- Verify term payment amount updated
- Verify recast event created
- Apply recast when cannot recast (error)

**Recast History API:**
- Get recast history for mortgage
- Verify history sorted correctly (newest first)
- Verify history includes all events

### End-to-End Tests

**Recast Workflow E2E:**
1. User opens recast dialog
2. User enters prepayment amount
3. User clicks "Calculate"
4. Results displayed (before/after amounts, reduction)
5. User clicks "Apply Recast"
6. Recast applied successfully
7. Mortgage balance and payment updated
8. Recast event created
9. User views recast history
10. New recast event visible in history

**Recast Opportunity E2E:**
1. User makes large prepayment (≥10% of original)
2. Scheduled job runs
3. Recast opportunity notification created
4. User receives notification
5. User clicks notification → opens recast dialog
6. User calculates and applies recast

---

## Future Enhancements

### Known Limitations

1. **Lender-Specific Rules:**
   - Currently uses standard 10% threshold
   - Could add lender-specific thresholds
   - Could add lender-specific fees

2. **Recast Fee:**
   - Currently not tracked
   - Could add fee field to recast events
   - Could include fee in cost-benefit analysis

3. **Partial Recast:**
   - Currently assumes full prepayment amount used
   - Could support partial recast (use portion of prepayment)

### Potential Improvements

**Enhanced Analysis:**
- Recast vs refinancing comparison
- Recast impact on interest savings
- Recast impact on payoff timeline
- Cost-benefit analysis (recast fee vs payment reduction savings)

**Advanced Features:**
- Recast scheduling (apply recast at future date)
- Recast templates (common scenarios)
- Recast calculator (standalone tool)
- Recast educational content

**Integration Enhancements:**
- Recast in scenario planning
- Recast projections over time
- Recast optimization recommendations
- Recast impact on cash flow projections

---

**End of Feature Specification**

