# Mortgage Payoff Tracking Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Mortgage payoff tracking records the final payment that fully pays off a mortgage, marking a significant financial milestone. This feature provides:

- **Payoff Documentation:** Complete record of mortgage payoff for financial records
- **Penalty Tracking:** Records any penalties paid during payoff
- **Total Cost Tracking:** Tracks final payment amount plus penalties for complete cost accounting
- **Historical Record:** Maintains payoff history for financial planning and tax purposes
- **Milestone Achievement:** Celebrates major financial accomplishment
- **Refinancing Analysis:** Payoff data used for refinancing decision analysis

### Market Context

**Canadian Mortgage Payoff Market:**

- **Average Payoff Time:** 20-25 years (typical amortization)
- **Early Payoff:** Common for homeowners who maximize prepayments
- **Payoff Penalties:** Common when paying off closed mortgages early (break penalties)
- **Refinancing vs Payoff:** Many homeowners refinance rather than pay off completely
- **Tax Implications:** Payoff may trigger tax events (capital gains, etc.)

**Industry Statistics:**

- Average mortgage term: 5 years (renewed multiple times)
- Average mortgage lifetime: 20-25 years
- Early payoff rate: ~15% of mortgages paid off before term end
- Penalty frequency: ~30% of early payoffs incur penalties
- Average penalty amount: $2,000-$10,000 (varies by mortgage size and terms)

**Strategic Importance:**

- Milestone achievement feature (high user satisfaction)
- Complete financial record for homeowners
- Essential for mortgage lifecycle tracking
- Important for tax and financial planning

### Strategic Positioning

- **Milestone Feature:** Marks completion of major financial goal
- **Record Keeping:** Essential for financial documentation
- **Integration Value:** Integrates with penalty calculations, refinancing analysis, scenario planning
- **User Value:** Celebratory milestone with complete payoff documentation

---

## Domain Overview

### Mortgage Payoff Fundamentals

**Mortgage Payoff** is the final payment that fully pays off a mortgage, reducing the balance to zero. Key characteristics:

1. **Payoff Types:**
   - **Natural Payoff:** Mortgage paid off through regular payments (reaches end of amortization)
   - **Early Payoff:** Mortgage paid off before end of amortization (through prepayments or lump sum)
   - **Refinancing Payoff:** Mortgage paid off when refinancing to new mortgage
   - **Sale Payoff:** Mortgage paid off when property is sold

2. **Payoff Components:**
   - **Remaining Balance:** Outstanding principal balance at payoff date
   - **Final Payment Amount:** Payment made to pay off mortgage
   - **Penalty Amount:** Break penalty (if applicable, for closed mortgages)
   - **Total Cost:** Final payment amount + penalty amount

3. **Penalty Calculation:**
   - **Open Mortgages:** No penalty (can be paid off anytime)
   - **Closed Mortgages:** Break penalty applies (IRD or 3-month interest, greater of)
   - **Variable Rate Mortgages:** Typically 3-month interest penalty
   - **Fixed Rate Mortgages:** Typically IRD (Interest Rate Differential) penalty

### Mortgage Payoff Process

**Payoff Workflow:**

1. **Determine Remaining Balance:**
   - Calculate outstanding principal balance
   - Include accrued interest to payoff date
   - Calculate any prepayment amounts applied

2. **Calculate Penalty (if applicable):**
   - Determine if mortgage is open or closed
   - If closed, calculate break penalty (IRD or 3-month interest)
   - Use penalty calculation method from mortgage terms

3. **Calculate Total Cost:**
   - Total Cost = Remaining Balance + Penalty Amount
   - This is the amount needed to fully pay off mortgage

4. **Record Payoff:**
   - Record payoff date
   - Record final payment amount
   - Record penalty amount (if applicable)
   - Record total cost
   - Store notes (optional context)

5. **Update Mortgage Status:**
   - Mark mortgage as paid off
   - Update mortgage balance to zero
   - Close mortgage term

### Payoff Penalty Calculation

**Penalty Calculation Methods:**

1. **Open Mortgage:**
   - Penalty = $0 (can be paid off anytime without penalty)

2. **Closed Mortgage - IRD Method:**
   - Penalty = Remaining Balance × (Mortgage Rate - Current Market Rate) × Remaining Months / 12
   - More complex calculation, typically higher penalty

3. **Closed Mortgage - 3-Month Interest:**
   - Penalty = Remaining Balance × Mortgage Rate × 3 / 12
   - Simpler calculation, typically lower penalty

4. **Greater of Rule:**
   - Penalty = Max(IRD Penalty, 3-Month Interest Penalty)
   - Lender uses whichever is greater

**Example:**
```
Remaining Balance: $200,000
Mortgage Rate: 5.5%
Market Rate: 3.5%
Remaining Months: 36

IRD Penalty = $200,000 × (5.5% - 3.5%) × 36 / 12 = $12,000
3-Month Interest = $200,000 × 5.5% × 3 / 12 = $2,750

Penalty = Max($12,000, $2,750) = $12,000 (IRD method)

Total Cost = $200,000 + $12,000 = $212,000
```

### Canadian Lender Conventions

1. **Open vs Closed Mortgages:**
   - **Open Mortgages:** Can be paid off anytime without penalty (higher rates)
   - **Closed Mortgages:** Break penalty applies if paid off early (lower rates)

2. **Penalty Calculation:**
   - Most lenders use "greater of" rule (IRD or 3-month interest)
   - IRD calculation method varies by lender (posted rate vs discounted rate)
   - Penalty typically decreases as mortgage term progresses

3. **Payoff Timing:**
   - Payoff can occur at any time (subject to penalty for closed mortgages)
   - Common to pay off at renewal (penalty may be waived or reduced)
   - Early payoff often triggered by refinancing, sale, or large lump sum

4. **Documentation:**
   - Payoff statement required from lender
   - Penalty amount must be documented
   - Total cost should include all fees and penalties

---

## User Personas & Use Cases

### Primary Personas

1. **Homeowner Paying Off Mortgage:**
   - Records mortgage payoff to document financial milestone
   - Tracks total cost including penalties
   - Maintains payoff records for financial planning

2. **Homeowner Refinancing:**
   - Records payoff of old mortgage when refinancing
   - Tracks payoff penalty as part of refinancing costs
   - Documents payoff for refinancing analysis

3. **Homeowner Selling Property:**
   - Records mortgage payoff when property sold
   - Tracks payoff amount and penalty
   - Documents payoff for sale proceeds calculation

### Use Cases

#### UC-1: Record Mortgage Payoff

**Actor:** Homeowner  
**Goal:** Record mortgage payoff completion

**Steps:**
1. User navigates to mortgage details page
2. User clicks "Record Payoff" button
3. User enters payoff date
4. User enters remaining balance (system can calculate if current balance available)
5. System calculates penalty (if applicable, based on mortgage type)
6. User reviews penalty calculation
7. User enters final payment amount (typically = remaining balance + penalty)
8. User adds optional notes
9. System validates payoff data
10. System records payoff
11. System updates mortgage balance to zero
12. System marks mortgage as paid off

**Success Criteria:**
- Payoff recorded with all required fields
- Penalty calculated correctly (if applicable)
- Total cost calculated correctly
- Mortgage balance updated to zero
- Mortgage marked as paid off
- Payoff appears in payoff history

#### UC-2: View Payoff History

**Actor:** Homeowner  
**Goal:** View mortgage payoff history

**Steps:**
1. User navigates to mortgage details page
2. User clicks "Payoff History" section
3. System displays payoff history (if any)
4. User can view payoff details (date, amounts, penalty, notes)

**Success Criteria:**
- Payoff history displayed (if payoffs exist)
- Payoff details visible (date, amounts, penalty, notes)
- Empty state message if no payoffs

#### UC-3: Calculate Payoff Penalty

**Actor:** Homeowner  
**Goal:** Calculate penalty before paying off mortgage

**Steps:**
1. User navigates to mortgage details page
2. User clicks "Calculate Payoff Penalty" button
3. User enters payoff date (default: today)
4. System calculates remaining balance
5. System determines mortgage type (open/closed)
6. System calculates penalty (if closed mortgage)
7. System displays penalty breakdown
8. System displays total cost (balance + penalty)

**Success Criteria:**
- Remaining balance calculated correctly
- Penalty calculated correctly (if applicable)
- Penalty breakdown displayed (IRD vs 3-month interest)
- Total cost displayed clearly
- Calculation uses correct penalty method

#### UC-4: Record Payoff Without Penalty

**Actor:** Homeowner  
**Goal:** Record payoff for open mortgage (no penalty)

**Steps:**
1. User navigates to payoff recording
2. System detects mortgage is open (no penalty)
3. System displays remaining balance only
4. User enters final payment amount (typically = remaining balance)
5. User records payoff
6. System records payoff with penalty = $0

**Success Criteria:**
- Penalty amount = $0 (open mortgage)
- Total cost = remaining balance only
- Payoff recorded correctly
- Mortgage marked as paid off

---

## Feature Requirements

### Data Models

#### mortgage_payoff Table

```typescript
{
  id: string (UUID, primary key)
  mortgageId: string (foreign key → mortgages.id, cascade delete)
  payoffDate: date (not null)
  finalPaymentAmount: decimal (not null, precision 12, scale 2)
  remainingBalance: decimal (not null, precision 12, scale 2)
  penaltyAmount: decimal (default 0.00, precision 12, scale 2)
  totalCost: decimal (not null, precision 12, scale 2) // finalPaymentAmount + penaltyAmount
  notes: string? (optional)
  createdAt: timestamp (default now)
}
```

### Business Logic

#### Payoff Recording

1. **Validation:**
   - Payoff date must be valid date
   - Remaining balance must be > 0
   - Final payment amount must be >= remaining balance
   - Penalty amount must be >= 0
   - Total cost must equal final payment amount + penalty amount

2. **Balance Calculation:**
   - If current balance available, use current balance
   - Otherwise, use provided remaining balance
   - Include accrued interest to payoff date

3. **Penalty Calculation:**
   - Determine mortgage type (open/closed)
   - If open, penalty = $0
   - If closed, calculate penalty using mortgage's penalty calculation method
   - Use IRD or 3-month interest (or greater of, depending on lender)

4. **Total Cost Calculation:**
   - Total Cost = Remaining Balance + Penalty Amount
   - This represents total amount needed to pay off mortgage

5. **Mortgage Update:**
   - Update mortgage balance to zero
   - Mark mortgage as paid off (optional: add status field)
   - Close mortgage term (if applicable)

#### Payoff Penalty Calculation

1. **Mortgage Type Check:**
   - Check mortgage.openClosedMortgageType
   - If "open", return penalty = $0
   - If "closed", proceed with penalty calculation

2. **Penalty Method:**
   - Use mortgage term's penaltyCalculationMethod
   - Calculate IRD penalty if method includes IRD
   - Calculate 3-month interest penalty if method includes 3-month interest
   - Use "greater of" rule if method is "greater_of"

3. **IRD Calculation:**
   - Remaining Balance × (Mortgage Rate - Market Rate) × Remaining Months / 12
   - Use posted rate or discounted rate (depending on lender method)
   - Market rate from current market rates

4. **3-Month Interest Calculation:**
   - Remaining Balance × Mortgage Rate × 3 / 12
   - Use mortgage's effective rate

### Calculations

#### Payoff Penalty Calculation

```typescript
function calculatePayoffPenalty(
  mortgage: Mortgage,
  term: MortgageTerm,
  remainingBalance: number,
  payoffDate: Date,
  marketRate?: number
): number {
  // Open mortgages have no penalty
  if (mortgage.openClosedMortgageType === "open") {
    return 0;
  }
  
  // Closed mortgages: calculate penalty based on method
  const penaltyMethod = term.penaltyCalculationMethod || "greater_of";
  const mortgageRate = getTermEffectiveRate(term);
  const remainingMonths = calculateRemainingMonths(term, payoffDate);
  
  let irdPenalty = 0;
  let threeMonthInterestPenalty = 0;
  
  // Calculate IRD penalty if method includes IRD
  if (penaltyMethod.includes("ird") && marketRate !== undefined) {
    const rateDifference = mortgageRate - marketRate;
    irdPenalty = remainingBalance * (rateDifference / 100) * (remainingMonths / 12);
  }
  
  // Calculate 3-month interest penalty
  if (penaltyMethod.includes("three_month_interest")) {
    threeMonthInterestPenalty = remainingBalance * (mortgageRate / 100) * (3 / 12);
  }
  
  // Return greater of if method is "greater_of", otherwise return specific method
  if (penaltyMethod === "greater_of") {
    return Math.max(irdPenalty, threeMonthInterestPenalty);
  } else if (penaltyMethod === "ird") {
    return irdPenalty;
  } else {
    return threeMonthInterestPenalty;
  }
}
```

#### Total Payoff Cost

```typescript
function calculateTotalPayoffCost(
  remainingBalance: number,
  penaltyAmount: number
): number {
  return remainingBalance + penaltyAmount;
}
```

### Validation

1. **Payoff Date Validation:**
   - Date must be valid date
   - Date should not be in future (warn if future date)

2. **Balance Validation:**
   - Remaining balance must be > 0
   - Remaining balance should match current mortgage balance (within tolerance)

3. **Payment Amount Validation:**
   - Final payment amount must be >= remaining balance
   - Final payment amount should equal total cost (remaining balance + penalty)

4. **Penalty Validation:**
   - Penalty amount must be >= 0
   - Penalty amount should match calculated penalty (within tolerance)

5. **Total Cost Validation:**
   - Total cost must equal final payment amount + penalty amount
   - Total cost must be >= remaining balance

### Integrations

1. **Penalty Calculation Service:**
   - Use existing penalty calculation logic
   - Integrate with penalty calculation methods (IRD, 3-month interest)

2. **Mortgage Service:**
   - Update mortgage balance to zero
   - Mark mortgage as paid off (optional status update)

3. **Mortgage Term Service:**
   - Close mortgage term when paid off
   - Update term status

4. **Refinancing Service:**
   - Payoff data used for refinancing analysis
   - Payoff penalty included in refinancing cost analysis

5. **Scenario Planning:**
   - Payoff scenarios in scenario planning
   - Projected payoff dates and costs

---

## User Stories & Acceptance Criteria

### US-1: Record Mortgage Payoff

**As a** homeowner  
**I want to** record my mortgage payoff  
**So that** I have complete documentation of this financial milestone

**Acceptance Criteria:**
- ✅ Payoff date input (required)
- ✅ Remaining balance input (required, can be auto-filled from current balance)
- ✅ Final payment amount input (required)
- ✅ Penalty amount calculated automatically (if applicable)
- ✅ Total cost calculated automatically (remaining balance + penalty)
- ✅ Notes field (optional)
- ✅ System validates all fields
- ✅ System records payoff
- ✅ System updates mortgage balance to zero
- ✅ System marks mortgage as paid off

### US-2: Calculate Payoff Penalty

**As a** homeowner  
**I want to** calculate payoff penalty before paying off mortgage  
**So that** I know the total cost including penalties

**Acceptance Criteria:**
- ✅ Payoff date input (default: today)
- ✅ System calculates remaining balance
- ✅ System determines mortgage type (open/closed)
- ✅ System calculates penalty (if closed mortgage)
- ✅ Penalty breakdown displayed (IRD vs 3-month interest)
- ✅ Total cost displayed (remaining balance + penalty)
- ✅ Calculation uses correct penalty method from mortgage terms

### US-3: View Payoff History

**As a** homeowner  
**I want to** view my mortgage payoff history  
**So that** I can reference payoff records

**Acceptance Criteria:**
- ✅ Payoff history displayed (if payoffs exist)
- ✅ Payoff details visible (date, amounts, penalty, notes)
- ✅ Empty state message if no payoffs
- ✅ Payoff history sorted by date (most recent first)

### US-4: Record Payoff for Open Mortgage

**As a** homeowner  
**I want to** record payoff for open mortgage (no penalty)  
**So that** I have documentation of payoff

**Acceptance Criteria:**
- ✅ System detects mortgage is open
- ✅ Penalty amount = $0 (displayed but not editable)
- ✅ Total cost = remaining balance only
- ✅ Payoff recorded correctly
- ✅ Mortgage marked as paid off

### US-5: Record Payoff with Penalty

**As a** homeowner  
**I want to** record payoff for closed mortgage (with penalty)  
**So that** I have complete documentation including penalty

**Acceptance Criteria:**
- ✅ System detects mortgage is closed
- ✅ Penalty calculated automatically
- ✅ Penalty breakdown displayed (IRD vs 3-month interest)
- ✅ Total cost = remaining balance + penalty
- ✅ User can review and adjust penalty if needed
- ✅ Payoff recorded with penalty amount
- ✅ Mortgage marked as paid off

---

## Technical Implementation Notes

### API Endpoints

#### POST /api/mortgages/:mortgageId/payoff

**Request Body:**
```typescript
{
  payoffDate: string (ISO date)
  finalPaymentAmount: number
  remainingBalance: number
  penaltyAmount?: number (optional, calculated if not provided)
  notes?: string
}
```

**Response:**
```typescript
{
  id: string
  mortgageId: string
  payoffDate: string
  finalPaymentAmount: number
  remainingBalance: number
  penaltyAmount: number
  totalCost: number
  notes?: string
  createdAt: string
}
```

#### GET /api/mortgages/:mortgageId/payoff/history

**Response:**
```typescript
Array<MortgagePayoff>
```

#### GET /api/mortgages/:mortgageId/payoff/calculate-penalty

**Query Parameters:**
- `payoffDate?: string` (ISO date, default: today)
- `remainingBalance?: number` (optional, uses current balance if not provided)

**Response:**
```typescript
{
  remainingBalance: number
  penaltyAmount: number
  penaltyBreakdown: {
    irdPenalty?: number
    threeMonthInterestPenalty?: number
    method: string
  }
  totalCost: number
  mortgageType: "open" | "closed"
}
```

### Database Schema

See "Data Models" section above for table schema.

### Service Layer

#### MortgagePayoffService

**Methods:**
- `recordPayoff(mortgageId, userId, input): Promise<MortgagePayoff>`
- `getPayoffHistory(mortgageId, userId): Promise<MortgagePayoff[]>`
- `calculatePayoffPenalty(mortgageId, userId, options?): Promise<PayoffPenaltyCalculation>`

### Frontend Components

#### RecordPayoffDialog

**Props:**
```typescript
{
  mortgageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Features:**
- Payoff date picker
- Remaining balance input (auto-filled from current balance)
- Final payment amount input
- Penalty amount display (calculated automatically, editable if needed)
- Total cost display (calculated automatically)
- Notes textarea
- Validation and error display
- Submit button

#### PayoffHistorySection

**Props:**
```typescript
{
  mortgageId: string
  payoffs: MortgagePayoff[]
}
```

**Features:**
- Payoff history table
- Payoff details display (date, amounts, penalty, notes)
- Empty state message if no payoffs

#### CalculatePayoffPenaltyDialog

**Props:**
```typescript
{
  mortgageId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Features:**
- Payoff date picker
- Remaining balance display (calculated)
- Penalty breakdown display (IRD vs 3-month interest)
- Total cost display
- Mortgage type indicator (open/closed)

### Data Flows

#### Payoff Recording Flow

1. User clicks "Record Payoff"
2. Frontend opens RecordPayoffDialog
3. Frontend fetches current mortgage balance (if available)
4. Frontend pre-fills remaining balance
5. User enters payoff date and final payment amount
6. Frontend calls GET /api/mortgages/:mortgageId/payoff/calculate-penalty
7. Backend calculates penalty (if applicable)
8. Backend returns penalty breakdown
9. Frontend displays penalty and total cost
10. User reviews and confirms
11. Frontend calls POST /api/mortgages/:mortgageId/payoff
12. Backend validates payoff data
13. Backend creates payoff record
14. Backend updates mortgage balance to zero
15. Backend marks mortgage as paid off
16. Backend returns payoff record
17. Frontend refreshes mortgage display
18. Frontend shows success message

#### Payoff Penalty Calculation Flow

1. User clicks "Calculate Payoff Penalty"
2. Frontend opens CalculatePayoffPenaltyDialog
3. Frontend calls GET /api/mortgages/:mortgageId/payoff/calculate-penalty
4. Backend fetches mortgage and term
5. Backend calculates remaining balance
6. Backend determines mortgage type (open/closed)
7. Backend calculates penalty (if closed)
8. Backend returns penalty breakdown
9. Frontend displays penalty breakdown and total cost

---

## Edge Cases & Error Handling

### Edge Cases

1. **Open Mortgage Payoff:**
   - Penalty = $0
   - Total cost = remaining balance only
   - No penalty breakdown needed

2. **Closed Mortgage with No Penalty Method:**
   - Use default penalty method (greater_of)
   - Calculate both IRD and 3-month interest
   - Use greater of the two

3. **Payoff Date in Future:**
   - Warn user if payoff date is in future
   - Allow future date (for planning purposes)
   - Use current balance if payoff date is today

4. **Remaining Balance Mismatch:**
   - Warn if provided remaining balance doesn't match current balance
   - Allow user to proceed with provided balance
   - Use provided balance for calculations

5. **No Payoff History:**
   - Display empty state message
   - Show "Record Payoff" button

6. **Multiple Payoffs:**
   - Support multiple payoffs (for refinancing scenarios)
   - Display all payoffs in history
   - Most recent payoff is current status

### Error Handling

1. **Validation Errors:**
   - Display field-level errors
   - Prevent submission until errors resolved

2. **Server Errors:**
   - Display user-friendly error messages
   - Log detailed errors for debugging

3. **Penalty Calculation Errors:**
   - Show error if penalty calculation fails
   - Allow manual penalty entry if calculation unavailable
   - Warn if market rate unavailable for IRD calculation

4. **Balance Update Errors:**
   - Rollback payoff if balance update fails
   - Show error with details
   - Allow user to retry

---

## Testing Considerations

### Unit Tests

1. **Payoff Penalty Calculation:**
   - Open mortgage (penalty = $0)
   - Closed mortgage with IRD method
   - Closed mortgage with 3-month interest method
   - Closed mortgage with greater_of method

2. **Total Cost Calculation:**
   - Total cost = remaining balance + penalty
   - Open mortgage (penalty = $0)
   - Closed mortgage (penalty > 0)

3. **Payoff Validation:**
   - Date validation
   - Balance validation
   - Payment amount validation
   - Total cost validation

### Integration Tests

1. **Payoff Recording:**
   - Full payoff recording flow
   - Balance update after payoff
   - Mortgage status update

2. **Payoff Penalty Calculation:**
   - Penalty calculation for different mortgage types
   - Penalty breakdown calculation

3. **Payoff History:**
   - Payoff history retrieval
   - Multiple payoffs handling

### End-to-End Tests

1. **Record Payoff:**
   - User records mortgage payoff
   - Mortgage balance updated to zero
   - Payoff appears in history

2. **Calculate Payoff Penalty:**
   - User calculates payoff penalty
   - Penalty breakdown displayed correctly

3. **View Payoff History:**
   - User views payoff history
   - Payoff details displayed correctly

---

## Future Enhancements

### Phase 1: Payoff Planning

- **Payoff Projections:** Project payoff date based on current payment schedule
- **Payoff Scenarios:** Compare different payoff strategies (prepayments, payment increases)
- **Payoff Goal Setting:** Set target payoff date and track progress

### Phase 2: Payoff Analysis

- **Payoff vs Refinancing:** Compare payoff cost vs refinancing cost
- **Payoff Impact Analysis:** Analyze financial impact of early payoff
- **Payoff Timeline:** Visualize payoff timeline with different strategies

### Phase 3: Payoff Automation

- **Automatic Payoff Detection:** Detect when mortgage balance reaches zero
- **Payoff Reminders:** Remind user when payoff date approaching
- **Payoff Celebration:** Celebrate mortgage payoff milestone with user

### Phase 4: Integration Enhancements

- **Lender Integration:** Sync payoff data with lender systems
- **Tax Integration:** Export payoff data for tax purposes
- **Financial Planning Integration:** Integrate payoff data with financial planning tools

---

**End of Mortgage Payoff Tracking Feature Specification**

