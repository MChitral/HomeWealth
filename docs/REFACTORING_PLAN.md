# Refactoring Plan: Large Components

## 🎯 Goal

Split large components into smaller, focused, maintainable pieces following single responsibility principle.

---

## 📊 Current State

### File 1: `use-mortgage-tracking-state.ts` (707 lines)
**Issues:**
- Manages too many concerns
- Contains dialog state, form state, mutations, computed values
- Many state variables no longer needed (replaced by React Hook Form)
- Hard to test and maintain

**Concerns Identified:**
1. **Dialog State Management** - 4 dialog states
2. **Filter State** - Year filter
3. **Backfill Form State** - Payment backfill form
4. **Edit Term Form State** - Term editing (still using useState)
5. **Term Renewal State** - Mostly replaced by form hooks but still exported
6. **Mutations** - 6 different mutations
7. **Computed Values** - Derived state calculations
8. **Helper Functions** - Utility functions

### File 2: `mortgage-feature.tsx` (494 lines)
**Issues:**
- Large component with multiple sections
- Mixes data fetching, state management, and rendering
- Could be split into container components

---

## 🔧 Refactoring Strategy

### Phase 1: Clean Up `use-mortgage-tracking-state.ts`

**Step 1: Remove Obsolete State**
- ✅ Create Mortgage form state - **REMOVED** (now using React Hook Form)
- ✅ Edit Mortgage form state - **REMOVED** (now using React Hook Form)
- ✅ Term Renewal form state - **MOSTLY REMOVED** (using React Hook Form)
- ⏭️ Edit Term form state - **TO REMOVE** (can migrate to React Hook Form)

**Step 2: Extract Dialog State Management**
- Create `use-mortgage-dialogs.ts` hook
- Manages all dialog open/close states
- Small, focused hook

**Step 3: Extract Mutations**
- Create `use-mortgage-mutations.ts` hook
- Consolidates all mutations
- Better error handling

**Step 4: Extract Computed Values**
- Create `use-mortgage-computed.ts` hook
- Derived state calculations
- Memoized values

**Step 5: Keep Core Hook Lean**
- Main hook orchestrates everything
- Exports clean interface
- Easy to understand

---

### Phase 2: Split `mortgage-feature.tsx`

**Step 1: Extract Container Components**
- Create `MortgageFeatureContainer.tsx` - Data fetching and state
- Keep `MortgageFeature.tsx` lean - Just rendering

**Step 2: Extract Section Components**
- Payment history section already extracted ✅
- Term details section already extracted ✅
- Summary panels already extracted ✅

---

## 📝 Proposed Structure

### New Hooks Structure

```
hooks/
├── use-mortgage-tracking-state.ts (150-200 lines) - Core orchestrator
├── use-mortgage-dialogs.ts (50 lines) - Dialog state
├── use-mortgage-mutations.ts (200-250 lines) - All mutations
├── use-mortgage-computed.ts (100-150 lines) - Computed values
└── [existing hooks...]
```

### Component Structure

```
mortgage-feature.tsx (150-200 lines) - Main component
├── MortgageFeatureContainer (data/state)
└── MortgageFeature (presentation)
```

---

## 🎯 Benefits

1. **Smaller Files** - Each file < 300 lines
2. **Single Responsibility** - Each hook/component has one job
3. **Easier Testing** - Test individual hooks/components
4. **Better Navigation** - Find code faster
5. **Easier Maintenance** - Changes are localized
6. **Clearer Dependencies** - See what depends on what

---

## ⚠️ Considerations

- Need to maintain backward compatibility during refactor
- Test each extraction carefully
- Update imports in all consuming components
- Keep related code together

---

**Next Steps:**
1. Analyze what state is actually still needed
2. Extract dialog state management
3. Extract mutations
4. Extract computed values
5. Clean up core hook
6. Split feature component

---

**Last Updated:** Just now

