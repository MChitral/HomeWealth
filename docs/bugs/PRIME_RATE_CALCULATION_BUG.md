# Prime Rate Calculation Bug

**Date:** 2025-01-27  
**Severity:** High  
**Status:** 🔍 Investigating

---

## Problem Description

User reports incorrect effective rate calculation:
- **Displayed:** Current Prime Rate 4.45%, Current Effective Rate 2.55%
- **Expected:** Current Effective Rate 3.55% (according to bank)
- **Spread:** -1.9% (locked)

**Calculation:**
- If effective rate = 3.55% and spread = -1.9%
- Then: Prime = 3.55% + 1.9% = **5.45%**
- But app shows: Prime = 4.45%

---

## Root Cause Analysis

### Issue 1: Wrong Prime Rate Value

The `currentPrimeRateValue` in `use-mortgage-computed.ts` uses a fallback chain:
1. `primeRateData?.primeRate` - Current Bank of Canada API rate
2. `uiCurrentTerm?.primeRate` - Stored in term (might be old)
3. `paymentHistory[paymentHistory.length - 1]?.primeRate` - Last payment's rate
4. `parseFloat(primeRate)` - Prop value
5. `0` - Fallback

**Problem:** If `primeRateData` is not available or wrong, it falls back to old stored values.

### Issue 2: API Endpoint May Be Wrong

The API endpoint `V121796` might not be returning the correct prime rate. Console logs show rates decreasing from 5.45% to 4.45%, which seems unusual.

---

## Expected Behavior

For a variable rate mortgage with:
- **Spread:** -1.9% (locked)
- **Current Prime:** Should be 5.45% (to get 3.55% effective)
- **Current Effective Rate:** 5.45% + (-1.9%) = **3.55%**

---

## Investigation Steps

1. **Verify API Endpoint:**
   - Check what V121796 actually returns
   - Verify if it's the prime rate or policy rate
   - Check if there's a better endpoint

2. **Check Fallback Logic:**
   - Verify `primeRateData` is being fetched correctly
   - Check if fallback values are stale
   - Ensure current rate is always used

3. **Add Debug Logging:**
   - Log what prime rate value is being used
   - Log where it came from (API, term, payment, etc.)
   - Log the effective rate calculation

---

## Potential Fixes

### Fix 1: Always Use Current Prime Rate Data

Ensure `primeRateData` is always fetched and used, never fall back to stale values.

### Fix 2: Verify API Endpoint

Check if V121796 is the correct endpoint for prime rate, or if we need a different one.

### Fix 3: Add Validation

Add validation to ensure prime rate values are reasonable (should be around 4-7% typically).

---

## Related Files

- `client/src/features/mortgage-tracking/hooks/use-mortgage-computed.ts`
- `server/src/api/routes/prime-rate.routes.ts`
- `client/src/features/mortgage-tracking/hooks/use-prime-rate.ts`

