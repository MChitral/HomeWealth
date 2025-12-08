# Spread Verification Issue

**Date:** 2025-01-27  
**Status:** 🔍 Investigating

---

## User Report

User suspects:
1. **Spread might be -0.9%** (not -1.9% as stored)
2. **Initial prime rate was wrong** - API returned 6.45% but should have been 5.45%

---

## Calculation Verification

### If Spread is -0.9%:

**Initial Rate (at mortgage creation):**
- Effective Rate: 4.55%
- Spread: -0.9%
- Prime = 4.55% + 0.9% = **5.45%** ✓

**Current Rate:**
- Effective Rate: 3.55% (according to bank)
- Spread: -0.9%
- Prime = 3.55% + 0.9% = **4.45%** ✓ (matches current API)

### If Spread is -1.9% (as stored):

**Initial Rate:**
- Effective Rate: 4.55%
- Spread: -1.9%
- Prime = 4.55% + 1.9% = **6.45%** (matches what was stored)

**Current Rate:**
- Effective Rate: 2.55% (what app shows)
- Spread: -1.9%
- Prime = 2.55% + 1.9% = **4.45%** ✓ (matches current API)

---

## Analysis

The math works out correctly in both scenarios:
- If spread is -0.9%: Initial prime should be 5.45%, current prime is 4.45%
- If spread is -1.9%: Initial prime was 6.45%, current prime is 4.45%

**The issue is:** Which spread value is correct?

---

## How Spread is Stored

**File:** `client/src/features/mortgage-tracking/hooks/use-create-mortgage-form-state.ts`

```typescript
lockedSpread: formData.termType !== "fixed" ? formData.spread : "0",
```

The spread is stored **exactly as entered** in the form. There's no calculation or validation that checks if it's correct.

---

## How to Verify

1. **Check Database:**
   - Query the `mortgage_terms` table
   - Check the `locked_spread` value
   - Check the `prime_rate` value stored at term creation

2. **Check Form Default:**
   - Default spread in form: `-0.80` (line 126 of `use-create-mortgage-form.ts`)
   - But user might have entered `-1.9` manually

3. **Check Bank Documents:**
   - Verify what spread was actually agreed upon
   - Verify what the initial prime rate was

---

## Potential Fixes

### Option 1: Edit Term to Correct Spread

If spread is wrong, user can:
1. Click "Edit Term"
2. Change spread from -1.9% to -0.9%
3. Save

**Note:** This will affect all future calculations but won't change historical payments.

### Option 2: Verify API Endpoint

Check if the Bank of Canada API endpoint V121796 is correct, or if it was returning wrong values at creation time.

### Option 3: Add Validation

Add validation to ensure spread values are reasonable and match expected effective rates.

---

## Next Steps

1. Check what spread is actually stored in database
2. Verify with user what spread was agreed upon
3. If wrong, provide instructions to edit term
4. Add logging to show spread calculation

