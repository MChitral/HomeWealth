# Component Refactoring Plan

## 🎯 Objective

Refactor large components into smaller, focused, maintainable pieces:
- `use-mortgage-tracking-state.ts` (707 lines) → Multiple focused hooks
- `mortgage-feature.tsx` (494 lines) → Smaller components

---

## 📊 Analysis

### Current State: `use-mortgage-tracking-state.ts`

**Total Lines:** 707

**Major Sections:**
1. **State Variables** (Lines 24-72) - ~50 lines
   - Dialog states: `isDialogOpen`, `isTermRenewalOpen`, `isBackfillOpen`
   - Filter: `filterYear`
   - Backfill form: 3 states
   - Renewal form: 8 states (mostly obsolete - using form hooks now)
   - Create mortgage form: 13 states (OBSOLETE - using form hooks now)
   - Edit mortgage form: 3 states (OBSOLETE - using form hooks now)
   - Edit term form: 9 states

2. **Validation Logic** (Lines 74-104) - ~30 lines
   - Property price validation
   - Down payment validation
   - Loan amount calculation
   - Form validation (OBSOLETE - handled by form hooks)

3. **Data Fetching** (Lines 106-110) - ~5 lines
   - Uses `useMortgageData` and `usePrimeRate`

4. **Effects** (Lines 112-185) - ~75 lines
   - Prime rate syncing
   - Auto-payment calculations
   - Payment edited state management

5. **Mutations** (Lines 187-453) - ~265 lines
   - Create payment mutation
   - Create term mutation
   - Backfill payments mutation
   - Delete payment mutation
   - Edit mortgage mutation
   - Update term mutation

6. **Helper Functions** (Lines 400-410, 496-517) - ~35 lines
   - `formatAmortization`
   - `handleTermRenewal`
   - `createMortgageWithTerm` (OBSOLETE - using form hooks)
   - `isStep2Valid` (OBSOLETE - using form hooks)

7. **Computed Values** (Lines 135-553, 519-568) - ~120 lines
   - `uiCurrentTerm`
   - `paymentHistory`
   - `summaryStats`
   - `filteredPayments`
   - `availableYears`
   - Various rate calculations

8. **Return Object** (Lines 570-704) - ~135 lines
   - Exports everything (many obsolete)

---

## 🔧 Refactoring Strategy

### Phase 1: Extract and Remove Obsolete State

**Observed:** Many state variables are obsolete because we migrated to React Hook Form:
- ✅ Create mortgage form - Using `useCreateMortgageFormState`
- ✅ Edit mortgage form - Using `useEditMortgageForm`
- ✅ Term renewal (first term) - Using `useTermRenewalFormState`
- ⏭️ Term renewal (existing term) - Still using old state (needs form hook)
- ⏭️ Edit term form - Still using old state (can migrate to form hook)
- ⏭️ Backfill payments form - Small form, can migrate or keep

### Phase 2: Split into Focused Hooks

1. **`use-mortgage-dialogs.ts`** (~50 lines)
   - Dialog open/close states
   - Simple state management

2. **`use-mortgage-mutations.ts`** (~250 lines)
   - All mutation hooks
   - Error handling
   - Success callbacks

3. **`use-mortgage-computed.ts`** (~150 lines)
   - Derived state calculations
   - Memoized values
   - Summary statistics

4. **`use-mortgage-tracking-state.ts`** (reduced to ~200 lines)
   - Orchestrates everything
   - Exports clean interface
   - Core data fetching

### Phase 3: Clean Up Feature Component

- Extract data fetching logic
- Simplify component structure
- Better separation of concerns

---

## 📋 Step-by-Step Plan

### Step 1: Extract Dialog State
**File:** `use-mortgage-dialogs.ts`
**Size:** ~50 lines

### Step 2: Extract Mutations
**File:** `use-mortgage-mutations.ts`
**Size:** ~250 lines

### Step 3: Extract Computed Values
**File:** `use-mortgage-computed.ts`
**Size:** ~150 lines

### Step 4: Clean Up Core Hook
**File:** `use-mortgage-tracking-state.ts`
**Size:** ~200 lines (down from 707)

### Step 5: Refactor Feature Component
**File:** `mortgage-feature.tsx`
**Size:** ~200 lines (down from 494)

---

## 🚀 Let's Start!

I'll begin by extracting the dialog state management first (smallest, safest change).

---

**Last Updated:** Just now

