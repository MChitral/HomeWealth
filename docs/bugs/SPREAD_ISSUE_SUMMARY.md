# Spread Issue Summary

**Date:** 2025-01-27  
**Status:** ✅ Identified

---

## Issue Confirmed

**Console logs show:**
```
[Backfill] Rate for 2025-11-07: Prime 4.45% (date: 2025-11-05) + Spread -1.9% = Effective 2.55%
```

**Stored Spread:** -1.9%  
**Should Be:** -0.9%

---

## Verification

**Current Calculation (Wrong):**
- Prime: 4.45%
- Spread: -1.9%
- Effective: 4.45% + (-1.9%) = **2.55%** ❌

**Expected Calculation (Correct):**
- Prime: 4.45%
- Spread: -0.9%
- Effective: 4.45% + (-0.9%) = **3.55%** ✓ (matches bank)

---

## How to Fix

### Option 1: Edit Term (Recommended)

1. Navigate to `/mortgage` page
2. Click **"Edit Term"** button
3. Change **Spread** field from `-1.9` to `-0.9`
4. Click **"Save"**
5. Verify effective rate updates to **3.55%**

**Note:** This will fix all future calculations. Historical payments won't change (they're already logged).

### Option 2: Check What Was Entered

The spread is stored exactly as entered during mortgage creation. Check:
- What spread value was entered in the form?
- Was it -1.9% or -0.9%?

---

## Root Cause

The spread value is stored **directly from user input** without validation. Possible causes:

1. **User entered wrong value** during mortgage creation
2. **Form had wrong default** (default is -0.80, but user might have changed it)
3. **API returned wrong prime rate** at creation time (6.45% instead of 5.45%), causing user to enter wrong spread to match desired effective rate

---

## Initial Rate Analysis

**If spread is -0.9%:**
- Initial effective rate: 4.55%
- Prime needed: 4.55% + 0.9% = **5.45%** ✓

**If spread is -1.9%:**
- Initial effective rate: 4.55%
- Prime needed: 4.55% + 1.9% = **6.45%** (what was stored)

**Conclusion:** If the API returned 6.45% at creation time, user might have entered -1.9% to get 4.55% effective rate. But the API should have returned 5.45%, and spread should be -0.9%.

---

## Next Steps

1. ✅ Added logging to show stored spread
2. ✅ Added calculation display in UI
3. ⏸️ User should edit term to correct spread
4. ⏸️ Verify effective rate updates correctly
5. ⏸️ Re-test backfill with corrected spread

---

## Files Modified

- `client/src/features/mortgage-tracking/hooks/use-mortgage-computed.ts` - Added detailed logging
- `client/src/features/mortgage-tracking/components/term-details-section.tsx` - Added calculation display

