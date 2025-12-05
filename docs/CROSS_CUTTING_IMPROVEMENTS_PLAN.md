# Cross-Cutting Improvements Plan

**Date:** December 2025  
**Status:** 📋 Planning Phase  
**Estimated Effort:** 10-15 hours  
**Priority:** Medium (all features are modularized, these are enhancements)

---

## Executive Summary

With all 8 features now fully modularized, the focus shifts to **cross-cutting improvements** that will enhance the application's consistency, reusability, and user experience across all features.

### Three Main Areas:

1. **Global Mortgage Selection** - Enable multi-mortgage support across Dashboard, Scenario Editor, and Scenario Comparison
2. **Shared Component Library** - Extract common patterns into reusable components
3. **Form Standardization** - Standardize form handling and validation patterns

---

## 1. Global Mortgage Selection

**Priority:** 🔴 **High**  
**Estimated Effort:** 4-6 hours  
**Impact:** Enables users with multiple mortgages to use all features effectively

### Current State

- ✅ **Mortgage Tracking:** Full multi-mortgage support with selector
- ⚠️ **Dashboard:** Always uses first mortgage (no selector)
- ⚠️ **Scenario Editor:** No mortgage selector, uses first mortgage
- ⚠️ **Scenario Comparison:** May use wrong mortgage
- ⚠️ **Selection Persistence:** Not persisted across pages/sessions

### Implementation Plan

#### Phase 1.1: Create Mortgage Selection Context (2-3 hours)

**Create:** `client/src/shared/contexts/mortgage-selection-context.tsx`

```typescript
interface MortgageSelectionContextValue {
  selectedMortgageId: string | null;
  setSelectedMortgageId: (id: string | null) => void;
  mortgages: Mortgage[];
  selectedMortgage: Mortgage | null;
}
```

**Features:**
- Store `selectedMortgageId` in localStorage for persistence
- Provide context to all features
- Auto-select first mortgage if none selected
- Validate selected mortgage still exists

**Integration Points:**
- Wrap app in `MortgageSelectionProvider`
- Update `useMortgageData` to use context
- Update Dashboard to use context
- Update Scenario Editor to use context

#### Phase 1.2: Add Mortgage Selector to Dashboard (1 hour)

**Update:** `client/src/features/dashboard/dashboard-feature.tsx`

- Import `MortgageSelector` component (reuse from mortgage tracking)
- Add selector to dashboard header
- Use `selectedMortgageId` from context
- Update `useDashboardData` to accept `selectedMortgageId`

#### Phase 1.3: Add Mortgage Selector to Scenario Editor (1 hour)

**Update:** `client/src/features/scenario-management/scenario-editor.tsx`

- Add mortgage selector to scenario editor header
- Use `selectedMortgageId` from context
- Ensure projections use correct mortgage data
- Store `mortgageId` with scenarios (if not already)

#### Phase 1.4: Update Scenario Comparison (30 minutes)

**Update:** `client/src/features/scenario-comparison/scenario-comparison-feature.tsx`

- Filter scenarios by `selectedMortgageId`
- Ensure comparisons use correct mortgage data

### Success Criteria

- ✅ Users can select mortgage on any page
- ✅ Selection persists across page navigation
- ✅ Selection persists after page refresh
- ✅ Dashboard shows data for selected mortgage
- ✅ Scenarios are scoped to selected mortgage
- ✅ All features respect mortgage selection

---

## 2. Shared Component Library

**Priority:** 🟡 **Medium**  
**Estimated Effort:** 4-6 hours  
**Impact:** Reduces code duplication, improves consistency

### Current State

- Similar patterns repeated across features:
  - Stat display components (`CurrentStatusStat`, similar patterns in Dashboard)
  - Loading skeletons (each feature has its own)
  - Empty states (similar patterns)
  - Form sections (similar input patterns)
  - Card layouts (similar structures)

### Implementation Plan

#### Phase 2.1: Create Shared Stat Display Component (1 hour)

**Create:** `client/src/shared/components/stat-display.tsx`

**Extract common pattern:**
```typescript
interface StatDisplayProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}
```

**Replace in:**
- Dashboard: `CurrentStatusStat`
- Scenario Editor: Similar stat displays
- Other features with stat displays

#### Phase 2.2: Create Shared Loading Skeletons (1 hour)

**Create:** `client/src/shared/components/page-skeleton.tsx`

**Standardize:**
- Header skeleton
- Content skeleton
- Card skeleton
- Table skeleton

**Replace in:**
- Dashboard: `DashboardSkeleton`
- Scenario Editor: `ScenarioEditorSkeleton`
- Scenario List: `ScenarioListSkeleton`
- Scenario Comparison: `ScenarioComparisonSkeleton`

#### Phase 2.3: Create Shared Empty State Component (1 hour)

**Create:** `client/src/shared/components/empty-state.tsx`

**Standardize:**
- Icon
- Title
- Description
- Action button (optional)

**Replace in:**
- Dashboard: `DashboardEmptyState`
- Scenario List: `ScenarioListEmptyState`
- Other features with empty states

#### Phase 2.4: Create Shared Form Components (2-3 hours)

**Create:** `client/src/shared/components/forms/`

**Components:**
- `FormSection` - Wrapper for form sections
- `FormField` - Standardized input field with label and error
- `FormSelect` - Standardized select with label
- `FormSlider` - Standardized slider with label
- `FormCard` - Card wrapper for form sections

**Benefits:**
- Consistent styling
- Built-in validation display
- Accessibility improvements
- Easier to maintain

### Success Criteria

- ✅ Stat displays are consistent across features
- ✅ Loading states are consistent
- ✅ Empty states follow same pattern
- ✅ Forms have consistent styling and behavior
- ✅ Code duplication reduced by 30%+

---

## 3. Form Standardization

**Priority:** 🟡 **Medium**  
**Estimated Effort:** 2-3 hours  
**Impact:** Better validation, consistency, maintainability  
**Status:** ✅ **Complete**

### Implementation Summary

#### Phase 3.1: Created Form Validation Utilities ✅

**Created:** `client/src/shared/utils/form-validation.ts`

**Features:**
- Common validation functions (required, positiveNumber, email, date, etc.)
- Validation result type with error messages
- Helper functions (combineValidations, lessThan, greaterThan)
- Type-safe validation with TypeScript

#### Phase 3.2: Created Form Field Hook ✅

**Created:** `client/src/shared/hooks/use-form-validation.ts`

**Features:**
- `useFormField` hook for individual field management
- Automatic error handling
- Touch state management
- Reset functionality
- Type-safe field state

#### Phase 3.3: Standardized Validation Messages ✅

**Created:** `client/src/shared/constants/validation-messages.ts`

**Features:**
- Consistent error message constants
- Parameterized messages for ranges, lengths, etc.
- Centralized message management

#### Phase 3.4: Created Documentation ✅

**Created:** `docs/FORM_VALIDATION_GUIDE.md`

**Features:**
- Usage examples
- Migration patterns
- Best practices
- Future React Hook Form integration guide

### Success Criteria

- ✅ Forms use consistent validation patterns
- ✅ Error messages are user-friendly and consistent
- ✅ Form validation is reusable
- ✅ Type-safe form handling
- ✅ Better user experience with clear validation feedback
- ✅ Documentation provided for developers

### Next Steps (Optional)

For complex forms, consider migrating to React Hook Form:
- Better performance (fewer re-renders)
- Built-in validation with Zod
- Better TypeScript inference
- Form state management

See `docs/FORM_VALIDATION_GUIDE.md` for migration patterns.

---

## Implementation Order

### Recommended Sequence:

1. **Global Mortgage Selection** (4-6 hours)
   - Highest user impact
   - Enables multi-mortgage workflows
   - Relatively straightforward implementation

2. **Shared Component Library** (4-6 hours)
   - Medium impact
   - Reduces technical debt
   - Improves consistency

3. **Form Standardization** (2-3 hours)
   - Medium impact
   - Improves maintainability
   - Better UX with validation

**Total Estimated Effort:** 10-15 hours

---

## Success Metrics

### After Implementation:

1. **User Experience**
   - ✅ Users can seamlessly switch mortgages across all features
   - ✅ Selection persists across sessions
   - ✅ Consistent UI patterns throughout app
   - ✅ Better form validation feedback

2. **Developer Experience**
   - ✅ Reduced code duplication
   - ✅ Easier to add new features
   - ✅ Consistent patterns to follow
   - ✅ Reusable components available

3. **Code Quality**
   - ✅ 30%+ reduction in duplicate code
   - ✅ Consistent component patterns
   - ✅ Standardized validation
   - ✅ Better type safety

---

## Future Enhancements (Post-Cross-Cutting)

### Additional Improvements to Consider:

1. **Performance Optimizations**
   - Code splitting by route
   - Lazy loading for heavy components
   - Memoization improvements

2. **Accessibility Improvements**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

3. **Testing Infrastructure**
   - Component testing setup
   - Integration testing
   - E2E testing

4. **Documentation**
   - Component storybook
   - API documentation
   - Developer guides

---

## Notes

- All improvements are **enhancements**, not critical fixes
- Features are fully functional without these improvements
- Can be implemented incrementally
- Each phase can be done independently
- Priority can be adjusted based on business needs

---

## Next Steps

1. **Review this plan** with the team
2. **Prioritize** based on user needs
3. **Start with Global Mortgage Selection** (highest impact)
4. **Iterate** on shared components as patterns emerge
5. **Document** shared components as they're created

