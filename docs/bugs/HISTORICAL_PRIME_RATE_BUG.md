# Historical Prime Rate Bug

**Date:** 2025-01-27  
**Status:** 🔍 Investigating

---

## Problem

User reports that when creating a mortgage in **January 2025**, the system is using **6.45%** prime rate instead of **5.45%** (or 5.20%).

**Expected Prime Rates (from Bank of Canada):**
- January 30, 2025: **5.20%**
- December 12, 2024: **5.45%**
- September 05, 2024: **6.45%** ❌ (this is what we're getting)

---

## Root Cause Analysis

### Issue 1: Date Range Query

The backfill dialog queries historical rates from `startDate` to `endDate`. If the mortgage was created in January 2025, but the query doesn't include the right date range, it might be using an older rate.

**Current Logic:**
```typescript
const queryStartDateStr = new Date(startDate);
queryStartDateStr.setMonth(queryStartDateStr.getMonth() - 1); // 1 month before
```

This should work, but let's verify what dates are actually being queried.

### Issue 2: Rate Lookup Logic

The `getRateForDate` function:
1. Sorts rates descending (newest first)
2. Finds first rate where `rate.date <= paymentDate`

**Problem:** Bank of Canada API only returns rates on **change dates**, not every day. So:
- If payment is Jan 15, 2025
- API has: Jan 30 (5.20%), Dec 12 (5.45%)
- Logic should use Dec 12 (5.45%) for Jan 15

But if the API doesn't return Dec 12 in the query range, it might fall back to an older rate.

### Issue 3: Bank of Canada API Response

The Bank of Canada API might:
- Not return all historical rates in the requested range
- Return rates in a different format
- Have gaps in the data

---

## Investigation Steps

1. **Check what date range is being queried:**
   - Log the `start_date` and `end_date` being sent to API
   - Verify the mortgage creation date

2. **Check Bank of Canada API response:**
   - Query API directly: `https://www.bankofcanada.ca/valet/observations/V121796/json?start_date=2024-12-01&end_date=2025-02-01`
   - Verify what rates are returned

3. **Check rate lookup logic:**
   - Verify `getRateForDate` is finding the correct rate
   - Check if dates are being compared correctly (timezone issues?)

4. **Check mortgage creation date:**
   - Verify when the mortgage was actually created
   - Check what prime rate was stored at creation time

---

## Expected Behavior

For a mortgage created in **January 2025**:
- **Early January (before Jan 30):** Should use **5.45%** (from Dec 12, 2024)
- **Late January (after Jan 30):** Should use **5.20%** (from Jan 30, 2025)
- **Never:** Should use **6.45%** (from Sep 5, 2024)

---

## Potential Fixes

### Fix 1: Expand Date Range Query

Query a wider date range to ensure we get all relevant rates:
```typescript
const queryStartDateStr = new Date(startDate);
queryStartDateStr.setMonth(queryStartDateStr.getMonth() - 6); // 6 months before
```

### Fix 2: Improve Rate Lookup

Ensure we're finding the most recent rate on or before the payment date:
```typescript
// Sort ascending, then find last rate <= payment date
const sortedRates = [...historicalRates].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);
const applicableRate = sortedRates
  .filter(r => r.date <= paymentDate)
  .pop(); // Get last (most recent) rate
```

### Fix 3: Add Fallback Logic

If no rate found in range, query a wider range or use a known fallback.

---

## Files to Check

- `client/src/features/mortgage-tracking/components/backfill-payments-dialog.tsx` - Rate lookup logic
- `server/src/api/routes/prime-rate.routes.ts` - API endpoint
- Check console logs for actual dates being queried

---

## Next Steps

1. ✅ Query Bank of Canada API directly to verify response
2. ⏸️ Check what date range is being queried in backfill
3. ⏸️ Verify mortgage creation date
4. ⏸️ Fix rate lookup logic if needed

