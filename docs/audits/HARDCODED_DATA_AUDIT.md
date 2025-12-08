# Hardcoded Data Audit

**Date:** 2025-01-27  
**Status:** ✅ **FIXED** - Critical issues resolved

---

## Summary

This audit identifies hardcoded values throughout the application that should be dynamic or configurable. Some are acceptable (placeholders, form defaults), while others are problematic (fallback values, hardcoded display data).

---

## Critical Issues (Must Fix)

### ✅ 1. Emergency Fund Target - Hardcoded $30,000
**File:** `client/src/features/scenario-management/components/emergency-fund-strategy-card.tsx`  
**Status:** ✅ **FIXED**

**Issue:**
```typescript
<p className="text-2xl font-mono font-bold mb-2">$30,000</p>
<p className="text-sm text-muted-foreground">= 6 months of expenses</p>
```

**Problem:** The emergency fund target was hardcoded instead of fetching from the database.

**Fix Applied:**
- ✅ Added `useEmergencyFundData()` and `useCashFlowData()` hooks
- ✅ Calculate actual target amount from `targetMonths` × monthly expenses
- ✅ Display actual target amount and months dynamically
- ✅ Show "Not Set" state when emergency fund or cash flow is missing
- ✅ Button text changes to "Set Target" when not configured

---

### ✅ 2. Emergency Fund Timeline - Hardcoded $500/month and 60 months
**File:** `client/src/features/scenario-management/components/emergency-fund-strategy-card.tsx`  
**Status:** ✅ **FIXED**

**Issue:**
```typescript
<Input defaultValue="500" placeholder="500" />
// ...
At $500/month contribution, emergency fund will be fully funded in{" "}
<span className="font-mono font-semibold">60 months (5 years)</span>
```

**Problem:** 
- Default value was hardcoded
- Timeline calculation was hardcoded (60 months = $30,000 / $500)
- Should calculate dynamically based on actual target and contribution

**Fix Applied:**
- ✅ Made input controlled with `useState` for monthly contribution
- ✅ Calculate timeline dynamically: `Math.ceil(targetAmount / monthlyContribution)`
- ✅ Timeline updates in real-time as user changes contribution amount
- ✅ Shows "Enter a monthly contribution amount" when contribution is invalid
- ✅ Timeline only shows when target amount is available

---

### ✅ 3. Property Price Fallback - Hardcoded $500,000
**File:** `client/src/features/scenario-management/hooks/use-scenario-editor-calculations.ts`  
**Status:** ✅ **FIXED**

**Issue:**
```typescript
const homeValue = Number(mortgage?.propertyPrice || 500000);
```

**Problem:** Fell back to hardcoded $500,000 if property price was missing.

**Fix Applied:**
- ✅ Changed fallback to `0` instead of arbitrary $500,000
- ✅ Added warning Alert in `CurrentMortgagePositionCard` when property price is missing
- ✅ Home value displays "Not Set" when property price is 0
- ✅ Warning explains that property price is needed for accurate net worth projections

---

### ✅ 4. Mortgage Balance Fallback - Hardcoded $300,000
**File:** `client/src/features/mortgage-tracking/components/backfill-payments-dialog.tsx`  
**Status:** ✅ **FIXED**

**Issue:**
```typescript
let runningBalance = Number(mortgage?.currentBalance || 300000);
```

**Problem:** Fell back to hardcoded $300,000 if balance was missing.

**Fix Applied:**
- ✅ Added validation to check `mortgage?.currentBalance` exists before proceeding
- ✅ Removed hardcoded fallback value
- ✅ Added error logging if balance is missing (prevents silent data corruption)
- ✅ Uses actual mortgage balance (validated above)

---

## Medium Priority Issues (Should Fix)

### ✅ 5. Payment Amount Fallback - Hardcoded $1,500
**File:** `client/src/features/mortgage-tracking/components/backfill-payments-dialog.tsx`  
**Status:** ✅ **PARTIALLY FIXED**

**Issue:**
```typescript
placeholder={currentTerm.regularPaymentAmount?.toString() || "1500.00"}
parseFloat(formData.paymentAmount) || currentTerm.regularPaymentAmount || 1500;
```

**Problem:** Fell back to hardcoded $1,500 if payment amount was missing.

**Fix Applied:**
- ✅ Added validation to check payment amount exists before proceeding
- ✅ Removed hardcoded fallback in calculation logic
- ✅ Removed hardcoded placeholder (now shows empty string if missing)
- ⚠️ Note: Form validation should prevent submission if payment amount is missing (handled by form schema)

---

### ⚠️ 6. Investment Base Contribution - Hardcoded Placeholder
**File:** `client/src/features/scenario-management/components/investment-strategy-card.tsx`  
**Line:** 22

**Issue:**
```typescript
<Input id="base-contribution" type="number" placeholder="1000" />
```

**Problem:** Placeholder is hardcoded, but this is just a placeholder (acceptable).

**Impact:** Low - placeholder is fine, but should be consistent with other defaults.

**Recommendation:** Keep as placeholder (not a bug, just a UX choice).

---

## Low Priority (Acceptable)

### ✅ 7. Form Default Values
**Files:** 
- `client/src/features/cash-flow/hooks/use-cash-flow-form.ts`
- `client/src/features/cash-flow/hooks/use-cash-flow-state.ts`

**Issue:**
```typescript
const DEFAULTS: CashFlowFormData = {
  monthlyIncome: 8000,
  annualBonus: 10000,
  propertyTax: 400,
  // ...
};
```

**Status:** ✅ **ACCEPTABLE** - These are form defaults for new users. Users can change them.

---

### ✅ 8. Expected Return Rate Default - 6.0%
**Files:**
- `client/src/features/scenario-management/hooks/use-scenario-editor-state.ts`
- `client/src/features/scenario-management/hooks/use-scenario-basic-info-form-state.ts`

**Issue:**
```typescript
const [expectedReturnRate, setExpectedReturnRate] = useState(6.0);
```

**Status:** ✅ **ACCEPTABLE** - This is a reasonable default (6-8% is typical for balanced portfolio). User can change it.

---

### ✅ 9. Rate Assumption Default - 2.0%
**File:** `client/src/features/scenario-management/components/rate-assumption-card.tsx`  
**Line:** 111

**Issue:**
```typescript
<Select defaultValue="2.0">
```

**Status:** ✅ **ACCEPTABLE** - Default assumption for rate changes. User can change it.

---

### ✅ 10. Placeholder Values in Forms
**Files:** Various form components

**Examples:**
- `placeholder="500000"` (property price)
- `placeholder="2500.00"` (payment amount)
- `placeholder="4.99"` (interest rate)

**Status:** ✅ **ACCEPTABLE** - These are just placeholder hints for users. Not actual data.

---

## Summary by Priority

### 🔴 Critical (Must Fix)
1. Emergency Fund Target - Hardcoded $30,000
2. Emergency Fund Timeline - Hardcoded $500/month and 60 months
3. Property Price Fallback - Hardcoded $500,000
4. Mortgage Balance Fallback - Hardcoded $300,000

### ⚠️ Medium Priority (Should Fix)
5. Payment Amount Fallback - Hardcoded $1,500

### ✅ Acceptable (No Action Needed)
6. Form default values (user-configurable)
7. Investment return rate default (reasonable default)
8. Rate assumption default (user-configurable)
9. Placeholder values (UX hints)

---

## Recommended Fixes

### Fix 1: Emergency Fund Strategy Card
- Fetch emergency fund data
- Display actual target amount
- Calculate timeline dynamically
- Remove hardcoded defaults

### Fix 2: Property Price Validation
- Show warning if property price is missing
- Don't use fallback value
- Prompt user to set property price

### Fix 3: Mortgage Balance Validation
- Validate balance exists before backfill
- Show error if missing
- Don't use fallback value

### Fix 4: Payment Amount Validation
- Validate payment amount exists
- Show error if missing
- Remove hardcoded fallback

---

## Testing Checklist

After fixes:
- [ ] Emergency fund target displays actual value from database
- [ ] Timeline calculates correctly based on actual target and contribution
- [ ] Property price warning shows when missing
- [ ] Backfill validation prevents operation if balance is missing
- [ ] Payment amount validation prevents operation if amount is missing

