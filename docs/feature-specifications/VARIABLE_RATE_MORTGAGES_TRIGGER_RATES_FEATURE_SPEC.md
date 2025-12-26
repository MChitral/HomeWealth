# Variable Rate Mortgages & Trigger Rates Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Variable Rate Mortgages (VRMs) represent a significant portion of the Canadian mortgage market, with approximately 30-40% of homeowners choosing variable-rate options. The Variable Rate Mortgages & Trigger Rates feature provides:

- **Accurate Rate Modeling:** Prime + spread pricing with automatic rate updates from Bank of Canada
- **Risk Management:** Trigger rate monitoring and negative amortization tracking for VRM-Fixed-Payment mortgages
- **Proactive Alerts:** Distance-to-trigger calculations and automated notifications when trigger rates are approached or hit
- **Payment Behavior Accuracy:** Correct modeling of payment-changing vs payment-fixed variable mortgages
- **Regulatory Compliance:** Support for rate caps/floors and stress testing scenarios

### Market Context

**Canadian Variable Rate Mortgage Market:**

- **Market Share:** 30-40% of new mortgages (varies by rate environment)
- **Pricing Model:** Prime Rate + Locked Spread (typically -0.9% to +0.5%)
- **Term Lengths:** 1, 2, 3, 5, 7, or 10 years (5-year most common)
- **Payment Types:** Two distinct types:
  - **VRM-Changing Payment:** Payment adjusts with rate changes
  - **VRM-Fixed Payment:** Payment stays constant, risk of negative amortization

**Trigger Rate Phenomenon:**

- Unique to VRM-Fixed-Payment mortgages in Canada
- Occurs when effective rate exceeds trigger rate (payment = interest only)
- Results in negative amortization (balance increases)
- Became prominent in 2022-2023 during rapid rate increases
- OSFI (Office of the Superintendent of Financial Institutions) monitors trigger rate exposure

**Industry Statistics:**

- Typical variable rate spread: Prime -0.9% to Prime +0.5%
- Trigger rates typically 6-8% (varies by payment amount and balance)
- Negative amortization events: Rare historically, more common during rapid rate increases
- Rate caps/floors: Common lender protections (typically ±2% per period)

### Strategic Positioning

- **Core Feature:** Variable rate mortgage support is essential for Canadian market
- **Competitive Differentiation:** Accurate trigger rate modeling and monitoring exceeds basic mortgage tools
- **Risk Management:** Proactive trigger rate alerts help homeowners manage negative amortization risk
- **Regulatory Alignment:** Supports OSFI stress testing and risk assessment requirements

---

## Domain Overview

### Variable Rate Mortgage Fundamentals

**Variable Rate Mortgage (VRM)** is a mortgage where the interest rate adjusts with changes to the Bank of Canada Prime Rate. Key characteristics:

1. **Rate Structure:**
   - Effective Rate = Prime Rate + Locked Spread
   - Prime Rate: Bank of Canada prime rate (changes with monetary policy)
   - Locked Spread: Fixed spread locked at term start (e.g., -0.9%, +0.5%)
   - Rate updates automatically when Prime Rate changes

2. **Payment Frequency Impact:**
   - Monthly, biweekly, weekly, or accelerated payments supported
   - Payment frequency affects periodic rate calculations
   - Trigger rate calculation accounts for payment frequency

3. **Rate Caps and Floors:**
   - Maximum rate increase per period (cap)
   - Minimum rate (floor)
   - Protects borrowers from extreme rate volatility

### VRM-Changing Payment (Variable-Changing)

**Behavior:** Payment amount adjusts when Prime Rate changes.

**Key Characteristics:**
- Payment recalculated to maintain original amortization schedule
- Payment always covers full interest + principal
- Balance always decreases (no negative amortization)
- Amortization schedule remains consistent

**How It Works:**
1. When Prime Rate changes → Effective rate changes
2. Payment recalculated based on:
   - Current balance
   - New effective rate
   - Remaining amortization period
3. New payment amount = recalculated payment
4. Balance continues decreasing normally

**Example:**
- Original: Balance $500,000, Prime 5.45%, Spread -0.9% → Effective 4.55%, Payment $2,800/month
- Prime increases to 6.45% → Effective 5.55%
- New Payment: ~$3,050/month (recalculated)
- Balance continues decreasing normally

**Use Cases:**
- Borrowers who want payment to reflect current rates
- Predictable amortization schedule
- No risk of negative amortization
- Ability to adjust payment with rate changes

### VRM-Fixed Payment (Variable-Fixed)

**Behavior:** Payment amount stays constant regardless of Prime Rate changes.

**Key Characteristics:**
- Payment amount locked at term start
- Payment may not cover full interest if rates rise too high
- Can result in negative amortization (balance increases)
- Trigger rate determines when payment becomes interest-only

**How It Works:**
1. Payment amount set at term start and stays constant
2. When Prime Rate changes → Effective rate changes, but payment stays same
3. Interest portion = `balance × effectivePeriodicRate`
4. If `paymentAmount <= interestPortion` → Trigger rate hit
5. Unpaid interest added to principal → Balance increases (negative amortization)

**Example:**
- Original: Balance $500,000, Prime 5.45%, Spread -0.9% → Effective 4.55%, Payment $2,800/month (fixed)
- Prime increases to 8.45% → Effective 7.55%
- Interest: ~$3,146/month
- Payment ($2,800) < Interest ($3,146) → Trigger rate hit!
- Unpaid interest: $346/month
- New Balance: $500,346 (increased)

**Use Cases:**
- Borrowers who want predictable payment amounts
- Willing to accept potential negative amortization
- Risk of balance increasing if rates rise significantly

### Trigger Rate

**What Is Trigger Rate?**

The **trigger rate** is the annual interest rate at which the fixed payment equals interest-only. When the effective rate exceeds the trigger rate:

- Payment doesn't cover full interest
- Unpaid interest is added to principal
- Balance increases (negative amortization)
- Amortization becomes undefined

**Calculation Formula:**

```
Trigger Rate = f(paymentAmount, remainingBalance, paymentFrequency)
```

The trigger rate is calculated such that:
```
paymentAmount = remainingBalance × periodicRate
```

Where `periodicRate` is derived from the trigger rate using Canadian semi-annual compounding.

**Calculation Steps:**
1. Calculate periodic rate: `periodicRate = paymentAmount / remainingBalance`
2. Convert periodic rate to effective annual rate: `effectiveAnnualRate = (1 + periodicRate)^paymentsPerYear - 1`
3. Convert effective annual to semi-annual rate: `semiAnnualRate = (1 + effectiveAnnualRate)^(1/2) - 1`
4. Convert semi-annual to nominal annual rate: `nominalAnnualRate = semiAnnualRate × 2`

**Factors Affecting Trigger Rate:**
- Payment amount (higher payment = higher trigger rate)
- Remaining balance (lower balance = higher trigger rate)
- Payment frequency (weekly vs monthly affects calculation)

### Negative Amortization

**What Is Negative Amortization?**

**Negative amortization** occurs when the payment doesn't cover the full interest due, causing the mortgage balance to **increase** instead of decrease.

**When It Happens:**
- VRM-Fixed Payment mortgages only
- When effective rate exceeds trigger rate
- Payment amount is fixed (doesn't adjust)
- Unpaid interest is added to principal

**How It's Modeled:**

```typescript
const interestPayment = remainingBalance × effectivePeriodicRate;
const triggerRateHit = currentPaymentAmount <= interestPayment;

if (triggerRateHit) {
  // Negative amortization
  principalPayment = 0;
  unpaidInterest = interestPayment - currentPaymentAmount;
  newBalance = remainingBalance + unpaidInterest; // Balance increases!
}
```

**Impact:**
- **Short Term:** Balance increases each payment period, amortization becomes undefined, more interest accrues on larger balance
- **Long Term:** If rates decrease → Payment may cover interest again; If rates stay high → Balance continues increasing; May require payment increase or refinancing

**Prepayments During Trigger Rate:**

- Prepayments can still be made
- Prepayments reduce the negative amortization
- Formula: `newBalance = oldBalance + unpaidInterest - prepayment`
- If prepayment > unpaid interest → Balance decreases

### Prime + Spread Pricing

**Formula:**
```
Effective Rate = Prime Rate + Locked Spread
```

**Components:**
- **Prime Rate:** Bank of Canada prime rate (changes over time)
- **Locked Spread:** Fixed spread locked at term start (e.g., -0.9%, +0.5%)

**Rate Updates:**
- Prime Rate fetched from Bank of Canada API
- Updated automatically via scheduled job (daily at 9 AM ET)
- Historical rates stored in database
- Effective rate recalculated automatically

**VRM-Changing Payment:**
- Payment recalculated when Prime changes
- New payment = recalculated for new effective rate

**VRM-Fixed Payment:**
- Payment stays constant
- Effective rate changes with Prime
- May hit trigger rate if Prime rises too much

### Rate Caps and Floors

**Rate Cap:**
- Maximum rate increase per period (e.g., 2% per period)
- Protects borrowers from rapid rate increases
- Applied during rate change calculations

**Rate Floor:**
- Minimum rate (e.g., 2.5%)
- Protects lenders from rates going too low
- Applied during rate change calculations

**Validation:**
- Rate caps/floors stored in `mortgageTerms` table (`variableRateCap`, `variableRateFloor`)
- Validated during prime rate updates
- Rate changes constrained by caps/floors

### Canadian Lender Conventions

**Standard VRM Features:**
- Prime + spread pricing (variable rate)
- Payment frequency options (monthly, biweekly, weekly)
- Prepayment privileges (typically 20% annually)
- Rate caps/floors (varies by lender)

**Trigger Rate Handling:**
- Lenders monitor trigger rate exposure
- May require payment increase if trigger rate hit
- May offer payment increase options to prevent negative amortization
- Regulatory reporting required for trigger rate exposure

**OSFI Guidelines:**
- Stress testing requirements for variable rate mortgages
- Trigger rate exposure monitoring
- Risk assessment for negative amortization scenarios

---

## User Personas & Use Cases

### Persona 1: Variable Rate Borrower (VRM-Changing)

**Profile:**
- Chose variable rate for potential savings
- Comfortable with payment fluctuations
- Wants predictable amortization schedule
- Monitors rates but accepts changes

**Use Cases:**
- Track effective rate changes (Prime + Spread)
- View payment adjustments when Prime changes
- Monitor amortization schedule (should remain consistent)
- Compare variable vs fixed rate performance
- Receive rate change notifications

**Pain Points Addressed:**
- Understanding how Prime changes affect payments
- Tracking payment history with rate changes
- Ensuring amortization remains on track

### Persona 2: Fixed Payment Variable Borrower (VRM-Fixed)

**Profile:**
- Chose variable rate but wants fixed payments
- Comfortable with variable rate risk
- Needs predictable monthly payments
- May not fully understand trigger rate risk

**Use Cases:**
- Track trigger rate status and distance
- Receive trigger rate alerts (approaching, close, hit)
- Monitor for negative amortization
- Understand balance increase implications
- Calculate required payment to prevent negative amortization
- Track prepayment impact during trigger rate conditions

**Pain Points Addressed:**
- Unaware when trigger rate is approached/hit
- Surprised by balance increases
- Need guidance on payment increase options
- Understanding prepayment strategies during trigger rate

### Persona 3: Rate Risk Manager (Sophisticated Borrower)

**Profile:**
- Understands variable rate mechanics
- Actively monitors trigger rates
- Makes strategic decisions based on rate outlook
- Uses prepayments strategically

**Use Cases:**
- View detailed trigger rate calculations
- Monitor distance-to-trigger metrics
- Receive proactive alerts before trigger rate hit
- Analyze balance projection scenarios
- Plan prepayment strategies
- Compare switching to VRM-Changing vs increasing payment

**Pain Points Addressed:**
- Need for early warning system
- Detailed rate and balance projections
- Strategic planning tools

### Persona 4: First-Time Variable Rate Borrower

**Profile:**
- New to variable rate mortgages
- May not understand trigger rate concept
- Needs education and guidance
- Wants simple, clear information

**Use Cases:**
- Understand what trigger rate means
- Learn about negative amortization
- View educational content
- Receive simplified alerts with explanations
- Get recommendations on actions to take

**Pain Points Addressed:**
- Lack of understanding of variable rate mechanics
- Confusion about trigger rate concept
- Need for clear, simple explanations
- Guidance on appropriate actions

---

## Feature Requirements

### Data Model Requirements

**Mortgage Terms Table (`mortgageTerms`):**

For Variable Rate Mortgages:
- `termType` (text) - "variable-changing" or "variable-fixed"
- `primeRate` (decimal 5,3) - Current Prime Rate (updated by scheduler)
- `lockedSpread` (decimal 5,3) - Fixed spread locked at term start (e.g., -0.9% stored as -0.009)
- `variableRateCap` (decimal 5,3, optional) - Maximum rate increase per period
- `variableRateFloor` (decimal 5,3, optional) - Minimum rate
- `regularPaymentAmount` (decimal 12,2) - Payment amount (fixed for VRM-Fixed, recalculated for VRM-Changing)
- `paymentFrequency` (text) - Payment frequency (affects trigger rate calculation)

**Mortgage Payments Table (`mortgagePayments`):**

For Trigger Rate Tracking:
- `triggerRateHit` (boolean) - Flag indicating if trigger rate was hit for this payment
- `remainingBalance` (decimal 12,2) - Balance after payment (may increase if trigger rate hit)
- `interestPayment` (decimal 12,2) - Interest portion of payment
- `principalPayment` (decimal 12,2) - Principal portion (0 if trigger rate hit)
- `effectiveRate` (decimal 5,3) - Effective rate at time of payment

**Prime Rate History Table (`primeRateHistory`):**

- `primeRate` (decimal 5,3) - Prime Rate value
- `effectiveDate` (date) - Date rate became effective
- `source` (text) - Source (typically "Bank of Canada")
- `createdAt` (timestamp) - Record creation timestamp

**Market Rates Table (`marketRates`):**

- `rateType` (text) - "variable-changing" or "variable-fixed"
- `termYears` (integer) - Term length
- `rate` (decimal 5,3) - Market rate
- `effectiveDate` (date) - Date rate became effective
- `source` (text) - Source

### Business Logic Requirements

**Trigger Rate Calculation:**

1. **Inputs:**
   - Payment amount (fixed for VRM-Fixed)
   - Remaining balance
   - Payment frequency

2. **Calculation Steps:**
   - Calculate periodic rate: `periodicRate = paymentAmount / remainingBalance`
   - Convert to effective annual rate: `effectiveAnnualRate = (1 + periodicRate)^paymentsPerYear - 1`
   - Convert to semi-annual rate: `semiAnnualRate = (1 + effectiveAnnualRate)^(1/2) - 1`
   - Convert to nominal annual rate: `nominalAnnualRate = semiAnnualRate × 2`
   - Return nominal annual rate as trigger rate

3. **Payment Frequency Handling:**
   - Monthly: 12 payments per year
   - Biweekly: 26 payments per year
   - Weekly: 52 payments per year
   - Accelerated: Same as base frequency (monthly/biweekly/weekly)

**Trigger Rate Monitoring:**

1. **Status Calculation:**
   - Current effective rate = Prime Rate + Locked Spread
   - Trigger rate = Calculate trigger rate (payment, balance, frequency)
   - Distance to trigger = `triggerRate - currentRate`
   - Is hit = `currentRate >= triggerRate`
   - Is risk = `currentRate >= triggerRate - 0.5%`

2. **Alert Thresholds:**
   - **Approaching:** Distance ≤ 1.0% (trigger_rate_approaching)
   - **Close:** Distance ≤ 0.5% (trigger_rate_close)
   - **Hit:** Distance ≤ 0% (trigger_rate_hit)

3. **Monitoring Scope:**
   - Only VRM-Fixed Payment mortgages
   - Active terms only
   - Check all mortgages daily via scheduled job

**Negative Amortization Calculation:**

1. **Payment Processing:**
   - Calculate interest payment: `interestPayment = remainingBalance × effectivePeriodicRate`
   - Check trigger rate: `triggerRateHit = currentPaymentAmount <= interestPayment`

2. **Normal Payment (Trigger Rate Not Hit):**
   - Principal payment = `currentPaymentAmount - interestPayment`
   - Balance decreases: `newBalance = remainingBalance - principalPayment`

3. **Trigger Rate Hit:**
   - Principal payment = 0
   - Unpaid interest = `interestPayment - currentPaymentAmount`
   - Balance increases: `newBalance = remainingBalance + unpaidInterest`
   - `triggerRateHit` flag = true

4. **Prepayment During Trigger Rate:**
   - Prepayments reduce negative amortization
   - Formula: `newBalance = remainingBalance + unpaidInterest - prepayment`
   - If prepayment > unpaid interest, balance decreases

**Payment Recalculation (VRM-Changing):**

1. **Trigger:** Prime Rate change detected
2. **Recalculation:**
   - New effective rate = New Prime Rate + Locked Spread
   - New payment = Recalculate payment (balance, new rate, remaining amortization)
   - Update `regularPaymentAmount` in term
3. **Amortization:** Amortization schedule remains consistent

**Prime Rate Updates:**

1. **Source:** Bank of Canada API
2. **Frequency:** Daily at 9 AM ET (configurable)
3. **Process:**
   - Fetch current Prime Rate from API
   - Store in `primeRateHistory` table
   - Update active terms: `primeRate` field in `mortgageTerms`
   - Recalculate effective rates for all active VRM terms
   - Trigger payment recalculation for VRM-Changing mortgages
   - Check trigger rates for VRM-Fixed mortgages

4. **Rate Cap/Floor Validation:**
   - If rate cap exists: Limit rate increase to cap
   - If rate floor exists: Limit rate to floor
   - Apply constraints during rate update

**Trigger Rate Alerts:**

1. **Alert Types:**
   - `trigger_rate_approaching`: Within 1.0% of trigger rate
   - `trigger_rate_close`: Within 0.5% of trigger rate
   - `trigger_rate_hit`: Trigger rate hit or exceeded

2. **Alert Content:**
   - Current rate vs trigger rate
   - Distance to trigger rate
   - Balance impact (monthly increase if hit)
   - Projected balance at term end
   - Required payment to prevent negative amortization

3. **Deduplication:**
   - Check if alert already sent for same alert type (last 24 hours)
   - Allow upgrade alerts (approaching → close → hit)
   - Prevent duplicate alerts for same condition

**Distance-to-Trigger Calculation:**

1. **Formula:**
   ```
   distanceToTrigger = triggerRate - currentRate
   ```

2. **Display:**
   - Positive value: Buffer before trigger rate hit
   - Zero or negative: Trigger rate hit
   - Expressed in percentage points (e.g., 0.5% = 0.005)

**Balance Projection:**

1. **Monthly Balance Increase:**
   ```
   monthlyIncrease = (currentRate - triggerRate) × balance × (1/12)
   ```

2. **Projected Balance at Term End:**
   ```
   projectedBalance = currentBalance + monthlyIncrease × monthsRemaining
   ```

**Required Payment Calculation:**

1. **Calculate payment needed to prevent negative amortization:**
   - Payment = Recalculate payment (balance, triggerRate, remaining amortization)
   - This is the minimum payment to cover interest at trigger rate

2. **Display:**
   - Show required payment amount
   - Compare to current payment
   - Show payment increase needed

### Validation Requirements

**Variable Rate Term Validation:**

- `termType`: Required, must be "variable-changing" or "variable-fixed"
- `primeRate`: Required for variable terms, must be positive number
- `lockedSpread`: Required for variable terms, can be negative or positive
- `fixedRate`: Must be null for variable terms (mutually exclusive)
- Rate cap/floor: Optional, but if provided must be positive and valid range

**Trigger Rate Calculation Validation:**

- Payment amount: Must be positive
- Remaining balance: Must be positive
- Payment frequency: Must be valid (monthly, biweekly, weekly, accelerated-monthly, accelerated-biweekly, accelerated-weekly)
- Result: Trigger rate must be positive

**Rate Update Validation:**

- Prime Rate: Must be positive, reasonable range (e.g., 0% to 20%)
- Rate cap: If exists, new rate cannot exceed previous rate + cap
- Rate floor: If exists, new rate cannot be below floor

**Business Rules:**

- VRM-Changing: Payment must be recalculated when Prime changes
- VRM-Fixed: Payment stays constant, but effective rate changes
- Trigger rate only applies to VRM-Fixed mortgages
- Negative amortization only occurs for VRM-Fixed when trigger rate hit

### Integration Requirements

**Prime Rate Service Integration:**
- Fetch Prime Rate from Bank of Canada API
- Store historical rates
- Update active mortgage terms
- Trigger rate change notifications

**Mortgage Payment Service Integration:**
- Calculate payments with trigger rate logic
- Track trigger rate hit flag
- Record negative amortization events
- Handle prepayments during trigger rate

**Notification Service Integration:**
- Send trigger rate alerts
- Include structured metadata (current rate, trigger rate, distance, balance impact)
- Support alert deduplication
- Email and in-app notifications

**Amortization Calculation Service Integration:**
- Include trigger rate logic in amortization schedules
- Track balance increases for VRM-Fixed
- Handle payment recalculation for VRM-Changing

**Dashboard Integration:**
- Display trigger rate status on dashboard
- Show distance-to-trigger metrics
- Provide quick access to trigger rate details

---

## User Stories & Acceptance Criteria

### Epic: Trigger Rate Monitoring

**Story 1: View Trigger Rate Status**
- **As a** VRM-Fixed Payment borrower
- **I want to** see my trigger rate status and distance
- **So that** I know how close I am to hitting the trigger rate

**Acceptance Criteria:**
- ✅ Trigger rate displayed for VRM-Fixed mortgages
- ✅ Current effective rate displayed (Prime + Spread)
- ✅ Distance to trigger rate shown (percentage points)
- ✅ Visual indicator for status (safe, approaching, close, hit)
- ✅ Balance impact shown if trigger rate hit
- ✅ Projected balance at term end displayed

**Story 2: Trigger Rate Calculation**
- **As a** system
- **I want to** accurately calculate trigger rates
- **So that** users receive correct trigger rate information

**Acceptance Criteria:**
- ✅ Trigger rate calculated correctly using payment, balance, frequency
- ✅ Payment frequency properly accounted for (monthly vs biweekly vs weekly)
- ✅ Canadian semi-annual compounding used in calculation
- ✅ Calculation matches lender calculations
- ✅ Edge cases handled (zero balance, very high payment, etc.)

**Story 3: Trigger Rate Alerts**
- **As a** VRM-Fixed Payment borrower
- **I want to** receive alerts when approaching trigger rate
- **So that** I can take action before negative amortization occurs

**Acceptance Criteria:**
- ✅ Alert sent when within 1.0% of trigger rate (approaching)
- ✅ Alert sent when within 0.5% of trigger rate (close)
- ✅ Alert sent when trigger rate hit
- ✅ Alerts include current rate, trigger rate, distance, balance impact
- ✅ Alerts not duplicated (deduplication logic)
- ✅ Alerts appear in notifications center
- ✅ Email notifications sent (if enabled)

### Epic: Negative Amortization Tracking

**Story 4: Track Negative Amortization**
- **As a** system
- **I want to** track when negative amortization occurs
- **So that** balance increases are accurately recorded

**Acceptance Criteria:**
- ✅ Negative amortization detected when trigger rate hit
- ✅ Balance increase calculated correctly (unpaid interest)
- ✅ `triggerRateHit` flag set in payment records
- ✅ Balance accurately reflects increases
- ✅ Payment history shows trigger rate events

**Story 5: View Balance Impact**
- **As a** VRM-Fixed Payment borrower
- **I want to** see the impact of negative amortization
- **So that** I understand how my balance is changing

**Acceptance Criteria:**
- ✅ Monthly balance increase shown when trigger rate hit
- ✅ Projected balance at term end displayed
- ✅ Historical balance changes visible in payment history
- ✅ Visual indicators for balance increases (red highlighting)
- ✅ Summary statistics (total balance increase, months affected)

**Story 6: Prepayment During Trigger Rate**
- **As a** VRM-Fixed Payment borrower
- **I want to** make prepayments during trigger rate conditions
- **So that** I can reduce negative amortization

**Acceptance Criteria:**
- ✅ Prepayments allowed during trigger rate conditions
- ✅ Prepayments reduce negative amortization
- ✅ Balance calculation: `newBalance = oldBalance + unpaidInterest - prepayment`
- ✅ If prepayment > unpaid interest, balance decreases
- ✅ Prepayment tracking includes trigger rate context

### Epic: Payment Behavior

**Story 7: VRM-Changing Payment Recalculation**
- **As a** VRM-Changing Payment borrower
- **I want to** have my payment recalculated when Prime changes
- **So that** my amortization schedule remains consistent

**Acceptance Criteria:**
- ✅ Payment recalculated automatically when Prime Rate changes
- ✅ New payment based on current balance, new rate, remaining amortization
- ✅ Payment amount updated in term
- ✅ Payment history shows payment changes
- ✅ Amortization schedule remains consistent

**Story 8: VRM-Fixed Payment Stability**
- **As a** VRM-Fixed Payment borrower
- **I want to** keep my payment constant
- **So that** I have predictable monthly payments

**Acceptance Criteria:**
- ✅ Payment amount stays constant regardless of Prime changes
- ✅ Effective rate changes with Prime, but payment unchanged
- ✅ Payment history shows constant payment amount
- ✅ Trigger rate risk increases if rates rise

**Story 9: Payment Frequency Impact**
- **As a** borrower
- **I want to** understand how payment frequency affects trigger rate
- **So that** I can make informed decisions

**Acceptance Criteria:**
- ✅ Trigger rate calculation accounts for payment frequency
- ✅ Monthly vs biweekly vs weekly payments produce different trigger rates
- ✅ Payment frequency properly reflected in calculations
- ✅ UI explains payment frequency impact

### Epic: Prime Rate Integration

**Story 10: Prime Rate Updates**
- **As a** system
- **I want to** automatically update Prime Rates
- **So that** variable rate mortgages reflect current rates

**Acceptance Criteria:**
- ✅ Prime Rate fetched from Bank of Canada API daily
- ✅ Historical rates stored in database
- ✅ Active terms updated with new Prime Rate
- ✅ Effective rates recalculated automatically
- ✅ Rate change notifications sent to users
- ✅ Rate cap/floor validation applied

**Story 11: Rate Cap/Floor Enforcement**
- **As a** borrower
- **I want to** have rate caps/floors enforced
- **So that** I'm protected from extreme rate volatility

**Acceptance Criteria:**
- ✅ Rate caps limit maximum rate increases per period
- ✅ Rate floors limit minimum rates
- ✅ Caps/floors stored in mortgage terms
- ✅ Validation applied during rate updates
- ✅ Rate changes constrained by caps/floors

**Story 12: Rate Change History**
- **As a** borrower
- **I want to** view Prime Rate change history
- **So that** I can understand rate trends

**Acceptance Criteria:**
- ✅ Prime Rate history displayed (chart/table)
- ✅ Effective rate changes tracked
- ✅ Rate change dates and values shown
- ✅ Historical context for current rates

### Epic: Dashboard & UI

**Story 13: Trigger Rate Dashboard Widget**
- **As a** VRM-Fixed Payment borrower
- **I want to** see trigger rate status on my dashboard
- **So that** I can quickly monitor my risk

**Acceptance Criteria:**
- ✅ Trigger rate widget on dashboard
- ✅ Shows current rate, trigger rate, distance
- ✅ Visual status indicator (safe/approaching/close/hit)
- ✅ Quick access to detailed trigger rate information
- ✅ Links to trigger rate monitoring section

**Story 14: Payment History Trigger Rate Indicators**
- **As a** borrower
- **I want to** see trigger rate events in payment history
- **So that** I can track when negative amortization occurred

**Acceptance Criteria:**
- ✅ Payment rows highlighted when trigger rate hit
- ✅ "Trigger" badge displayed for trigger rate payments
- ✅ Tooltip explains trigger rate condition
- ✅ Balance increase clearly indicated
- ✅ Filter option to show only trigger rate payments

**Story 15: Trigger Rate Detail View**
- **As a** borrower
- **I want to** view detailed trigger rate information
- **So that** I can understand my situation and plan actions

**Acceptance Criteria:**
- ✅ Detailed trigger rate page with calculations
- ✅ Current rate vs trigger rate comparison
- ✅ Distance-to-trigger metric
- ✅ Balance impact projections
- ✅ Required payment to prevent negative amortization
- ✅ Action recommendations
- ✅ Historical trigger rate status

---

## Technical Implementation Notes

### API Endpoints

**Trigger Rate Status:**
- `GET /api/mortgages/:id/trigger-rate-status` - Get trigger rate status for mortgage
  - Returns: `TriggerRateAlert` (mortgageId, currentRate, triggerRate, isHit, isRisk, balance, paymentAmount)

**Prime Rate:**
- `GET /api/prime-rate` - Get current Prime Rate
  - Returns: `PrimeRateResponse` (primeRate, effectiveDate, source, lastUpdated)
- `GET /api/prime-rate/history` - Get Prime Rate history
  - Returns: `PrimeRateHistoryEntry[]`

**Rate Changes:**
- `GET /api/mortgages/:id/rate-changes` - Get rate change history for mortgage
  - Returns: `RateChangeEntry[]` (date, previousRate, newRate, effectiveRate)

### Database Schema

**Mortgage Terms Table (Variable Rate Fields):**
```sql
-- Variable rate fields in mortgage_terms table
term_type TEXT NOT NULL CHECK (term_type IN ('fixed', 'variable-changing', 'variable-fixed')),
prime_rate DECIMAL(5,3), -- Current Prime Rate (for variable terms)
locked_spread DECIMAL(5,3), -- Fixed spread (for variable terms)
variable_rate_cap DECIMAL(5,3), -- Maximum rate increase per period (optional)
variable_rate_floor DECIMAL(5,3), -- Minimum rate (optional)
regular_payment_amount DECIMAL(12,2) NOT NULL, -- Payment amount
payment_frequency TEXT NOT NULL, -- Payment frequency
```

**Mortgage Payments Table (Trigger Rate Fields):**
```sql
-- Trigger rate fields in mortgage_payments table
trigger_rate_hit BOOLEAN NOT NULL DEFAULT FALSE, -- Flag indicating trigger rate hit
remaining_balance DECIMAL(12,2) NOT NULL, -- Balance after payment (may increase)
interest_payment DECIMAL(12,2) NOT NULL, -- Interest portion
principal_payment DECIMAL(12,2) NOT NULL, -- Principal portion (0 if trigger rate hit)
effective_rate DECIMAL(5,3), -- Effective rate at time of payment
```

**Prime Rate History Table:**
```sql
CREATE TABLE prime_rate_history (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  prime_rate DECIMAL(5,3) NOT NULL,
  effective_date DATE NOT NULL,
  source TEXT NOT NULL DEFAULT 'Bank of Canada',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IDX_prime_rate_history_date ON prime_rate_history(effective_date);
```

### Service Layer

**TriggerRateMonitor:**
- `checkAll(): Promise<TriggerRateAlert[]>` - Check all mortgages for trigger rate status
- `checkOne(mortgageId: string): Promise<TriggerRateAlert | null>` - Check single mortgage

**Prime Rate Tracking Service:**
- `fetchCurrentPrimeRate(): Promise<PrimeRate>` - Fetch from Bank of Canada API
- `updateActiveTerms(): Promise<void>` - Update active terms with new Prime Rate
- `getPrimeRateHistory(): Promise<PrimeRateHistoryEntry[]>` - Get historical rates

**Mortgage Payment Service:**
- Calculate payments with trigger rate logic
- Track `triggerRateHit` flag
- Record negative amortization
- Handle prepayments during trigger rate

### Calculation Functions

**Trigger Rate Calculation:**
```typescript
function calculateTriggerRate(
  paymentAmount: number,
  remainingBalance: number,
  frequency: PaymentFrequency
): number {
  const paymentsPerYear = getPaymentsPerYear(frequency);
  const periodicRate = paymentAmount / remainingBalance;
  const effectiveAnnualRate = Math.pow(1 + periodicRate, paymentsPerYear) - 1;
  const semiAnnualRate = Math.pow(1 + effectiveAnnualRate, 1 / 2) - 1;
  const nominalAnnualRate = semiAnnualRate * 2;
  return nominalAnnualRate;
}
```

**Trigger Rate Check:**
```typescript
function isTriggerRateHit(
  currentRate: number,
  paymentAmount: number,
  remainingBalance: number,
  frequency: PaymentFrequency
): boolean {
  const triggerRate = calculateTriggerRate(paymentAmount, remainingBalance, frequency);
  return currentRate >= triggerRate;
}
```

**Negative Amortization Calculation:**
```typescript
const interestPayment = remainingBalance * effectivePeriodicRate;
const triggerRateHit = currentPaymentAmount <= interestPayment;

if (triggerRateHit) {
  unpaidInterest = interestPayment - currentPaymentAmount;
  principalPayment = 0;
  newBalance = remainingBalance + unpaidInterest - prepayment;
} else {
  principalPayment = currentPaymentAmount - interestPayment;
  newBalance = remainingBalance - principalPayment - prepayment;
}
```

### Scheduled Jobs

**Prime Rate Scheduler (`prime-rate-scheduler.ts`):**
- Schedule: Daily at 9 AM ET (configurable via `PRIME_RATE_SCHEDULER_SCHEDULE`)
- Function: `fetchAndUpdatePrimeRate()`
- Logic:
  1. Fetch current Prime Rate from Bank of Canada API
  2. Store in `primeRateHistory` table
  3. Update active terms: `primeRate` field in `mortgageTerms`
  4. Recalculate effective rates
  5. Trigger payment recalculation for VRM-Changing mortgages
  6. Trigger rate check for VRM-Fixed mortgages

**Trigger Rate Alert Job (`trigger-rate-alert-job.ts`):**
- Schedule: Daily at 10 AM ET (configurable via `TRIGGER_RATE_ALERT_SCHEDULE`)
- Function: `checkTriggerRatesAndSendAlerts()`
- Logic:
  1. Check all VRM-Fixed mortgages
  2. Calculate trigger rate status
  3. Determine alert type (approaching/close/hit)
  4. Check for existing alerts (deduplication)
  5. Send notifications if needed
  6. Log results

### Frontend Components

**TriggerRateStatusCard:**
- Displays trigger rate status
- Shows current rate, trigger rate, distance
- Visual status indicator
- Links to detailed view

**TriggerRateDetailPage:**
- Comprehensive trigger rate information
- Calculations and projections
- Balance impact analysis
- Action recommendations

**PaymentHistorySection:**
- Highlights trigger rate payments
- Shows balance increases
- Filter for trigger rate events
- Tooltips and explanations

**PrimeRateWidget:**
- Current Prime Rate display
- Rate change history chart
- Effective rate calculation

### Data Flow

**Prime Rate Update Flow:**
1. Scheduled job runs daily at 9 AM
2. Fetch Prime Rate from Bank of Canada API
3. Store in `primeRateHistory` table
4. Update active terms: `primeRate` field
5. Recalculate effective rates for all VRM terms
6. VRM-Changing: Recalculate payments
7. VRM-Fixed: Check trigger rates
8. Send rate change notifications

**Trigger Rate Check Flow:**
1. User requests trigger rate status or scheduled job runs
2. `TriggerRateMonitor.checkOne()` called
3. Fetch mortgage and active term
4. Get current balance from payment history
5. Calculate trigger rate (payment, balance, frequency)
6. Get current effective rate (Prime + Spread)
7. Calculate distance to trigger
8. Determine status (safe/approaching/close/hit)
9. Return `TriggerRateAlert`

**Payment Calculation Flow (VRM-Fixed):**
1. Calculate interest payment: `balance × effectivePeriodicRate`
2. Check trigger rate: `paymentAmount <= interestPayment`
3. If trigger rate hit:
   - Principal payment = 0
   - Unpaid interest = `interestPayment - paymentAmount`
   - Balance increases
4. If not hit:
   - Principal payment = `paymentAmount - interestPayment`
   - Balance decreases
5. Record payment with `triggerRateHit` flag

**Trigger Rate Alert Flow:**
1. Scheduled job runs daily
2. Check all VRM-Fixed mortgages
3. Calculate trigger rate status
4. Determine alert type based on distance
5. Check for existing alerts (deduplication)
6. Create notification with metadata
7. Send email and in-app notification
8. User views alert in notifications center

---

## Edge Cases & Error Handling

### Business Rules & Edge Cases

**Trigger Rate Calculation Edge Cases:**

1. **Zero Balance:**
   - Cannot calculate trigger rate (division by zero)
   - Handle gracefully (return null or error)
   - Should not occur in practice (mortgage would be paid off)

2. **Very High Payment:**
   - Payment significantly exceeds balance
   - Trigger rate would be very high
   - Handle correctly (calculation still valid)

3. **Very Low Balance:**
   - Balance close to zero
   - Trigger rate calculation may be unstable
   - Handle with appropriate precision

4. **Payment Frequency Edge Cases:**
   - Accelerated payments (accelerated-monthly, accelerated-biweekly)
   - Use base frequency for calculation (monthly, biweekly, weekly)
   - Ensure correct payments per year count

**Negative Amortization Edge Cases:**

1. **Exact Trigger Rate:**
   - Current rate exactly equals trigger rate
   - Payment = interest exactly
   - Principal payment = 0, balance stays same (no increase, no decrease)

2. **Prepayment Exceeds Unpaid Interest:**
   - Prepayment > unpaid interest
   - Balance decreases (prepayment reduces negative amortization)
   - Formula: `newBalance = oldBalance + unpaidInterest - prepayment`

3. **Very Large Rate Increase:**
   - Rate increases significantly above trigger rate
   - Large unpaid interest amounts
   - Balance increases substantially
   - Ensure calculations handle large numbers correctly

4. **Multiple Consecutive Trigger Rate Payments:**
   - Balance increases each payment
   - Trigger rate recalculated each time (based on new balance)
   - Trigger rate may change as balance increases

**Prime Rate Update Edge Cases:**

1. **API Failure:**
   - Bank of Canada API unavailable
   - Retry logic with exponential backoff
   - Use last known Prime Rate as fallback
   - Log error and alert administrators

2. **Rate Cap Constraint:**
   - Prime Rate increase exceeds cap
   - Rate limited to previous rate + cap
   - Effective rate limited accordingly
   - Log constraint application

3. **Rate Floor Constraint:**
   - Prime Rate decrease would go below floor
   - Rate limited to floor
   - Effective rate limited accordingly
   - Log constraint application

4. **No Rate Change:**
   - Prime Rate unchanged from previous day
   - Skip term updates (efficiency)
   - No notifications sent

**Payment Recalculation Edge Cases (VRM-Changing):**

1. **Balance Changed (Prepayment):**
   - Prepayment made before rate change
   - Recalculate payment based on new (lower) balance
   - Payment may decrease more than expected

2. **Amortization Period:**
   - Remaining amortization may have changed
   - Use current remaining amortization for recalculation
   - Ensure accurate payment calculation

3. **Rate Change During Payment Period:**
   - Rate changes mid-payment period
   - Apply new rate to current period (pro-rated if needed)
   - Next payment uses new rate

**Alert Deduplication Edge Cases:**

1. **Alert Upgrade:**
   - Previous alert: "approaching"
   - New status: "close"
   - Should send upgrade alert (more severe)
   - Previous alert context maintained

2. **Alert Downgrade:**
   - Previous alert: "hit"
   - New status: "close" (rates decreased)
   - May not send downgrade alert (less severe)
   - User still informed if status improves

3. **Multiple Mortgages:**
   - User has multiple VRM-Fixed mortgages
   - Each mortgage tracked separately
   - Alerts sent per mortgage
   - No cross-mortgage deduplication

### Error Handling

**API Error Responses:**

- **400 Bad Request:** Invalid mortgage ID or parameters
- **404 Not Found:** Mortgage not found or not VRM-Fixed
- **500 Internal Server Error:** Calculation error or unexpected error
- **503 Service Unavailable:** Prime Rate API unavailable

**Frontend Error Handling:**

- Display user-friendly error messages
- Show loading states during calculations
- Handle network errors gracefully
- Fallback to cached data if API fails
- Log errors for debugging

**Scheduled Job Error Handling:**

- Individual mortgage processing errors don't fail entire job
- Log errors with context (mortgage ID, error message)
- Continue processing remaining mortgages
- Alert administrators for critical failures
- Retry logic for transient failures

**Calculation Error Handling:**

- Validate inputs before calculations
- Handle edge cases (zero balance, division by zero)
- Return appropriate error messages
- Log calculation errors for debugging
- Use safe defaults where appropriate

---

## Testing Considerations

### Unit Tests

**Trigger Rate Calculation Tests:**
- `calculateTriggerRate()`: Calculate correctly for all payment frequencies
- `isTriggerRateHit()`: Correctly identify trigger rate hit conditions
- Edge cases: Zero balance, very high payment, very low balance
- Payment frequency variations: Monthly, biweekly, weekly, accelerated

**Negative Amortization Tests:**
- Balance increase calculation when trigger rate hit
- Prepayment impact during trigger rate
- Exact trigger rate condition (payment = interest)
- Multiple consecutive trigger rate payments

**Prime Rate Update Tests:**
- Rate cap constraint application
- Rate floor constraint application
- Rate change detection and updates
- Effective rate recalculation

**Payment Recalculation Tests (VRM-Changing):**
- Payment recalculation when Prime changes
- Payment based on current balance and remaining amortization
- Amortization schedule consistency

### Integration Tests

**Trigger Rate Monitoring:**
- Check trigger rate status for VRM-Fixed mortgage
- Verify calculation accuracy
- Test alert generation logic
- Verify deduplication

**Prime Rate Integration:**
- Fetch Prime Rate from Bank of Canada API (mocked)
- Update active terms correctly
- Recalculate payments for VRM-Changing
- Check trigger rates for VRM-Fixed

**Payment Processing:**
- Process payment with trigger rate hit
- Record negative amortization correctly
- Handle prepayments during trigger rate
- Update balance accurately

**Alert System:**
- Send trigger rate alerts
- Verify alert content and metadata
- Test deduplication logic
- Verify email and in-app notifications

### End-to-End Tests

**Trigger Rate Monitoring E2E:**
1. Create VRM-Fixed mortgage
2. Set Prime Rate to approach trigger rate
3. Verify trigger rate status updates
4. Receive approaching alert
5. Increase Prime Rate to hit trigger rate
6. Verify trigger rate hit status
7. Process payment with negative amortization
8. Verify balance increase
9. Make prepayment
10. Verify balance decrease

**Prime Rate Update E2E:**
1. Create VRM-Changing mortgage
2. Set initial Prime Rate
3. Verify initial payment
4. Update Prime Rate (increase)
5. Verify payment recalculation
6. Verify amortization schedule consistency

**Rate Cap/Floor E2E:**
1. Create VRM mortgage with rate cap
2. Attempt Prime Rate increase exceeding cap
3. Verify rate limited to cap
4. Create VRM mortgage with rate floor
5. Attempt Prime Rate decrease below floor
6. Verify rate limited to floor

---

## Future Enhancements

### Known Limitations

1. **Lender-Specific Trigger Rate Handling:**
   - Currently uses standard calculation
   - Some lenders may have variations
   - Could add lender-specific calculation methods

2. **Payment Increase Options:**
   - Currently shows required payment to prevent negative amortization
   - Could add workflow to request payment increase from lender
   - Could model payment increase scenarios

3. **Stress Testing Scenarios:**
   - Currently shows projections based on current rate
   - Could add stress testing (what if Prime increases by 2%?)
   - Could show worst-case scenarios

4. **Rate Lock Options:**
   - Currently tracks Prime Rate changes
   - Could add rate lock tracking for future rate changes
   - Could model rate lock scenarios

### Potential Improvements

**Enhanced Analytics:**
- Historical trigger rate exposure analysis
- Comparison of VRM-Changing vs VRM-Fixed performance
- Rate volatility analysis
- Balance projection scenarios

**Advanced Alerts:**
- Customizable alert thresholds
- Rate change predictions
- Stress test alerts
- Personalized recommendations

**Payment Strategy Tools:**
- Payment increase calculator
- Prepayment strategy optimizer
- Switching cost calculator (VRM-Fixed → VRM-Changing)
- Break-even analysis for payment increases

**Educational Content:**
- Interactive trigger rate calculator
- Educational videos/articles
- FAQ and glossary
- Comparison tools (VRM vs Fixed)

**Integration Enhancements:**
- Real-time Prime Rate updates (webhooks)
- Multiple rate source support
- Historical rate data from multiple sources
- Rate prediction models

---

**End of Feature Specification**

