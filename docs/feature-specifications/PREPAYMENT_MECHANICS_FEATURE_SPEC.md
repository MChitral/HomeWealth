# Prepayment Mechanics Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Prepayments are one of the most powerful tools homeowners have to save money on mortgages. Making prepayments can save tens of thousands of dollars in interest and reduce mortgage payoff time by years. The Prepayment Mechanics feature provides:

- **Annual Prepayment Limit Tracking:** Accurate tracking of prepayment limits based on original mortgage amount
- **Limit Enforcement:** Prevents over-limit prepayments with penalty calculations
- **Carry-Forward Support:** Tracks unused prepayment room from previous year
- **Anniversary vs Calendar Year:** Support for both reset date methods used by Canadian lenders
- **Prepayment Opportunity Analysis:** Recommendations based on cash flow surplus and available room
- **Prepayment Strategy Recommendations:** Scenario-based analysis for optimal prepayment strategies

### Market Context

**Canadian Mortgage Prepayment Market:**

- **Annual Limits:** Most Canadian lenders allow 10-20% of original mortgage amount in prepayments per year
- **Common Limit:** 20% is the industry standard (RBC, TD, BMO, Scotiabank, CIBC all use 20%)
- **Reset Dates:** Some lenders reset on anniversary date, others on calendar year (January 1st)
- **Carry-Forward:** Many lenders allow unused prepayment room to carry forward to next year
- **Over-Limit Penalties:** Typically 1-3% of over-limit amount (most common: 1.5%)

**Industry Statistics:**

- Average prepayment limit: 20% of original mortgage amount
- Typical prepayment room: $20,000-$100,000 per year (for $100,000-$500,000 mortgages)
- Only 15-20% of homeowners maximize their prepayment privileges
- Prepayments can save $10,000-$50,000+ in interest over mortgage lifetime
- Accelerating payoff by 5-10 years is common with regular prepayments

**Strategic Importance:**

- Prepayments are key differentiator for mortgage optimization tools
- Critical for Smith Maneuver strategies (borrow to invest)
- Essential for scenario planning and financial projections
- High user engagement feature (savings are tangible and measurable)

### Strategic Positioning

- **Core Feature:** Prepayment mechanics are fundamental to mortgage optimization
- **Competitive Differentiation:** Comprehensive limit tracking with carry-forward and anniversary date support exceeds basic tools
- **User Value:** Direct savings calculations and recommendations drive user engagement
- **Integration Value:** Prepayments integrate with recast, refinancing, renewal workflows, and scenario planning

---

## Domain Overview

### Prepayment Fundamentals

**Mortgage Prepayment** is any payment made toward the mortgage principal in excess of the required regular payment. Key characteristics:

1. **Prepayment Types:**
   - **Lump Sum:** One-time prepayment (bonus, tax refund, inheritance)
   - **Payment Increase:** Increasing regular payment amount (e.g., $200 extra per month)
   - **Annual Prepayment:** Regular annual prepayment (e.g., tax refund every March)
   - **Double-Up Payments:** Paying two regular payments in one period

2. **Prepayment Benefits:**
   - **Interest Savings:** Reduces total interest paid over mortgage lifetime
   - **Faster Payoff:** Reduces amortization period (pay off mortgage sooner)
   - **Principal Reduction:** Directly reduces principal balance
   - **Guaranteed Return:** Risk-free return equal to mortgage interest rate

3. **Prepayment Limits:**
   - **Annual Limit:** Maximum prepayment allowed per year (typically 10-20% of original amount)
   - **Based on Original Amount:** Limit calculated from original mortgage amount (not current balance)
   - **Year-to-Date Tracking:** All prepayments count toward annual limit
   - **Reset Period:** Limit resets annually (calendar year or anniversary date)

### Annual Prepayment Limit

**What Is Annual Prepayment Limit?**

The **annual prepayment limit** is the maximum amount a borrower can prepay on their mortgage each year without penalty. This limit is set by the lender and typically ranges from 10-20% of the original mortgage amount.

**Calculation:**

```
Annual Limit = Original Mortgage Amount × Annual Limit Percentage

Example:
  Original Amount: $500,000
  Annual Limit Percent: 20%
  Annual Limit: $500,000 × 0.20 = $100,000
```

**Key Points:**

- **Based on Original Amount:** Limit calculated from original mortgage amount, not current balance
- **Industry Standard:** 20% is most common (used by major Canadian lenders)
- **Fixed Limit:** Limit remains constant each year (doesn't decrease with balance)
- **All Prepayments Count:** Lump sums, payment increases, and annual prepayments all count toward limit

**Example Scenarios:**

1. **Year 1:** Original amount $500,000, limit $100,000, prepaid $50,000, remaining $50,000
2. **Year 2:** Original amount still $500,000, limit still $100,000, prepaid $30,000, remaining $70,000
3. **Year 3:** Original amount still $500,000, limit still $100,000, prepaid $120,000 → **$20,000 over limit** (penalty applies)

### Prepayment Limit Reset Dates

**Two Methods:**

1. **Calendar Year (Default):**
   - Limit resets on January 1st each year
   - All prepayments from Jan 1 - Dec 31 count toward that year's limit
   - Used by some lenders (less common)

2. **Anniversary Date:**
   - Limit resets on mortgage anniversary date (same month/day as mortgage start)
   - All prepayments from anniversary to anniversary count toward that year's limit
   - Used by many lenders (more common)

**Example (Anniversary Date):**
- Mortgage start: March 15, 2024
- Anniversary date: March 15 (each year)
- Year 1: March 15, 2024 - March 14, 2025
- Year 2: March 15, 2025 - March 14, 2026

**Implementation:**
- `prepaymentLimitResetDate` field stores anniversary date (null = calendar year)
- `getPrepaymentYear()` function determines which prepayment year a payment belongs to
- Prepayment year identifier: `"calendar-2024"` or `"anniversary-2024"`

### Prepayment Carry-Forward

**What Is Carry-Forward?**

**Prepayment carry-forward** allows unused prepayment room from one year to be used in the following year. This feature is offered by many Canadian lenders to give borrowers flexibility.

**Example:**

```
Year 1:
  Annual Limit: $100,000
  Used: $60,000
  Remaining: $40,000
  
  If lender allows carry-forward:
    Year 2 Limit: $100,000 (new) + $40,000 (carry-forward) = $140,000
```

**Key Points:**

- **Not All Lenders Offer:** Some lenders allow carry-forward, others don't
- **Limited Time:** Typically must be used in next year (can't accumulate indefinitely)
- **Capped:** Some lenders cap carry-forward amount (e.g., max 50% of annual limit)
- **Expires:** Unused carry-forward may expire if not used

**Implementation:**
- `prepaymentCarryForward` field stores unused room from previous year
- Added to annual limit: `Total Limit = Annual Limit + Carry-Forward`
- Updated at reset date (unused room from previous year)

### Over-Limit Prepayment Penalties

**What Happens If Prepayment Exceeds Limit?**

When prepayments exceed the annual limit, lenders typically charge a penalty. This penalty is usually 1-3% of the over-limit amount (most common: 1.5%).

**Penalty Calculation:**

```
Over-Limit Amount = Total Prepayment - Available Limit

Penalty = Over-Limit Amount × Penalty Percentage

Example:
  Available Limit: $100,000
  Prepayment Amount: $120,000
  Over-Limit: $120,000 - $100,000 = $20,000
  Penalty: $20,000 × 1.5% = $300
  Total Cost: $120,000 + $300 = $120,300
```

**Key Points:**

- **Penalty Range:** Typically 1-3% (1.5% is industry standard)
- **Only on Over-Limit:** Penalty only applies to amount exceeding limit
- **Can Be Worthwhile:** If prepayment benefits exceed penalty cost, may still be beneficial
- **Lender-Dependent:** Some lenders may decline over-limit prepayments entirely

**Example Scenario:**

- Available limit: $50,000 remaining
- Requested prepayment: $60,000
- Over-limit: $10,000
- Penalty (1.5%): $150
- Total cost: $60,150
- Decision: If interest savings > $150, still beneficial

### Year-to-Date Prepayment Tracking

**How Are Prepayments Tracked?**

All prepayments made within a prepayment year are tracked and counted toward the annual limit.

**Tracking Components:**

1. **Prepayment Year Determination:**
   - Based on payment date and reset date method
   - Calendar year: Jan 1 - Dec 31
   - Anniversary year: Anniversary date to anniversary date

2. **Year-to-Date Calculation:**
   - Sum all `prepaymentAmount` from payments in current prepayment year
   - Includes: lump sums, payment increases, annual prepayments

3. **Remaining Room:**
   ```
   Remaining Room = (Annual Limit + Carry-Forward) - Year-to-Date Used
   ```

**Implementation:**
- `getPrepaymentYear()` determines prepayment year for each payment
- Payments filtered by prepayment year for YTD calculations
- `prepaymentAmount` field in `mortgagePayments` table tracks prepayment amount

### Prepayment Opportunity Analysis

**What Is Prepayment Opportunity?**

Prepayment opportunity analysis evaluates whether a homeowner should make prepayments based on:
- Available prepayment room (annual limit - YTD used)
- Cash flow surplus (monthly income - expenses - debt)
- Financial recommendations

**Analysis Components:**

1. **Available Room:**
   - Annual limit + carry-forward - YTD used
   - Remaining prepayment room for current year

2. **Cash Flow Surplus:**
   - Monthly income - monthly expenses - monthly debt payments
   - Available funds for prepayments

3. **Recommendations:**
   - If surplus > 0 and room > 0: "Consider making prepayments"
   - If surplus = 0: "Focus on improving cash flow first"
   - If room = 0: "Maximized prepayment limit, consider investing surplus"

**Example Recommendations:**

- **High Surplus, High Room:** "You have $2,000/mo surplus. Maximize your prepayment limit in 25 months."
- **Low Surplus:** "Focus on improving cash flow before making prepayments."
- **No Room:** "You have maximized your prepayment privileges. Consider investing surplus."

### Prepayment Strategy Recommendations

**What Are Strategy Recommendations?**

Prepayment strategy recommendations provide scenario-based analysis for optimal prepayment strategies, comparing different prepayment amounts and methods.

**Scenarios Analyzed:**

1. **Small Lump Sum:** $5,000 or 5% of balance (whichever is smaller)
2. **Medium Lump Sum:** $10,000 or 10% of balance (whichever is smaller)
3. **Payment Increase:** $200/month or 10% of payment (whichever is smaller)
4. **Custom Amount:** User-specified amount

**Analysis Metrics:**

For each scenario:
- **Interest Savings:** Total interest saved over remaining amortization
- **Time Saved:** Months/years saved on mortgage payoff
- **ROI:** Return on investment (equal to mortgage interest rate)
- **New Payoff Date:** Projected mortgage payoff date with prepayment

**Investment Comparison:**

- Compares prepayment strategy vs investing surplus
- Considers: prepayment interest savings vs investment returns (after tax)
- Provides recommendation: prepayment, investment, or balanced approach

### Canadian Lender Conventions

**Common Prepayment Privileges:**

1. **Major Lenders (RBC, TD, BMO, Scotiabank, CIBC):**
   - Annual limit: 20% of original amount
   - Reset: Anniversary date
   - Carry-forward: Varies by lender
   - Over-limit penalty: 1.5% of over-limit amount

2. **Alternative Lenders:**
   - Annual limit: 10-15% of original amount (more restrictive)
   - Reset: Calendar year or anniversary
   - Carry-forward: Less common
   - Over-limit penalty: 1-3% (varies)

3. **Credit Unions:**
   - Annual limit: 10-20% (varies)
   - Reset: Anniversary date (common)
   - Carry-forward: Often allowed
   - Over-limit penalty: Similar to banks

**Best Practices:**

- Always check lender's prepayment privileges before making large prepayments
- Track year-to-date prepayments to avoid over-limit penalties
- Maximize annual limit if cash flow allows
- Consider carry-forward if available
- Compare prepayment vs investment returns for optimal strategy

---

## User Personas & Use Cases

### Persona 1: Maximizer (Wants to Save Interest)

**Profile:**
- Focused on paying off mortgage as fast as possible
- Has surplus cash flow
- Wants to maximize prepayment privileges
- Values interest savings over investment returns

**Use Cases:**
- View annual prepayment limit and remaining room
- Track year-to-date prepayments
- Make prepayments up to annual limit
- See interest savings from prepayments
- Plan prepayment strategy to maximize savings

**Pain Points Addressed:**
- Uncertainty about available prepayment room
- Fear of over-limit penalties
- Need for prepayment impact calculations
- Wanting to maximize annual privileges

### Persona 2: Strategic Planner (Prepayment vs Investment)

**Profile:**
- Considers multiple financial strategies
- Compares prepayment returns vs investment returns
- Wants optimal financial strategy
- Has surplus cash flow but wants best ROI

**Use Cases:**
- Compare prepayment strategy vs investment strategy
- Analyze different prepayment scenarios
- Evaluate ROI of prepayments vs investments
- See break-even analysis (prepayment vs investment)
- Get recommendations based on mortgage rate vs investment returns

**Pain Points Addressed:**
- Uncertainty about prepayment vs investment decision
- Need for ROI comparison
- Wanting data-driven recommendations
- Complexity of financial trade-offs

### Persona 3: Bonus Earner (Lump Sum Prepayments)

**Profile:**
- Receives irregular income (bonuses, tax refunds, inheritances)
- Wants to use windfalls effectively
- Needs to know if prepayment room is available
- Values simplicity and quick decisions

**Use Cases:**
- Check available prepayment room before receiving bonus
- Make lump sum prepayment when bonus received
- See impact of lump sum prepayment (savings, payoff time)
- Ensure prepayment is within limit
- Track prepayment history

**Pain Points Addressed:**
- Uncertainty about available prepayment room
- Wanting to make quick prepayment decisions
- Need for impact calculations
- Fear of over-limit penalties

### Persona 4: Monthly Prepayer (Regular Payment Increases)

**Profile:**
- Wants to increase regular payment amount
- Has consistent surplus cash flow
- Prefers automatic prepayments (payment increase)
- Values simplicity and consistency

**Use Cases:**
- Increase regular payment by fixed amount (e.g., $200/month)
- See impact of payment increase (monthly savings, payoff time)
- Track payment increase over time
- Ensure payment increase doesn't exceed annual limit
- Adjust payment increase as needed

**Pain Points Addressed:**
- Uncertainty about payment increase impact
- Tracking cumulative prepayments from payment increases
- Ensuring payment increases don't exceed limit
- Need for impact calculations

---

## Feature Requirements

### Data Model Requirements

**Mortgage Table Fields:**

- `annualPrepaymentLimitPercent` (integer, default: 20) - Annual prepayment limit percentage (10-20 typical)
- `prepaymentLimitResetDate` (date, nullable) - Anniversary date for reset (null = calendar year)
- `prepaymentCarryForward` (decimal, default: 0.00) - Unused prepayment room from previous year

**Mortgage Payments Table Fields:**

- `prepaymentAmount` (decimal) - Prepayment amount for this payment
- `paymentDate` (date) - Payment date (used for prepayment year determination)

**Prepayment Events Table (for Scenario Planning):**

- `id` (UUID, primary key)
- `scenarioId` (foreign key to scenarios)
- `eventType` (text) - "annual", "one-time", "payment-increase"
- `amount` (decimal) - Prepayment amount
- `startPaymentNumber` (integer) - Which payment to start prepayments
- `recurrenceMonth` (integer, optional) - For annual events (1-12)
- `oneTimeYear` (integer, optional) - For one-time events (year offset)
- `description` (text, optional)
- `createdAt` (timestamp)

### Business Logic Requirements

**Prepayment Year Determination:**

1. **Calendar Year (prepaymentLimitResetDate = null):**
   - Prepayment year = calendar year (e.g., "calendar-2024")
   - Resets January 1st each year

2. **Anniversary Date (prepaymentLimitResetDate set):**
   - Prepayment year = anniversary year (e.g., "anniversary-2024")
   - Resets on anniversary date each year
   - Payment before anniversary date belongs to previous year
   - Payment on/after anniversary date belongs to current year

**Prepayment Limit Calculation:**

```
Annual Limit = Original Mortgage Amount × (Annual Limit Percent / 100)

Total Available Limit = Annual Limit + Carry-Forward

Remaining Room = Total Available Limit - Year-to-Date Used

Year-to-Date Used = Sum of prepaymentAmount for all payments in current prepayment year
```

**Over-Limit Penalty Calculation:**

```
Available Limit = (Annual Limit + Carry-Forward) - Year-to-Date Used

Over-Limit Amount = Requested Prepayment - Available Limit (if > 0)

Penalty Amount = Over-Limit Amount × Penalty Percentage (default: 1.5%)

Total Cost = Requested Prepayment + Penalty Amount
```

**Prepayment Opportunity Analysis:**

1. **Calculate Available Room:**
   - Get current prepayment year
   - Filter payments by prepayment year
   - Calculate YTD used
   - Calculate remaining room

2. **Calculate Cash Flow Surplus:**
   - Monthly income - expenses - debt payments
   - Surplus = max(0, income - expenses - debt)

3. **Generate Recommendation:**
   - If surplus <= 0: "Focus on improving cash flow"
   - If room <= 0: "Maximized prepayment limit, consider investing"
   - If surplus > 0 and room > 0: Provide prepayment recommendation

**Carry-Forward Management:**

1. **At Reset Date:**
   - Calculate unused room from previous year
   - Set `prepaymentCarryForward` = unused room
   - Reset year-to-date tracking

2. **In Limit Calculation:**
   - Include carry-forward in total available limit
   - Use carry-forward room first (optional: some lenders may require using new limit first)

### Calculation Requirements

**Prepayment Year Function:**

```typescript
function getPrepaymentYear(
  paymentDate: Date,
  prepaymentLimitResetDate: Date | null,
  mortgageStartDate: Date
): string {
  if (!prepaymentLimitResetDate) {
    // Calendar year
    return `calendar-${paymentDate.getFullYear()}`;
  }
  
  // Anniversary year
  const resetMonth = prepaymentLimitResetDate.getMonth();
  const resetDay = prepaymentLimitResetDate.getDate();
  const paymentMonth = paymentDate.getMonth();
  const paymentDay = paymentDate.getDate();
  const paymentYear = paymentDate.getFullYear();
  
  // If payment is before reset date in current year, belongs to previous year
  if (paymentMonth < resetMonth || 
      (paymentMonth === resetMonth && paymentDay < resetDay)) {
    return `anniversary-${paymentYear - 1}`;
  }
  
  return `anniversary-${paymentYear}`;
}
```

**Prepayment Room Calculation:**

```typescript
function calculatePrepaymentRoom(
  mortgage: Mortgage,
  currentYearPayments: MortgagePayment[]
): {
  limit: number;
  used: number;
  remaining: number;
  carryForward: number;
} {
  const percent = mortgage.annualPrepaymentLimitPercent || 20;
  const annualLimit = Number(mortgage.originalAmount) * (percent / 100);
  const carryForward = Number(mortgage.prepaymentCarryForward || 0);
  const totalLimit = annualLimit + carryForward;
  
  const used = currentYearPayments.reduce(
    (sum, p) => sum + Number(p.prepaymentAmount || 0),
    0
  );
  
  const remaining = Math.max(0, totalLimit - used);
  
  return {
    limit: totalLimit,
    used,
    remaining,
    carryForward
  };
}
```

**Over-Limit Penalty Calculation:**

```typescript
function calculateOverLimitPenalty(
  overLimitAmount: number,
  penaltyPercent: number = 1.5
): number {
  if (overLimitAmount <= 0) return 0;
  return (overLimitAmount * penaltyPercent) / 100;
}

function calculatePrepaymentWithPenalty(
  requestedAmount: number,
  availableLimit: number,
  penaltyPercent: number = 1.5
): {
  prepaymentAmount: number;
  overLimitAmount: number;
  penaltyAmount: number;
  totalCost: number;
} {
  const overLimitAmount = Math.max(0, requestedAmount - availableLimit);
  const penaltyAmount = calculateOverLimitPenalty(overLimitAmount, penaltyPercent);
  const totalCost = requestedAmount + penaltyAmount;
  
  return {
    prepaymentAmount: requestedAmount,
    overLimitAmount,
    penaltyAmount,
    totalCost
  };
}
```

**Prepayment Impact Calculation:**

```typescript
function calculatePrepaymentImpact(
  currentBalance: number,
  prepaymentAmount: number,
  monthlyRate: number,
  regularPayment: number,
  remainingMonths: number
): {
  interestSavings: number;
  timeSavedMonths: number;
  newPayoffDate: Date;
  roi: number;
} {
  // Calculate amortization with prepayment
  // Compare total interest with vs without prepayment
  // Calculate months saved
  // Return impact metrics
}
```

### Validation Requirements

**Prepayment Amount Validation:**

- Prepayment amount must be positive (> 0)
- Prepayment amount should not exceed current balance (optional validation)
- If over limit, penalty should be calculated and displayed

**Prepayment Limit Validation:**

- Annual limit percent should be between 0-100 (typically 10-20)
- Carry-forward should be non-negative
- Year-to-date used should not exceed total limit (unless penalty accepted)

**Reset Date Validation:**

- If set, must be valid date
- Should be within reasonable range (not too far in future/past)
- Month/day should match mortgage start date (for anniversary dates)

### Integration Requirements

**Mortgage Payment Integration:**

- Prepayments recorded in `mortgagePayments.prepaymentAmount` field
- Prepayment amount included in total payment amount
- Principal reduction includes prepayment amount

**Recast Integration:**

- Large prepayments may trigger recast opportunity
- Recast can reduce payment amount (using prepayment + recast)
- Prepayment and recast work together

**Scenario Planning Integration:**

- Prepayment events can be scheduled in scenarios
- Annual, one-time, and payment-increase events supported
- Prepayment events affect projection calculations

**Smith Maneuver Integration:**

- Prepayments trigger HELOC borrowing (if Smith Maneuver active)
- Prepayment amount determines borrowing amount
- Investment allocation based on borrowed amount

**Notification Integration:**

- Prepayment limit alerts at 80%, 90%, 100% thresholds
- Alerts when approaching limit
- Alerts when limit exceeded (if penalty applies)

---

## User Stories & Acceptance Criteria

### Epic: Prepayment Limit Tracking

**Story 1: View Annual Prepayment Limit**
- **As a** homeowner
- **I want to** see my annual prepayment limit and remaining room
- **So that** I know how much I can prepay this year

**Acceptance Criteria:**
- ✅ Annual prepayment limit displayed (based on original amount × percentage)
- ✅ Year-to-date prepayments displayed
- ✅ Remaining prepayment room displayed
- ✅ Carry-forward amount shown (if applicable)
- ✅ Visual progress indicator (bar chart or percentage)
- ✅ Prepayment year clearly indicated (calendar or anniversary)

**Story 2: Track Prepayment Year (Calendar vs Anniversary)**
- **As a** system
- **I want to** correctly determine prepayment year for each payment
- **So that** prepayments are tracked accurately

**Acceptance Criteria:**
- ✅ Calendar year method: Payments Jan 1 - Dec 31 count toward same year
- ✅ Anniversary method: Payments from anniversary to anniversary count toward same year
- ✅ Payment before anniversary date belongs to previous year
- ✅ Payment on/after anniversary date belongs to current year
- ✅ Prepayment year identifier: "calendar-2024" or "anniversary-2024"

**Story 3: Calculate Year-to-Date Prepayments**
- **As a** system
- **I want to** calculate total prepayments for current prepayment year
- **So that** remaining room can be calculated accurately

**Acceptance Criteria:**
- ✅ All payments in current prepayment year included
- ✅ Prepayment amounts summed correctly
- ✅ Only payments within current prepayment year counted
- ✅ Excludes payments from previous years
- ✅ Handles edge cases (year boundaries, no payments yet)

### Epic: Prepayment Carry-Forward

**Story 4: Track Carry-Forward Amount**
- **As a** homeowner
- **I want to** see unused prepayment room from previous year
- **So that** I can use it in current year

**Acceptance Criteria:**
- ✅ Carry-forward amount displayed
- ✅ Carry-forward included in total available limit
- ✅ Carry-forward calculated at reset date (unused room from previous year)
- ✅ Carry-forward can be zero (if previous year limit was fully used)

**Story 5: Include Carry-Forward in Limit Calculation**
- **As a** system
- **I want to** include carry-forward in total available limit
- **So that** homeowners can use unused room from previous year

**Acceptance Criteria:**
- ✅ Total limit = Annual limit + Carry-forward
- ✅ Carry-forward used first (optional: may vary by lender)
- ✅ Remaining room calculation includes carry-forward
- ✅ Over-limit penalty only applies after total limit exceeded

### Epic: Over-Limit Penalties

**Story 6: Calculate Over-Limit Penalty**
- **As a** system
- **I want to** calculate penalty for prepayments exceeding limit
- **So that** homeowners understand total cost of over-limit prepayment

**Acceptance Criteria:**
- ✅ Over-limit amount calculated: `Requested Amount - Available Limit`
- ✅ Penalty calculated: `Over-Limit Amount × Penalty Percentage` (default 1.5%)
- ✅ Total cost calculated: `Prepayment Amount + Penalty`
- ✅ Penalty only applies to over-limit portion (not entire prepayment)
- ✅ Penalty displayed clearly before prepayment is made

**Story 7: Warn About Over-Limit Prepayments**
- **As a** homeowner
- **I want to** be warned if prepayment exceeds limit
- **So that** I can make informed decision about penalty cost

**Acceptance Criteria:**
- ✅ Warning displayed if requested prepayment exceeds available limit
- ✅ Over-limit amount shown
- ✅ Penalty amount shown
- ✅ Total cost shown (prepayment + penalty)
- ✅ User must acknowledge penalty before proceeding (optional)
- ✅ Comparison: Prepayment benefit vs penalty cost

### Epic: Prepayment Opportunity Analysis

**Story 8: View Prepayment Opportunity**
- **As a** homeowner
- **I want to** see prepayment opportunity analysis
- **So that** I can decide if prepayments make sense

**Acceptance Criteria:**
- ✅ Available prepayment room displayed
- ✅ Cash flow surplus calculated and displayed
- ✅ Recommendation provided based on room and surplus
- ✅ Monthly surplus amount shown (if positive)
- ✅ Opportunity card displayed on dashboard (if relevant)

**Story 9: Get Prepayment Recommendations**
- **As a** homeowner
- **I want to** get recommendations about prepayment strategy
- **So that** I can optimize my prepayment decisions

**Acceptance Criteria:**
- ✅ If surplus <= 0: Recommend improving cash flow first
- ✅ If room <= 0: Recommend investing surplus instead
- ✅ If surplus > 0 and room > 0: Recommend prepayment strategy
- ✅ Recommendation includes timing (months to maximize limit)
- ✅ Recommendation considers available room and surplus

### Epic: Prepayment Strategy Recommendations

**Story 10: View Prepayment Scenarios**
- **As a** homeowner
- **I want to** see different prepayment scenarios
- **So that** I can compare options and choose best strategy

**Acceptance Criteria:**
- ✅ Small lump sum scenario ($5,000 or 5% of balance)
- ✅ Medium lump sum scenario ($10,000 or 10% of balance)
- ✅ Payment increase scenario ($200/month or 10% of payment)
- ✅ Each scenario shows: interest savings, time saved, new payoff date, ROI
- ✅ Scenarios are actionable (can use suggested amount)

**Story 11: Compare Prepayment vs Investment**
- **As a** homeowner
- **I want to** compare prepayment strategy vs investment strategy
- **So that** I can choose optimal financial strategy

**Acceptance Criteria:**
- ✅ Prepayment interest savings calculated
- ✅ Investment returns calculated (with tax considerations)
- ✅ Net difference shown (prepayment savings vs investment returns)
- ✅ Recommendation provided: prepayment, investment, or balanced
- ✅ Reasoning provided for recommendation

**Story 12: Calculate Prepayment Impact**
- **As a** homeowner
- **I want to** see impact of prepayment (savings, payoff time)
- **So that** I can understand benefits before making prepayment

**Acceptance Criteria:**
- ✅ Total interest savings calculated
- ✅ Months/years saved on payoff displayed
- ✅ New projected payoff date shown
- ✅ ROI calculated (equal to mortgage interest rate)
- ✅ Comparison with current payoff timeline

### Epic: Prepayment Notifications

**Story 13: Receive Prepayment Limit Alerts**
- **As a** homeowner
- **I want to** receive alerts when approaching prepayment limit
- **So that** I can plan prepayments before limit is reached

**Acceptance Criteria:**
- ✅ Alert at 80% of limit (configurable threshold)
- ✅ Alert at 90% of limit
- ✅ Alert at 100% of limit
- ✅ Alert shows: usage percentage, used amount, remaining room
- ✅ Alerts can be enabled/disabled in preferences
- ✅ Thresholds configurable in preferences

---

## Technical Implementation Notes

### API Endpoints

**Prepayment Opportunity:**
- `GET /api/prepayment/:mortgageId/opportunity` - Get prepayment opportunity analysis
  - Returns: `PrepaymentOpportunity` (yearlyLimit, usedAmount, remainingRoom, monthlySurplus, recommendation)

**Prepayment Limit Calculation:**
- Calculated in service layer (not separate endpoint)
- Used by prepayment opportunity endpoint
- Used by payment validation logic

**Prepayment Events (Scenario Planning):**
- `GET /api/scenarios/:scenarioId/prepayment-events` - List prepayment events
- `POST /api/scenarios/:scenarioId/prepayment-events` - Create prepayment event
- `PATCH /api/scenarios/:scenarioId/prepayment-events/:id` - Update prepayment event
- `DELETE /api/scenarios/:scenarioId/prepayment-events/:id` - Delete prepayment event

### Database Schema

**Mortgage Table:**
```sql
annual_prepayment_limit_percent INTEGER NOT NULL DEFAULT 20,
prepayment_limit_reset_date DATE, -- null = calendar year, date = anniversary date
prepayment_carry_forward DECIMAL(12,2) DEFAULT 0.00
```

**Mortgage Payments Table:**
```sql
prepayment_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00
```

**Prepayment Events Table (Scenario Planning):**
```sql
CREATE TABLE prepayment_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id VARCHAR NOT NULL REFERENCES scenarios(id),
  event_type TEXT NOT NULL, -- 'annual', 'one-time', 'payment-increase'
  amount DECIMAL(10,2) NOT NULL,
  start_payment_number INTEGER NOT NULL DEFAULT 1,
  recurrence_month INTEGER, -- 1-12, for annual events
  one_time_year INTEGER, -- year offset, for one-time events
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Service Layer

**PrepaymentService:**
- `getPrepaymentOpportunity(userId, mortgageId): Promise<PrepaymentOpportunity>`
  - Calculates available prepayment room
  - Calculates cash flow surplus
  - Generates recommendation
  - Returns opportunity analysis

- `calculatePrepaymentRoom(mortgage, currentYearPayments): { limit, used, remaining, carryForward }`
  - Calculates annual limit (original amount × percentage)
  - Adds carry-forward to limit
  - Calculates YTD used from payments
  - Returns room calculation

**Prepayment Calculation Functions:**
- `getPrepaymentYear(paymentDate, prepaymentLimitResetDate, mortgageStartDate): string`
  - Determines prepayment year for payment date
  - Returns "calendar-YYYY" or "anniversary-YYYY"

- `calculateOverLimitPenalty(overLimitAmount, penaltyPercent): number`
  - Calculates penalty for over-limit prepayment
  - Default penalty: 1.5%

- `calculatePrepaymentWithPenalty(requestedAmount, availableLimit, penaltyPercent): { prepaymentAmount, overLimitAmount, penaltyAmount, totalCost }`
  - Calculates total cost including penalty

**Prepayment Year Functions:**
- `getPrepaymentYearDates(prepaymentYear, prepaymentLimitResetDate, mortgageStartDate): { startDate, endDate }`
  - Returns start and end dates for prepayment year

### Scheduled Jobs

**Prepayment Limit Check Job:**
- Runs daily
- Checks all mortgages for prepayment limit thresholds
- Creates notifications at 80%, 90%, 100% thresholds
- Respects user notification preferences

**Carry-Forward Update Job:**
- Runs at prepayment year reset (calendar year: Jan 1, anniversary: on anniversary date)
- Calculates unused room from previous year
- Updates `prepaymentCarryForward` field
- Resets year-to-date tracking (new prepayment year starts)

### Frontend Components

**PrepaymentCard (Dashboard):**
- Displays prepayment opportunity summary
- Shows annual limit, used amount, remaining room
- Progress bar for limit usage
- Monthly surplus display
- Recommendation text

**PrepaymentStrategyRecommendations:**
- Displays multiple prepayment scenarios
- Shows impact for each scenario (savings, time saved, ROI)
- Investment comparison (prepayment vs investment)
- Actionable buttons to use suggested amounts

**Prepayment Opportunity Display:**
- Integrated into mortgage details page
- Shows current prepayment status
- Links to detailed prepayment analysis
- Quick access to make prepayment

### Data Flow

**Prepayment Opportunity Flow:**
1. User views dashboard or mortgage details
2. Frontend calls `GET /api/prepayment/:mortgageId/opportunity`
3. Backend: `PrepaymentService.getPrepaymentOpportunity()`
   - Fetches mortgage and payments
   - Determines current prepayment year
   - Filters payments by prepayment year
   - Calculates prepayment room
   - Calculates cash flow surplus
   - Generates recommendation
4. Returns `PrepaymentOpportunity`
5. Frontend displays opportunity card

**Prepayment Year Determination Flow:**
1. Payment is recorded with `prepaymentAmount`
2. When calculating prepayment room:
   - `getPrepaymentYear()` determines prepayment year for payment
   - Payments filtered by prepayment year
   - YTD used calculated from filtered payments

**Over-Limit Penalty Calculation Flow:**
1. User requests prepayment amount
2. System calculates available limit
3. If requested amount > available limit:
   - Calculate over-limit amount
   - Calculate penalty (over-limit × 1.5%)
   - Display warning with penalty and total cost
4. User can proceed (pay penalty) or adjust amount

**Carry-Forward Update Flow:**
1. Scheduled job runs at reset date
2. For each mortgage:
   - Determine previous prepayment year
   - Calculate unused room (limit - used)
   - Update `prepaymentCarryForward` field
   - Reset YTD tracking (new year starts)

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Prepayment Year Edge Cases:**

1. **Payment on Anniversary Date:**
   - Payment on exact anniversary date belongs to new year
   - Payment day before anniversary belongs to previous year

2. **Leap Year (February 29):**
   - If anniversary is Feb 29 and year is not leap year, use Feb 28 or March 1
   - Handle gracefully in date calculations

3. **Mortgage Start vs Reset Date:**
   - Reset date should match mortgage start date (month/day) for anniversary method
   - Validation ensures reset date is reasonable

**Prepayment Limit Edge Cases:**

1. **Zero Original Amount:**
   - Should not occur (mortgage must have original amount)
   - Handle gracefully: return 0 limit

2. **Very High Limit Percentage:**
   - Limit percentage > 100% is unusual but valid
   - No upper bound validation (lender-specific)

3. **Carry-Forward Exceeds Annual Limit:**
   - Possible if previous year had very high limit
   - Total limit = Annual limit + Carry-forward (no cap)

4. **Negative Carry-Forward:**
   - Should not occur (carry-forward is unused room, can't be negative)
   - Validation prevents negative values

**Over-Limit Penalty Edge Cases:**

1. **Zero Penalty Percentage:**
   - Some lenders may not charge penalty
   - Handle gracefully: penalty = 0

2. **Very High Penalty Percentage:**
   - Penalty > 10% is unusual but possible
   - No upper bound validation (lender-specific)

3. **Exact Limit Prepayment:**
   - Prepayment exactly equals available limit
   - No over-limit, no penalty (within limit)

4. **Prepayment Exceeds Balance:**
   - Prepayment amount > current balance
   - Should not be allowed (validation prevents)

**Year-to-Date Calculation Edge Cases:**

1. **No Payments Yet:**
   - Current year has no payments
   - YTD used = 0, remaining = total limit

2. **All Payments Have Zero Prepayment:**
   - Payments exist but no prepayments
   - YTD used = 0, remaining = total limit

3. **Payments Span Multiple Years:**
   - Payments from previous years not counted
   - Only current prepayment year payments included

**Cash Flow Surplus Edge Cases:**

1. **No Cash Flow Record:**
   - User hasn't entered cash flow data
   - Surplus = 0, recommendation focuses on cash flow

2. **Negative Surplus:**
   - Expenses + debt > income
   - Surplus = 0 (max with 0), recommendation: improve cash flow

3. **Very High Surplus:**
   - Surplus > annual prepayment limit
   - Recommendation: maximize prepayment limit

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid mortgage ID, invalid prepayment amount
- **401 Unauthorized:** User not authenticated
- **404 Not Found:** Mortgage not found
- **500 Internal Server Error:** Calculation error or unexpected error

**Frontend Error Handling:**

- Display user-friendly error messages
- Show loading states during calculations
- Handle network errors gracefully
- Fallback to default values if data unavailable
- Log errors for debugging

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero amounts, missing data, etc.)
- Return appropriate error messages
- Use safe defaults where appropriate
- Log calculation errors for debugging

**Data Validation:**

- Prepayment amount must be positive
- Annual limit percent must be 0-100
- Carry-forward must be non-negative
- Reset date must be valid date (if provided)
- Payment dates must be valid

---

## Testing Considerations

### Unit Tests

**Prepayment Year Calculation Tests:**
- `getPrepaymentYear()`: Calendar year determination
- `getPrepaymentYear()`: Anniversary year determination (before/after anniversary)
- `getPrepaymentYear()`: Payment on exact anniversary date
- `getPrepaymentYearDates()`: Start and end dates for calendar year
- `getPrepaymentYearDates()`: Start and end dates for anniversary year

**Prepayment Room Calculation Tests:**
- `calculatePrepaymentRoom()`: Basic calculation (limit, used, remaining)
- `calculatePrepaymentRoom()`: With carry-forward included
- `calculatePrepaymentRoom()`: Zero YTD used
- `calculatePrepaymentRoom()`: Limit fully used
- `calculatePrepaymentRoom()`: Over limit scenario

**Over-Limit Penalty Tests:**
- `calculateOverLimitPenalty()`: Zero over-limit (no penalty)
- `calculateOverLimitPenalty()`: Positive over-limit (penalty applies)
- `calculateOverLimitPenalty()`: Different penalty percentages
- `calculatePrepaymentWithPenalty()`: Within limit (no penalty)
- `calculatePrepaymentWithPenalty()`: Over limit (penalty applies)

**PrepaymentService Tests:**
- `getPrepaymentOpportunity()`: Complete opportunity calculation
- `calculateSurplus()`: Surplus calculation from cash flow
- `calculateSurplus()`: Zero or negative surplus
- `generateRecommendation()`: Different recommendation scenarios

### Integration Tests

**Prepayment Opportunity API:**
- Calculate opportunity with calendar year reset
- Calculate opportunity with anniversary date reset
- Calculate opportunity with carry-forward
- Calculate opportunity with zero surplus
- Calculate opportunity with zero room

**Prepayment Limit Enforcement:**
- Prepayment within limit (allowed)
- Prepayment at limit (allowed, no room remaining)
- Prepayment over limit (penalty calculated)
- Prepayment with carry-forward (higher limit)

**Year-to-Date Tracking:**
- Payments in current year counted correctly
- Payments in previous year not counted
- Anniversary date boundary handling
- Calendar year boundary handling

### End-to-End Tests

**Prepayment Opportunity E2E:**
1. User views mortgage details
2. Prepayment opportunity card displayed
3. Shows annual limit, used amount, remaining room
4. Shows monthly surplus (if positive)
5. Shows recommendation
6. User clicks to view detailed analysis

**Prepayment Limit Alert E2E:**
1. User makes prepayment approaching limit
2. System calculates usage percentage
3. At 80% threshold, alert created
4. User receives notification
5. At 90% threshold, another alert
6. At 100% threshold, final alert

**Over-Limit Prepayment E2E:**
1. User requests prepayment exceeding limit
2. System calculates over-limit amount
3. System calculates penalty
4. Warning displayed with penalty and total cost
5. User can proceed (accept penalty) or adjust amount

---

## Future Enhancements

### Known Limitations

1. **Lender-Specific Rules:**
   - Currently supports standard rules (20% limit, 1.5% penalty)
   - Could add lender-specific configurations
   - Different penalty percentages by lender
   - Different carry-forward rules by lender

2. **Carry-Forward Expiration:**
   - Currently assumes carry-forward available indefinitely
   - Some lenders may expire carry-forward after one year
   - Could add expiration date tracking

3. **Prepayment Frequency Limits:**
   - Currently no limit on prepayment frequency
   - Some lenders may limit number of prepayments per year
   - Could add frequency limit tracking

4. **Double-Up Payments:**
   - Currently not explicitly tracked as prepayment type
   - Could add double-up payment option
   - Double-up payments count toward annual limit

### Potential Improvements

**Enhanced Analysis:**
- Prepayment vs investment ROI calculator (with tax considerations)
- Prepayment optimization recommendations (best timing)
- Prepayment impact on renewal/refinancing decisions
- Prepayment history trends and analytics

**Advanced Features:**
- Prepayment scheduling (automated prepayments)
- Prepayment goal tracking (pay off by specific date)
- Prepayment impact on HELOC credit limit (for re-advanceable mortgages)
- Prepayment impact on property value appreciation

**User Experience:**
- Prepayment wizard (guided prepayment workflow)
- Prepayment calculator (standalone tool)
- Prepayment templates (common scenarios)
- Prepayment educational content

**Integration Enhancements:**
- Prepayment in scenario planning (already implemented for events)
- Prepayment in Smith Maneuver (already integrated)
- Prepayment impact on cash flow projections
- Prepayment optimization in renewal workflow

---

**End of Feature Specification**

