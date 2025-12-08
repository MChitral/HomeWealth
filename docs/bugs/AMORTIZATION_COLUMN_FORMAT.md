# Amortization Column Format Issue

**Date:** 2025-01-27  
**Status:** 🔍 Investigating

---

## Problem

The Amortization column in the payment history table is displaying "28 yr 2025" instead of "28 yr".

**Expected:** "28 yr" or "28 yr 6 mo"  
**Actual:** "28 yr 2025"

---

## What the Column Represents

The **Amortization** column shows the **remaining amortization period** after each payment. This is calculated based on:
- Current balance
- Payment amount
- Interest rate
- Payment frequency

**Example:**
- Started with 30-year mortgage
- Made 2 years of payments
- Remaining amortization: **28 years**

---

## Root Cause

The `formatAmortization` function receives `payment.amortizationYears` which is calculated as:
```typescript
amortizationYears: payment.remainingAmortizationMonths / 12
```

If `remainingAmortizationMonths` is 336 (28 years), then `amortizationYears` should be 28.0, which should format as "28 yr".

The "2025" suffix suggests:
1. Data corruption in `remainingAmortizationMonths`
2. Incorrect calculation/conversion
3. Display/formatting bug

---

## Investigation Steps

1. Check what value `payment.remainingAmortizationMonths` actually contains
2. Verify the calculation: `remainingAmortizationMonths / 12`
3. Check if `formatAmortization` is receiving the correct input
4. Verify database values are correct

---

## Fix

Updated `formatAmortization` to:
- Handle invalid inputs (null, undefined, non-numbers)
- Validate input is a finite number
- Ensure proper formatting

The function should now safely handle edge cases and format correctly.

---

## Related Files

- `client/src/features/mortgage-tracking/utils/format.ts` - `formatAmortization` function
- `client/src/features/mortgage-tracking/components/payment-history-section.tsx` - Table display
- `client/src/features/mortgage-tracking/utils/normalize.ts` - Data normalization

