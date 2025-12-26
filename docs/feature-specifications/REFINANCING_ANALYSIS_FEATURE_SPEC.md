# Refinancing Analysis Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Refinancing a mortgage is one of the most significant financial decisions homeowners can make. Accurate refinancing analysis helps homeowners understand whether refinancing makes financial sense, saving thousands of dollars in interest costs or preventing costly mistakes. The Refinancing Analysis feature provides:

- **Comprehensive Cost-Benefit Analysis:** Monthly savings, break-even analysis, and total term savings calculations
- **Closing Costs Integration:** Detailed tracking of all refinancing costs (legal, appraisal, discharge, other fees)
- **Penalty Integration:** Accurate penalty estimates included in total refinancing costs
- **Market Rate Comparison:** Current rate vs market rate analysis to identify opportunities
- **Decision Support:** Clear indicators of whether refinancing is beneficial based on break-even analysis

### Market Context

**Canadian Mortgage Refinancing Market:**

- **Refinancing Definition:** Replacing existing mortgage with new mortgage (often at different rate/terms)
- **Common Reasons:** Lower rates, cash out (borrow more), consolidate debt, change amortization
- **Frequency:** Homeowners refinance 2-4 times over 25-30 year mortgage lifecycle
- **Typical Costs:** Penalty ($1,500-$10,000) + Closing Costs ($1,000-$2,500) = Total $2,500-$12,500

**Industry Statistics:**

- Average refinancing closing costs: $1,500-$2,500
- Typical break-even period: 12-36 months
- Refinancing most beneficial when rates drop 0.5-1.0% or more
- Approximately 30% of homeowners refinance within first 5 years
- Cash-out refinancing represents 40-50% of refinancing activity

**Strategic Importance:**

- Refinancing decisions have long-term financial impact (thousands of dollars)
- Complex calculations require accurate analysis tools
- Integration with penalties, closing costs, and market rates essential
- Critical for competitive mortgage planning tools

### Strategic Positioning

- **Core Feature:** Refinancing analysis is essential for mortgage lifecycle management
- **Competitive Differentiation:** Comprehensive cost-benefit analysis with closing costs exceeds basic tools
- **User Trust:** Accurate refinancing analysis prevents costly mistakes and builds user confidence
- **Integration Value:** Integrates with renewal workflow, penalty calculations, and scenario planning

---

## Domain Overview

### Refinancing Fundamentals

**Mortgage Refinancing** is the process of replacing an existing mortgage with a new mortgage, typically to take advantage of better rates, borrow additional funds, or change mortgage terms. Key characteristics:

1. **When Refinancing Occurs:**
   - Breaking current term before term end (early refinancing)
   - At term end (renewal refinancing)
   - To borrow additional funds (cash-out refinancing)
   - To consolidate debt
   - To change amortization period

2. **Refinancing Costs:**
   - **Penalty:** Fee for breaking current term early (IRD or 3-month interest)
   - **Closing Costs:** Legal fees, appraisal, discharge fees, other fees
   - **Total Cost:** Penalty + Closing Costs

3. **Refinancing Benefits:**
   - **Lower Rate:** New rate lower than current rate
   - **Lower Payment:** Reduced monthly payment from lower rate
   - **Monthly Savings:** Difference between old and new monthly payments
   - **Total Savings:** Cumulative savings over term minus costs

4. **Break-Even Analysis:**
   - Months to recover total refinancing costs through monthly savings
   - Critical decision factor: Is break-even period acceptable?
   - Rule of thumb: Break-even < 24-36 months typically beneficial

### Refinancing Calculation Components

**Current Mortgage Details:**
- Current mortgage balance
- Current interest rate (fixed or variable)
- Remaining amortization period
- Remaining term period
- Current monthly payment

**New Mortgage Details:**
- New interest rate (market rate or user-specified)
- New amortization period (may extend or keep same)
- New term period
- New monthly payment (calculated)

**Costs:**
- **Penalty:** Calculated using penalty calculation service
- **Closing Costs:**
  - Legal fees ($500-$1,000)
  - Appraisal fees ($300-$500)
  - Discharge fees ($200-$400)
  - Other fees ($0-$300)
  - **Total:** Typically $1,000-$2,500

**Benefits:**
- **Monthly Savings:** Old payment - New payment
- **Break-Even Months:** Total costs / Monthly savings
- **Total Term Savings:** (Monthly savings × Remaining term months) - Total costs

### Break-Even Analysis

**What Is Break-Even?**

The **break-even point** is the number of months it takes to recover the total refinancing costs (penalty + closing costs) through monthly savings from the lower rate.

**Break-Even Formula:**

```
Break-Even Months = Total Refinancing Costs / Monthly Savings

Where:
  Total Refinancing Costs = Penalty + Closing Costs
  Monthly Savings = Current Payment - New Payment
```

**Break-Even Interpretation:**

- **< 12 months:** Excellent refinancing opportunity
- **12-24 months:** Good refinancing opportunity
- **24-36 months:** Acceptable, depends on plans and rate outlook
- **> 36 months:** Questionable, only if planning to stay long-term or need cash-out
- **Infinity:** Not beneficial (monthly savings ≤ 0)

**Example:**
- Total costs: $3,500 (penalty $2,000 + closing $1,500)
- Monthly savings: $200
- Break-even: $3,500 / $200 = 17.5 months ✅ Beneficial

### Total Term Savings

**What Is Total Term Savings?**

**Total term savings** represents the net financial benefit of refinancing over the remaining term of the current mortgage.

**Calculation:**

```
Total Term Savings = (Monthly Savings × Remaining Term Months) - Total Refinancing Costs

Where:
  Monthly Savings = Current Payment - New Payment
  Remaining Term Months = Months remaining in current term
  Total Refinancing Costs = Penalty + Closing Costs
```

**Interpretation:**

- **Positive value:** Refinancing saves money over remaining term
- **Negative value:** Refinancing costs more than staying put
- **Zero:** Break-even (rare)

**Example:**
- Monthly savings: $200/month
- Remaining term: 36 months
- Total costs: $3,500
- Total term savings: ($200 × 36) - $3,500 = $3,700 ✅ Beneficial

### Beneficial Determination

**Is Refinancing Beneficial?**

Refinancing is considered **beneficial** if total term savings > 0, meaning the cumulative monthly savings over the remaining term exceed the total refinancing costs.

**Logic:**

```
isBeneficial = totalTermSavings > 0

Where:
  totalTermSavings = (monthlySavings × remainingTermMonths) - totalCosts
```

**Factors:**
- Monthly savings amount
- Remaining term length (more months = more cumulative savings)
- Total refinancing costs (lower costs = better)
- Break-even period (shorter = better)

### Closing Costs Breakdown

**Legal Fees:**
- Lawyer/notary fees for mortgage registration
- Typical range: $500-$1,000
- Required for all refinancing transactions

**Appraisal Fees:**
- Property appraisal to determine current value
- Typical range: $300-$500
- May be waived in some cases

**Discharge Fees:**
- Fees to discharge old mortgage
- Typical range: $200-$400
- Standard requirement

**Other Fees:**
- Title insurance, registration fees, administrative fees
- Typical range: $0-$300
- Varies by lender and transaction

**Total Closing Costs:**
- Typical total: $1,000-$2,500
- Default estimate: $1,500 (if not specified)
- Actual costs may vary significantly

### Market Rate Integration

**Market Rate Usage:**

- Used as comparison rate for new mortgage
- Fetched from Market Rate Service
- Based on term type (fixed vs variable) and term years (1, 2, 3, 5, 7, 10)
- Default: 5-year fixed rate (most common refinancing term)

**Market Rate Selection:**

- Match current term type (fixed → fixed, variable → variable)
- Or allow user to specify new term type
- Match term years or allow user selection
- Use most recent available market rate

**Rate Comparison:**

- Current rate vs market rate
- Rate difference indicates opportunity
- Larger difference = larger potential savings
- Market rates may be higher (refinancing not beneficial)

### Penalty Integration

**Penalty in Refinancing:**

- Penalty is major cost component in refinancing
- Calculated using penalty calculation service
- Includes IRD or 3-month interest (whichever is higher)
- Penalty amount included in total refinancing costs

**Penalty Calculation:**

- Uses current mortgage balance
- Uses current interest rate
- Uses market rate for IRD calculation
- Uses remaining term months
- Applies standard "greater of" rule

**Impact on Break-Even:**

- Higher penalty = longer break-even period
- Penalty often largest cost component
- Accurate penalty estimate critical for analysis

### Canadian Lender Conventions

**Refinancing Process:**

- Requires breaking current term (if before term end)
- Penalty applies (unless at term end)
- New mortgage application process
- Closing costs apply
- New term and rate set

**Typical Refinancing Terms:**

- New term: 1, 2, 3, 5, 7, or 10 years (5-year most common)
- New rate: Market rate at time of refinancing
- Amortization: May extend (if cash-out) or keep same
- Payment frequency: May change

**Lender Considerations:**

- Some lenders offer better rates to existing customers
- Rate negotiation possible
- Closing costs may be waived or reduced in some cases
- Penalty calculation methodology varies by lender

---

## User Personas & Use Cases

### Persona 1: Rate Optimizer (Seeking Lower Rates)

**Profile:**
- Current mortgage rate higher than market rates
- Wants to reduce monthly payments
- Willing to pay penalty if savings justify it
- Focuses on break-even analysis

**Use Cases:**
- View refinancing opportunity analysis
- Compare current rate vs market rate
- Calculate monthly savings from refinancing
- Evaluate break-even period
- Make refinancing decision based on analysis

**Pain Points Addressed:**
- Uncertainty about whether refinancing makes sense
- Complex cost-benefit calculations
- Need for accurate penalty and closing cost estimates
- Understanding break-even period

### Persona 2: Cash-Out Refinancer (Borrowing More)

**Profile:**
- Needs additional funds
- Wants to tap into home equity
- Considering refinancing to borrow more
- Needs to understand costs vs benefits

**Use Cases:**
- Analyze refinancing costs (penalty + closing costs)
- Understand impact of borrowing more
- Calculate new monthly payment with increased balance
- Evaluate if cash-out refinancing makes sense
- Compare to other borrowing options (HELOC, etc.)

**Pain Points Addressed:**
- Understanding total costs of cash-out refinancing
- Comparing refinancing to other borrowing options
- Calculating affordability of increased balance
- Need for comprehensive cost analysis

### Persona 3: Debt Consolidator (Refinancing to Consolidate)

**Profile:**
- Has other debts (credit card, personal loans)
- Wants to consolidate into mortgage
- Needs to borrow more to pay off debts
- Wants to understand refinancing impact

**Use Cases:**
- Calculate total refinancing costs
- Understand impact of increased mortgage balance
- Calculate new monthly payment
- Evaluate if consolidation saves money
- Compare refinancing to other debt consolidation options

**Pain Points Addressed:**
- Complex cost-benefit analysis
- Understanding impact of increased balance
- Comparing consolidation options
- Need for comprehensive analysis

### Persona 4: Strategic Refinancer (Long-Term Planning)

**Profile:**
- Plans to stay in home long-term
- Considers refinancing for strategic reasons
- Values total term savings over break-even period
- Makes informed, data-driven decisions

**Use Cases:**
- Analyze total term savings (not just break-even)
- Compare multiple refinancing scenarios
- Evaluate long-term financial impact
- Plan refinancing timing
- Optimize mortgage strategy

**Pain Points Addressed:**
- Need for comprehensive long-term analysis
- Comparing multiple scenarios
- Strategic planning support
- Understanding cumulative savings

---

## Feature Requirements

### Data Model Requirements

**Refinancing Analysis (Runtime/Calculated):**

No persistent storage for analysis results (calculated on-demand), but uses:

- **Mortgage Data:** Balance, rate, remaining amortization, remaining term
- **Term Data:** Current rate, term type, term end date
- **Market Rate Data:** Current market rates for comparison
- **Penalty Data:** Calculated penalty (from penalty service)

**Refinancing Events Table (`refinancingEvents`):**

For scenario planning (future refinancing events):
- `id` (UUID, primary key)
- `scenarioId` (foreign key to scenarios)
- `refinancingYear` (integer, optional) - For year-based refinancing
- `atTermEnd` (boolean) - For term-end refinancing
- `newRate` (decimal 5,3) - New interest rate
- `termType` (text) - New term type
- `newAmortizationMonths` (integer, optional) - Extended amortization
- `paymentFrequency` (text, optional) - New payment frequency
- `closingCosts` (decimal 12,2, optional) - Total closing costs
- `legalFees` (decimal 12,2, optional) - Legal fees breakdown
- `appraisalFees` (decimal 12,2, optional) - Appraisal fees
- `dischargeFees` (decimal 12,2, optional) - Discharge fees
- `otherFees` (decimal 12,2, optional) - Other fees
- `description` (text, optional) - Event description
- `createdAt` (timestamp)

**Closing Costs Input:**

- `total` (number, optional) - Total closing costs (if provided, breakdown ignored)
- `legalFees` (number, optional) - Legal fees
- `appraisalFees` (number, optional) - Appraisal fees
- `dischargeFees` (number, optional) - Discharge fees
- `otherFees` (number, optional) - Other fees

**Refinancing Analysis Output:**

- `currentRate` (number) - Current interest rate (percentage)
- `marketRate` (number) - Market rate for comparison (percentage)
- `marketRateType` (text) - "fixed" | "variable"
- `penalty` (number) - Calculated penalty amount
- `closingCosts` (number) - Total closing costs
- `monthlySavings` (number) - Monthly payment savings
- `breakEvenMonths` (number) - Months to break even
- `isBeneficial` (boolean) - Whether refinancing is beneficial
- `totalTermSavings` (number) - Total savings over remaining term

### Business Logic Requirements

**Refinancing Analysis Calculation:**

1. **Get Current Mortgage Data:**
   - Fetch mortgage: balance, remaining amortization
   - Fetch active term: current rate, term type, term end date
   - Calculate remaining term months

2. **Get Market Rate:**
   - Fetch market rate for term type and years (default: 5-year fixed)
   - Use as new rate for comparison
   - Fallback to current rate if market rate unavailable

3. **Calculate Penalty:**
   - Use penalty calculation service
   - Inputs: balance, current rate, market rate (for IRD), remaining term months
   - Returns penalty amount and method

4. **Calculate Closing Costs:**
   - Use provided total if specified
   - Otherwise sum breakdown (legal + appraisal + discharge + other)
   - Default to $1,500 if not provided

5. **Calculate Monthly Payments:**
   - Current payment: Based on current balance, current rate, remaining amortization
   - New payment: Based on current balance, new rate, remaining amortization
   - Monthly savings: Current payment - New payment

6. **Calculate Break-Even:**
   - Total costs: Penalty + Closing costs
   - Break-even months: Total costs / Monthly savings
   - If monthly savings ≤ 0: Break-even = Infinity

7. **Calculate Total Term Savings:**
   - Total term savings: (Monthly savings × Remaining term months) - Total costs
   - Is beneficial: totalTermSavings > 0

**Payment Calculation:**

1. **Current Payment:**
   ```
   currentPayment = calculatePayment(
     currentBalance,
     currentRate,
     remainingAmortizationMonths,
     "monthly"
   )
   ```

2. **New Payment:**
   ```
   newPayment = calculatePayment(
     currentBalance,
     newRate,
     remainingAmortizationMonths,
     "monthly"
   )
   ```

3. **Monthly Savings:**
   ```
   monthlySavings = currentPayment - newPayment
   ```

**Break-Even Calculation:**

```
breakEvenMonths = totalCosts / monthlySavings

Where:
  totalCosts = penalty + closingCosts
  monthlySavings = currentPayment - newPayment

Edge Cases:
  - If monthlySavings <= 0: breakEvenMonths = Infinity (not beneficial)
  - If totalCosts = 0: breakEvenMonths = 0 (no recovery needed)
  - Minimum: 0 months
  - Maximum: Infinity
```

**Total Term Savings Calculation:**

```
totalTermSavings = (monthlySavings × remainingTermMonths) - totalCosts

Where:
  monthlySavings = currentPayment - newPayment
  remainingTermMonths = Months remaining in current term
  totalCosts = penalty + closingCosts

Interpretation:
  - Positive: Refinancing saves money
  - Negative: Refinancing costs more
  - Zero: Break-even (rare)
```

**Beneficial Determination:**

```
isBeneficial = totalTermSavings > 0
```

**Closing Costs Calculation:**

1. **Priority:**
   - If `total` provided: Use total (ignore breakdown)
   - Else if breakdown provided: Sum breakdown components
   - Else: Use default $1,500

2. **Breakdown Sum:**
   ```
   totalClosingCosts = (legalFees || 0) + (appraisalFees || 0) + (dischargeFees || 0) + (otherFees || 0)
   ```

### Calculation Requirements

**Payment Calculation:**

Uses standard mortgage payment formula:
```
Payment = (Balance × MonthlyRate × (1 + MonthlyRate)^Months) / ((1 + MonthlyRate)^Months - 1)

Where:
  MonthlyRate = AnnualRate / 12
  Months = Remaining amortization months
```

**Break-Even Formula:**

```
breakEvenMonths = (penalty + closingCosts) / (currentPayment - newPayment)
```

**Total Term Savings Formula:**

```
totalTermSavings = (monthlySavings × remainingTermMonths) - (penalty + closingCosts)
```

### Validation Requirements

**Closing Costs Validation:**

- `total`: Optional, must be positive if provided
- `legalFees`: Optional, must be positive if provided
- `appraisalFees`: Optional, must be positive if provided
- `dischargeFees`: Optional, must be positive if provided
- `otherFees`: Optional, must be positive if provided
- At least one value should be provided (or default used)

**Business Rules:**

- Monthly savings can be negative (new rate higher than current)
- Break-even = Infinity if monthly savings ≤ 0
- Total term savings can be negative (refinancing not beneficial)
- Closing costs default to $1,500 if not provided
- Penalty calculated using penalty service (accurate)

### Integration Requirements

**Penalty Service Integration:**
- Calculate penalty using penalty calculation service
- Uses current balance, current rate, market rate, remaining term months
- Returns penalty amount (used in total costs)

**Market Rate Service Integration:**
- Fetch current market rates by term type and years
- Used as new rate for comparison
- Default: 5-year fixed rate (most common)

**Mortgage Service Integration:**
- Fetch mortgage details (balance, amortization)
- Fetch active term details (rate, term type, term end)
- Calculate remaining term months

**Renewal Service Integration:**
- Refinancing analysis included in renewal recommendations
- Break-even analysis used in renewal decision logic
- Penalty estimates from renewal status

**Payment Calculation Integration:**
- Uses standard payment calculation functions
- Supports different payment frequencies
- Handles variable rate mortgages

---

## User Stories & Acceptance Criteria

### Epic: Refinancing Analysis

**Story 1: View Refinancing Opportunity**
- **As a** homeowner
- **I want to** see if refinancing makes financial sense
- **So that** I can decide whether to refinance my mortgage

**Acceptance Criteria:**
- ✅ Refinancing analysis shows current rate vs market rate
- ✅ Monthly savings displayed prominently
- ✅ Break-even period shown clearly
- ✅ Total term savings calculated and displayed
- ✅ Beneficial indicator shows if refinancing is recommended
- ✅ Penalty amount included in analysis
- ✅ Closing costs included in analysis (default if not provided)

**Story 2: Calculate Break-Even Analysis**
- **As a** homeowner
- **I want to** understand how long it takes to recover refinancing costs
- **So that** I can make an informed refinancing decision

**Acceptance Criteria:**
- ✅ Break-even months calculated correctly: `(Penalty + Closing Costs) / Monthly Savings`
- ✅ Break-even displayed in months (e.g., "17.5 months")
- ✅ Break-even interpretation provided (< 12 months = excellent, 12-24 = good, etc.)
- ✅ Handles edge case: Infinity if monthly savings ≤ 0
- ✅ Break-even shown in refinancing analysis results

**Story 3: Include Closing Costs in Analysis**
- **As a** homeowner
- **I want to** include closing costs in refinancing analysis
- **So that** I get an accurate picture of total refinancing costs

**Acceptance Criteria:**
- ✅ Closing costs can be entered as total or breakdown
- ✅ Breakdown includes: Legal fees, Appraisal fees, Discharge fees, Other fees
- ✅ Total closing costs calculated from breakdown if total not provided
- ✅ Default closing costs ($1,500) used if not provided
- ✅ Closing costs included in total refinancing costs
- ✅ Closing costs included in break-even calculation

**Story 4: Calculate Total Term Savings**
- **As a** homeowner
- **I want to** see total savings over remaining term
- **So that** I understand long-term financial impact

**Acceptance Criteria:**
- ✅ Total term savings calculated: `(Monthly Savings × Remaining Term Months) - Total Costs`
- ✅ Total term savings displayed in refinancing analysis
- ✅ Beneficial determination based on total term savings > 0
- ✅ Negative savings shown clearly (refinancing not beneficial)
- ✅ Total term savings includes penalty and closing costs

**Story 5: Compare Current vs Market Rate**
- **As a** homeowner
- **I want to** compare my current rate to market rates
- **So that** I can identify refinancing opportunities

**Acceptance Criteria:**
- ✅ Current rate displayed clearly
- ✅ Market rate displayed clearly
- ✅ Rate difference highlighted (market rate lower = opportunity)
- ✅ Rate comparison visual (current vs market)
- ✅ Market rate type shown (fixed/variable)

### Epic: Closing Costs Tracking

**Story 6: Enter Closing Costs Breakdown**
- **As a** homeowner
- **I want to** enter closing costs as breakdown
- **So that** I can accurately track all refinancing costs

**Acceptance Criteria:**
- ✅ Form fields for: Legal fees, Appraisal fees, Discharge fees, Other fees
- ✅ Total calculated automatically from breakdown
- ✅ Fields are optional (can use total instead)
- ✅ Validation: All values must be positive numbers
- ✅ Total displayed and editable

**Story 7: Enter Total Closing Costs**
- **As a** homeowner
- **I want to** enter total closing costs directly
- **So that** I can quickly analyze refinancing without breakdown

**Acceptance Criteria:**
- ✅ Total closing costs field available
- ✅ If total provided, breakdown fields disabled/ignored
- ✅ Total takes priority over breakdown
- ✅ Default total ($1,500) used if not provided
- ✅ Total included in refinancing analysis

**Story 8: View Closing Costs in Analysis**
- **As a** homeowner
- **I want to** see closing costs included in refinancing analysis
- **So that** I understand total refinancing costs

**Acceptance Criteria:**
- ✅ Closing costs displayed in analysis results
- ✅ Closing costs breakdown shown if provided
- ✅ Closing costs included in total cost to break
- ✅ Closing costs included in break-even calculation
- ✅ Closing costs clearly labeled

### Epic: Refinancing UI & Workflow

**Story 9: Refinancing Analysis Dialog**
- **As a** homeowner
- **I want to** use a refinancing analysis dialog
- **So that** I can analyze refinancing with custom closing costs

**Acceptance Criteria:**
- ✅ Dialog opens from refinancing tab
- ✅ Two tabs: Closing Costs, Analysis Results
- ✅ Closing Costs tab: Form for entering costs (total or breakdown)
- ✅ Analysis Results tab: Displays analysis results
- ✅ Calculate button triggers analysis
- ✅ Results update when closing costs change

**Story 10: Refinancing Card on Dashboard**
- **As a** homeowner
- **I want to** see refinancing opportunity on dashboard
- **So that** I can quickly identify refinancing opportunities

**Acceptance Criteria:**
- ✅ Refinancing card displayed on dashboard (if beneficial)
- ✅ Shows current rate vs market rate
- ✅ Shows monthly savings
- ✅ Shows break-even period
- ✅ Shows beneficial indicator (badge)
- ✅ Links to detailed refinancing analysis

**Story 11: Refinancing Tab**
- **As a** homeowner
- **I want to** access refinancing analysis from mortgage details
- **So that** I can analyze refinancing for specific mortgage

**Acceptance Criteria:**
- ✅ Refinancing tab in mortgage details
- ✅ Shows refinancing analysis card (if available)
- ✅ Button to open detailed analysis dialog
- ✅ Links to mortgage portability feature
- ✅ Integration with renewal workflow

**Story 12: Beneficial Indicator**
- **As a** homeowner
- **I want to** see clearly if refinancing is beneficial
- **So that** I can quickly understand recommendation

**Acceptance Criteria:**
- ✅ Beneficial badge/indicator displayed (green if beneficial, neutral if not)
- ✅ "Save Money" badge if beneficial
- ✅ "Keep Current Rate" if not beneficial
- ✅ Clear visual distinction between beneficial and non-beneficial
- ✅ Total term savings shown to support indicator

### Epic: Integration & Accuracy

**Story 13: Penalty Integration**
- **As a** system
- **I want to** include accurate penalty estimates in refinancing analysis
- **So that** users get complete cost picture

**Acceptance Criteria:**
- ✅ Penalty calculated using penalty calculation service
- ✅ Penalty amount displayed in analysis
- ✅ Penalty included in total refinancing costs
- ✅ Penalty included in break-even calculation
- ✅ Penalty breakdown available (IRD vs 3-month interest)

**Story 14: Market Rate Integration**
- **As a** system
- **I want to** use current market rates for refinancing analysis
- **So that** users get accurate rate comparisons

**Acceptance Criteria:**
- ✅ Market rate fetched from Market Rate Service
- ✅ Market rate matches term type (fixed/variable)
- ✅ Market rate matches term years (default: 5-year)
- ✅ Market rate displayed in analysis
- ✅ Fallback to current rate if market rate unavailable

**Story 15: Refinancing in Renewal Workflow**
- **As a** homeowner
- **I want to** see refinancing analysis in renewal workflow
- **So that** I can compare renewal vs refinancing options

**Acceptance Criteria:**
- ✅ Refinancing analysis included in renewal recommendations
- ✅ Refinancing option compared to stay/switch options
- ✅ Break-even analysis included in renewal comparison
- ✅ Penalty included in refinancing costs
- ✅ Links to detailed refinancing analysis

---

## Technical Implementation Notes

### API Endpoints

**Refinancing Analysis:**
- `GET /api/mortgages/:id/refinance-analysis` - Get refinancing analysis (with optional closing costs in query params)
  - Query params: `closingCostsTotal?`, `legalFees?`, `appraisalFees?`, `dischargeFees?`, `otherFees?`
  - Returns: `RefinanceAnalysisResponse` (currentRate, marketRate, penalty, closingCosts, monthlySavings, breakEvenMonths, isBeneficial, totalTermSavings)
- `POST /api/mortgages/:id/refinance-analysis` - Calculate refinancing analysis with closing costs in body
  - Body: `RefinanceAnalysisRequest` (closingCosts?: { total?, legalFees?, appraisalFees?, dischargeFees?, otherFees? })
  - Returns: `RefinanceAnalysisResponse`

### Database Schema

**Refinancing Events Table (for Scenario Planning):**
```sql
CREATE TABLE refinancing_events (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id VARCHAR NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  refinancing_year INTEGER, -- For year-based refinancing
  at_term_end INTEGER NOT NULL DEFAULT 0, -- Boolean: 0 = false, 1 = true
  new_rate DECIMAL(5,3) NOT NULL,
  term_type TEXT NOT NULL, -- 'fixed', 'variable-changing', 'variable-fixed'
  new_amortization_months INTEGER, -- Optional
  payment_frequency TEXT, -- Optional
  closing_costs DECIMAL(12,2), -- Total closing costs
  legal_fees DECIMAL(12,2), -- Legal fees breakdown
  appraisal_fees DECIMAL(12,2), -- Appraisal fees
  discharge_fees DECIMAL(12,2), -- Discharge fees
  other_fees DECIMAL(12,2), -- Other fees
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IDX_refinancing_events_scenario ON refinancing_events(scenario_id);
```

### Service Layer

**RefinancingService:**
- `analyzeRefinanceOpportunity(mortgageId, closingCosts?): Promise<RefinanceAnalysis | null>`
  - Fetches mortgage and active term
  - Gets market rate for comparison
  - Calculates penalty using penalty service
  - Calculates closing costs (provided total, sum breakdown, or default)
  - Calculates monthly payments (current vs new)
  - Calculates break-even and total term savings
  - Returns analysis results

**Refinance Calculation Functions:**
- `calculateRefinanceBenefit(balance, currentRate, newRate, remainingAmortizationMonths, remainingTermMonths, penalty, closingCosts): RefinanceResult`
  - Calculates monthly payments (current vs new)
  - Calculates monthly savings
  - Calculates break-even months
  - Calculates total term savings
  - Determines if beneficial

### Calculation Functions

**Refinance Benefit Calculation:**
```typescript
function calculateRefinanceBenefit(
  currentBalance: number,
  currentRate: number,
  newRate: number,
  remainingAmortizationMonths: number,
  remainingTermMonths: number,
  penalty: number,
  closingCosts: number = 0
): RefinanceResult {
  // Calculate payments
  const oldPayment = calculatePayment(
    currentBalance,
    currentRate,
    remainingAmortizationMonths,
    "monthly"
  );
  const newPayment = calculatePayment(
    currentBalance,
    newRate,
    remainingAmortizationMonths,
    "monthly"
  );

  const monthlySavings = oldPayment - newPayment;
  const totalCosts = penalty + closingCosts;

  // Break-even calculation
  let breakEvenMonths = 0;
  if (monthlySavings > 0) {
    breakEvenMonths = totalCosts / monthlySavings;
  } else {
    breakEvenMonths = Infinity; // Never break even if rate is higher
  }

  // Total term savings
  const totalTermSavings = monthlySavings * remainingTermMonths - totalCosts;

  return {
    monthlySavings,
    breakEvenMonths,
    newPayment,
    totalTermSavings,
    isBeneficial: totalTermSavings > 0,
  };
}
```

### Frontend Components

**RefinanceTab:**
- Main tab component for refinancing-related content
- Displays refinancing analysis card
- Button to open detailed analysis dialog
- Links to mortgage portability feature

**RefinanceAnalysisDialog:**
- Dialog component for detailed refinancing analysis
- Two tabs: Closing Costs, Analysis Results
- Form for entering closing costs (total or breakdown)
- Displays analysis results
- Handles calculation submission

**RefinanceScenarioCard:**
- Card component displaying refinancing analysis summary
- Shows current rate vs market rate
- Shows monthly savings
- Shows break-even period
- Shows beneficial indicator
- Displays total term savings

**useRefinanceAnalysis (Hook):**
- Fetches refinancing analysis
- Handles closing costs input
- Manages calculation state
- Updates analysis when inputs change

### Data Flow

**Refinancing Analysis Flow:**
1. User opens refinancing tab or dialog
2. Frontend calls `GET /api/mortgages/:id/refinance-analysis` (with optional closing costs)
3. Backend: `RefinancingService.analyzeRefinanceOpportunity()`
   - Fetches mortgage and active term
   - Gets market rate (default: 5-year fixed)
   - Calculates penalty using penalty service
   - Calculates closing costs (provided, breakdown sum, or default $1,500)
   - Calculates monthly payments (current vs new rate)
   - Calculates break-even: `(penalty + closingCosts) / monthlySavings`
   - Calculates total term savings: `(monthlySavings × remainingTermMonths) - totalCosts`
   - Determines beneficial: `totalTermSavings > 0`
4. Returns `RefinanceAnalysisResponse`
5. Frontend displays analysis results
6. User can adjust closing costs and recalculate

**Closing Costs Input Flow:**
1. User opens refinancing analysis dialog
2. User navigates to "Closing Costs" tab
3. User enters closing costs (total or breakdown)
4. User clicks "Calculate"
5. Frontend sends `POST /api/mortgages/:id/refinance-analysis` with closing costs
6. Backend recalculates analysis with new closing costs
7. Frontend displays updated results in "Analysis Results" tab

**Penalty Integration Flow:**
1. Refinancing service calls penalty calculation service
2. Penalty service calculates penalty (IRD or 3-month interest)
3. Penalty amount returned to refinancing service
4. Penalty included in total costs: `totalCosts = penalty + closingCosts`
5. Penalty included in break-even calculation
6. Penalty displayed in analysis results

**Market Rate Integration Flow:**
1. Refinancing service calls market rate service
2. Market rate service fetches current rate (default: 5-year fixed)
3. Market rate returned to refinancing service
4. Market rate used as new rate for payment calculation
5. Market rate displayed in analysis (current vs market comparison)

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Payment Calculation Edge Cases:**

1. **Zero Balance:**
   - Should not occur in refinancing (mortgage would be paid off)
   - Handle gracefully: Return $0 payment

2. **Zero Remaining Amortization:**
   - Should not occur in refinancing
   - Handle gracefully: Use mortgage amortization or return error

3. **Very High Rates:**
   - New rate higher than current rate
   - Monthly savings negative
   - Break-even = Infinity (not beneficial)

4. **Equal Rates:**
   - Current rate = market rate
   - Monthly savings = $0
   - Break-even = Infinity (not beneficial)
   - Total term savings = negative (costs only)

**Break-Even Calculation Edge Cases:**

1. **Zero Monthly Savings:**
   - New rate ≥ current rate
   - Monthly savings ≤ 0
   - Break-even = Infinity
   - Not beneficial

2. **Zero Total Costs:**
   - Penalty = $0 and closing costs = $0 (unlikely but possible)
   - Break-even = 0 months
   - Beneficial if monthly savings > 0

3. **Very Large Total Costs:**
   - High penalty + high closing costs
   - Break-even period very long (> 36 months)
   - May not be beneficial

4. **Very Small Monthly Savings:**
   - Small rate difference
   - Break-even period very long
   - May not be beneficial

**Closing Costs Edge Cases:**

1. **No Closing Costs Provided:**
   - Use default $1,500
   - Analysis still accurate (conservative estimate)
   - User can provide actual costs later

2. **Total vs Breakdown Conflict:**
   - If total provided, ignore breakdown
   - Total takes priority
   - Breakdown fields can be disabled when total provided

3. **Negative Closing Costs:**
   - Should not occur (validation prevents)
   - Handle gracefully: Treat as $0

4. **Very High Closing Costs:**
   - May indicate unusual transaction
   - Still valid input
   - Affects break-even period

**Total Term Savings Edge Cases:**

1. **Negative Total Term Savings:**
   - Refinancing costs more than staying put
   - isBeneficial = false
   - Display clearly: "Refinancing would cost $X more"

2. **Zero Total Term Savings:**
   - Break-even exactly at term end
   - isBeneficial = false (strict interpretation)
   - Very rare scenario

3. **Very High Total Term Savings:**
   - Excellent refinancing opportunity
   - Large rate difference, long remaining term
   - Clearly beneficial

**Market Rate Edge Cases:**

1. **Market Rate Unavailable:**
   - Market rate service returns null
   - Fallback to current rate
   - Analysis shows no benefit (current = new rate)
   - User can manually specify new rate

2. **Market Rate Higher Than Current:**
   - Refinancing not beneficial (rate increase)
   - Monthly savings negative
   - Break-even = Infinity
   - isBeneficial = false

3. **Market Rate Much Lower Than Current:**
   - Excellent refinancing opportunity
   - Large monthly savings
   - Short break-even period
   - High total term savings

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid mortgage ID, invalid closing costs input
- **401 Unauthorized:** User not authenticated
- **404 Not Found:** Mortgage not found or no active term
- **500 Internal Server Error:** Calculation error or unexpected error

**Frontend Error Handling:**

- Display user-friendly error messages
- Show loading states during analysis
- Handle network errors gracefully
- Fallback to default values if data unavailable
- Log errors for debugging

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero balance, zero months, etc.)
- Return appropriate error messages
- Use safe defaults where appropriate
- Log calculation errors for debugging

**Market Rate Error Handling:**

- Handle market rate unavailability
- Fallback to current rate (conservative)
- Show warning if market rate unavailable
- Allow manual rate input (future enhancement)

---

## Testing Considerations

### Unit Tests

**Refinance Benefit Calculation Tests:**
- `calculateRefinanceBenefit()`: Calculate correctly for beneficial scenarios
- `calculateRefinanceBenefit()`: Calculate correctly for non-beneficial scenarios
- Break-even calculation: Handle edge cases (zero savings, zero costs, etc.)
- Total term savings: Calculate correctly
- Beneficial determination: Correct logic (totalTermSavings > 0)
- Payment calculations: Current vs new payment accuracy

**Closing Costs Calculation Tests:**
- Total priority: If total provided, use total (ignore breakdown)
- Breakdown sum: Calculate total from breakdown components
- Default: Use $1,500 if no costs provided
- Validation: Handle negative values, invalid inputs

**RefinancingService Tests:**
- `analyzeRefinanceOpportunity()`: Complete analysis calculation
- Market rate integration: Fetch and use market rate correctly
- Penalty integration: Calculate and include penalty
- Closing costs handling: Provided, breakdown, default
- Edge cases: No active term, market rate unavailable, etc.

### Integration Tests

**Refinancing Analysis API:**
- Calculate analysis with default closing costs
- Calculate analysis with provided total closing costs
- Calculate analysis with breakdown closing costs
- Verify penalty included correctly
- Verify market rate used correctly
- Verify all calculations accurate

**Penalty Integration:**
- Penalty calculated using penalty service
- Penalty amount included in total costs
- Penalty included in break-even calculation
- Penalty displayed in analysis results

**Market Rate Integration:**
- Market rate fetched from Market Rate Service
- Market rate used as new rate
- Fallback to current rate if unavailable
- Market rate displayed correctly

**Mortgage Integration:**
- Mortgage data fetched correctly
- Active term identified correctly
- Remaining term months calculated correctly
- Payment calculations use correct data

### End-to-End Tests

**Refinancing Analysis E2E:**
1. User opens refinancing tab
2. Refinancing analysis card displayed (if beneficial)
3. User clicks "Calculate with Closing Costs"
4. Dialog opens with Closing Costs tab
5. User enters closing costs (total or breakdown)
6. User clicks "Calculate"
7. Analysis calculated and displayed
8. Results show: monthly savings, break-even, total term savings, beneficial indicator
9. User views detailed breakdown

**Closing Costs E2E:**
1. User opens refinancing analysis dialog
2. User enters total closing costs
3. Analysis recalculated with total
4. User switches to breakdown
5. User enters breakdown components
6. Total calculated from breakdown
7. Analysis recalculated with breakdown total

**Beneficial Determination E2E:**
1. Create mortgage with high rate (5.5%)
2. Set market rate low (3.5%)
3. Verify analysis shows beneficial = true
4. Verify break-even < 24 months
5. Verify total term savings > 0
6. Change market rate to higher than current (6.0%)
7. Verify analysis shows beneficial = false
8. Verify break-even = Infinity
9. Verify total term savings < 0

---

## Future Enhancements

### Known Limitations

1. **Cash-Out Refinancing:**
   - Currently analyzes rate-based refinancing only
   - Does not model borrowing additional funds
   - Could add cash-out amount to analysis
   - Would require new payment calculation with increased balance

2. **Amortization Extension:**
   - Currently keeps same amortization period
   - Does not model extending amortization
   - Could add amortization extension option
   - Would affect monthly payment calculation

3. **Multiple Rate Scenarios:**
   - Currently compares to single market rate
   - Could compare to multiple term options (1-year, 3-year, 5-year)
   - Could show best refinancing option
   - Could add rate scenario comparison

4. **Refinancing History:**
   - Currently no history of past refinancing analyses
   - Could track refinancing analysis history
   - Could compare past vs current opportunities
   - Could track refinancing decisions

### Potential Improvements

**Enhanced Analysis:**
- Cash-out refinancing modeling (borrowing more)
- Amortization extension scenarios
- Multiple rate term comparison (1-year vs 3-year vs 5-year)
- Refinancing history and tracking

**Advanced Features:**
- Refinancing recommendation engine (automated suggestions)
- Refinancing opportunity alerts (when rates drop significantly)
- Refinancing scenario planning (future refinancing events)
- Refinancing comparison tool (compare multiple scenarios)

**User Experience:**
- Refinancing wizard (guided refinancing workflow)
- Refinancing checklist (tasks to complete)
- Refinancing calculator (standalone tool)
- Refinancing educational content

**Integration Enhancements:**
- Refinancing in scenario planning (already implemented for events)
- Refinancing projections over time
- Refinancing optimization recommendations
- Refinancing vs HELOC comparison

---

**End of Feature Specification**

