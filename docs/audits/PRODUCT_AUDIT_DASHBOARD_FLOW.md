# Product Audit: Dashboard Empty State Flow

**Date:** 2025-01-27  
**Auditor:** Product Owner  
**Priority:** 🔴 **CRITICAL - User Flow Issue**

---

## Issue Summary

The Dashboard empty state logic does not properly handle the user onboarding flow when the database is empty. It prompts users to create scenarios before they have created a mortgage, which violates the logical dependency chain.

---

## Current Behavior

**When database is empty:**
- Dashboard shows: "No Scenarios Created"
- Action: "Create Your First Scenario"
- **Problem:** Users cannot create meaningful scenarios without a mortgage first

**When mortgages exist but no scenarios:**
- Dashboard shows: "No Scenarios Created" ✅ (This is correct)

---

## Expected Behavior (Product Requirements)

### User Journey Priority

1. **First-time user (no mortgages, no scenarios):**
   - Dashboard should detect: `mortgages.length === 0`
   - Show: "No Mortgage Created" or "Get Started"
   - Action: "Create Your First Mortgage"
   - Link to: `/mortgage` (mortgage creation page)

2. **User with mortgage but no scenarios:**
   - Dashboard should detect: `mortgages.length > 0 && scenarios.length === 0`
   - Show: "No Scenarios Created"
   - Action: "Create Your First Scenario"
   - Link to: `/scenarios/new`

3. **User with both:**
   - Show full dashboard with projections and metrics ✅

---

## Domain Logic Justification

### Why Mortgage Must Come First

1. **Scenarios are projections based on mortgage data:**
   - Scenarios require mortgage balance, rate, payment frequency
   - Scenarios compare strategies (prepayment vs investment) for the same mortgage
   - Without a mortgage, scenarios have no foundation

2. **Canadian Mortgage Lifecycle:**
   - Origination → Amortization → Scenarios/Projections
   - You cannot project mortgage payoff without knowing the mortgage details
   - Scenarios are strategic planning tools, not standalone features

3. **User Mental Model:**
   - Users think: "I have a mortgage, now let me compare strategies"
   - Not: "Let me create a scenario for a mortgage I haven't entered yet"

---

## Product Impact

### Current State (Broken Flow)
```
New User → Dashboard → "Create Scenario" → Confusion
(No mortgage data to base scenario on)
```

### Correct Flow
```
New User → Dashboard → "Create Mortgage" → Mortgage Page → 
Enter Mortgage → Dashboard → "Create Scenario" → Scenario Editor
```

---

## Recommended Fix

### Implementation Requirements

1. **Update `DashboardFeature` component:**
   - Check `mortgages.length` before checking `scenarios.length`
   - If `mortgages.length === 0`: Show mortgage creation empty state
   - If `mortgages.length > 0 && scenarios.length === 0`: Show scenario creation empty state

2. **Create new empty state component:**
   - `DashboardNoMortgageState` component
   - Title: "No Mortgage Created" or "Get Started"
   - Description: "Create your first mortgage to start tracking payments and comparing strategies"
   - Action: "Create Your First Mortgage"
   - Link: `/mortgage`

3. **Update `DashboardEmptyState`:**
   - Keep existing component for "no scenarios" state
   - Ensure it only shows when mortgages exist

---

## Additional Product Considerations

### Onboarding Flow Enhancement (Future)

Consider a guided onboarding flow:
1. **Step 1:** Create Mortgage (required)
2. **Step 2:** Set up Cash Flow (optional but recommended)
3. **Step 3:** Create First Scenario (optional)
4. **Step 4:** View Dashboard with projections

This could be implemented as a multi-step wizard or progressive disclosure.

---

## Related Features to Audit

While reviewing this, also check:
- [ ] Scenario creation page - does it handle missing mortgage gracefully?
- [ ] Comparison page - what happens when no mortgages/scenarios exist?
- [ ] Cash Flow page - should it prompt for mortgage first?
- [ ] Emergency Fund page - dependency on cash flow data?

---

## Priority

**🔴 CRITICAL** - This breaks the fundamental user onboarding flow and creates confusion for new users. Should be fixed immediately.

---

## Acceptance Criteria

- [ ] Dashboard shows "Create Mortgage" when `mortgages.length === 0`
- [ ] Dashboard shows "Create Scenario" only when `mortgages.length > 0`
- [ ] Empty state actions link to correct pages
- [ ] User can complete full flow: Mortgage → Scenario → Dashboard
- [ ] No broken states or confusing prompts

