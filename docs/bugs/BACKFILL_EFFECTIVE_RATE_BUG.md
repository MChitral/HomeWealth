# Backfill Effective Rate Calculation Bug

**Date:** 2025-01-27  
**Severity:** High  
**Status:** 🔍 Investigating

---

## Problem Description

User reports that when backfilling payments:
- **Expected:** First payment effective rate should be **4.30%** (Bank of Canada decreased rate by 0.25% from 4.55%)
- **Actual:** First payment effective rate shows **3.3%**
- **Initial Rate:** 4.55% (at mortgage start)

---

## Root Cause Analysis

### Current Logic (`getRateForDate` function)

**File:** `client/src/features/mortgage-tracking/components/backfill-payments-dialog.tsx`

```typescript
const getRateForDate = (dateStr: string): number => {
  if (currentTerm.termType === "fixed") {
    return currentTerm.fixedRate || 4.5;
  }

  const sortedRates = [...historicalRates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  for (const rate of sortedRates) {
    if (rate.date <= dateStr) {
      return rate.primeRate + currentTerm.lockedSpread;
    }
  }

  return (primeRateData?.primeRate || 5.45) + currentTerm.lockedSpread;
};
```

### Issues Identified

1. **Rate Lookup Logic:**
   - Rates are sorted **descending** (newest first)
   - Finds first rate where `rate.date <= dateStr`
   - This should work correctly, but may have edge cases

2. **Historical Rate Fetching:**
   - Fetches rates from `queryStartDate` (3 months before start) to `endDate`
   - Bank of Canada API returns observations, but may not have exact dates
   - Need to verify what dates are actually returned

3. **Spread Calculation:**
   - Uses `currentTerm.lockedSpread` 
   - Need to verify if spread is correct: `4.55% - 4.30% = 0.25%` (if prime was 6.45%, then spread = -1.9%)
   - If effective rate is 3.3%, and prime is 6.45%, then spread would be -3.15% (incorrect)

4. **Fallback Logic:**
   - If no historical rate found, uses `primeRateData?.primeRate || 5.45`
   - This might be using current rate instead of historical rate

---

## Expected Behavior

For a variable rate mortgage:
- **Initial Rate:** 4.55% (Prime 6.45% + Spread -1.9%)
- **After Rate Decrease:** Prime decreases by 0.25% → 6.20%
- **New Effective Rate:** 6.20% + (-1.9%) = **4.30%**

---

## Investigation Steps

1. **Check Historical Rate Data:**
   - Verify what dates Bank of Canada API returns
   - Check if rate changes are captured correctly
   - Verify date format matching

2. **Check Spread Calculation:**
   - Verify `lockedSpread` value is correct
   - Check if spread is being applied correctly
   - Verify initial rate calculation

3. **Check Rate Lookup:**
   - Verify `getRateForDate` finds correct rate
   - Check date comparison logic
   - Verify sorting is correct

4. **Check Fallback:**
   - Verify fallback doesn't use wrong rate
   - Check if historical rates are being fetched correctly

---

## Potential Fixes

### Fix 1: Improve Rate Lookup Logic

```typescript
const getRateForDate = (dateStr: string): number => {
  if (currentTerm.termType === "fixed") {
    return currentTerm.fixedRate || 4.5;
  }

  // Sort rates descending (newest first)
  const sortedRates = [...historicalRates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Find the most recent rate that was effective on or before the payment date
  for (const rate of sortedRates) {
    if (rate.date <= dateStr) {
      const effectiveRate = rate.primeRate + currentTerm.lockedSpread;
      console.log(`[DEBUG] Rate for ${dateStr}: Prime ${rate.primeRate}% + Spread ${currentTerm.lockedSpread}% = ${effectiveRate}%`);
      return effectiveRate;
    }
  }

  // Fallback: Use the oldest rate in history, or current rate
  if (sortedRates.length > 0) {
    const oldestRate = sortedRates[sortedRates.length - 1];
    console.log(`[DEBUG] Using oldest historical rate: ${oldestRate.primeRate}%`);
    return oldestRate.primeRate + currentTerm.lockedSpread;
  }

  console.log(`[DEBUG] No historical rates found, using current rate: ${primeRateData?.primeRate || 5.45}%`);
  return (primeRateData?.primeRate || 5.45) + currentTerm.lockedSpread;
};
```

### Fix 2: Verify Historical Rate Fetching

Check if the date range is correct and if rates are being fetched for the right period.

### Fix 3: Add Debug Logging

Add console logs to track:
- What historical rates are fetched
- What rate is selected for each payment date
- What spread is being used
- What effective rate is calculated

---

## Fixes Applied

### Fix 1: Improved Rate Lookup Logic
**File:** `client/src/features/mortgage-tracking/components/backfill-payments-dialog.tsx`

**Changes:**
1. Added comprehensive debug logging to track rate selection
2. Improved fallback logic to use oldest historical rate if payment date is before all rates
3. Added null checks for `lockedSpread`
4. Added console logs to show:
   - What historical rates are fetched
   - What rate is selected for each payment date
   - What spread is being used
   - What effective rate is calculated

### Fix 2: Backend Rate Sorting
**File:** `server/src/api/routes/prime-rate.routes.ts`

**Changes:**
1. Sort rates by date ascending (oldest first) on backend
2. Added logging to show what rates are fetched
3. Ensures consistent ordering for frontend processing

## Testing Steps

1. **Open browser console** (F12)
2. **Navigate to mortgage page**
3. **Click "Backfill" button**
4. **Fill in backfill form:**
   - Start Date: First payment date
   - Number of Payments: 1 (to test first payment)
   - Payment Amount: Your payment amount
5. **Click "Create Payments"**
6. **Check console logs** for:
   - `[Backfill] Fetched X historical rates...`
   - `[Backfill] Rate for [date]: Prime X% + Spread Y% = Effective Z%`
7. **Verify:**
   - Historical rates are fetched correctly
   - Correct rate is selected for first payment date
   - Effective rate matches expected (4.30%)
   - Spread is applied correctly

## Expected Console Output

```
[Backfill] Fetched 4 historical rates from 2024-10-01 to 2025-01-01
  2024-10-01: 6.45%, 2024-11-01: 6.45%, 2024-12-01: 6.20%, 2025-01-01: 6.20%
[Backfill] Rate for 2024-12-15: Prime 6.20% (date: 2024-12-01) + Spread -1.9% = Effective 4.30%
```

## Related Issue

This bug is related to the **Prime Rate Calculation Bug** - if the wrong prime rate is being used, all effective rate calculations will be wrong, including backfill.

See: `docs/bugs/PRIME_RATE_INVESTIGATION.md`

## Next Steps

1. ✅ Added debug logging
2. ✅ Improved rate lookup logic
3. ✅ Added backend logging
4. ⏸️ Verify API endpoint returns correct prime rate
5. ⏸️ Test with actual data
6. ⏸️ Verify fix resolves the issue

---

## Related Files

- `client/src/features/mortgage-tracking/components/backfill-payments-dialog.tsx`
- `server/src/api/routes/prime-rate.routes.ts`
- `client/src/features/mortgage-tracking/api/mortgage-api.ts`

