# Prepayment Events Not Applying Bug

**Date:** 2025-01-27  
**Status:** 🔍 Investigating

---

## Problem

Annual prepayment events (e.g., $15,000 every March starting Year 2) are not affecting:
1. Interest Saved (showing $0)
2. Total Paid in yearly amortization schedule
3. Projected Payoff timeline

---

## Root Cause Analysis

### Issue: Payment Number Mismatch

**The Problem:**
- `startPaymentNumber` is calculated relative to **mortgage start date** (Year 1 = payment 1, Year 2 = payment 13, etc.)
- But `paymentNumber` in the projection starts at **1** relative to the **projection start date** (after last historical payment)

**Example:**
- Mortgage started: January 2025 (payment 1 = Jan 2025)
- Historical payments: Through December 2025 (payment 12 = Dec 2025)
- Projection starts: January 2026 (projection payment 1 = Jan 2026)
- Annual prepayment configured: Year 2, March = payment 15 (March 2026 relative to mortgage start)
- **Problem:** In projection, payment 1 = January 2026, so payment 15 doesn't exist!

**Current Logic:**
```typescript
// In use-scenario-editor-projections.ts
startPaymentNumber = (event.startYear - 1) * paymentsPerYear + 1;
// Year 2 = (2-1) * 12 + 1 = 13 (relative to mortgage start)

// In mortgage.ts
if (paymentNumber >= p.startPaymentNumber && p.recurrenceMonth === currentMonth) {
  // paymentNumber starts at 1 in projection, but startPaymentNumber is 13
  // So paymentNumber (1-12) never >= startPaymentNumber (13)
  // Prepayment never applies!
}
```

---

## Solution

### Adjust `startPaymentNumber` Relative to Projection Start

We need to:
1. Calculate how many payments have been made historically
2. Subtract that from `startPaymentNumber` to get the relative payment number in the projection
3. If the result is <= 0, the prepayment event has already occurred and shouldn't apply

**Fix:**
```typescript
// In mortgage.routes.ts, before calling generateAmortizationScheduleWithPayment
const historicalPaymentCount = historicalPayments.length;
const adjustedPrepayments = prepayments.map(prep => {
  if (prep.startPaymentNumber > historicalPaymentCount) {
    return {
      ...prep,
      startPaymentNumber: prep.startPaymentNumber - historicalPaymentCount
    };
  } else {
    // Prepayment already occurred, don't include it
    return null;
  }
}).filter(Boolean);
```

---

## Related Files

- `server/src/api/routes/mortgage.routes.ts` - Projection endpoint
- `client/src/features/scenario-management/hooks/use-scenario-editor-projections.ts` - Payment number calculation
- `server/src/shared/calculations/mortgage.ts` - Prepayment event application logic

---

## Testing

**Test Case:**
- Mortgage started: January 2025
- Historical payments: 12 payments (through December 2025)
- Annual prepayment: $15,000 every March starting Year 2
- Expected: Prepayment should apply in March 2026 (projection payment 3)
- Actual: Prepayment not applying

**After Fix:**
- `startPaymentNumber` = 13 (Year 2, March relative to mortgage start)
- `historicalPaymentCount` = 12
- Adjusted `startPaymentNumber` = 13 - 12 = 1
- But wait, March is month 3, so it should be payment 3 in the projection...

Actually, the issue is more complex. We need to:
1. Calculate which payment number corresponds to March in Year 2
2. Adjust that relative to the projection start
3. Account for the month offset

Let me think about this more carefully...

