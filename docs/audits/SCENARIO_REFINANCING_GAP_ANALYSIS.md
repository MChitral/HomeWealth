# Scenario Refinancing Gap Analysis

**Date:** 2025-01-27  
**Auditor:** Mortgage Product Owner  
**Status:** 🔍 Gap Identified

---

## Current State

### What Scenarios Currently Handle

✅ **Term Renewals (Existing Terms)**
- Scenarios correctly handle renewals for existing mortgage terms
- When a term ends, the system uses the next term's rate (if configured)
- Rate changes are applied at term renewal dates
- Amortization resets to original period (Canadian convention)

✅ **Rate Assumptions**
- Users can override rates for scenario modeling
- Rate assumptions apply to projections

❌ **Missing: Refinancing After All Terms End**
- After all configured terms end, projections continue with the last term's rate
- No option to model refinancing scenarios (switching lenders, changing terms, etc.)
- No option to model different renewal rate assumptions beyond existing terms

---

## Product Gap Analysis

### What is Refinancing?

**Refinancing** in Canadian mortgage context means:
1. **Switching Lenders**: Moving mortgage to a different lender (often for better rates)
2. **Changing Terms**: Switching from variable to fixed (or vice versa) at renewal
3. **Rate Shopping**: Comparing renewal rates from different lenders
4. **Blend-and-Extend**: Extending amortization while blending rates (already supported)
5. **Cash-Out Refinancing**: Taking equity out of the property (advanced feature)

### Why This Matters for Scenarios

**Current Limitation:**
- Scenarios project 10-30 years into the future
- Most mortgages have 3-5 year terms
- After the first renewal (or second), users have no way to model:
  - "What if I switch lenders at renewal?"
  - "What if rates are higher/lower at renewal?"
  - "What if I switch from variable to fixed?"
  - "What if I refinance to a different amortization period?"

**Real-World Impact:**
- Homeowners typically shop around at every renewal
- Rates can vary significantly between lenders
- Refinancing decisions can save thousands in interest
- This is a **critical gap** for long-term scenario planning

---

## Domain Requirements

### Canadian Mortgage Renewal Process

**Standard Renewal:**
1. Term ends (3-5 years)
2. Lender offers renewal rate (often not competitive)
3. Homeowner shops around
4. Homeowner can:
   - Renew with current lender (often at higher rate)
   - Switch to new lender (often at better rate)
   - Change term type (variable ↔ fixed)
   - Adjust amortization (if blend-and-extend)

**Current System:**
- Only models renewals with existing lender
- Uses configured term rates
- No option to model "what if I switch lenders?"

---

## Strategic Value Assessment

### User Value

**High Value Feature:**
- ✅ Enables realistic long-term planning
- ✅ Models real homeowner behavior (shopping at renewal)
- ✅ Allows comparison of "stay with lender" vs "switch lenders"
- ✅ Critical for 10-30 year projections

**Competitive Positioning:**
- Most mortgage calculators don't model refinancing
- This would be a **differentiator**
- Aligns with real homeowner decision-making

### Feature Completeness

**Current Feature Set:**
- ✅ Prepayment modeling
- ✅ Rate assumptions
- ✅ Term renewals (existing terms)
- ❌ Refinancing scenarios (missing)

**Gap Impact:**
- Scenarios become less accurate after first renewal
- Users can't model realistic long-term strategies
- Missing critical homeowner decision point

---

## Recommended Solution

### Option 1: Renewal Rate Assumptions (Simplest)

**Add to Scenario:**
- "Renewal Rate Assumption" field
- Applied to all renewals after existing terms end
- Allows modeling: "What if rates are X% at renewal?"

**Pros:**
- Simple to implement
- Covers most use cases
- Minimal UI changes

**Cons:**
- Doesn't model lender switching
- Single rate assumption for all renewals

---

### Option 2: Per-Renewal Rate Assumptions (Better)

**Add to Scenario:**
- "Renewal Rate Assumptions" table
- Each renewal can have different rate assumption
- Allows modeling: "Year 5 renewal: 4.5%, Year 10 renewal: 5.0%"

**Pros:**
- More flexible
- Models different rate environments
- Still relatively simple

**Cons:**
- More complex UI
- Requires users to predict future rates

---

### Option 3: Refinancing Scenarios (Most Complete)

**Add to Scenario:**
- "Refinancing Options" section
- Configure refinancing at each renewal:
  - New rate
  - New term type (variable/fixed)
  - New amortization (if extending)
  - Lender switching costs (if applicable)

**Pros:**
- Most realistic
- Models real homeowner decisions
- Comprehensive

**Cons:**
- Complex to implement
- More UI complexity
- May be overkill for most users

---

## Recommendation

### Phase 1: Renewal Rate Assumptions (Quick Win)

**Implementation:**
1. Add "Renewal Rate Assumption" field to scenario
2. Apply this rate to all renewals after existing terms end
3. Default to current rate (or user can override)

**User Experience:**
- Simple input: "Assume renewal rates will be X%"
- Applies to all future renewals
- Covers 80% of use cases

### Phase 2: Per-Renewal Assumptions (Future Enhancement)

**Implementation:**
- Add table for renewal assumptions
- Each renewal can have different rate
- More granular control

---

## Conclusion

**Status:** ⚠️ **CRITICAL GAP IDENTIFIED**

**Impact:**
- Scenarios become less accurate after first renewal
- Users can't model realistic long-term strategies
- Missing critical homeowner decision point

**Priority:** 🔴 **HIGH**

**Recommendation:**
- Implement Phase 1 (Renewal Rate Assumptions) as quick win
- Plan Phase 2 (Per-Renewal Assumptions) for future
- This is essential for accurate long-term scenario planning

---

## Related Features

- Term Renewal Logic (already implemented)
- Rate Assumptions (already implemented)
- Blend-and-Extend (already implemented)
- **Refinancing Scenarios (MISSING)**

