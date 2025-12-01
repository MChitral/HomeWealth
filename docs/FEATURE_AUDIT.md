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
| **Dashboard** | ~500 | 🟡 Medium | **P2** | Could benefit from component extraction |
| **Cash Flow** | ~537 | 🟡 Medium | **P2** | Large form, could be split |
| **Emergency Fund** | ~104 | ✅ Complete | - | Modularized with components & hooks |
| **Scenario List** | ~213 | ✅ Good | - | Well-structured |
| **Scenario Comparison** | ~130 | ✅ Good | - | Already modularized |

**Overall Assessment:** 1 feature needs immediate attention (Scenario Editor), 2 could benefit from improvements (Dashboard, Cash Flow), 4 are in good shape.

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

### 3. 🟡 Dashboard Feature
**Status:** 🟡 **Medium Priority - Could Be Improved**

**File:** `client/src/features/dashboard/dashboard-feature.tsx`  
**Lines:** ~500 lines  
**Priority:** **P2**

#### Issues Identified

**1. Mixed Concerns**
- Data fetching mixed with UI rendering
- Calculation logic inline
- Chart rendering inline

**2. Large Component**
- 500 lines is manageable but could be better
- Multiple sections that could be extracted

**3. Missing Mortgage Selector**
- Always uses first mortgage (from multi-mortgage audit)
- No way to select different mortgage
- Should integrate with global mortgage selection

**4. Inline Helper Components**
- `CurrentStatusStat` and `SummaryItem` defined at bottom
- Should be extracted to separate files

**5. Complex useMemo Calculations**
- Payment preview calculation is complex
- Could be extracted to custom hook

#### Recommended Improvements

**Priority 1: Mortgage Integration**
- Add mortgage selector to dashboard
- Use shared mortgage selection state
- Scope all data to selected mortgage

**Priority 2: Component Extraction**
- `DashboardHeader` - Header with scenario/horizon selectors
- `CurrentStatusCard` - Current financial snapshot
- `NextPaymentPreview` - Payment breakdown card
- `ScenarioMetricsCard` - Selected scenario metrics
- `DashboardCharts` - All three charts in one component

**Priority 3: Custom Hooks**
- `useDashboardCalculations` - Payment preview, metrics calculations
- `useDashboardCharts` - Chart data preparation

**Estimated Effort:** 8-12 hours

---

### 4. 🟡 Cash Flow Feature
**Status:** 🟡 **Medium Priority - Could Be Improved**

**File:** `client/src/features/cash-flow/cash-flow-feature.tsx`  
**Lines:** ~537 lines  
**Priority:** **P2**

#### Issues Identified

**1. Large Form Component**
- Single component with all form fields
- Many `useState` hooks (15+)
- Form sections could be extracted

**2. Inline Calculations**
- Monthly surplus calculation inline
- Income/expense summaries inline
- Could be extracted to custom hook

**3. Repetitive Form Fields**
- Similar input patterns repeated
- Could use reusable form field components

**4. No Form Validation Feedback**
- Basic validation but no visual feedback
- Could use React Hook Form for better UX

#### Recommended Improvements

**Priority 1: Form Section Components**
- `IncomeSection` - All income inputs
- `FixedExpensesSection` - Property tax, insurance, etc.
- `VariableExpensesSection` - Groceries, dining, etc.
- `DebtSection` - Car loan, student loan, credit card
- `SummarySection` - Monthly summary card

**Priority 2: Custom Hooks**
- `useCashFlowCalculations` - All calculation logic
- `useCashFlowForm` - Form state management (or migrate to React Hook Form)

**Priority 3: Reusable Components**
- `MoneyInput` - Reusable money input with formatting
- `ExpenseCategoryInput` - Standardized expense input

**Estimated Effort:** 6-10 hours

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
**Status:** ✅ **Good - Well Structured**

**File:** `client/src/features/scenario-management/scenario-list.tsx`  
**Lines:** ~213 lines  
**Priority:** **None**

**Assessment:**
- Well-organized
- Good use of components (`ScenarioCard`)
- Proper empty state
- Clean deletion flow
- No major improvements needed

---

### 7. ✅ Scenario Comparison Feature
**Status:** ✅ **Good - Already Modularized**

**File:** `client/src/features/scenario-comparison/scenario-comparison-feature.tsx`  
**Lines:** ~130 lines  
**Priority:** **None**

**Assessment:**
- Already well-modularized
- Uses component library (`ScenarioSelector`, `WinnerCard`, etc.)
- Clean hook usage (`useScenarioComparison`)
- Good separation of concerns
- No improvements needed

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
- Scenario editor: Multiple `useState` hooks
- Dashboard: Mixed `useState` and `useMemo`
- Cash flow: Multiple `useState` hooks

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

### Phase 2: High-Value Improvements (P2)
2. **Dashboard Improvements** (8-12 hours)
   - Add mortgage selector
   - Extract components
   - Better organization

3. **Cash Flow Improvements** (6-10 hours)
   - Extract form sections
   - Better form handling
   - Calculation hooks

### Phase 3: Cross-Cutting Improvements
4. **Cross-Cutting Improvements** (10-15 hours)
   - Global mortgage selection
   - Shared component library
   - Form standardization

**Total Estimated Effort:** 44-67 hours

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

