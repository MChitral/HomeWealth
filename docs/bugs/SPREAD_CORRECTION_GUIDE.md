# Spread Correction Guide

**Date:** 2025-01-27  
**Issue:** Spread might be stored incorrectly (-1.9% instead of -0.9%)

---

## Problem

User suspects the spread stored in the database is **-1.9%** but should be **-0.9%**.

**Evidence:**
- Current effective rate shows: **2.55%** (Prime 4.45% + Spread -1.9%)
- Bank shows effective rate should be: **3.55%**
- If spread is -0.9%: 4.45% + (-0.9%) = **3.55%** ✓

---

## How to Verify Stored Spread

### Method 1: Check Browser Console

1. Open browser console (F12)
2. Look for log: `[Effective Rate Calculation]`
3. Check the `storedSpread` value

### Method 2: Check UI Display

1. Navigate to mortgage page
2. Look at "Locked Spread" in the term details section
3. It should show: `Prime -X%` where X is the spread

### Method 3: Check Database

Query the database:
```sql
SELECT id, term_type, locked_spread, prime_rate, start_date 
FROM mortgage_terms 
ORDER BY start_date DESC 
LIMIT 1;
```

---

## How to Correct Spread

### Option 1: Edit Term (Recommended)

1. Navigate to mortgage page
2. Click **"Edit Term"** button
3. Change **Spread** from `-1.9` to `-0.9`
4. Click **"Save"**
5. Verify effective rate updates to 3.55%

**Note:** This will affect all future calculations but won't change historical payments.

### Option 2: Database Update (Advanced)

If you need to update directly in database:
```sql
UPDATE mortgage_terms 
SET locked_spread = -0.9 
WHERE id = '<term-id>' 
  AND term_type != 'fixed';
```

---

## Verification After Correction

After correcting the spread:

1. **Check Current Effective Rate:**
   - Should show: Prime 4.45% + Spread -0.9% = **3.55%**

2. **Check Console Logs:**
   ```
   [Effective Rate Calculation] {
     primeRate: 4.45,
     storedSpread: -0.9,
     calculatedEffective: 3.55
   }
   ```

3. **Verify Backfill:**
   - Backfill payments should now use correct spread
   - Effective rates should match bank's rates

---

## Root Cause

The spread is stored **exactly as entered** in the form during mortgage creation. There's no validation to ensure it's correct.

**Possible causes:**
1. User entered wrong spread value during creation
2. Form default was wrong
3. API returned wrong prime rate, causing user to enter wrong spread to match desired effective rate

---

## Prevention

To prevent this in the future:

1. **Add Validation:**
   - Validate spread is reasonable (typically -2% to +2%)
   - Show warning if spread seems unusual

2. **Add Confirmation:**
   - Show effective rate calculation prominently
   - Ask user to confirm before saving

3. **Add Logging:**
   - Log what spread was entered and why
   - Store calculation details for audit

---

## Related Files

- `client/src/features/mortgage-tracking/components/edit-term-dialog.tsx` - Edit term form
- `client/src/features/mortgage-tracking/hooks/use-mortgage-computed.ts` - Effective rate calculation
- `shared/schema.ts` - Database schema for `lockedSpread`

