# Refactoring Steps for Large Components

## 🎯 Goal

Split `use-mortgage-tracking-state.ts` (707 lines) into smaller, focused hooks.

---

## 📋 Step-by-Step Plan

### ✅ Step 1: Extract Dialog State
**Status:** ✅ Created `use-mortgage-dialogs.ts`
- Simple hook for dialog open/close states
- ~30 lines

### ✅ Step 2: Extract Computed Values
**Status:** ✅ Created `use-mortgage-computed.ts`
- Derived state calculations
- Memoized values
- Summary statistics
- ~100 lines

### ⏭️ Step 3: Extract Mutations
**Status:** Next
- All mutation hooks
- Error handling
- Success callbacks
- ~250 lines

### ⏭️ Step 4: Extract Backfill Form State
**Status:** Next
- Backfill payment form state
- Small form, could migrate to React Hook Form later
- ~50 lines

### ⏭️ Step 5: Extract Edit Term Form State
**Status:** Optional
- Edit term form state
- Could migrate to React Hook Form
- ~100 lines

### ⏭️ Step 6: Remove Obsolete State
**Status:** After extractions
- Remove create mortgage form state (using form hooks)
- Remove edit mortgage form state (using form hooks)
- Remove term renewal form state (using form hooks)
- Clean up unused exports

### ⏭️ Step 7: Refactor Core Hook
**Status:** After all extractions
- Orchestrate all extracted hooks
- Export clean interface
- Target: ~200 lines (down from 707)

---

## 🚀 Current Progress

**Completed:**
- ✅ Dialog state hook created
- ✅ Computed values hook created

**Next:**
- ⏭️ Extract mutations hook
- ⏭️ Integrate into core hook

---

**Last Updated:** Just now

