# Refactoring Execution Plan

## ✅ Phase 1: Hook Extraction (COMPLETE)

1. ✅ Created `use-mortgage-dialogs.ts` - Dialog state management
2. ✅ Created `use-mortgage-computed.ts` - Computed values  
3. ✅ Created `use-mortgage-mutations.ts` - All mutations

---

## 🚧 Phase 2: Integration (IN PROGRESS)

### Step 1: Integrate Extracted Hooks into Core Hook

**File:** `use-mortgage-tracking-state.ts`

**Changes Needed:**
1. Import extracted hooks
2. Replace inline dialog state with `useMortgageDialogs()`
3. Replace computed values with `useMortgageComputed()`
4. Replace mutations with `useMortgageMutations()`
5. Remove duplicate code

**Current:** 707 lines  
**Target:** ~400 lines (after integration, before cleanup)

### Step 2: Remove Obsolete State

**Obsolete State to Remove:**
- Create mortgage form state (13+ variables) - Using form hooks
- Edit mortgage form state (3 variables) - Using form hooks
- Term renewal form state (8+ variables) - Using form hooks
- Validation logic - Handled by Zod
- Obsolete helper functions

**Target:** ~250 lines (after removing obsolete code)

### Step 3: Update Feature Component

**File:** `mortgage-feature.tsx`

**Changes:**
- Remove obsolete prop destructuring
- Use extracted hooks where appropriate
- Simplify component structure

**Current:** 494 lines  
**Target:** ~300 lines

---

## 📊 Expected Results

| File | Before | After | Reduction |
|------|--------|-------|-----------|
| `use-mortgage-tracking-state.ts` | 707 | ~250 | 65% |
| `mortgage-feature.tsx` | 494 | ~300 | 40% |

---

## 🎯 Benefits

1. ✅ **Smaller Files** - Each < 300 lines
2. ✅ **Single Responsibility** - Each hook has one job
3. ✅ **Easier Testing** - Test individual hooks
4. ✅ **Better Navigation** - Find code faster
5. ✅ **Easier Maintenance** - Changes are localized

---

**Status:** Ready to begin integration!

---

**Last Updated:** Just now
