# Mortgage Creation Prime Rate Bug

**Date:** 2025-01-27  
**Status:** 🔍 Investigating

---

## Problem

When creating a mortgage in **January 2025**, the system stores **6.45%** prime rate instead of **5.45%** (or 5.20%).

**Expected:**
- January 2025: **5.45%** (from Dec 12, 2024) or **5.20%** (from Jan 30, 2025)
- **NOT:** 6.45% (from Sep 5, 2024)

---

## Root Cause

### Issue: `ensurePrimeRate` Uses Current Rate

When creating a mortgage term, the backend calls `ensurePrimeRate()` which:
1. Fetches the **current** prime rate from Bank of Canada API
2. Uses that rate for the term's `primeRate` field

**Problem:** If the mortgage was created in January 2025, but we're creating it now (in late 2025), it fetches the **current** rate (4.45%) instead of the **historical** rate that was effective in January 2025 (5.45%).

---

## Code Flow

1. **Frontend:** User fills form, enters `primeRate` from form (which might be auto-filled with current rate)
2. **Backend:** `ensurePrimeRate()` is called, which:
   - Checks if `primeRate` is provided
   - If not, fetches **current** rate from API
   - Overwrites the provided rate with current rate

**File:** `server/src/api/routes/mortgage.routes.ts`
```typescript
async function ensurePrimeRate<T extends { termType?: string; primeRate?: string | number }>(payload: T): Promise<T> {
  // If variable rate and no prime rate provided, fetch current rate
  if (payload.termType !== "fixed" && !payload.primeRate) {
    const response = await fetch(BOC_PRIME_RATE_API);
    // ... fetches CURRENT rate
  }
  return payload;
}
```

---

## Solution

### Option 1: Use Historical Rate Based on Term Start Date

When creating a term, fetch the prime rate that was effective on the `startDate`, not the current rate:

```typescript
async function ensurePrimeRate<T extends { termType?: string; primeRate?: string | number; startDate?: string }>(payload: T): Promise<T> {
  if (payload.termType !== "fixed" && !payload.primeRate) {
    const startDate = payload.startDate;
    if (startDate) {
      // Fetch historical rate for startDate
      const historicalRate = await fetchHistoricalPrimeRate(startDate);
      payload.primeRate = historicalRate;
    } else {
      // Fallback to current rate
      const response = await fetch(BOC_PRIME_RATE_API);
      // ...
    }
  }
  return payload;
}
```

### Option 2: Trust Frontend-Provided Rate

If the frontend provides a `primeRate`, don't overwrite it:

```typescript
async function ensurePrimeRate<T extends { termType?: string; primeRate?: string | number }>(payload: T): Promise<T> {
  // Only fetch if not provided AND variable rate
  if (payload.termType !== "fixed" && !payload.primeRate) {
    // Fetch current rate
  }
  // If primeRate is provided, use it (don't overwrite)
  return payload;
}
```

### Option 3: Frontend Should Fetch Historical Rate

The frontend should fetch the historical rate for the term's start date before submitting:

```typescript
// In create-mortgage-dialog.tsx
const termStartDate = formData.startDate;
const historicalRate = await fetchHistoricalPrimeRate(termStartDate);
form.setValue("primeRate", historicalRate.toString());
```

---

## Recommended Fix

**Option 1 + Option 2 Combined:**
1. If frontend provides `primeRate`, use it (don't overwrite)
2. If not provided, fetch historical rate for `startDate`
3. If `startDate` not available, fallback to current rate

This ensures:
- Historical mortgages get correct historical rates
- Current mortgages get current rates
- User-provided rates are respected

---

## Files to Modify

1. `server/src/api/routes/mortgage.routes.ts` - Update `ensurePrimeRate` function
2. `server/src/api/routes/prime-rate.routes.ts` - Add `fetchHistoricalPrimeRate` helper
3. `client/src/features/mortgage-tracking/components/create-mortgage-dialog.tsx` - Optionally fetch historical rate

---

## Verification

After fix:
1. Create a mortgage with start date in January 2025
2. Check stored `primeRate` in database
3. Should be **5.45%** (or 5.20%), not 6.45%

