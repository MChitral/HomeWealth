# Integration Strategy

## Overview

We need to integrate the 3 extracted hooks into `use-mortgage-tracking-state.ts` while maintaining backward compatibility with `mortgage-feature.tsx`.

---

## Current Situation

### What's Still Being Used:
- Dialog states (5 dialogs) ✅ Can use `useMortgageDialogs()`
- Filter state (year filter) - Keep as is (simple)
- Backfill form state - Keep as is (small form)
- Edit term form state - Still needed
- Term renewal state for TermDetailsSection - Still needed (but we have form hooks!)
- Computed values ✅ Can use `useMortgageComputed()`
- Mutations ✅ Can use `useMortgageMutations()`

### What's Obsolete:
- Create mortgage form state - Using form hooks now
- Edit mortgage form state - Using form hooks now
- Term renewal form state (for first term) - Using form hooks now
- Validation logic - Handled by Zod
- Some helper functions

---

## Integration Approach

### Step 1: Integrate Hooks (Safe - Additive)
1. Import extracted hooks
2. Use them alongside existing code
3. Verify everything works

### Step 2: Replace Inline Code
1. Replace dialog state management
2. Replace computed values
3. Replace mutations

### Step 3: Remove Obsolete Code
1. Remove create mortgage form state
2. Remove edit mortgage form state  
3. Remove term renewal state (where form hooks are used)
4. Clean up unused exports

---

## Important Notes

- TermDetailsSection still uses old term renewal state - We should migrate that too later
- Need to maintain backward compatibility
- Some state is still needed for backward compatibility

---

**Status:** Ready to start Step 1!

---

**Last Updated:** Just now

