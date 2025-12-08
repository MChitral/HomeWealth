# Historical Prime Rate Fix

**Date:** 2025-01-27  
**Status:** ✅ Fixed

---

## Problem

When creating a mortgage term in **January 2025**, the system was storing **6.45%** prime rate instead of **5.45%**.

**Root Cause:**
- `ensurePrimeRate()` function fetched the **current** rate when `primeRate` was not provided
- If API failed, it used hardcoded fallback **6.450%**
- No logic to fetch historical rate based on term's `startDate`

---

## Solution

Updated `ensurePrimeRate()` to:
1. **Check if `startDate` is provided**
2. **Fetch historical rate** for that date from Bank of Canada API
3. **Use the most recent rate on or before `startDate`**
4. **Fallback to current rate** only if historical fetch fails or no `startDate`

---

## Implementation

**File:** `server/src/api/routes/mortgage.routes.ts`

```typescript
async function ensurePrimeRate<T extends { termType?: string; primeRate?: string | number; startDate?: string }>(payload: T): Promise<T> {
  if (payload.termType && payload.termType.startsWith("variable") && (payload.primeRate == null || payload.primeRate === "")) {
    try {
      // If startDate is provided, fetch historical rate for that date
      if (payload.startDate) {
        // Query Bank of Canada API for rates around startDate
        // Use most recent rate on or before startDate
        // ...
      }
      // Fallback to current rate
      // ...
    } catch {
      // Improved fallback based on startDate year
      // ...
    }
  }
  return payload;
}
```

---

## Expected Behavior

**Before Fix:**
- Mortgage created Jan 2025 → Stores **6.45%** (current rate or fallback)

**After Fix:**
- Mortgage created Jan 2025 → Stores **5.45%** (historical rate for Jan 2025)
- Mortgage created Sep 2024 → Stores **6.45%** (historical rate for Sep 2024)
- Mortgage created today → Stores **4.45%** (current rate)

---

## Verification

1. Create a new mortgage with start date in January 2025
2. Check stored `primeRate` in database
3. Should be **5.45%** (not 6.45%)

---

## Related Files

- `server/src/api/routes/mortgage.routes.ts` - `ensurePrimeRate` function
- `server/src/api/routes/prime-rate.routes.ts` - Historical rate API endpoint

