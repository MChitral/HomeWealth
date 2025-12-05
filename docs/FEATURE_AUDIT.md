# Frontend Feature Audit & Improvement Plan

**Date:** December 2025  
**Scope:** Complete audit of all frontend features for code quality, maintainability, and improvement opportunities  
**Goal:** Identify areas for modularization, component extraction, and UX improvements

---

## Executive Summary

| Feature | Lines | Status | Priority | Issues |
|---------|-------|--------|----------|--------|
| **Mortgage Tracking** | ~555 | ✅ Complete | - | Already modularized |
| **Scenario Editor** | ~1360 | 🔴 Critical | **P1** | Monolithic, needs modularization |
| **Dashboard** | ~170 | ✅ Complete | - | Modularized with components & hooks |
| **Cash Flow** | ~203 | ✅ Complete | - | Modularized with components & hooks |
| **Emergency Fund** | ~104 | ✅ Complete | - | Modularized with components & hooks |
| **Scenario List** | ~90 | ✅ Complete | - | Modularized with components & hooks |
| **Scenario Comparison** | ~83 | ✅ Complete | - | Modularized with components & hooks |

**Overall Assessment:** 1 feature needs immediate attention (Scenario Editor), 7 are in good shape.

---

## Detailed Feature Audits

### 1. ✅ Mortgage Tracking Feature
**Status:** ✅ **Complete - Already Modularized**

**Current State:**
- Main component: ~555 lines (down from 1400+)
- 14 specialized components
- 4 custom hooks
- Well-organized structure

**No Action Required** - This feature serves as the reference implementation.

---

### 2. 🔴 Scenario Editor Feature
**Status:** 🔴 **Critical - Needs Immediate Attention**

**File:** `client/src/features/scenario-management/scenario-editor.tsx`  
**Lines:** ~1360 lines  
**Priority:** **P1 - Highest**

#### Issues Identified

**1. Monolithic Component**
- Single file with 1360+ lines
- Mixes form state, business logic, UI rendering, and data fetching
- Hard to navigate and maintain
- Difficult to test individual parts

**2. Complex State Management**
- Multiple `useState` hooks (15+ state variables)
- Form state mixed with UI state
- Prepayment events state management is complex
- No centralized state management hook

**3. Inline Calculations**
- Payment preview calculations inline
- Amortization table generation inline
- Projection logic mixed with UI

**4. Large Form Sections**
- Multiple tabs (Mortgage, Investments, Emergency Fund, Prepayment Events)
- Each tab has significant form logic
- No component extraction for form sections

**5. Prepayment Events Management**
- Complex CRUD logic for events
- Inline dialogs for add/edit
- Event form state management is verbose

**6. Missing Components**
- No extracted components for:
  - Mortgage strategy form section
  - Investment strategy form section
  - Emergency fund strategy form section
  - Prepayment events list/management
  - Amortization preview table
  - Payment preview card

#### Recommended Modularization Plan

**Phase 1: State & Data Layer**
- Create `useScenarioEditorState` hook
  - Centralize all form state
  - Handle mutations
  - Manage prepayment events state
  - Calculate derived values

**Phase 2: Form Section Components**
- `MortgageStrategySection` - Prepayment split, rate assumptions
- `InvestmentStrategySection` - Expected return, investment split
- `EmergencyFundStrategySection` - EF contribution and reroute
- `PrepaymentEventsSection` - Events list and management

**Phase 3: Preview & Display Components**
- `PaymentPreviewCard` - Current mortgage payment breakdown
- `AmortizationPreviewTable` - Yearly amortization summary
- `ProjectionPreview` - Scenario projection preview

**Phase 4: Dialog Components**
- `PrepaymentEventDialog` - Add/edit prepayment event
- `ScenarioSaveDialog` - Save confirmation with validation

**Phase 5: Layout & Structure**
- `ScenarioEditorLayout` - Main layout wrapper
- `ScenarioEditorHeader` - Header with navigation
- `ScenarioEditorTabs` - Tab navigation component

**Estimated Effort:** 20-30 hours

---

### 3. ✅ Dashboard Feature
**Status:** ✅ **Complete - Modularized**

**File:** `client/src/features/dashboard/dashboard-feature.tsx`  
**Lines:** ~170 lines (down from 501, 66% reduction)  
**Priority:** **None**

**Current State:**
- Main component: ~170 lines (orchestration only)
- 11 specialized components
- 2 custom hooks
- Well-organized structure

**Components Created:**
- `DashboardSkeleton` - Loading skeleton component
- `DashboardEmptyState` - Empty state when no scenarios exist
- `CurrentStatusStat` - Reusable stat display component
- `SummaryItem` - Reusable summary item component
- `CurrentFinancialStatusCard` - Current financial status overview
- `ProjectionsHeader` - Time horizon and scenario selectors
- `ScenarioMetricsCards` - Net worth, mortgage, and investment metric cards
- `MortgageDetailsCard` - Mortgage details with chart
- `NetWorthProjectionCard` - Net worth projection chart
- `InvestmentGrowthCard` - Investment growth chart
- `StrategySummaryCard` - Strategy summary with key metrics

**Hooks Created:**
- `useDashboardCalculations` - Payment preview, financial calculations, emergency fund targets
- `useDashboardCharts` - Chart data preparation for net worth, mortgage, and investment projections

**Note:** Multi-mortgage selector integration is still recommended for future enhancement (see Cross-Cutting Issues).

**No Action Required** - This feature has been successfully modularized following the same patterns as other features.

---

### 4. ✅ Cash Flow Feature
**Status:** ✅ **Complete - Modularized**

**File:** `client/src/features/cash-flow/cash-flow-feature.tsx`  
**Lines:** ~203 lines (down from 537, 62% reduction)  
**Priority:** **None**

**Current State:**
- Main component: ~203 lines (orchestration only)
- 5 specialized components
- 2 custom hooks
- Well-organized structure

**Components Created:**
- `IncomeSection` - Income inputs (base salary, extra paycheques, bonus)
- `FixedExpensesSection` - Fixed housing costs (property tax, insurance, condo fees, utilities)
- `VariableExpensesSection` - Variable expenses (groceries, dining, transportation, entertainment)
- `DebtSection` - Other debt payments (car loan, student loan, credit card)
- `SummarySection` - Monthly summary with income/expense breakdown and surplus

**Hooks Created:**
- `useCashFlowState` - Manages all 15 form state variables and save mutation
- `useCashFlowCalculations` - Handles income, expense, and surplus calculations

**No Action Required** - This feature has been successfully modularized following the same patterns as Mortgage Tracking and Emergency Fund.

---

### 5. ✅ Emergency Fund Feature
**Status:** ✅ **Complete - Modularized**

**File:** `client/src/features/emergency-fund/emergency-fund-feature.tsx`  
**Lines:** ~104 lines (down from 359, 71% reduction)  
**Priority:** **None**

**Current State:**
- Main component: ~104 lines (orchestration only)
- 4 specialized components
- 2 custom hooks
- Well-organized structure

**Components Created:**
- `EmergencyFundTargetCard` - Main target card with form inputs
- `EmergencyFundProgress` - Progress display component
- `EmergencyFundCalculatorCard` - Expense breakdown and recommendations
- `EmergencyFundEducation` - Educational content section

**Hooks Created:**
- `useEmergencyFundCalculations` - Expense calculations, target amount, progress
- `useEmergencyFundState` - Form state management and save mutation

**No Action Required** - This feature has been successfully modularized following the same patterns as Mortgage Tracking.

---

### 6. ✅ Scenario List Feature
**Status:** ✅ **Complete - Modularized**

**File:** `client/src/features/scenario-management/scenario-list.tsx`  
**Lines:** ~90 lines (down from 213, 58% reduction)  
**Priority:** **None**

**Current State:**
- Main component: ~90 lines (orchestration only)
- 3 specialized components
- 1 custom hook
- 1 utility function
- Well-organized structure

**Components Created:**
- `ScenarioListEmptyState` - Empty state with educational content
- `ScenarioListSkeleton` - Loading skeleton component
- `DeleteScenarioDialog` - Delete confirmation dialog

**Hooks Created:**
- `useScenarioListState` - Manages delete dialog state and deletion logic

**Utilities Created:**
- `formatScenarioMetrics` - Formats scenario metrics for display

**No Action Required** - This feature has been successfully modularized following the same patterns as other features.

---

### 7. ✅ Scenario Comparison Feature
**Status:** ✅ **Complete - Modularized**

**File:** `client/src/features/scenario-comparison/scenario-comparison-feature.tsx`  
**Lines:** ~83 lines (down from 130, 36% reduction)  
**Priority:** **None**

**Current State:**
- Main component: ~83 lines (orchestration only)
- 9 specialized components (6 existing + 3 new)
- 1 custom hook
- Well-organized structure

**Components Created:**
- `ScenarioComparisonSkeleton` - Loading skeleton component
- `TimeHorizonSelector` - Time horizon selector (10/20/30 years)
- `ComparisonTabs` - Tabs wrapper for charts and metrics views

**Existing Components:**
- `ScenarioSelector` - Scenario selection interface
- `WinnerCard` - Winner scenario display
- `ComparisonMetrics` - Metrics comparison cards
- `ComparisonCharts` - Chart visualizations
- `ComparisonTable` - Detailed metrics table
- `EmptyState` - Empty state display

**Hooks:**
- `useScenarioComparison` - Centralized comparison logic and state

**No Action Required** - This feature has been successfully modularized following the same patterns as other features.

---

## Cross-Cutting Issues

### 1. Multi-Mortgage Support
**Status:** ⚠️ **Incomplete**

**Affected Features:**
- Dashboard (always uses first mortgage)
- Scenario Editor (no mortgage selector)
- Scenario Comparison (may use wrong mortgage)

**Impact:** Users with multiple mortgages cannot properly use these features

**Recommendation:** Implement global mortgage selection context (see `MULTI_MORTGAGE_AUDIT.md`)

---

### 2. State Management Patterns
**Status:** ⚠️ **Inconsistent**

**Current State:**
- Mortgage tracking: Centralized hook (`useMortgageTrackingState`)
- Emergency fund: Centralized hooks (`useEmergencyFundState`, `useEmergencyFundCalculations`)
- Cash flow: Centralized hooks (`useCashFlowState`, `useCashFlowCalculations`)
- Scenario list: Centralized hook (`useScenarioListState`)
- Dashboard: Centralized hooks (`useDashboardCalculations`, `useDashboardCharts`)
- Scenario editor: Multiple `useState` hooks

**Recommendation:** 
- Standardize on custom hooks for complex state
- Consider Context API for shared state (mortgage selection)

---

### 3. Form Handling
**Status:** ⚠️ **Mixed Approaches**

**Current State:**
- Some features use `useState` for forms
- No consistent form validation
- No form library usage

**Recommendation:**
- Consider React Hook Form for complex forms
- Create reusable form components
- Standardize validation patterns

---

### 4. Component Reusability
**Status:** ⚠️ **Low**

**Issues:**
- Similar patterns repeated across features
- No shared form components
- No shared calculation hooks

**Recommendation:**
- Create shared component library
- Extract common patterns
- Build reusable hooks

---

## Recommended Implementation Order

### Phase 1: Critical Fixes (P1)
1. **Scenario Editor Modularization** (20-30 hours)
   - Highest impact
   - Most complex component
   - Blocks other improvements

### Phase 2: Cross-Cutting Improvements
2. **Cross-Cutting Improvements** (10-15 hours)
   - Global mortgage selection (for Dashboard, Scenario Editor, Scenario Comparison)
   - Shared component library
   - Form standardization

**Total Estimated Effort:** 30-45 hours

---

## Success Metrics

After improvements, we should see:

1. **Code Maintainability**
   - Average component size < 300 lines
   - Clear separation of concerns
   - Easy to locate and modify code

2. **Developer Experience**
   - Faster navigation
   - Easier testing
   - Better IDE support

3. **User Experience**
   - Multi-mortgage support across all features
   - Consistent UI patterns
   - Better form validation

4. **Code Quality**
   - Reusable components
   - Shared hooks
   - Consistent patterns

---

## Next Steps

1. **Review this audit** with the team
2. **Prioritize** based on business needs
3. **Start with Scenario Editor** (highest impact)
4. **Iterate** on other features based on learnings

---

## Appendix: Component Size Guidelines

**Recommended Component Sizes:**
- **Feature Components:** < 300 lines (orchestration only)
- **Section Components:** < 200 lines
- **Dialog Components:** < 250 lines
- **Form Components:** < 150 lines
- **Display Components:** < 100 lines

**When to Extract:**
- Component > 300 lines
- Multiple responsibilities
- Complex state management
- Repeated patterns
- Hard to test

