# Blend and Extend Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Blend and extend is a unique Canadian mortgage renewal option that allows homeowners to blend their existing interest rate with the current market rate while optionally extending their amortization period. This feature provides:

- **Payment Reduction:** Lower monthly payments through blended rate and amortization extension
- **Renewal Flexibility:** Alternative to standard renewal or refinancing
- **Rate Preservation:** Maintain some benefit from existing lower rate (if applicable)
- **Cash Flow Relief:** Reduce payment burden when facing financial constraints
- **Strategic Option:** Compare blend-and-extend vs standard renewal vs refinancing

### Market Context

**Canadian Mortgage Blend-and-Extend Market:**

- **Blend-and-Extend Definition:** Renewal option that blends old rate with new market rate and extends amortization
- **Common Use Case:** Renewal time when homeowners want lower payments or need cash flow relief
- **Availability:** Most Canadian lenders offer blend-and-extend (with conditions)
- **When Beneficial:** When market rates have increased significantly, extending amortization needed

**Industry Statistics:**

- Blend-and-extend used by 10-15% of homeowners at renewal
- Average payment reduction: 10-20% (from extension + blended rate)
- Common scenario: Market rates increased 1-2% since original term
- Typical extension: 20 years remaining → 25-30 years (back to original or longer)
- Blend-and-extend vs standard renewal: Payment savings but longer amortization

**Strategic Importance:**

- Blend-and-extend is unique Canadian renewal option (competitive differentiator)
- Provides alternative renewal strategy for homeowners
- Helps homeowners manage cash flow during rate increases
- Integration with renewal workflow essential

### Strategic Positioning

- **Unique Canadian Feature:** Blend-and-extend is Canada-specific renewal option
- **User Value:** Lower payments provide immediate financial relief
- **Integration Value:** Integrates with renewal workflow, refinancing analysis, and scenario planning
- **Educational Opportunity:** Raises awareness of blend-and-extend option (many homeowners unaware)

---

## Domain Overview

### Blend-and-Extend Fundamentals

**Blend-and-Extend** is a renewal option that combines:
1. **Blended Rate:** Weighted average of old rate and new market rate
2. **Extended Amortization:** Option to extend amortization period (typically back to original or longer)

**Key Characteristics:**

1. **When Blend-and-Extend Occurs:**
   - At mortgage renewal time
   - Homeowner chooses blend-and-extend instead of standard renewal
   - Old rate blended with new market rate
   - Amortization can be extended (optional)

2. **Blend-and-Extend Benefits:**
   - **Lower Payment:** Blended rate + extended amortization reduces payment
   - **Rate Benefit:** Some preservation of old rate benefit (if lower than market)
   - **Cash Flow Relief:** Lower payments free up monthly cash

3. **Blend-and-Extend Trade-offs:**
   - **Longer Amortization:** More time to pay off mortgage
   - **More Interest:** Longer term means more total interest paid
   - **Less Principal:** Each payment has less principal reduction

### Blended Rate Calculation

**What Is Blended Rate?**

The **blended rate** is a weighted average of the old interest rate and the new market rate, where the weighting is based on the time remaining in the old term relative to the new term length.

**Calculation Formula:**

```
Blended Rate = Old Rate × Weight + New Market Rate × (1 - Weight)

Where:
  Weight = Remaining Term Months / (Remaining Term Months + New Term Months)
  New Term Months = Typically 60 months (5 years)
```

**Key Points:**

- Weight favors old rate if more time remaining in old term
- Weight favors new rate if less time remaining in old term
- Blended rate is between old rate and new market rate
- Standard new term: 5 years (60 months) - typical Canadian term

**Example:**

```
Old Rate: 3.5%
New Market Rate: 5.5%
Remaining Term Months: 12 months (1 year left)
New Term Months: 60 months (5 years)

Weight = 12 / (12 + 60) = 12 / 72 = 0.167 (16.7%)

Blended Rate = 3.5% × 0.167 + 5.5% × 0.833
             = 0.584% + 4.582%
             = 5.166% (approximately)
```

**Rate Comparison:**

- Old Rate: 3.5%
- Blended Rate: 5.166%
- New Market Rate: 5.5%

The blended rate is between old and new, but closer to new (since most of term is ahead).

### Extended Amortization

**What Is Extended Amortization?**

**Extended amortization** means increasing the remaining amortization period back toward (or beyond) the original amortization period, reducing the monthly payment amount.

**Common Scenarios:**

1. **Extend to Original:**
   - Original: 25 years
   - Remaining: 20 years
   - Extended: 25 years (back to original)

2. **Extend Beyond Original:**
   - Original: 25 years
   - Remaining: 20 years
   - Extended: 30 years (if lender allows)

3. **Extend from Remaining:**
   - Remaining: 15 years
   - Extended: 25 years (+10 years)

**Impact on Payment:**

Extending amortization reduces monthly payment because:
- Same balance spread over more months
- More payments (lower amount per payment)
- Less principal per payment
- More total interest over lifetime

**Example:**

```
Balance: $400,000
Rate: 5.166% (blended)
Remaining Amortization: 20 years (240 months)
Extended Amortization: 25 years (300 months)

Payment at 20 years: ~$2,650/month
Payment at 25 years: ~$2,375/month
Payment Reduction: ~$275/month (10.4%)
```

### Blend-and-Extend vs Standard Renewal

**Key Differences:**

1. **Standard Renewal:**
   - New market rate applies to entire balance
   - Amortization typically stays same (remaining period)
   - Payment recalculated with new rate
   - No blending of rates

2. **Blend-and-Extend:**
   - Blended rate (old + new market rate)
   - Amortization can be extended
   - Payment typically lower than standard renewal
   - More total interest over lifetime

**When to Choose Blend-and-Extend:**

- Want lower monthly payments
- Need cash flow relief
- Old rate was lower than current market rate (benefit from blending)
- Comfortable with longer amortization

**When to Choose Standard Renewal:**

- Want to maintain current amortization schedule
- Minimize total interest paid
- Market rate is favorable (similar to or lower than old rate)
- Priority is faster payoff

### Payment Calculation

**How Are Payments Calculated?**

The new payment amount is calculated using:
- Blended rate (not old rate or new market rate alone)
- Extended amortization period (if extended)
- Current remaining balance
- Payment frequency (unchanged)

**Payment Formula:**

```
New Payment = calculatePayment(
  Remaining Balance,
  Blended Rate,
  Extended Amortization Months,
  Payment Frequency
)
```

**Comparison Payments:**

The system also calculates:
- Payment at old rate (with remaining amortization)
- Payment at new market rate (with extended amortization)

These are for comparison to show the benefit of blend-and-extend.

**Interest Savings Calculation:**

```
Interest Savings Per Payment = Market Rate Payment - Blended Rate Payment
```

This shows how much less you pay per payment vs standard renewal.

### Canadian Lender Conventions

**Blend-and-Extend Availability:**

- **Major Lenders:** Most offer blend-and-extend (RBC, TD, BMO, Scotiabank, CIBC)
- **Timing:** Typically available at renewal time
- **Rate Blending:** Lender-specific formulas (most use time-weighted average)
- **Amortization Extension:** Typically up to original amortization or 30 years max

**Common Rules:**

1. **Blending Formula:**
   - Most lenders: Time-weighted average (remaining months vs new term months)
   - Some lenders: Balance-weighted average (not common)
   - Formula may vary by lender

2. **Amortization Extension:**
   - Maximum: Typically 30 years (360 months)
   - Can extend back to original amortization
   - Some lenders: Can extend beyond original (up to 30 years)

3. **New Term Length:**
   - Typically 5 years (60 months)
   - Some lenders: 3-7 year terms available

**Process:**

1. Homeowner requests blend-and-extend at renewal
2. Lender calculates blended rate
3. Homeowner chooses amortization extension (optional)
4. New payment calculated with blended rate and extended amortization
5. New term begins with blended rate

---

## User Personas & Use Cases

### Persona 1: Cash Flow Seeker (Needs Payment Relief)

**Profile:**
- Facing renewal with increased rates
- Needs lower monthly payments
- Values cash flow relief
- Comfortable with longer amortization

**Use Cases:**
- Calculate blend-and-extend options at renewal
- Compare blend-and-extend vs standard renewal
- See payment reduction from blend-and-extend
- Apply blend-and-extend to reduce payments

**Pain Points Addressed:**
- Uncertainty about blend-and-extend option
- Need for payment reduction
- Wanting to understand payment savings
- Evaluating blend-and-extend vs other options

### Persona 2: Strategic Renewer (Evaluates Options)

**Profile:**
- Approaching renewal
- Wants to evaluate all renewal options
- Values data-driven decisions
- Considers multiple strategies

**Use Cases:**
- Compare blend-and-extend vs standard renewal vs refinancing
- Calculate blended rate and payment reduction
- Evaluate impact of amortization extension
- Make informed renewal decision

**Pain Points Addressed:**
- Uncertainty about best renewal option
- Need for comprehensive comparison
- Wanting to understand blend-and-extend impact
- Complexity of renewal decisions

### Persona 3: Rate-Aware Borrower (Has Lower Rate)

**Profile:**
- Currently has lower rate (from previous term)
- Market rates have increased
- Wants to preserve some rate benefit
- Interested in blend-and-extend

**Use Cases:**
- Calculate blended rate (preserving some old rate benefit)
- See how much rate benefit is preserved
- Compare blended rate vs new market rate
- Evaluate blend-and-extend benefit

**Pain Points Addressed:**
- Wanting to preserve rate benefit
- Need to understand blended rate calculation
- Evaluating blend-and-extend vs losing old rate completely
- Uncertainty about blend-and-extend benefit

---

## Feature Requirements

### Data Model Requirements

**Blend-and-Extend Calculation (No Persistent Storage):**

Blend-and-extend is calculated on-demand and doesn't require separate storage. Results can be stored as part of renewal workflow or term creation.

**Related Tables:**

- `mortgageTerms` - Stores term details (rate, amortization, payment)
- `mortgages` - Stores mortgage details (balance, amortization)

**Calculation Input Fields:**

- Old rate (from current term)
- New market rate (user input or fetched)
- Remaining balance (from mortgage)
- Remaining term months (from current term)
- Remaining amortization months (from mortgage)
- Extended amortization months (user input)
- Payment frequency (from current term)

### Business Logic Requirements

**Blend-and-Extend Calculation:**

1. **Inputs:**
   - Current term (for old rate, remaining term months)
   - Mortgage (for remaining balance, remaining amortization)
   - New market rate (user input or fetched)
   - Extended amortization months (user input, optional)

2. **Process:**
   - Get old rate from current term
   - Get remaining term months from current term
   - Get remaining balance from mortgage
   - Get remaining amortization months from mortgage
   - Calculate blended rate: `blendedRate = oldRate × weight + newMarketRate × (1 - weight)`
   - Calculate new payment: `calculatePayment(balance, blendedRate, extendedAmortization, frequency)`
   - Calculate comparison payments (old rate, market rate)
   - Calculate interest savings per payment
   - Return blend-and-extend result

3. **Outputs:**
   - Blended rate (decimal and percentage)
   - New payment amount (with blended rate and extended amortization)
   - Market rate payment (for comparison)
   - Old rate payment (for comparison)
   - Interest savings per payment
   - Extended amortization months

### Calculation Requirements

**Blended Rate Calculation:**

```typescript
function calculateBlendedRate(
  oldRate: number,
  newMarketRate: number,
  remainingTermMonths: number,
  newTermMonths: number = 60 // Default 5 years
): number {
  // Weight based on time remaining vs new term length
  const totalMonths = remainingTermMonths + newTermMonths;
  const oldWeight = remainingTermMonths / totalMonths;
  const newWeight = 1 - oldWeight;
  
  // Blended rate is weighted average
  const blendedRate = oldRate * oldWeight + newMarketRate * newWeight;
  
  // Round to 3 decimal places (standard rate precision)
  return Math.round(blendedRate * 1000) / 1000;
}
```

**Blend-and-Extend Payment Calculation:**

```typescript
function calculateBlendAndExtend(input: BlendAndExtendInput): BlendAndExtendResult {
  // Calculate blended rate
  const blendedRate = calculateBlendedRate(
    input.oldRate,
    input.newMarketRate,
    input.remainingTermMonths,
    60 // New term: 5 years
  );
  
  // Calculate payment with blended rate and extended amortization
  const newPaymentAmount = calculatePayment(
    input.remainingBalance,
    blendedRate,
    input.extendedAmortizationMonths,
    input.frequency
  );
  
  // Calculate comparison payments
  const marketRatePaymentAmount = calculatePayment(
    input.remainingBalance,
    input.newMarketRate,
    input.extendedAmortizationMonths,
    input.frequency
  );
  
  const oldRatePaymentAmount = calculatePayment(
    input.remainingBalance,
    input.oldRate,
    input.remainingAmortizationMonths, // Use remaining, not extended
    input.frequency
  );
  
  // Interest savings per payment
  const interestSavingsPerPayment = marketRatePaymentAmount - newPaymentAmount;
  
  return {
    blendedRate,
    newPaymentAmount,
    marketRatePaymentAmount,
    oldRatePaymentAmount,
    interestSavingsPerPayment
  };
}
```

**Extended Amortization Validation:**

- Extended amortization must be ≥ remaining amortization
- Extended amortization typically ≤ 30 years (360 months)
- Can extend to original amortization or beyond (if lender allows)

### Validation Requirements

**Input Validation:**

- New market rate must be positive (0-20% reasonable range)
- Remaining term months must be positive
- Remaining balance must be positive
- Extended amortization months must be ≥ remaining amortization months
- Extended amortization months typically ≤ 360 months (30 years)

**Calculation Validation:**

- Old rate must be positive
- New market rate must be positive
- Blended rate should be between old rate and new market rate
- Payment amounts must be positive

### Integration Requirements

**Renewal Workflow Integration:**

- Blend-and-extend available as option in renewal workflow
- Compare blend-and-extend vs standard renewal
- Compare blend-and-extend vs refinancing
- Integrated into renewal decision process

**Market Rate Integration:**

- Fetch current market rate for new term
- Use market rate in blend-and-extend calculation
- Update market rate if needed (user can refresh)

**Term Creation Integration:**

- After blend-and-extend calculation, user can create new term
- New term uses blended rate
- New term uses extended amortization
- Payment amount updated in new term

---

## User Stories & Acceptance Criteria

### Epic: Blend-and-Extend Calculation

**Story 1: Calculate Blend-and-Extend Options**
- **As a** homeowner
- **I want to** calculate blend-and-extend options at renewal
- **So that** I can see payment reduction and compare options

**Acceptance Criteria:**
- ✅ Blend-and-extend calculation form with inputs
- ✅ New market rate input (with auto-fill from market rate service)
- ✅ Extended amortization selection (current, original, +5 years, etc.)
- ✅ Calculate button triggers calculation
- ✅ Results show: blended rate, new payment, comparison payments, interest savings
- ✅ Results clearly formatted and easy to understand

**Story 2: View Blend-and-Extend Results**
- **As a** homeowner
- **I want to** see detailed blend-and-extend calculation results
- **So that** I can understand the impact

**Acceptance Criteria:**
- ✅ Blended rate displayed (decimal and percentage)
- ✅ New payment amount displayed (with blended rate and extended amortization)
- ✅ Comparison payments displayed (old rate, market rate)
- ✅ Interest savings per payment displayed
- ✅ Payment reduction amount and percentage shown
- ✅ Results clearly formatted with comparison

### Epic: Blend-and-Extend Comparison

**Story 3: Compare Blend-and-Extend vs Standard Renewal**
- **As a** homeowner
- **I want to** compare blend-and-extend vs standard renewal
- **So that** I can choose the best option

**Acceptance Criteria:**
- ✅ Comparison table showing blend-and-extend vs standard renewal
- ✅ Comparison metrics: rate, payment, total interest, amortization
- ✅ Clear indication of differences
- ✅ Recommendations based on priorities (payment reduction vs interest savings)

**Story 4: Compare Blend-and-Extend vs Refinancing**
- **As a** homeowner
- **I want to** compare blend-and-extend vs refinancing
- **So that** I can evaluate all renewal options

**Acceptance Criteria:**
- ✅ Comparison including refinancing option
- ✅ Comparison metrics: rate, payment, costs, total interest
- ✅ Break-even analysis (if applicable)
- ✅ Recommendations based on priorities

### Epic: Market Rate Integration

**Story 5: Fetch Current Market Rate**
- **As a** homeowner
- **I want to** fetch current market rate for blend-and-extend calculation
- **So that** I don't have to manually look up rates

**Acceptance Criteria:**
- ✅ Auto-fill button for market rate
- ✅ Market rate fetched from market rate service
- ✅ Market rate populated in form
- ✅ Option to refresh market rate
- ✅ Loading state during fetch

---

## Technical Implementation Notes

### API Endpoints

**Blend-and-Extend Calculation:**
- `POST /api/mortgage-terms/:id/blend-and-extend` - Calculate blend-and-extend
  - Body: `{ newMarketRate: number, extendedAmortizationMonths?: number }`
  - Returns: `{ blendedRate, blendedRatePercent, newPaymentAmount, marketRatePaymentAmount, oldRatePaymentAmount, interestSavingsPerPayment, extendedAmortizationMonths, message }`

### Database Schema

**No Separate Storage Required:**

Blend-and-extend calculation is on-demand and doesn't require separate storage. Results can be:
- Stored as part of renewal workflow (if user chooses blend-and-extend)
- Used to create new term (with blended rate and extended amortization)
- Stored in renewal history (if applicable)

**Related Tables:**
- `mortgageTerms` - Current term (for old rate, remaining term months)
- `mortgages` - Mortgage (for balance, remaining amortization)

### Service Layer

**Calculation Functions:**

- `calculateBlendedRate(oldRate, newMarketRate, remainingTermMonths, newTermMonths): number`
  - Calculates weighted average rate
  - Returns blended rate (decimal)

- `calculateBlendAndExtend(input): BlendAndExtendResult`
  - Complete blend-and-extend calculation
  - Returns blended rate, payment amounts, interest savings

**API Route Handler:**

- `POST /api/mortgage-terms/:id/blend-and-extend`
  - Fetches term and mortgage
  - Validates inputs
  - Calculates blend-and-extend
  - Returns results

### Frontend Components

**BlendAndExtendForm:**
- Form component for blend-and-extend inputs
- New market rate input (with auto-fill)
- Extended amortization selector
- Calculate button

**BlendAndExtendResults:**
- Component displaying calculation results
- Blended rate display
- Payment amounts (blended, market rate, old rate)
- Interest savings display
- Comparison visualization

**BlendAndExtendComparison:**
- Component for comparing options
- Comparison table (blend-and-extend vs standard renewal)
- Metrics comparison
- Recommendations

### Data Flow

**Blend-and-Extend Calculation Flow:**
1. User opens blend-and-extend form (from renewal workflow or term details)
2. Form pre-fills: old rate, remaining term months, remaining balance, remaining amortization
3. User enters new market rate (or auto-fills from market rate service)
4. User selects extended amortization (optional)
5. User clicks "Calculate"
6. Frontend sends POST to `/api/mortgage-terms/:id/blend-and-extend`
7. Backend: Fetches term and mortgage, calculates blend-and-extend
8. Returns results (blended rate, payments, savings)
9. Frontend displays results
10. User can compare with other options or create new term

**Market Rate Auto-Fill Flow:**
1. User clicks "Auto-fill" button for market rate
2. Frontend sends GET to market rate service (with term type and years)
3. Market rate service returns current rate
4. Frontend populates market rate field
5. User can adjust if needed

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Rate Edge Cases:**

1. **Old Rate = New Market Rate:**
   - Blended rate = old rate = new market rate
   - No blending benefit (but amortization extension still reduces payment)
   - Valid scenario

2. **Old Rate > New Market Rate:**
   - Blended rate between old and new (closer to new)
   - Still beneficial to extend amortization (if needed)
   - Valid scenario (rate increase, but extension reduces payment)

3. **Remaining Term = 0:**
   - Should not occur (term already expired)
   - Handle gracefully: Return error or use standard renewal

**Amortization Edge Cases:**

1. **Extended = Remaining:**
   - No extension (keeping current amortization)
   - Still get blended rate benefit
   - Valid scenario

2. **Extended > Maximum (30 years):**
   - Validation prevents
   - Handle gracefully: Cap at 30 years or return error

3. **Extended < Remaining:**
   - Invalid (cannot reduce amortization)
   - Validation prevents
   - Handle gracefully: Return error

**Balance Edge Cases:**

1. **Zero Balance:**
   - Should not occur (mortgage paid off)
   - Handle gracefully: Return error

2. **Very Large Balance:**
   - Valid scenario
   - Calculate normally
   - Payment amounts will be large

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid market rate, invalid amortization, invalid input
- **401 Unauthorized:** User not authenticated
- **404 Not Found:** Term not found, mortgage not found
- **500 Internal Server Error:** Calculation error, unexpected error

**Frontend Error Handling:**

- Display user-friendly error messages
- Show loading states during calculation
- Handle network errors gracefully
- Validate inputs before submission
- Log errors for debugging

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero balance, invalid amortization, etc.)
- Return appropriate error messages
- Use safe defaults where appropriate
- Log calculation errors for debugging

---

## Testing Considerations

### Unit Tests

**Blended Rate Calculation Tests:**
- `calculateBlendedRate()`: Basic calculation (normal case)
- `calculateBlendedRate()`: Old rate = new market rate
- `calculateBlendedRate()`: Remaining term = 0 (edge case)
- `calculateBlendedRate()`: Very long remaining term
- `calculateBlendedRate()`: Very short remaining term

**Blend-and-Extend Calculation Tests:**
- `calculateBlendAndExtend()`: Basic calculation (normal case)
- `calculateBlendAndExtend()`: With amortization extension
- `calculateBlendAndExtend()`: Without amortization extension
- `calculateBlendAndExtend()`: Validation - invalid amortization (error)
- `calculateBlendAndExtend()`: Validation - zero balance (error)

### Integration Tests

**Blend-and-Extend API:**
- Calculate blend-and-extend with valid inputs
- Calculate blend-and-extend with invalid inputs (error)
- Calculate blend-and-extend without term (error)
- Verify calculation results accuracy

**Market Rate Integration:**
- Fetch market rate successfully
- Handle market rate fetch errors
- Auto-fill market rate in form

### End-to-End Tests

**Blend-and-Extend Workflow E2E:**
1. User opens blend-and-extend form
2. Form pre-fills with current term data
3. User auto-fills market rate
4. User selects extended amortization
5. User clicks "Calculate"
6. Results displayed (blended rate, payments, savings)
7. User compares with other options
8. User can create new term with blend-and-extend (if chosen)

**Comparison E2E:**
1. User calculates blend-and-extend
2. User views comparison (blend-and-extend vs standard renewal)
3. Comparison table displayed
4. User can evaluate options and make decision

---

## Future Enhancements

### Known Limitations

1. **Blended Rate Formula:**
   - Currently uses time-weighted average (standard approach)
   - Some lenders may use different formulas
   - Could add lender-specific blending formulas

2. **Amortization Extension Limits:**
   - Currently validates against 30-year maximum
   - Lender-specific limits may vary
   - Could add lender-specific extension limits

3. **New Term Length:**
   - Assumes 5-year term (standard)
   - Could support other term lengths (3, 4, 7 years)

### Potential Improvements

**Enhanced Analysis:**
- Total interest comparison (blend-and-extend vs standard renewal)
- Payoff timeline comparison
- Break-even analysis (if applicable)
- Cost-benefit analysis

**Advanced Features:**
- Multiple extension options comparison
- Rate scenario analysis (what-if market rates)
- Blend-and-extend calculator (standalone tool)
- Blend-and-extend educational content

**Integration Enhancements:**
- Blend-and-extend in scenario planning
- Blend-and-extend projections over time
- Blend-and-extend optimization recommendations
- Integration with renewal recommendations

---

**End of Feature Specification**

