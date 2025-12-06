# Mortgage Feature Component Refactoring Plan

## 📊 Current State Analysis

**File:** `mortgage-feature.tsx`
**Lines:** 494
**Issues:**
1. Too many destructured props (90+ lines)
2. Multiple form state hooks with useEffect logic
3. Long render methods (`renderNoTermState`, `renderMainContent`)
4. Dialog state management spread throughout
5. Edit term form still using old state (not React Hook Form)

---

## 🎯 Refactoring Strategy

### Phase 1: Extract Form State Management
Create `use-mortgage-forms.ts` hook to consolidate:
- Create mortgage form state
- Edit mortgage form state  
- Term renewal form state (first term)
- Form reset logic
- Dialog synchronization

### Phase 2: Extract Dialog Handlers
Create `use-mortgage-dialog-handlers.ts` hook to consolidate:
- Dialog open/close handlers
- Dialog state synchronization
- Form reset on dialog close

### Phase 3: Extract Render Logic
Create smaller components:
- `NoTermState.tsx` - Extract `renderNoTermState()`
- Simplify `renderMainContent()` by extracting sections

### Phase 4: Simplify Main Component
- Use extracted hooks
- Reduce destructuring
- Cleaner component structure

---

## 📋 Step-by-Step Plan

### Step 1: Extract Form State Management Hook ✅
**File:** `client/src/features/mortgage-tracking/hooks/use-mortgage-forms.ts`
**Purpose:** Consolidate all form state management

### Step 2: Extract Dialog Handlers Hook ✅
**File:** `client/src/features/mortgage-tracking/hooks/use-mortgage-dialog-handlers.ts`
**Purpose:** Consolidate dialog open/close logic

### Step 3: Extract NoTermState Component ✅
**File:** `client/src/features/mortgage-tracking/components/no-term-state.tsx`
**Purpose:** Extract the "no term" state rendering

### Step 4: Refactor Main Component ✅
**File:** `mortgage-feature.tsx`
**Expected size:** ~250-300 lines (down from 494)

---

## 🚀 Starting Now!

**Status:** In Progress

