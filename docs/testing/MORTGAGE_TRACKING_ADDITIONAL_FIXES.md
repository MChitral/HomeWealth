# Additional Fixes for Mortgage Tracking

**Date:** 2025-01-27  
**Status:** Reviewing

---

## Potential Issues Found

### ⚠️ Issue 1: Potential Null/Undefined Access - frequency.replace()

**Location:** `create-mortgage-dialog.tsx` line 238

**Code:**
```typescript
<strong>Payments:</strong> {frequency.replace("-", " ")}
```

**Problem:**
- `frequency` could be `undefined` or `null` if form hasn't been initialized
- Calling `.replace()` on `undefined` would throw a runtime error

**Risk:** Medium - Could crash if form state is not properly initialized

**Recommended Fix:**
```typescript
<strong>Payments:</strong> {frequency?.replace("-", " ") || frequency || "monthly"}
```

Or use optional chaining with fallback:
```typescript
<strong>Payments:</strong> {(frequency || "monthly").replace("-", " ")}
```

---

### ⚠️ Issue 2: Potential Null/Undefined Access - primeRateData.effectiveDate

**Location:** `create-mortgage-dialog.tsx` line 369

**Code:**
```typescript
{primeRateData && (
  <p className="text-xs text-muted-foreground">
    Bank of Canada rate as of{" "}
    {new Date(primeRateData.effectiveDate).toLocaleDateString()}
  </p>
)}
```

**Problem:**
- `primeRateData.effectiveDate` could be `undefined` or `null`
- `new Date(undefined)` creates an invalid date
- `.toLocaleDateString()` on invalid date returns "Invalid Date"

**Risk:** Low - Already wrapped in conditional, but `effectiveDate` could be missing

**Recommended Fix:**
```typescript
{primeRateData?.effectiveDate && (
  <p className="text-xs text-muted-foreground">
    Bank of Canada rate as of{" "}
    {new Date(primeRateData.effectiveDate).toLocaleDateString()}
  </p>
)}
```

---

### ✅ Issue 3: Loan Amount Calculation - Already Safe

**Location:** `create-mortgage-dialog.tsx` line 61-62

**Code:**
```typescript
const loanAmountValue =
  (Number(propertyPrice) || 0) - (Number(downPayment) || 0);
```

**Status:** ✅ Safe - Uses fallback values

---

### ✅ Issue 4: Number Conversions - Already Safe

**Location:** Multiple locations

**Code:**
```typescript
Number(propertyPrice) || 0
Number(downPayment) || 0
```

**Status:** ✅ Safe - Uses fallback values

---

## Summary

| Issue | Severity | Status | Fix Required |
|-------|----------|--------|--------------|
| frequency.replace() | Medium | ⚠️ Needs Fix | Yes |
| primeRateData.effectiveDate | Low | ⚠️ Needs Fix | Yes |
| Loan amount calculation | - | ✅ Safe | No |
| Number conversions | - | ✅ Safe | No |

---

## Recommended Actions

1. **Fix frequency.replace()** - Add null check or fallback
2. **Fix primeRateData.effectiveDate** - Add optional chaining
3. **Test edge cases** - Form with undefined values
4. **Add error boundaries** - Catch any remaining runtime errors

