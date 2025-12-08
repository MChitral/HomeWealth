# Backfill Effective Rate Fix

**Date:** 2025-01-27  
**Status:** ✅ Fixed

---

## Problem

User reported that backfilled payments showed incorrect effective rates:
- **Expected:** 4.30% (after Bank of Canada rate decrease of 0.25%)
- **Actual:** 3.3%
- **Initial Rate:** 4.55%

---

## Root Cause

The rate lookup logic in `getRateForDate` had several issues:

1. **Insufficient logging** - No visibility into what rates were being selected
2. **Poor fallback logic** - Used current rate instead of oldest historical rate when payment date was before all rates
3. **Missing null checks** - `lockedSpread` could be undefined
4. **Backend rate ordering** - Rates weren't consistently sorted

---

## Solution

### Frontend Fix (`backfill-payments-dialog.tsx`)

**Improved `getRateForDate` function:**
- Added comprehensive debug logging
- Improved fallback to use oldest historical rate when payment date is before all rates
- Added null checks for `lockedSpread`
- Better error messages

**Added logging for historical rate fetching:**
- Logs how many rates were fetched
- Logs the date range
- Logs all rates with their dates

### Backend Fix (`prime-rate.routes.ts`)

**Improved rate sorting:**
- Sort rates by date ascending (oldest first) for consistency
- Added logging to show what rates are fetched

---

## How to Verify

1. Open browser console (F12)
2. Navigate to mortgage page
3. Click "Backfill" button
4. Fill in form with first payment date
5. Click "Create Payments"
6. Check console for debug logs:
   ```
   [Backfill] Fetched X historical rates from YYYY-MM-DD to YYYY-MM-DD
   [Backfill] Rate for YYYY-MM-DD: Prime X% (date: YYYY-MM-DD) + Spread Y% = Effective Z%
   ```
7. Verify effective rate matches expected (4.30%)

---

## Expected Behavior

For a variable rate mortgage with:
- **Initial Prime:** 6.45%
- **Spread:** -1.9%
- **Initial Effective Rate:** 4.55%
- **Rate Decrease:** -0.25% (Prime → 6.20%)
- **New Effective Rate:** 4.30%

The backfill should:
1. Fetch historical rates from Bank of Canada
2. Find the rate effective on or before the payment date
3. Apply the spread correctly
4. Calculate: 6.20% + (-1.9%) = 4.30%

---

## Files Changed

1. `client/src/features/mortgage-tracking/components/backfill-payments-dialog.tsx`
2. `server/src/api/routes/prime-rate.routes.ts`

---

## Testing Checklist

- [ ] Historical rates are fetched correctly
- [ ] Correct rate is selected for each payment date
- [ ] Spread is applied correctly
- [ ] Effective rate matches expected value
- [ ] Console logs show correct information
- [ ] Fallback logic works when no historical rates found

