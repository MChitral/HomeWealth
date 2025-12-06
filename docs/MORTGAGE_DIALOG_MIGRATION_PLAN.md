# Mortgage Creation Dialog Migration Plan

## Current State

- ✅ Form hook created (`use-create-mortgage-form.ts`)
- ⏳ Component still uses manual state management

## Migration Strategy

The dialog is complex with:
- 2-step wizard
- Conditional fields (fixed vs variable rate)
- Auto-payment calculations
- Prime rate integration

## Approach

Create a new migrated version that:
1. Uses the form hook internally
2. Maintains same props interface (for now, can be refactored later)
3. Uses FormField components for better validation
4. Integrates auto-payment calculations

## Files to Create/Update

1. Update `create-mortgage-dialog.tsx` to use React Hook Form
2. Update `mortgage-feature.tsx` integration
3. Test wizard flow

## Complexity Notes

- Wizard requires step-by-step validation
- Auto-payment needs to work with form values
- Conditional rendering based on term type

Proceeding with full migration...

