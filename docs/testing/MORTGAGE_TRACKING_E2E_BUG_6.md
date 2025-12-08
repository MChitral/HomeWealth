# BUG-6: "Next: Term Detail" Button Disabled Despite Valid Form

**Date:** 2025-01-27  
**Severity:** 🔴 CRITICAL  
**Status:** 🔍 INVESTIGATING  
**Test Case:** TC-1.1

---

## Description

The "Next: Term Detail" button in the mortgage creation wizard remains disabled even when all Step 1 fields are correctly filled with valid values.

## Steps to Reproduce

1. Navigate to `/mortgage` page
2. Click "Create Your First Mortgage" button
3. Fill Step 1 form:
   - Property Price: `500000`
   - Down Payment: `100000`
   - Start Date: `2024-01-01`
   - Amortization: Select `25 Years`
   - Payment Frequency: Select `Monthly`
4. Observe "Next: Term Detail" button state

## Expected Behavior

Button should be **enabled** when all Step 1 fields are valid.

## Actual Behavior

Button remains **disabled** even though all fields are filled correctly.

## Impact

- 🔴 **CRITICAL**: Users cannot proceed from Step 1 to Step 2
- Mortgage creation flow is completely blocked
- Critical user journey broken
- Affects all new mortgage creation attempts

## Technical Details

### Button Implementation
```typescript
<Button
  onClick={onNextStep}
  disabled={!isStep1Valid}  // This evaluates to true (disabled)
  data-testid="button-next-step"
>
  Next: Term Details
</Button>
```

### Validation Logic
Located in: `client/src/features/mortgage-tracking/hooks/use-create-mortgage-form.ts`

```typescript
const isStep1Valid = useMemo(() => {
  const propertyPrice = form.watch("propertyPrice");
  const downPayment = form.watch("downPayment");
  const startDate = form.watch("startDate");
  const amortization = form.watch("amortization");
  const frequency = form.watch("frequency");

  // Check all Step 1 fields are present
  if (!propertyPrice || !downPayment || !startDate || !amortization || !frequency) {
    return false;
  }
  // ... validation logic
}, [
  form.watch("propertyPrice"),
  form.watch("downPayment"),
  form.watch("startDate"),
  form.watch("amortization"),
  form.watch("frequency"),
]);
```

## Possible Root Causes

### 1. Select Components Not Setting Form Values
**Hypothesis:** The `Select` components for `amortization` and `frequency` might not be properly connected to React Hook Form.

**Investigation:**
- Check if `field.onChange` is called when Select value changes
- Verify Select components use `value={field.value}` and `onValueChange={field.onChange}`

### 2. useMemo Dependency Array Issue
**Hypothesis:** The dependency array uses `form.watch()` calls, which might not trigger re-renders correctly.

**Investigation:**
- `form.watch()` returns current value, not a reactive reference
- Dependencies might not update when form values change
- Consider using `form.watch()` without dependencies or using a different approach

### 3. Form State Not Updating
**Hypothesis:** Form state might not be updating when Select values change.

**Investigation:**
- Check if form values are actually set in form state
- Verify React Hook Form is properly configured
- Check for any form reset or initialization issues

### 4. Timing Issue
**Hypothesis:** Validation might run before form values are set.

**Investigation:**
- Check if there's a race condition
- Verify form initialization timing
- Check if Select components need explicit value setting

## Files to Investigate

1. **`client/src/features/mortgage-tracking/hooks/use-create-mortgage-form.ts`**
   - Lines 166-207: `isStep1Valid` calculation
   - Check dependency array and watch() usage

2. **`client/src/features/mortgage-tracking/components/create-mortgage-dialog.tsx`**
   - Lines 138-163: Amortization Select component
   - Lines 167-177: Payment Frequency Select component
   - Verify `field.onChange` is properly connected

3. **Form Schema**
   - Check if `amortization` and `frequency` fields are properly defined in schema
   - Verify default values

## Recommended Fixes

### Option 1: Fix useMemo Dependencies
Instead of using `form.watch()` in dependencies, watch all fields:
```typescript
const propertyPrice = form.watch("propertyPrice");
const downPayment = form.watch("downPayment");
const startDate = form.watch("startDate");
const amortization = form.watch("amortization");
const frequency = form.watch("frequency");

const isStep1Valid = useMemo(() => {
  // validation logic
}, [propertyPrice, downPayment, startDate, amortization, frequency]);
```

### Option 2: Use formState.isValid
If Step 1 fields can be validated independently, use form validation:
```typescript
const isStep1Valid = form.formState.isValid && 
  form.watch("propertyPrice") && 
  form.watch("downPayment") && 
  // ... other checks
```

### Option 3: Debug Select Components
Add explicit onChange handlers to verify values are set:
```typescript
<Select
  value={field.value}
  onValueChange={(value) => {
    console.log("Setting amortization:", value);
    field.onChange(value);
  }}
>
```

## Testing After Fix

1. Fill all Step 1 fields
2. Verify button becomes enabled
3. Click button and verify navigation to Step 2
4. Test with different field combinations
5. Test edge cases (empty values, invalid values)

## Related Issues

- BUG-1: Step 1 validation logic error (FIXED)
- This might be a regression or related issue

