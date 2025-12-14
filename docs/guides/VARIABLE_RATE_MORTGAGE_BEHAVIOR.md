# Variable Rate Mortgage Behavior Guide

**Date:** December 2025  
**Purpose:** Comprehensive guide to Variable Rate Mortgage (VRM) types, trigger rates, and negative amortization behavior

---

## Overview

Canadian variable rate mortgages come in two main types, each with different payment behavior when interest rates change. This guide explains how the system models these behaviors, including the critical trigger rate condition for VRM-Fixed Payment mortgages.

---

## Variable Rate Mortgage Types

### 1. VRM-Changing Payment (Variable-Changing)

**Behavior:**
- Payment amount **adjusts** when Prime rate changes
- Payment always covers full interest + principal
- Amortization schedule remains consistent
- Balance always decreases (no negative amortization)

**How It Works:**
- When Prime rate increases → Payment increases
- When Prime rate decreases → Payment decreases
- Payment recalculated to maintain original amortization schedule
- Effective rate = Prime Rate + Locked Spread

**Example:**
- Original payment: $3,000/month at Prime 5.45% + Spread -0.9% = 4.55% effective
- Prime increases to 6.45% → Effective rate = 5.55%
- New payment: ~$3,150/month (recalculated to maintain amortization)

**Use Case:**
- Borrowers who want payment to reflect current rates
- Predictable amortization schedule
- No risk of negative amortization

---

### 2. VRM-Fixed Payment (Variable-Fixed)

**Behavior:**
- Payment amount **stays constant** regardless of Prime rate changes
- Payment may not cover full interest if rates rise too high
- Can result in negative amortization (balance increases)
- Trigger rate determines when payment becomes interest-only

**How It Works:**
- Payment amount locked at term start
- Effective rate = Prime Rate + Locked Spread
- If effective rate exceeds trigger rate → Payment doesn't cover interest
- Unpaid interest added to principal (negative amortization)

**Example:**
- Original payment: $3,000/month at Prime 5.45% + Spread -0.9% = 4.55% effective
- Prime increases to 6.45% → Effective rate = 5.55%
- Payment stays: $3,000/month (unchanged)
- If trigger rate hit → Balance increases by unpaid interest

**Use Case:**
- Borrowers who want predictable payment amounts
- Willing to accept potential negative amortization
- Risk of balance increasing if rates rise significantly

---

## Trigger Rate

### What Is Trigger Rate?

The **trigger rate** is the annual interest rate at which the fixed payment equals interest-only. When the effective rate exceeds the trigger rate:

- Payment doesn't cover full interest
- Unpaid interest is added to principal
- Balance increases (negative amortization)
- Amortization becomes undefined

### Calculation

**Formula:**
```
Trigger Rate = f(paymentAmount, remainingBalance, paymentFrequency)
```

The trigger rate is calculated such that:
```
paymentAmount = remainingBalance × periodicRate
```

Where `periodicRate` is derived from the trigger rate using Canadian semi-annual compounding.

**Code Location:** `server/src/shared/calculations/mortgage.ts`
- `calculateTriggerRate()` - Calculates trigger rate for given payment/balance
- `isTriggerRateHit()` - Checks if current rate exceeds trigger rate

### When Trigger Rate Is Hit

**Behavior:**
1. Payment amount stays constant (fixed payment)
2. Interest portion = `balance × effectivePeriodicRate`
3. If `paymentAmount <= interestPortion`:
   - Principal payment = 0
   - Unpaid interest = `interestPortion - paymentAmount`
   - Balance increases by unpaid interest
   - `triggerRateHit` flag set to `true` in payment record

**Example:**
- Balance: $500,000
- Payment: $3,000/month (fixed)
- Effective rate: 7.5% (Prime 6.45% + Spread 1.05%)
- Interest: $3,125/month
- Payment ($3,000) < Interest ($3,125)
- **Result:** 
  - Principal payment: $0
  - Unpaid interest: $125
  - New balance: $500,125 (increased!)
  - Trigger rate hit: `true`

---

## Negative Amortization

### What Is Negative Amortization?

**Negative amortization** occurs when the payment doesn't cover the full interest due, causing the mortgage balance to **increase** instead of decrease.

### When It Happens

- **VRM-Fixed Payment mortgages only**
- When effective rate exceeds trigger rate
- Payment amount is fixed (doesn't adjust)
- Unpaid interest is added to principal

### How It's Modeled

**Payment Calculation:**
```typescript
const interestPayment = remainingBalance * effectivePeriodicRate;
const triggerRateHit = currentPaymentAmount <= interestPayment;

if (triggerRateHit) {
  // Negative amortization
  principalPayment = 0;
  unpaidInterest = interestPayment - currentPaymentAmount;
  newBalance = remainingBalance + unpaidInterest; // Balance increases!
}
```

**Tracking:**
- `triggerRateHit` flag in payment records
- Balance increases tracked in amortization schedule
- UI displays warning when trigger rate is hit
- Payment history shows trigger rate events

### Impact

**Short Term:**
- Balance increases each payment period
- Amortization becomes undefined
- More interest accrues on larger balance

**Long Term:**
- If rates decrease → Payment may cover interest again
- If rates stay high → Balance continues increasing
- May require payment increase or refinancing

### Prepayments During Trigger Rate

**Behavior:**
- Prepayments can still be made
- Prepayments reduce the negative amortization
- Formula: `newBalance = oldBalance + unpaidInterest - prepayment`
- If prepayment > unpaid interest → Balance decreases

**Example:**
- Balance: $500,000
- Unpaid interest: $125
- Prepayment: $500
- **Result:**
  - Balance: $500,000 + $125 - $500 = $499,625 (decreased!)

---

## Prime + Spread Pricing

### How It Works

**Formula:**
```
Effective Rate = Prime Rate + Locked Spread
```

**Components:**
- **Prime Rate:** Bank of Canada prime rate (changes over time)
- **Locked Spread:** Fixed spread locked at term start (e.g., -0.9%, +0.5%)

**Example:**
- Prime Rate: 6.45%
- Locked Spread: -0.9%
- **Effective Rate:** 5.55%

### Rate Updates

**VRM-Changing Payment:**
- Payment recalculated when Prime changes
- New payment = recalculated for new effective rate

**VRM-Fixed Payment:**
- Payment stays constant
- Effective rate changes with Prime
- May hit trigger rate if Prime rises too much

### Prime Rate Tracking

**Source:** Bank of Canada API
- Endpoint: `https://www.bankofcanada.ca/valet/observations/V121796/json`
- Updated automatically via scheduler (daily at 9 AM ET)
- Historical rates stored in database

**Code Location:**
- `server/src/application/services/prime-rate-tracking.service.ts`
- `server/src/infrastructure/jobs/prime-rate-scheduler.ts`

---

## UI Indicators

### Payment History

**Trigger Rate Hit Indicator:**
- Payment row highlighted (red background)
- "Trigger" badge displayed
- Tooltip explains trigger rate condition

**Location:** `client/src/features/mortgage-tracking/components/payment-history-section.tsx`

### Dashboard Warnings

**Current Payment Preview:**
- Shows if next payment will hit trigger rate
- Displays warning message
- Suggests increasing payment or making prepayment

**Location:** `client/src/features/dashboard/components/current-financial-status-card.tsx`

---

## Calculation Examples

### Example 1: VRM-Changing Payment

**Initial:**
- Balance: $500,000
- Prime: 5.45%, Spread: -0.9% → Effective: 4.55%
- Payment: $2,800/month

**Prime Increases to 6.45%:**
- Effective: 5.55%
- **New Payment:** ~$3,050/month (recalculated)
- Balance continues decreasing normally

### Example 2: VRM-Fixed Payment (Normal)

**Initial:**
- Balance: $500,000
- Prime: 5.45%, Spread: -0.9% → Effective: 4.55%
- Payment: $2,800/month (fixed)

**Prime Increases to 6.45%:**
- Effective: 5.55%
- **Payment:** $2,800/month (unchanged)
- Interest: ~$2,312/month
- Principal: ~$488/month
- Balance decreases normally

### Example 3: VRM-Fixed Payment (Trigger Rate Hit)

**Initial:**
- Balance: $500,000
- Prime: 5.45%, Spread: -0.9% → Effective: 4.55%
- Payment: $2,800/month (fixed)
- Trigger Rate: ~6.7%

**Prime Increases to 7.45%:**
- Effective: 6.55%
- **Payment:** $2,800/month (unchanged)
- Interest: ~$2,729/month
- Payment ($2,800) < Interest ($2,729) → **Trigger rate hit!**
- Principal: $0
- Unpaid interest: $0 (payment covers interest, barely)
- Balance: $500,000 (no change this period)

**Prime Increases Further to 8.45%:**
- Effective: 7.55%
- Interest: ~$3,146/month
- Payment ($2,800) < Interest ($3,146) → **Trigger rate hit!**
- Principal: $0
- Unpaid interest: $346
- **New Balance:** $500,346 (increased!)

---

## Best Practices

### For Borrowers

**VRM-Changing Payment:**
- Good for: Predictable amortization, no negative amortization risk
- Consider: Payment may increase significantly if rates rise

**VRM-Fixed Payment:**
- Good for: Predictable payment amounts
- Watch for: Trigger rate conditions, negative amortization
- Action: Monitor rates, consider prepayments if trigger rate hit

### For Developers

**When Implementing:**
- Always check trigger rate for VRM-Fixed Payment
- Track `triggerRateHit` flag in payment records
- Display warnings when trigger rate is hit
- Allow prepayments even during trigger rate conditions
- Recalculate amortization when rates change (VRM-Changing)

---

## Testing

**Test Files:**
- `server/src/shared/calculations/__tests__/trigger-rate-calculation.test.ts`
- `server/src/shared/calculations/__tests__/negative-amortization.test.ts`

**Test Coverage:**
- ✅ Trigger rate calculation accuracy
- ✅ Negative amortization behavior
- ✅ Prepayment impact during trigger rate
- ✅ Rate change scenarios
- ✅ Edge cases (exact trigger rate, zero balance, etc.)

---

## Conclusion

The system accurately models both VRM types with proper handling of trigger rates and negative amortization. This ensures realistic projections and helps borrowers understand the implications of their mortgage choices.

**Key Takeaways:**
- VRM-Changing: Payment adjusts, no negative amortization
- VRM-Fixed: Payment fixed, may hit trigger rate
- Trigger rate: Rate where payment = interest only
- Negative amortization: Balance increases when trigger rate hit
- Prepayments: Can reduce negative amortization

