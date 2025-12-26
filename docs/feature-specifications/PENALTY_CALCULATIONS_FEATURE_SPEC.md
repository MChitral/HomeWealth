# Penalty Calculations Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Mortgage penalties are critical financial factors in renewal, refinancing, and early termination decisions. Accurately calculating penalties can save homeowners thousands of dollars and prevent costly mistakes. The Penalty Calculations feature provides:

- **Multiple Calculation Methodologies:** Support for different IRD calculation methods used by Canadian lenders
- **Accurate Estimates:** Penalty calculations based on current balances, rates, and market conditions
- **Method Selection:** Ability to choose appropriate calculation method based on lender and mortgage type
- **Open/Closed Mortgage Handling:** Automatic detection and zero-penalty handling for open mortgages
- **Variable Rate Support:** Correct penalty calculation for variable rate mortgages (3-month interest)
- **Greater-of Rule:** Standard Canadian rule application (IRD vs 3-month interest)

### Market Context

**Canadian Mortgage Penalty Market:**

- **Penalty Types:** IRD (Interest Rate Differential) and 3-month interest are the two primary methods
- **"Greater of" Rule:** Most Canadian lenders use the greater of IRD or 3-month interest
- **IRD Variations:** Different lenders use different comparison rates (Posted, Discounted, Origination Date)
- **Open Mortgages:** Open mortgages typically have minimal or zero penalties
- **Variable Rate Penalties:** Variable rate mortgages typically use 3-month interest (not IRD)

**Industry Statistics:**

- Typical penalty range: $1,500-$10,000 (varies by balance, rate difference, remaining term)
- IRD penalties can be 5-10x higher than 3-month interest in falling rate environments
- Penalty calculation disputes are common source of borrower-lender conflicts
- Accuracy critical: Small calculation errors can result in thousands of dollars difference

**Regulatory Context:**

- OSFI (Office of the Superintendent of Financial Institutions) requires clear penalty disclosure
- Lenders must provide penalty quotes upon request
- Penalty calculation methodology must be disclosed in mortgage agreements
- Borrowers have right to challenge penalty calculations

### Strategic Positioning

- **Core Feature:** Penalty calculation is essential for renewal and refinancing decisions
- **Competitive Differentiation:** Multiple IRD methodologies and lender-specific support exceeds basic tools
- **User Trust:** Accurate penalty calculations build user confidence and reduce costly mistakes
- **Integration Value:** Penalties are critical inputs for renewal workflow, refinancing analysis, and scenario planning

---

## Domain Overview

### Penalty Fundamentals

**Mortgage Penalty** is a fee charged by lenders when borrowers break their mortgage term before the term end date. Key characteristics:

1. **When Penalties Apply:**
   - Early renewal (breaking term before end date)
   - Refinancing (borrowing more or changing terms)
   - Switching lenders
   - Paying off mortgage completely before term end
   - **Exception:** Open mortgages typically have minimal/zero penalties

2. **Penalty Types:**
   - **IRD (Interest Rate Differential):** Compensation for lender's lost interest income
   - **3-Month Interest:** Simple interest calculation for 3 months
   - **"Greater of" Rule:** Lender charges the higher of IRD or 3-month interest

3. **Factors Affecting Penalties:**
   - Current mortgage balance
   - Current interest rate
   - Market/comparison rate
   - Remaining term length (months)
   - Mortgage type (fixed vs variable, open vs closed)
   - Lender's calculation methodology

### Interest Rate Differential (IRD)

**What Is IRD?**

**Interest Rate Differential (IRD)** compensates the lender for the difference between the borrower's current rate and the rate the lender could charge today for the remaining term.

**Key Concept:**
- If current rate > market rate → Lender loses money by re-lending at lower rate → Penalty applies
- If current rate ≤ market rate → Lender can charge same or higher rate → No IRD (or IRD = 0)

**IRD Calculation Formula:**

```
IRD = Balance × (CurrentRate - ComparisonRate) × RemainingYears

Where:
  - Balance = Current mortgage balance
  - CurrentRate = Borrower's current mortgage rate
  - ComparisonRate = Rate lender would charge today for remaining term
  - RemainingYears = Remaining months / 12
```

**IRD Calculation Methodologies:**

Different lenders use different comparison rates, leading to different IRD methodologies:

1. **Posted Rate Methodology:**
   - Comparison rate = Lender's posted rate for remaining term
   - Posted rate is lender's advertised rate (often higher than discounted rate)
   - Typically results in higher IRD penalties
   - Used by: Major banks (varies by lender)

2. **Discounted Rate Methodology:**
   - Comparison rate = Lender's discounted rate (what borrower actually pays)
   - More borrower-friendly (typically lower penalties)
   - Used by: Some lenders (less common)

3. **Origination Date Comparison:**
   - Comparison rate = Rate that was available at mortgage origination for remaining term
   - Historical rate comparison
   - Less common methodology
   - Used by: Fewer lenders

**IRD Edge Cases:**

- If comparison rate ≥ current rate → IRD = 0 (no penalty from IRD)
- If remaining term = 0 → IRD = 0 (no remaining term)
- If balance = 0 → IRD = 0 (no balance)

### 3-Month Interest Penalty

**What Is 3-Month Interest?**

**3-Month Interest** is a simple interest calculation representing three months of interest on the current balance.

**Calculation Formula:**

```
3-Month Interest = Balance × AnnualRate × (3 / 12)

Where:
  - Balance = Current mortgage balance
  - AnnualRate = Current annual interest rate
```

**Example:**
- Balance: $500,000
- Rate: 5.0% (0.05)
- 3-Month Interest = $500,000 × 0.05 × 0.25 = $6,250

**When It Applies:**
- Variable rate mortgages (standard method)
- Fixed rate mortgages (as part of "greater of" rule)
- Short remaining terms (where IRD would be low)

### "Greater of" Rule

**Standard Canadian Rule:**

Most Canadian lenders charge the **greater of**:
- IRD penalty
- 3-month interest penalty

**Logic:**
```
If IRD > 3-Month Interest:
  Penalty = IRD
Else:
  Penalty = 3-Month Interest
```

**Why This Rule Exists:**
- Protects lenders from losing money (IRD compensates for rate differences)
- Provides minimum penalty floor (3-month interest)
- Standard practice across Canadian mortgage industry

### Open vs Closed Mortgages

**Open Mortgages:**

- **Penalty:** Minimal or zero (typically $0)
- **Purpose:** Flexibility for borrowers who may need to break mortgage
- **Trade-off:** Higher interest rates (typically 0.5-1.0% higher than closed)
- **Use Case:** Borrowers expecting to sell, refinance, or pay off early

**Closed Mortgages:**

- **Penalty:** Full penalty calculation (IRD or 3-month interest)
- **Purpose:** Lock in lower rates with commitment to term
- **Trade-off:** Lower rates but penalties if broken early
- **Use Case:** Most mortgages (standard option)

**Automatic Detection:**
- System detects `openClosedMortgageType` field in mortgage record
- If "open" → Penalty automatically set to $0
- Overrides any other calculation method

### Variable Rate Mortgage Penalties

**Variable Rate Penalty Rule:**

Variable rate mortgages (both VRM-Changing and VRM-Fixed-Payment) typically use:
- **3-Month Interest** (not IRD)
- Rationale: Variable rates change with Prime, so IRD doesn't apply

**Calculation:**
- Same as standard 3-month interest calculation
- Uses current effective rate (Prime + Spread)

**Exception:**
- Some lenders may have different rules
- Always verify with lender for specific terms

### Canadian Lender Conventions

**Common IRD Methodologies by Lender:**

- **RBC (Royal Bank of Canada):** Typically Posted Rate methodology
- **TD (Toronto-Dominion Bank):** Posted Rate methodology
- **BMO (Bank of Montreal):** Posted Rate methodology
- **Scotiabank:** Posted Rate methodology
- **CIBC:** Posted Rate methodology
- **Credit Unions:** May use Discounted Rate methodology
- **Alternative Lenders:** Varies by lender

**Important Note:**
- Lender methodologies can change over time
- Specific mortgage agreements may specify methodology
- Actual penalties should be verified with lender

**Penalty Disclosure Requirements:**
- Lenders must provide penalty quotes upon request
- Penalty calculation methodology must be disclosed in mortgage agreement
- Borrowers have right to request detailed penalty breakdown

---

## User Personas & Use Cases

### Persona 1: Renewal Planner (Considering Early Renewal)

**Profile:**
- Mortgage term not yet expired
- Considering early renewal for better rates
- Needs to understand penalty cost vs savings

**Use Cases:**
- Calculate penalty for breaking current term
- Compare penalty cost to potential savings from new rate
- Evaluate break-even analysis (when savings exceed penalty)
- Test different renewal scenarios
- Get penalty estimate before contacting lender

**Pain Points Addressed:**
- Uncertainty about penalty amount
- Need to estimate costs before committing
- Understanding if early renewal is worth it

### Persona 2: Refinancer (Borrowing More or Changing Terms)

**Profile:**
- Planning to refinance mortgage
- May be borrowing additional funds
- Needs accurate penalty estimate for budgeting

**Use Cases:**
- Calculate penalty for refinancing
- Include penalty in total refinancing costs
- Compare refinancing options (stay vs switch)
- Budget for closing costs + penalty

**Pain Points Addressed:**
- Accurate penalty estimate for financial planning
- Understanding total refinancing costs
- Comparing refinancing options accurately

### Persona 3: Lender Method Explorer (Understanding Penalties)

**Profile:**
- Wants to understand different penalty calculation methods
- May be comparing lenders
- Needs to understand why penalties vary

**Use Cases:**
- Compare penalties using different IRD methodologies
- Understand Posted Rate vs Discounted Rate impact
- See breakdown of IRD vs 3-month interest
- Learn about "greater of" rule

**Pain Points Addressed:**
- Confusion about why penalties differ
- Need to understand lender methodologies
- Educational value

### Persona 4: Mortgage Switcher (Changing Lenders)

**Profile:**
- Considering switching to different lender
- Needs penalty estimate from current lender
- Comparing switching costs vs benefits

**Use Cases:**
- Calculate penalty for breaking current term
- Compare penalty + closing costs to new lender benefits
- Evaluate break-even period for switching
- Make informed switching decision

**Pain Points Addressed:**
- Accurate penalty estimate for cost-benefit analysis
- Understanding if switching is financially beneficial
- Planning for switching costs

---

## Feature Requirements

### Data Model Requirements

**Mortgages Table (`mortgages`):**

- `openClosedMortgageType` (text, optional) - "open" | "closed" | null (null = closed by default)
- `lenderName` (text, optional) - Lender name for methodology selection

**Mortgage Terms Table (`mortgageTerms`):**

- `penaltyCalculationMethod` (text, optional) - Penalty calculation method:
  - "ird_posted_rate"
  - "ird_discounted_rate"
  - "ird_origination_comparison"
  - "three_month_interest"
  - "open_mortgage"
  - "variable_rate"
- `termType` (text) - "fixed" | "variable-changing" | "variable-fixed" (affects penalty calculation)
- `fixedRate` (decimal) - Fixed rate (for fixed-rate mortgages)
- `primeRate` (decimal) - Prime rate (for variable-rate mortgages)
- `lockedSpread` (decimal) - Spread (for variable-rate mortgages)

**Penalty Calculation Input (Runtime):**

- `balance` (number) - Current mortgage balance
- `currentRate` (decimal) - Current interest rate
- `marketRate` (decimal) - Market/comparison rate
- `remainingMonths` (integer) - Months remaining in term
- `termType` (text) - Term type
- `penaltyCalculationMethod` (text, optional) - Specific method to use
- `openClosedMortgageType` (text, optional) - Override mortgage type

**Penalty Calculation Output:**

- `threeMonthPenalty` (number) - 3-month interest penalty amount
- `irdPenalty` (number) - IRD penalty amount
- `totalPenalty` (number) - Final penalty (greater of IRD or 3-month)
- `method` (string) - Method applied (e.g., "IRD (Posted Rate)", "3-Month Interest")
- `breakdown` (object) - Detailed breakdown of calculations
- `isOpenMortgage` (boolean, optional) - Whether mortgage is open
- `mortgageType` (string, optional) - Detected mortgage type
- `note` (string, optional) - Additional notes (e.g., "Penalty is $0 because this is an open mortgage")

### Business Logic Requirements

**Penalty Calculation Logic:**

1. **Open Mortgage Detection:**
   - Check `openClosedMortgageType` field
   - If "open" → Return penalty = $0, method = "Open Mortgage"
   - Override any user-selected method
   - Log auto-detection for transparency

2. **Variable Rate Mortgage Handling:**
   - If term type is "variable-changing" or "variable-fixed"
   - Default to 3-month interest method
   - Use current effective rate (Prime + Spread)
   - Do not apply IRD (variable rates don't use IRD)

3. **Method Selection Priority:**
   - Open mortgage → Open mortgage method (override)
   - User-specified method → Use specified method
   - Variable rate → 3-month interest (variable)
   - Default → Standard calculation ("greater of" rule)

4. **IRD Calculation (Posted Rate Methodology):**
   - Comparison rate = Posted rate (lender's advertised rate)
   - Formula: `IRD = Balance × (CurrentRate - PostedRate) × RemainingYears`
   - If PostedRate ≥ CurrentRate → IRD = 0

5. **IRD Calculation (Discounted Rate Methodology):**
   - Comparison rate = Discounted rate (what borrower pays)
   - Formula: `IRD = Balance × (CurrentRate - DiscountedRate) × RemainingYears`
   - If DiscountedRate ≥ CurrentRate → IRD = 0

6. **IRD Calculation (Origination Date Comparison):**
   - Comparison rate = Rate available at origination for remaining term
   - Formula: `IRD = Balance × (CurrentRate - OriginationRate) × RemainingYears`
   - If OriginationRate ≥ CurrentRate → IRD = 0

7. **3-Month Interest Calculation:**
   - Formula: `3-Month Interest = Balance × CurrentRate × (3 / 12)`
   - Uses current mortgage rate
   - Simple interest calculation

8. **"Greater of" Rule:**
   - Calculate both IRD and 3-month interest
   - Compare values
   - Apply greater value as penalty
   - Return method name indicating which was applied

**Market Rate Integration:**

1. **Market Rate Source:**
   - Fetched from Market Rate Service
   - Based on term type and term years
   - Updated regularly (daily/weekly)

2. **Market Rate Usage:**
   - Used as comparison rate for IRD calculations
   - Default comparison rate if no specific rate provided
   - Fallback to current rate if market rate unavailable

3. **Market Rate Selection:**
   - Match term type (fixed vs variable)
   - Match term years (1, 2, 3, 5, 7, 10)
   - Use most recent available rate

**Penalty Calculator Workflow:**

1. **Input Collection:**
   - Balance (from mortgage or manual input)
   - Current rate (from term or manual input)
   - Market rate (auto-fetched or manual input)
   - Remaining months (calculated or manual input)
   - Term type (from term or selection)
   - Penalty calculation method (optional selection)
   - Open/closed type (auto-detected or manual)

2. **Validation:**
   - All required fields must be positive numbers
   - Rates must be reasonable (e.g., 0% to 20%)
   - Remaining months must be > 0
   - Balance must be > 0

3. **Calculation:**
   - Apply penalty calculation logic
   - Calculate both IRD and 3-month interest
   - Apply "greater of" rule (if applicable)
   - Return results with breakdown

4. **Results Display:**
   - Total penalty amount
   - Method applied
   - Breakdown (IRD amount, 3-month amount, which applied)
   - Notes (if open mortgage, auto-detection, etc.)

### Calculation Requirements

**IRD Calculation Formula:**

```
IRD = Balance × (CurrentRate - ComparisonRate) × RemainingYears

Where:
  - Balance = Current mortgage balance (dollars)
  - CurrentRate = Current annual interest rate (decimal, e.g., 0.05 for 5%)
  - ComparisonRate = Comparison rate (decimal, varies by methodology)
  - RemainingYears = Remaining months / 12

Edge Cases:
  - If ComparisonRate ≥ CurrentRate → IRD = 0
  - If RemainingYears ≤ 0 → IRD = 0
  - If Balance ≤ 0 → IRD = 0
```

**3-Month Interest Formula:**

```
3-Month Interest = Balance × AnnualRate × (3 / 12)

Where:
  - Balance = Current mortgage balance (dollars)
  - AnnualRate = Current annual interest rate (decimal)

Edge Cases:
  - If Balance ≤ 0 → 3-Month Interest = 0
  - If AnnualRate ≤ 0 → 3-Month Interest = 0
```

**"Greater of" Rule:**

```
If IRD > 3-Month Interest:
  Penalty = IRD
  Method = "IRD ([Methodology])"
Else:
  Penalty = 3-Month Interest
  Method = "3-Month Interest"
```

**Open Mortgage Penalty:**

```
Penalty = 0
Method = "Open Mortgage"
```

**Variable Rate Penalty:**

```
Penalty = 3-Month Interest
Method = "3-Month Interest (Variable)"

Where:
  - Uses current effective rate (Prime + Spread)
  - IRD not applicable for variable rates
```

### Validation Requirements

**Input Validation:**

- `balance`: Required, must be positive number, reasonable range (e.g., $1 to $10,000,000)
- `currentRate`: Required, must be positive number, reasonable range (0% to 20%)
- `marketRate`: Required for IRD calculations, must be positive number, reasonable range (0% to 20%)
- `remainingMonths`: Required, must be positive integer, reasonable range (1 to 120 months)
- `termType`: Required, must be "fixed", "variable-changing", or "variable-fixed"
- `penaltyCalculationMethod`: Optional, must be valid method enum value
- `openClosedMortgageType`: Optional, must be "open", "closed", or null

**Business Rules:**

- Open mortgages always return $0 penalty (override other methods)
- Variable rate mortgages default to 3-month interest (not IRD)
- IRD only applies if current rate > comparison rate
- Remaining months must be > 0 for IRD calculation
- Balance must be > 0 for all calculations

**Error Handling:**

- Invalid inputs return validation errors
- Missing required fields return validation errors
- Calculation errors return 500 error with details
- Market rate unavailability: Use current rate as fallback or return error

### Integration Requirements

**Market Rate Service Integration:**
- Fetch market rates by term type and term years
- Provide fallback if market rate unavailable
- Support manual market rate input (override)

**Mortgage Service Integration:**
- Fetch mortgage details (balance, open/closed type, lender)
- Fetch term details (rate, term type, remaining months)
- Auto-populate calculator with mortgage data

**Renewal Service Integration:**
- Penalty estimates included in renewal status
- Used in renewal recommendations
- Break-even calculations include penalties

**Refinancing Service Integration:**
- Penalty included in refinancing cost analysis
- Break-even calculations include penalties
- Total cost = Penalty + Closing Costs

**UI Integration:**
- Penalty calculator dialog in renewal tab
- Penalty estimates in renewal workflow
- Penalty breakdown in refinancing analysis
- Standalone penalty calculator tool

---

## User Stories & Acceptance Criteria

### Epic: Penalty Calculation

**Story 1: Calculate Standard Penalty**
- **As a** homeowner
- **I want to** calculate my mortgage penalty using standard "greater of" rule
- **So that** I can estimate the cost of breaking my mortgage term

**Acceptance Criteria:**
- ✅ Calculator calculates both IRD and 3-month interest
- ✅ Returns the greater of the two amounts
- ✅ Displays which method was applied (IRD or 3-Month Interest)
- ✅ Shows breakdown of both calculations
- ✅ Handles edge cases (IRD = 0, equal amounts, etc.)

**Story 2: Calculate IRD Using Posted Rate**
- **As a** homeowner
- **I want to** calculate penalty using Posted Rate methodology
- **So that** I can estimate penalty for lenders using this method

**Acceptance Criteria:**
- ✅ Calculator uses posted rate as comparison rate
- ✅ IRD calculated correctly: `Balance × (CurrentRate - PostedRate) × RemainingYears`
- ✅ Returns greater of IRD or 3-month interest
- ✅ Displays method as "IRD (Posted Rate)"
- ✅ Shows IRD amount in breakdown

**Story 3: Calculate IRD Using Discounted Rate**
- **As a** homeowner
- **I want to** calculate penalty using Discounted Rate methodology
- **So that** I can estimate penalty for lenders using this method

**Acceptance Criteria:**
- ✅ Calculator uses discounted rate as comparison rate
- ✅ IRD calculated correctly: `Balance × (CurrentRate - DiscountedRate) × RemainingYears`
- ✅ Returns greater of IRD or 3-month interest
- ✅ Displays method as "IRD (Discounted Rate)"
- ✅ Shows IRD amount in breakdown

**Story 4: Calculate IRD Using Origination Comparison**
- **As a** homeowner
- **I want to** calculate penalty using Origination Date comparison
- **So that** I can estimate penalty for lenders using this method

**Acceptance Criteria:**
- ✅ Calculator uses origination rate as comparison rate
- ✅ IRD calculated correctly: `Balance × (CurrentRate - OriginationRate) × RemainingYears`
- ✅ Returns greater of IRD or 3-month interest
- ✅ Displays method as "IRD (Origination Comparison)"
- ✅ Shows IRD amount in breakdown

**Story 5: Calculate 3-Month Interest Penalty**
- **As a** homeowner
- **I want to** calculate 3-month interest penalty
- **So that** I can see the minimum penalty amount

**Acceptance Criteria:**
- ✅ Calculator calculates: `Balance × Rate × (3 / 12)`
- ✅ Displays method as "3-Month Interest"
- ✅ Shows 3-month interest amount in breakdown
- ✅ Works for both fixed and variable rate mortgages

**Story 6: Handle Open Mortgages**
- **As a** homeowner with open mortgage
- **I want to** see that my penalty is $0
- **So that** I understand there's no penalty for breaking my term

**Acceptance Criteria:**
- ✅ System detects open mortgage type
- ✅ Penalty automatically set to $0
- ✅ Method displayed as "Open Mortgage"
- ✅ Note explains: "Penalty is $0 because this is an open mortgage"
- ✅ Overrides any user-selected method

**Story 7: Handle Variable Rate Mortgages**
- **As a** homeowner with variable rate mortgage
- **I want to** see penalty calculated using 3-month interest
- **So that** I get accurate penalty estimate

**Acceptance Criteria:**
- ✅ System detects variable rate mortgage type
- ✅ Penalty uses 3-month interest (not IRD)
- ✅ Uses current effective rate (Prime + Spread)
- ✅ Method displayed as "3-Month Interest (Variable)"
- ✅ IRD not calculated for variable rates

### Epic: Penalty Calculator UI

**Story 8: Penalty Calculator Dialog**
- **As a** homeowner
- **I want to** use a penalty calculator dialog
- **So that** I can easily calculate my mortgage penalty

**Acceptance Criteria:**
- ✅ Calculator dialog opens from renewal tab or mortgage details
- ✅ Form fields: Balance, Current Rate, Market Rate, Remaining Months, Term Type, Method
- ✅ Auto-populates with mortgage/term data when available
- ✅ Market rate auto-fetched based on term type/years
- ✅ Calculate button triggers calculation
- ✅ Results displayed below form

**Story 9: Penalty Calculator Results**
- **As a** homeowner
- **I want to** see detailed penalty calculation results
- **So that** I understand how the penalty was calculated

**Acceptance Criteria:**
- ✅ Total penalty amount prominently displayed
- ✅ Method applied shown clearly
- ✅ Breakdown shows: IRD amount, 3-month interest amount, which was applied
- ✅ Notes displayed (if open mortgage, auto-detection, etc.)
- ✅ Results are clear and easy to understand

**Story 10: Penalty Method Selection**
- **As a** homeowner
- **I want to** select different penalty calculation methods
- **So that** I can compare penalties using different methodologies

**Acceptance Criteria:**
- ✅ Dropdown/select for penalty calculation method
- ✅ Options: Posted Rate, Discounted Rate, Origination Comparison, 3-Month Interest, Standard
- ✅ Method selection affects calculation
- ✅ Results update when method changes
- ✅ Default method selected based on mortgage/lender

**Story 11: Market Rate Integration**
- **As a** homeowner
- **I want to** have market rate auto-fetched
- **So that** I get accurate IRD calculations

**Acceptance Criteria:**
- ✅ Market rate fetched automatically based on term type and years
- ✅ Market rate displayed in form (editable)
- ✅ Refresh button to re-fetch market rate
- ✅ Loading state while fetching
- ✅ Error handling if market rate unavailable
- ✅ Manual override option

### Epic: Integration & Accuracy

**Story 12: Open/Closed Mortgage Auto-Detection**
- **As a** system
- **I want to** automatically detect open/closed mortgage type
- **So that** penalties are calculated correctly without user input

**Acceptance Criteria:**
- ✅ System checks `openClosedMortgageType` field in mortgage record
- ✅ If "open" → Penalty set to $0 automatically
- ✅ Auto-detection logged in results (transparency)
- ✅ User can override if needed (manual input)
- ✅ Detection works in calculator and renewal workflow

**Story 13: Penalty in Renewal Workflow**
- **As a** homeowner
- **I want to** see penalty estimates in renewal workflow
- **So that** I can factor penalties into renewal decisions

**Acceptance Criteria:**
- ✅ Renewal status includes estimated penalty
- ✅ Penalty shown in renewal comparison
- ✅ Penalty included in break-even calculations
- ✅ Penalty breakdown available in renewal workflow
- ✅ Links to penalty calculator for details

**Story 14: Penalty in Refinancing Analysis**
- **As a** homeowner
- **I want to** see penalty included in refinancing costs
- **So that** I can accurately assess refinancing options

**Acceptance Criteria:**
- ✅ Refinancing analysis includes penalty estimate
- ✅ Total cost = Penalty + Closing Costs
- ✅ Penalty included in break-even calculations
- ✅ Penalty breakdown available in refinancing workflow
- ✅ Links to penalty calculator for details

**Story 15: Accuracy Disclaimers**
- **As a** homeowner
- **I want to** understand that penalty estimates are approximations
- **So that** I know to verify with lender before making decisions

**Acceptance Criteria:**
- ✅ Disclaimer displayed in calculator results
- ✅ Note that actual penalties may vary
- ✅ Recommendation to verify with lender
- ✅ Explanation of methodology limitations
- ✅ Clear communication about estimate vs actual

---

## Technical Implementation Notes

### API Endpoints

**Penalty Calculation:**
- `POST /api/mortgages/calculate-penalty` - Calculate mortgage penalty
  - Body: `CalculatePenaltyRequest` (balance, currentRate, marketRate, remainingMonths, termType, penaltyCalculationMethod?, mortgageId?, openClosedMortgageType?)
  - Returns: `CalculatePenaltyResponse` (threeMonthPenalty, irdPenalty, totalPenalty, method, breakdown, isOpenMortgage?, mortgageType?, note?)

### Database Schema

**Mortgages Table (Relevant Fields):**
```sql
-- In mortgages table
open_closed_mortgage_type TEXT, -- "open" | "closed" | null (null = closed by default)
lender_name TEXT, -- Lender name for methodology selection
```

**Mortgage Terms Table (Relevant Fields):**
```sql
-- In mortgage_terms table
penalty_calculation_method TEXT, -- "ird_posted_rate", "ird_discounted_rate", "ird_origination_comparison", "three_month_interest", "open_mortgage", "variable_rate"
term_type TEXT NOT NULL, -- "fixed", "variable-changing", "variable-fixed"
fixed_rate DECIMAL(5,3), -- Fixed rate (for fixed-rate mortgages)
prime_rate DECIMAL(5,3), -- Prime rate (for variable-rate mortgages)
locked_spread DECIMAL(5,3), -- Spread (for variable-rate mortgages)
```

### Service Layer

**Penalty Calculation Functions:**
- `calculateThreeMonthInterestPenalty(balance, annualRate): number`
- `calculateIRDPenalty(balance, currentRate, comparisonRate, remainingMonths): number`
- `calculateIRDPostedRate(balance, currentRate, postedRate, remainingMonths): number`
- `calculateIRDDiscountedRate(balance, currentRate, discountedRate, remainingMonths): number`
- `calculateIRDOriginationComparison(balance, currentRate, originationRate, remainingMonths): number`
- `calculateVariableRatePenalty(balance, annualRate): number`
- `calculateOpenMortgagePenalty(): number` (returns 0)
- `calculateStandardPenalty(balance, currentRate, marketRate, remainingMonths): { penalty, method }`
- `calculatePenaltyByMethod(method, balance, currentRate, comparisonRate, remainingMonths, termType?): { penalty, method }`

### Calculation Functions

**3-Month Interest Calculation:**
```typescript
function calculateThreeMonthInterestPenalty(
  balance: number,
  annualRate: number
): number {
  if (balance < 0 || annualRate < 0) return 0;
  return balance * annualRate * (3 / 12);
}
```

**IRD Calculation (Generic):**
```typescript
function calculateIRDPenalty(
  balance: number,
  currentRate: number,
  comparisonRate: number,
  remainingMonths: number
): number {
  if (balance < 0 || currentRate < 0 || comparisonRate < 0 || remainingMonths <= 0) {
    return 0;
  }
  
  if (comparisonRate >= currentRate) {
    return 0; // No penalty if comparison rate >= current rate
  }
  
  const rateDifference = currentRate - comparisonRate;
  const remainingYears = remainingMonths / 12;
  return balance * rateDifference * remainingYears;
}
```

**Standard Penalty ("Greater of" Rule):**
```typescript
function calculateStandardPenalty(
  balance: number,
  currentRate: number,
  marketRate: number,
  remainingMonths: number
): { penalty: number; method: "IRD" | "3-Month Interest" } {
  const threeMonth = calculateThreeMonthInterestPenalty(balance, currentRate);
  const ird = calculateIRDPenalty(balance, currentRate, marketRate, remainingMonths);
  
  if (ird > threeMonth) {
    return { penalty: ird, method: "IRD" };
  } else {
    return { penalty: threeMonth, method: "3-Month Interest" };
  }
}
```

**Penalty by Method:**
```typescript
function calculatePenaltyByMethod(
  method: PenaltyCalculationMethod | null,
  balance: number,
  currentRate: number,
  comparisonRate: number,
  remainingMonths: number,
  termType?: "fixed" | "variable-changing" | "variable-fixed"
): { penalty: number; method: string } {
  // Open mortgage → $0
  if (method === "open_mortgage") {
    return { penalty: 0, method: "Open Mortgage" };
  }
  
  // Variable rate → 3-month interest
  if (method === "variable_rate" || termType?.startsWith("variable")) {
    return {
      penalty: calculateThreeMonthInterestPenalty(balance, currentRate),
      method: "3-Month Interest (Variable)",
    };
  }
  
  // 3-month interest only
  if (method === "three_month_interest") {
    return {
      penalty: calculateThreeMonthInterestPenalty(balance, currentRate),
      method: "3-Month Interest",
    };
  }
  
  // IRD methods
  let irdPenalty = 0;
  let methodName = "";
  
  switch (method) {
    case "ird_posted_rate":
      irdPenalty = calculateIRDPostedRate(balance, currentRate, comparisonRate, remainingMonths);
      methodName = "IRD (Posted Rate)";
      break;
    case "ird_discounted_rate":
      irdPenalty = calculateIRDDiscountedRate(balance, currentRate, comparisonRate, remainingMonths);
      methodName = "IRD (Discounted Rate)";
      break;
    case "ird_origination_comparison":
      irdPenalty = calculateIRDOriginationComparison(balance, currentRate, comparisonRate, remainingMonths);
      methodName = "IRD (Origination Comparison)";
      break;
  }
  
  // For IRD methods, compare with 3-month interest (greater of)
  const threeMonth = calculateThreeMonthInterestPenalty(balance, currentRate);
  if (irdPenalty > threeMonth) {
    return { penalty: irdPenalty, method: methodName };
  } else {
    return { penalty: threeMonth, method: "3-Month Interest" };
  }
}
```

### Frontend Components

**PenaltyCalculatorDialog:**
- Main dialog component
- Contains form and results
- Handles calculation submission
- Displays results

**PenaltyCalculatorForm:**
- Form fields: Balance, Current Rate, Market Rate, Remaining Months, Term Type, Method
- Auto-population from mortgage/term data
- Market rate fetching and display
- Validation

**PenaltyCalculatorResults:**
- Displays total penalty amount
- Shows method applied
- Breakdown of IRD and 3-month interest
- Notes and disclaimers

**usePenaltyCalculatorForm:**
- Form hook with validation
- Market rate integration
- Auto-population logic

### Data Flow

**Penalty Calculation Flow:**
1. User opens penalty calculator
2. Form auto-populates with mortgage/term data (if available)
3. Market rate fetched automatically (based on term type/years)
4. User adjusts inputs if needed
5. User selects penalty calculation method (optional)
6. User clicks "Calculate"
7. Frontend sends request to `/api/mortgages/calculate-penalty`
8. Backend:
   - Validates inputs
   - Detects open/closed mortgage type
   - Determines calculation method (open override, user selection, or default)
   - Calculates penalty using selected method
   - Returns results with breakdown
9. Frontend displays results
10. User views breakdown and notes

**Open Mortgage Detection Flow:**
1. Backend receives calculation request
2. Checks `openClosedMortgageType` field (from mortgage record or request parameter)
3. If "open" → Sets method to "open_mortgage"
4. Returns penalty = $0 with note
5. Frontend displays note: "Penalty is $0 because this is an open mortgage"

**Market Rate Integration Flow:**
1. User selects term type and term years in form
2. Frontend triggers market rate fetch
3. API: `GET /api/market-rates?rateType={termType}&termYears={termYears}`
4. Market Rate Service fetches current market rate
5. Rate returned to frontend
6. Frontend populates market rate field (editable)
7. Market rate used as comparison rate in IRD calculation

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Calculation Edge Cases:**

1. **Zero Balance:**
   - All penalties = $0
   - Return $0 with appropriate method

2. **Zero Remaining Months:**
   - IRD = $0 (no remaining term)
   - 3-month interest still calculated
   - Penalty = 3-month interest

3. **Comparison Rate ≥ Current Rate:**
   - IRD = $0 (no loss for lender)
   - Penalty = 3-month interest (if greater)
   - Method = "3-Month Interest"

4. **Equal IRD and 3-Month Interest:**
   - Both calculations equal
   - Return either (typically IRD)
   - Method indicates which was applied

5. **Negative Rates (Edge Case):**
   - Rates should never be negative
   - Validation should prevent negative inputs
   - If negative, return 0 or error

6. **Very Large Balances:**
   - Calculations handle large numbers
   - Precision maintained
   - No overflow errors

**Open Mortgage Edge Cases:**

1. **Open Mortgage with Method Selected:**
   - User selects IRD method
   - System detects open mortgage
   - Override to open_mortgage method
   - Return $0 with note

2. **Open Mortgage Detection Failure:**
   - Mortgage type not detected
   - Fallback to standard calculation
   - User can manually select open_mortgage method

**Variable Rate Edge Cases:**

1. **Variable Rate with IRD Method Selected:**
   - User selects IRD method
   - System detects variable rate
   - Override to 3-month interest
   - Return 3-month interest with variable note

2. **Variable Rate Prime + Spread:**
   - Effective rate = Prime + Spread
   - Use effective rate for 3-month calculation
   - Handle negative spreads correctly

**Market Rate Edge Cases:**

1. **Market Rate Unavailable:**
   - Market rate service returns null
   - Option 1: Use current rate as fallback
   - Option 2: Return error requiring manual input
   - Option 3: Show warning but allow calculation

2. **Market Rate Mismatch:**
   - Market rate for wrong term type/years
   - Validate market rate matches term
   - Warn user if mismatch detected

3. **Historical Market Rates:**
   - System may not have historical rates
   - Origination comparison may require user input
   - Clear instructions for user

**Method Selection Edge Cases:**

1. **Invalid Method:**
   - User provides invalid method enum value
   - Fallback to standard calculation
   - Log warning

2. **Method Not Specified:**
   - No method provided
   - Use standard calculation (greater of)
   - Default behavior

3. **Method Incompatible with Term Type:**
   - Fixed rate method on variable mortgage
   - System handles gracefully (override or warn)
   - Use appropriate method

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid input data (missing required fields, invalid values, negative numbers)
- **401 Unauthorized:** User not authenticated
- **500 Internal Server Error:** Calculation error or unexpected error
- **503 Service Unavailable:** Market rate service unavailable

**Frontend Error Handling:**

- Display user-friendly error messages
- Show validation errors inline
- Handle network errors gracefully
- Fallback to manual input if auto-population fails
- Log errors for debugging

**Validation Error Messages:**

- "Balance must be a positive number"
- "Interest rate must be between 0% and 20%"
- "Remaining months must be greater than 0"
- "Market rate is required for IRD calculations"
- "Invalid penalty calculation method"

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero balance, zero months, etc.)
- Return appropriate error messages
- Log calculation errors for debugging
- Use safe defaults where appropriate

---

## Testing Considerations

### Unit Tests

**Penalty Calculation Tests:**
- `calculateThreeMonthInterestPenalty()`: Calculate correctly for various balances and rates
- `calculateIRDPenalty()`: Calculate correctly when current rate > comparison rate
- `calculateIRDPenalty()`: Return 0 when comparison rate >= current rate
- `calculateIRDPostedRate()`: Calculate correctly using posted rate
- `calculateIRDDiscountedRate()`: Calculate correctly using discounted rate
- `calculateIRDOriginationComparison()`: Calculate correctly using origination rate
- `calculateStandardPenalty()`: Return greater of IRD or 3-month interest
- `calculateOpenMortgagePenalty()`: Always return 0
- `calculateVariableRatePenalty()`: Calculate using 3-month interest
- `calculatePenaltyByMethod()`: Apply correct method based on input
- Edge cases: Zero balance, zero months, negative rates, equal amounts

**Open/Closed Detection Tests:**
- Detect open mortgage correctly
- Override method when open detected
- Handle null/undefined mortgage type
- Manual override functionality

**Variable Rate Handling Tests:**
- Detect variable rate correctly
- Use 3-month interest (not IRD)
- Handle Prime + Spread calculation
- Override IRD method selection

### Integration Tests

**Penalty Calculator API:**
- Calculate penalty with valid inputs
- Handle open mortgage detection
- Handle variable rate detection
- Return correct breakdown
- Handle invalid inputs gracefully

**Market Rate Integration:**
- Fetch market rate correctly
- Handle market rate unavailability
- Use market rate in IRD calculation
- Fallback to current rate if needed

**Mortgage Integration:**
- Auto-populate calculator with mortgage data
- Detect open/closed type from mortgage
- Fetch term details correctly
- Handle missing data gracefully

### End-to-End Tests

**Penalty Calculator E2E:**
1. User opens penalty calculator from renewal tab
2. Form auto-populates with mortgage data
3. Market rate fetched automatically
4. User adjusts inputs
5. User selects penalty calculation method
6. User clicks "Calculate"
7. Results displayed with breakdown
8. User views notes and disclaimers

**Open Mortgage E2E:**
1. User opens penalty calculator for open mortgage
2. System detects open mortgage type
3. Penalty automatically set to $0
4. Note displayed: "Penalty is $0 because this is an open mortgage"
5. Method shows as "Open Mortgage"

**Variable Rate E2E:**
1. User opens penalty calculator for variable rate mortgage
2. System detects variable rate type
3. Penalty uses 3-month interest (not IRD)
4. Method shows as "3-Month Interest (Variable)"
5. Effective rate (Prime + Spread) used correctly

**Renewal Workflow Integration E2E:**
1. User views renewal status
2. Estimated penalty displayed
3. User clicks penalty to open calculator
4. Calculator pre-filled with renewal data
5. User can adjust and recalculate
6. Results used in renewal decision

---

## Future Enhancements

### Known Limitations

1. **Lender-Specific Rules:**
   - Currently uses standard calculation methods
   - Some lenders have unique rules or variations
   - Could add lender-specific calculation profiles
   - Could store lender rules in database

2. **Historical Rate Data:**
   - Origination comparison requires historical rates
   - System may not have complete historical data
   - Could integrate historical rate sources
   - Could allow manual input of historical rates

3. **Complex IRD Calculations:**
   - Some lenders use more complex IRD formulas
   - May include additional factors (discounts, adjustments)
   - Current implementation uses standard formula
   - Could add advanced IRD calculation options

4. **Penalty Negotiation:**
   - Some lenders allow penalty negotiation
   - System shows calculated penalty (not negotiated)
   - Could add penalty negotiation tracking
   - Could add "negotiated penalty" field

### Potential Improvements

**Enhanced Accuracy:**
- Lender-specific calculation profiles
- Historical rate database
- More complex IRD calculation methods
- Penalty quote tracking and comparison

**User Experience:**
- Penalty comparison tool (compare multiple methods)
- Penalty history tracking
- Penalty quote requests from lenders
- Penalty negotiation workflow

**Integration Enhancements:**
- Penalty in scenario planning
- Penalty in what-if analysis
- Penalty projections over time
- Penalty optimization recommendations

**Educational Content:**
- IRD methodology explanations
- Lender methodology comparison
- Penalty negotiation tips
- Common penalty scenarios

**Advanced Features:**
- Penalty quote request system
- Lender penalty quote comparison
- Penalty negotiation tracking
- Penalty dispute documentation

---

**End of Feature Specification**

