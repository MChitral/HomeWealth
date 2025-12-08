# Prepayment Events Fix Audit

**Date:** 2025-01-27  
**Status:** 🔍 Issue Found

---

## Current State

**User Configuration:**
- Annual prepayment: $10,000 every March starting Year 2
- Interest Saved: **$0** (should be > $0)
- 2026 Total Paid: **$18,008** (should include $10,000 prepayment = ~$28,008)

---

## Problem Analysis

### Issue 1: `startPaymentNumber` Doesn't Account for Month

**Current Calculation:**
```typescript
// In use-scenario-editor-projections.ts
startPaymentNumber = (event.startYear - 1) * paymentsPerYear + 1;
// Year 2 = (2-1) * 12 + 1 = 13
```

**Problem:**
- `startPaymentNumber = 13` means "start from payment 13" = January of Year 2
- But prepayment should occur in **March** (month 3) = payment 15
- The month offset is not included in `startPaymentNumber`

**Annual Prepayment Logic:**
```typescript
// In mortgage.ts
const annualPrepayments = prepayments.filter(
  p => p.type === 'annual' && 
      paymentNumber >= p.startPaymentNumber &&  // ❌ This is wrong!
      p.recurrenceMonth === currentMonth
);
```

**The Logic:**
1. Checks `paymentNumber >= startPaymentNumber` (paymentNumber must be >= 13)
2. Checks `recurrenceMonth === currentMonth` (month must be March = 3)
3. But payment 3 in projection = March 2026, and `3 >= 13` is FALSE!

**Result:** Prepayment never applies because `paymentNumber (3) < startPaymentNumber (13)`.

---

## Root Cause

The `startPaymentNumber` for annual events represents the **first payment of the year**, but we need it to represent the **payment number in that specific month**.

**Example:**
- Year 2, March = payment 15 (not payment 13)
- Payment 15 = 12 (Year 1) + 3 (months into Year 2) = 15

**Current Calculation:**
- Year 2, March = `(2-1) * 12 + 1 = 13` ❌ (This is January!)

**Correct Calculation:**
- Year 2, March = `(2-1) * 12 + 3 = 15` ✅ (This is March!)

---

## Fix Required

### Option 1: Adjust `startPaymentNumber` to Include Month Offset

```typescript
// In use-scenario-editor-projections.ts
if (event.eventType === "annual" && event.startYear && event.recurrenceMonth) {
  // Year N, Month M = payment ((N-1) * paymentsPerYear + M)
  // E.g., Year 2, March = (2-1) * 12 + 3 = 15
  startPaymentNumber = (event.startYear - 1) * paymentsPerYear + event.recurrenceMonth;
}
```

### Option 2: Fix Annual Prepayment Logic to Not Require `paymentNumber >= startPaymentNumber`

The annual prepayment logic already checks the month, so the `paymentNumber >= startPaymentNumber` check might be redundant or incorrect. We could:
- Remove the `paymentNumber >= startPaymentNumber` check for annual events
- Or adjust it to check if we're in the correct year instead

---

## Recommended Fix

**Fix `startPaymentNumber` calculation to include month offset:**

```typescript
// In use-scenario-editor-projections.ts
} else if (event.eventType === "annual" && event.startYear) {
  // For annual events, convert startYear + recurrenceMonth to payment number
  // Year N, Month M = payment ((N-1) * paymentsPerYear + M)
  // E.g., Year 2, March (month 3) = (2-1) * 12 + 3 = 15
  const monthOffset = event.recurrenceMonth || 1; // Default to January if not specified
  startPaymentNumber = (event.startYear - 1) * paymentsPerYear + monthOffset;
}
```

Then in the projection adjustment:
- Historical payments: 12
- `startPaymentNumber = 15` (Year 2, March)
- Adjusted: `15 - 12 = 3` ✅
- Payment 3 in projection = March 2026 ✅

---

## Testing

**After Fix:**
- Annual prepayment: $10,000 every March starting Year 2
- Expected: Prepayment applies in March 2026 (projection payment 3)
- Expected: 2026 Total Paid = $18,008 + $10,000 = $28,008
- Expected: Interest Saved > $0

