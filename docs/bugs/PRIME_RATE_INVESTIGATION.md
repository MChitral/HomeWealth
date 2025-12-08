# Prime Rate Investigation

**Date:** 2025-01-27  
**Status:** 🔍 Investigating

---

## Problem Summary

**User Reports:**
- **Displayed:** Current Prime Rate 4.45%, Current Effective Rate 2.55%
- **Expected:** Current Effective Rate 3.55% (according to bank)
- **Spread:** -1.9% (locked)

**Calculation:**
- If effective rate = 3.55% and spread = -1.9%
- Then: Prime = 3.55% + 1.9% = **5.45%**
- But app shows: Prime = 4.45%

---

## Analysis

### Current Situation

From console logs, the API endpoint `V121796` is returning rates:
- 2024-12-18: 5.45%
- 2025-02-05: 5.2%
- 2025-03-19: 4.95%
- 2025-09-24: 4.7%
- 2025-11-05: 4.45%

These rates are **decreasing over time**, which is unusual for prime rates.

### Possible Issues

1. **Wrong API Endpoint:**
   - V121796 might be returning the Bank of Canada's **policy rate** (overnight rate), not the **prime rate**
   - Policy rate is typically ~2-3%
   - Prime rate = Policy rate + ~3% (set by banks)
   - If policy is 2.25%, prime should be ~5.25-5.45%

2. **Fallback Using Stale Data:**
   - The fallback chain might be using old prime rate from term or payments
   - Should always use current API data

3. **Rate Calculation:**
   - Effective rate = Prime + Spread
   - If prime is wrong, effective rate will be wrong

---

## Fixes Applied

### Fix 1: Improved Fallback Priority
**File:** `client/src/features/mortgage-tracking/hooks/use-mortgage-computed.ts`

**Changes:**
- Always prefer `primeRateData` from API first
- Only fall back to term/payment rates if API data unavailable
- Added debug logging to show rate source

### Fix 2: Added API Logging
**File:** `server/src/api/routes/prime-rate.routes.ts`

**Changes:**
- Added logging to show what rate is fetched from API
- Helps identify if API is returning wrong values

---

## Next Steps

1. **Verify API Endpoint:**
   - Check what V121796 actually returns
   - Verify if it's prime rate or policy rate
   - Check Bank of Canada documentation

2. **Check Browser Console:**
   - Look for `[Prime Rate API]` logs
   - Look for `[Effective Rate]` logs
   - Verify what rate is being used

3. **Verify Bank's Prime Rate:**
   - Confirm with bank what their current prime rate is
   - Check if it matches what API returns

4. **Potential Fix:**
   - If V121796 is policy rate, calculate prime = policy + 3%
   - Or find correct API endpoint for prime rate
   - Or use a different data source

---

## Testing

After fixes, check browser console for:
```
[Prime Rate API] Fetched rate: X% (date: YYYY-MM-DD), Series: V121796
[Effective Rate] Prime: X% (source: API) + Spread: Y% = Effective: Z%
```

Compare with bank's actual prime rate to verify correctness.

---

## Related Issues

- Backfill effective rate bug (same root cause - wrong prime rate)
- Current effective rate display bug (this issue)

