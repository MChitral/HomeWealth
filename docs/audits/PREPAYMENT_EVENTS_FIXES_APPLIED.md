# Prepayment Events Fixes - Implementation Summary

**Date:** 2025-01-27  
**Status:** ✅ Implemented

---

## Fixes Applied

### Fix 1: Use Actual Mortgage Payment Frequency ✅

**File:** `client/src/features/scenario-management/scenario-editor.tsx`

**Before:**
```typescript
const scenarioPaymentFrequency: PaymentFrequency = "monthly"; // Hardcoded
```

**After:**
```typescript
const scenarioPaymentFrequency: PaymentFrequency = useMemo(() => {
  // Try to get from latest term first
  const latestTerm = terms && terms.length > 0 
    ? [...terms].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
    : null;
  
  if (latestTerm?.paymentFrequency) {
    return latestTerm.paymentFrequency as PaymentFrequency;
  }
  
  // Fallback to mortgage payment frequency
  if (mortgage?.paymentFrequency) {
    return mortgage.paymentFrequency as PaymentFrequency;
  }
  
  // Default to monthly if no data available
  return "monthly";
}, [mortgage, terms]);
```

**Impact:** Scenarios now use the actual mortgage payment frequency (biweekly, weekly, etc.) instead of always assuming monthly.

---

### Fix 2: Pass Payment Frequency to Projections Hook ✅

**File:** `client/src/features/scenario-management/scenario-editor.tsx`

**Added:**
```typescript
const projections = useScenarioEditorProjections({
  // ... existing props
  paymentFrequency: scenarioPaymentFrequency, // ← Added
});
```

---

### Fix 3: Fix One-Time Event Conversion ✅

**File:** `client/src/features/scenario-management/hooks/use-scenario-editor-projections.ts`

**Before:**
```typescript
if (event.eventType === "one-time" && event.oneTimeYear) {
  startPaymentNumber = (event.oneTimeYear - 1) * 12 + 1; // Assumes monthly
}
```

**After:**
```typescript
// Get payments per year for this frequency
const paymentsPerYear = getPaymentsPerYear(paymentFrequency);

if (event.eventType === "one-time" && event.oneTimeYear) {
  startPaymentNumber = (event.oneTimeYear - 1) * paymentsPerYear + 1;
}
```

**Impact:** One-time prepayment events are now correctly converted to payment numbers for all payment frequencies.

**Example:**
- **Monthly (12 payments/year):** Year 2 = Payment 13 ✓
- **Biweekly (26 payments/year):** Year 2 = Payment 27 ✓
- **Weekly (52 payments/year):** Year 2 = Payment 53 ✓

---

### Fix 4: Use Actual Payment Frequency in Projection Request ✅

**File:** `client/src/features/scenario-management/hooks/use-scenario-editor-projections.ts`

**Before:**
```typescript
paymentFrequency: "monthly", // Hardcoded
```

**After:**
```typescript
paymentFrequency: paymentFrequency, // Use actual mortgage payment frequency
```

**Impact:** Projection calculations now use the correct payment frequency, ensuring accurate interest calculations and payment schedules.

---

## Backend Annual Event Logic

**File:** `server/src/shared/calculations/mortgage.ts` (lines 586-602)

The backend already has logic to handle annual events for non-monthly frequencies:

```typescript
// Process annual prepayments (check if this payment matches the recurrence month)
const currentMonth = currentDate.getMonth() + 1; // 1-12
const annualPrepayments = prepayments.filter(
  p => p.type === 'annual' && 
      paymentNumber >= p.startPaymentNumber && 
      p.recurrenceMonth === currentMonth
);

for (const prep of annualPrepayments) {
  // Check if this is the first occurrence this year
  const yearsSinceStart = Math.floor((paymentNumber - prep.startPaymentNumber) / paymentsPerYear);
  const expectedPaymentForThisYear = prep.startPaymentNumber + (yearsSinceStart * paymentsPerYear);
  
  // Apply only if this is roughly the right payment for this year
  if (Math.abs(paymentNumber - expectedPaymentForThisYear) < paymentsPerYear / 12) {
    extraPrepayment += prep.amount;
  }
}
```

**Note:** The backend uses `paymentsPerYear / 12` as a tolerance window. For biweekly (26 payments/year), this is ~2.17 payments, which should work reasonably well. However, this could be improved further.

---

## Testing Checklist

### Monthly Payment Frequency
- [ ] One-time prepayment in Year 2 applies at Payment 13
- [ ] Annual prepayment in March applies in March each year

### Biweekly Payment Frequency
- [ ] One-time prepayment in Year 2 applies at Payment 27 (not 13)
- [ ] Annual prepayment in March applies approximately in March each year

### Weekly Payment Frequency
- [ ] One-time prepayment in Year 2 applies at Payment 53 (not 13)
- [ ] Annual prepayment in March applies approximately in March each year

---

## Remaining Considerations

### Annual Event Month Matching

The backend logic uses calendar month matching (`recurrenceMonth === currentMonth`), which works well for monthly payments but may have slight timing variations for biweekly/weekly payments.

**Current Behavior:**
- Monthly: Exact month match (e.g., March = Payment 3, 15, 27...)
- Biweekly: Approximate month match (e.g., March ≈ Payments 5-6, 31-32, 57-58...)
- Weekly: Approximate month match (e.g., March ≈ Payments 9-12, 61-64, 113-116...)

**This is acceptable** because:
1. The tolerance window (`paymentsPerYear / 12`) ensures the prepayment is applied within the correct month
2. For biweekly/weekly, exact calendar month alignment isn't critical - the prepayment is applied in the right general timeframe
3. Users typically think in terms of calendar months (e.g., "Tax refund in March"), not exact payment numbers

---

## Related Files Modified

1. `client/src/features/scenario-management/scenario-editor.tsx` - Get actual payment frequency
2. `client/src/features/scenario-management/hooks/use-scenario-editor-projections.ts` - Fix conversions and use actual frequency

---

## Next Steps

1. Test with different payment frequencies (monthly, biweekly, weekly)
2. Verify one-time prepayment timing
3. Verify annual prepayment timing
4. Confirm projection accuracy improves

