# Multi-Mortgage Support Audit

**Date:** December 2025  
**Scope:** Complete audit of multiple mortgage creation, selection, and data scoping across the application  
**Status:** 🔍 Audit Complete

---

## Executive Summary

The application **supports multiple mortgages** at the database and API level, with **partial UI support**. The mortgage tracking page has full multi-mortgage support, but other features (dashboard, scenarios) have **incomplete integration**.

### Overall Assessment: ⚠️ **Partially Complete**

| Feature | Status | Issues |
|---------|--------|--------|
| Database Schema | ✅ Complete | No issues |
| API Endpoints | ✅ Complete | No issues |
| Mortgage Tracking Page | ✅ Complete | Minor UX improvements possible |
| Dashboard Integration | ⚠️ Partial | Uses first mortgage only |
| Scenario Integration | ⚠️ Partial | No mortgage selector |
| Selection Persistence | ⚠️ Partial | Not persisted across sessions |

---

## Detailed Findings

### ✅ **Fully Supported Areas**

#### 1. Database Schema
- **Status:** ✅ Complete
- **Evidence:** `mortgages` table has `userId` foreign key, allowing multiple mortgages per user
- **No issues found**

#### 2. API Endpoints
- **Status:** ✅ Complete
- **Endpoints:**
  - `GET /api/mortgages` - Returns all mortgages for user
  - `POST /api/mortgages` - Creates new mortgage
  - `GET /api/mortgages/:id/terms` - Scoped to specific mortgage
  - `GET /api/mortgages/:id/payments` - Scoped to specific mortgage
- **No issues found**

#### 3. Mortgage Tracking Page
- **Status:** ✅ Complete
- **Features:**
  - ✅ Mortgage selector in header (`MortgageHeader` component)
  - ✅ All data properly scoped to `selectedMortgageId`
  - ✅ "New Mortgage" button available
  - ✅ Automatic selection of first mortgage if none selected
  - ✅ Automatic selection of newly created mortgage (after invalidation)
- **Location:** `client/src/features/mortgage-tracking/mortgage-feature.tsx`

---

### ⚠️ **Partially Supported Areas**

#### 4. Dashboard Integration
- **Status:** ⚠️ **Partial - Uses First Mortgage Only**
- **Location:** `client/src/features/dashboard/dashboard-feature.tsx`
- **Issue:** Dashboard uses `useMortgageData()` without passing a `selectedMortgageId`, so it always uses the first mortgage
- **Code:**
  ```typescript
  // Line 44-45
  const { scenarios, emergencyFund, mortgage, cashFlow, isLoading } = useDashboardData();
  const selectedMortgageId = mortgage?.id ?? null;
  ```
- **Problem:** `useDashboardData()` returns the first mortgage from the list, not respecting any global mortgage selection
- **Impact:** 
  - Dashboard always shows data for the first mortgage
  - Users cannot view dashboard for their second/third mortgage
  - Scenarios may be associated with wrong mortgage

**Recommendation:**
1. Add mortgage selector to dashboard
2. Use shared state/context for selected mortgage across pages
3. Or pass `selectedMortgageId` from URL params/localStorage

#### 5. Scenario Integration
- **Status:** ⚠️ **Partial - No Mortgage Selector**
- **Location:** `client/src/features/scenario-management/`
- **Issue:** Scenario editor doesn't have a mortgage selector
- **Impact:**
  - Scenarios may be created for the wrong mortgage
  - No way to create scenarios for secondary mortgages
  - Scenario projections may use incorrect mortgage data

**Recommendation:**
1. Add mortgage selector to scenario editor
2. Store `mortgageId` with each scenario
3. Filter scenarios by selected mortgage

#### 6. Selection Persistence
- **Status:** ⚠️ **Partial - Not Persisted**
- **Issue:** `selectedMortgageId` is only stored in component state
- **Impact:**
  - Selection is lost on page refresh
  - Selection doesn't persist across pages
  - Users must re-select mortgage after navigation

**Recommendation:**
1. Store `selectedMortgageId` in localStorage
2. Or use URL params (`/mortgage/:mortgageId`)
3. Or use global state management (Context/Redux)

---

## Specific Issues Found

### Issue 1: Dashboard Always Uses First Mortgage

**Severity:** 🟡 **Medium**

**Description:**
The dashboard feature calls `useDashboardData()` which internally uses `useMortgageData()` without a `selectedMortgageId`. This means it always selects the first mortgage from the list.

**Code Location:**
- `client/src/features/dashboard/dashboard-feature.tsx:44-45`
- `client/src/features/dashboard/hooks/use-dashboard-data.ts` (likely)

**Impact:**
- Users with multiple mortgages cannot view dashboard for secondary mortgages
- Dashboard metrics may be incorrect if user expects to see data for a different mortgage

**Fix Required:**
```typescript
// Current (wrong):
const { mortgage } = useDashboardData();

// Should be:
const [selectedMortgageId, setSelectedMortgageId] = useState<string | null>(null);
const { mortgage } = useMortgageData(selectedMortgageId);
```

### Issue 2: New Mortgage Not Auto-Selected After Creation

**Severity:** 🟢 **Low**

**Description:**
When a new mortgage is created, the `mortgages` query is invalidated, but the `selectedMortgageId` is not automatically set to the new mortgage ID. The `useEffect` in `use-mortgage-tracking-state.ts` will select the first mortgage, which may be the new one, but it's not guaranteed.

**Code Location:**
- `client/src/features/mortgage-tracking/hooks/use-mortgage-tracking-state.ts:253-336`

**Current Behavior:**
```typescript
// After creating mortgage:
queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
// selectedMortgageId is not set to newMortgageId
```

**Impact:**
- User may need to manually select the newly created mortgage
- Minor UX friction

**Fix Required:**
```typescript
// After successful creation:
setSelectedMortgageId(newMortgage.id);
queryClient.invalidateQueries({ queryKey: mortgageQueryKeys.mortgages() });
```

### Issue 3: Mortgage Selector Display Could Be Improved

**Severity:** 🟢 **Low - UX Enhancement**

**Description:**
The mortgage selector in `MortgageHeader` shows:
- Property price (if available)
- Current balance

**Current Display:**
```typescript
{mortgage.propertyPrice
  ? `$${Number(mortgage.propertyPrice).toLocaleString()}`
  : "Mortgage"}{" "}
· Balance ${Number(mortgage.currentBalance).toLocaleString()}
```

**Issues:**
- No property address/identifier (if available)
- Hard to distinguish between similar mortgages
- Could show more distinguishing info

**Recommendation:**
- Add property address if available in schema
- Or show mortgage ID/creation date
- Or allow custom labels/names

### Issue 4: No Global Mortgage Selection State

**Severity:** 🟡 **Medium**

**Description:**
Each page/feature manages its own mortgage selection state. There's no shared state or context to maintain selection across pages.

**Impact:**
- User selects mortgage on tracking page
- Navigates to dashboard
- Dashboard shows first mortgage (not the selected one)
- Poor user experience

**Recommendation:**
1. Create `MortgageSelectionContext` to share selected mortgage across pages
2. Or use URL-based routing (`/mortgage/:id`)
3. Or use localStorage with a context provider

---

## Positive Findings

### ✅ Automatic Selection Logic Works Well

The `useEffect` in `use-mortgage-tracking-state.ts` properly handles:
- Selecting first mortgage when none selected
- Resetting selection when mortgages list becomes empty
- Validating selected mortgage still exists

```typescript
useEffect(() => {
  if (mortgages.length === 0) {
    setSelectedMortgageId(null);
    return;
  }
  if (!selectedMortgageId || !mortgages.some((m) => m.id === selectedMortgageId)) {
    setSelectedMortgageId(mortgages[0].id);
  }
}, [mortgages, selectedMortgageId]);
```

### ✅ Data Scoping is Correct

All queries properly scope to `selectedMortgageId`:
- Terms query: `mortgageQueryKeys.mortgageTerms(activeMortgage?.id ?? null)`
- Payments query: `mortgageQueryKeys.mortgagePayments(activeMortgage?.id ?? null)`
- Mutations: All require `mortgage.id` parameter

### ✅ Create Mortgage Flow Works

The mortgage creation wizard:
- Creates mortgage via API
- Creates initial term
- Invalidates queries
- Resets form state
- (Minor: Doesn't auto-select new mortgage, but will be selected as first)

---

## Recommendations

### Priority 1: High Impact Fixes

1. **Add Mortgage Selector to Dashboard**
   - Allow users to view dashboard for any mortgage
   - Use shared selection state or URL params

2. **Auto-Select New Mortgage After Creation**
   - Set `selectedMortgageId` to `newMortgage.id` after successful creation
   - Improves UX flow

### Priority 2: Medium Impact Improvements

3. **Implement Global Mortgage Selection**
   - Create `MortgageSelectionContext` or use URL routing
   - Persist selection across pages and sessions

4. **Add Mortgage Selector to Scenario Editor**
   - Allow creating scenarios for specific mortgages
   - Store `mortgageId` with scenarios

### Priority 3: UX Enhancements

5. **Improve Mortgage Selector Display**
   - Show property address or custom labels
   - Better visual distinction between mortgages

6. **Add Mortgage Management Page**
   - List all mortgages with key metrics
   - Quick actions (edit, delete, set as primary)

---

## Test Cases to Verify

### ✅ Test Case 1: Create Multiple Mortgages
- [x] Can create second mortgage via "New Mortgage" button
- [x] Both mortgages appear in selector
- [x] Can switch between mortgages
- [x] Data is properly scoped to selected mortgage

### ⚠️ Test Case 2: Dashboard with Multiple Mortgages
- [ ] Dashboard shows selector
- [ ] Dashboard data updates when mortgage is selected
- [ ] Scenarios are filtered by selected mortgage

### ⚠️ Test Case 3: Scenario Creation with Multiple Mortgages
- [ ] Scenario editor has mortgage selector
- [ ] Scenarios are associated with correct mortgage
- [ ] Scenario projections use correct mortgage data

### ⚠️ Test Case 4: Selection Persistence
- [ ] Selected mortgage persists across page navigation
- [ ] Selected mortgage persists after page refresh
- [ ] Selected mortgage is remembered in localStorage

---

## Conclusion

The application has **solid foundation** for multi-mortgage support:
- ✅ Database and API fully support multiple mortgages
- ✅ Mortgage tracking page has complete implementation
- ⚠️ Dashboard and scenarios need integration
- ⚠️ Selection persistence needs improvement

**Estimated Effort to Complete:**
- Priority 1 fixes: 2-4 hours
- Priority 2 improvements: 4-8 hours
- Priority 3 enhancements: 4-6 hours

**Total: ~10-18 hours** to achieve full multi-mortgage support across all features.

