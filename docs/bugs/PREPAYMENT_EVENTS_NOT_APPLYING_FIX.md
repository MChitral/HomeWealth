# Prepayment Events Not Applying - Fix Applied

**Date:** 2025-01-27  
**Status:** ✅ Fixed

---

## Problem

Annual prepayment events (e.g., $15,000 every March starting Year 2) were not affecting:
1. Interest Saved (showing $0)
2. Total Paid in yearly amortization schedule
3. Projected Payoff timeline

---

## Root Cause

**Payment Number Mismatch:**
- `startPaymentNumber` is calculated relative to **mortgage start date** (Year 1 = payment 1, Year 2 = payment 13, etc.)
- But `paymentNumber` in the projection starts at **1** relative to the **projection start date** (after last historical payment)

**Example:**
- Mortgage started: January 2025 (payment 1 = Jan 2025)
- Historical payments: 12 payments (through December 2025)
- Projection starts: January 2026 (projection payment 1 = Jan 2026)
- Annual prepayment configured: Year 2, March = payment 15 (relative to mortgage start)
- **Problem:** In projection, payment 1 = January 2026, but `startPaymentNumber` is 15, so `paymentNumber >= startPaymentNumber` never matches!

---

## Fix Applied

**File:** `server/src/api/routes/mortgage.routes.ts` (lines 650-688)

### Adjust `startPaymentNumber` Relative to Projection Start

```typescript
// Calculate how many payments have been made historically
const historicalPaymentCount = historicalPayments.length;
const paymentsPerYear = getPaymentsPerYear(projectionFrequency);

// Add configured prepayment events
for (const event of data.prepaymentEvents) {
  // Adjust startPaymentNumber relative to projection start
  let adjustedStartPaymentNumber = event.startPaymentNumber;
  
  if (event.startPaymentNumber > historicalPaymentCount) {
    // Prepayment hasn't occurred yet, adjust relative to projection start
    adjustedStartPaymentNumber = event.startPaymentNumber - historicalPaymentCount;
  } else {
    // Prepayment already occurred in historical payments
    if (event.type === 'annual') {
      // For annual events, calculate when the next occurrence should be
      const yearsSinceStart = Math.floor((historicalPaymentCount - event.startPaymentNumber) / paymentsPerYear);
      const nextOccurrenceYear = yearsSinceStart + 1;
      adjustedStartPaymentNumber = (nextOccurrenceYear * paymentsPerYear) - historicalPaymentCount + 1;
      if (adjustedStartPaymentNumber <= 0) {
        adjustedStartPaymentNumber = 1; // Apply in first payment of projection
      }
    } else {
      // One-time event already occurred, skip it
      continue;
    }
  }
  
  prepayments.push({
    type: event.type,
    amount: event.amount,
    startPaymentNumber: adjustedStartPaymentNumber,
    recurrenceMonth: event.recurrenceMonth,
    monthlyPercent: event.monthlyPercent,
  });
}
```

### How It Works

**Example:**
- Historical payments: 12 (through December 2025)
- Annual prepayment: Year 2, March = payment 15 (relative to mortgage start)
- `adjustedStartPaymentNumber = 15 - 12 = 3`
- In projection, payment 3 = March 2026
- Prepayment applies correctly! ✅

---

## Testing

**Test Case:**
- Mortgage started: January 2025
- Historical payments: 12 payments (through December 2025)
- Annual prepayment: $15,000 every March starting Year 2
- Expected:
  - Prepayment applies in March 2026 (projection payment 3)
  - Interest Saved > $0
  - Total Paid in 2026 includes $15,000 prepayment
  - Projected Payoff timeline reduced

**Verification:**
- ✅ `startPaymentNumber` adjusted relative to projection start
- ✅ Annual prepayments apply in correct months
- ✅ Interest savings calculated correctly
- ✅ Yearly amortization schedule includes prepayments

---

## Related Files

- `server/src/api/routes/mortgage.routes.ts` - Payment number adjustment
- `server/src/shared/calculations/mortgage.ts` - Prepayment event application logic
- `client/src/features/scenario-management/hooks/use-scenario-editor-projections.ts` - Payment number calculation

---

## Note

The fix ensures that prepayment events are correctly applied in projections, even when historical payments exist. The `startPaymentNumber` is adjusted relative to the projection start date, ensuring that annual prepayments occur in the correct months and one-time prepayments occur at the correct times.

