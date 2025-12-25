# Feature Limitations & Missing Features

**Last Updated:** January 2025  
**Purpose:** Current list of Canadian mortgage features NOT implemented, based on Product Owner Review  
**Reference:** See [PRODUCT_OWNER_REVIEW.md](../PRODUCT_OWNER_REVIEW.md) for comprehensive assessment

---

## Overview

This document lists mortgage-related features that are **not currently implemented** in the application. This helps set proper expectations and guides future development priorities.

**Note:** Many features previously listed as "not implemented" have since been completed. This document reflects the current state as of January 2025.

---

## High Priority Missing Features

### 1. Mortgage Recast ❌ **MISSING**

**Status:** ❌ Not Implemented  
**Priority:** HIGH

**What It Is:**

- Recalculate payment after large prepayment
- Payment amount decreases while keeping same amortization period
- Common after large lump sum prepayments, property sales, or windfalls

**Impact:**

- **HIGH** - Common homeowner scenario
- Users cannot model payment reduction after large prepayments
- Missing key mortgage lifecycle stage

**Why Not Implemented:**

- Not yet prioritized in roadmap
- Requires payment recalculation service
- Needs UI workflow for recast scenarios

**Recommendations:**

- Add recast calculation service
- Add `recastEvents` table to track recast history
- Add recast option to prepayment workflow
- Update payment amount after recast

---

### 2. Payment Frequency Changes Mid-Term ❌ **MISSING**

**Status:** ❌ Not Implemented  
**Priority:** MEDIUM

**What It Is:**

- Change payment frequency during term (e.g., monthly to biweekly)
- Recalculate payment amount for new frequency
- Maintain same rate and term end date

**Impact:**

- **MEDIUM** - Many homeowners want to switch to accelerated payments mid-term
- No way to model frequency changes without creating new term

**Why Not Implemented:**

- Can be modeled via term renewal (workaround exists)
- Lower priority than core features
- Some lenders don't allow it

**Recommendations:**

- Add payment frequency change service
- Add `paymentFrequencyChangeEvents` table
- Recalculate payment amount when frequency changes
- Add UI for frequency change scenarios

---

### 3. Mortgage Portability ❌ **MISSING**

**Status:** ❌ Not Implemented  
**Priority:** MEDIUM

**What It Is:**

- Transfer existing mortgage to new property
- Keep same rate and terms
- Avoid penalties
- Common feature with some lenders

**Impact:**

- **MEDIUM** - Important for homeowners moving
- Cannot model porting scenarios

**Why Not Implemented:**

- Complex feature with many edge cases
- Lender-specific rules
- Can be modeled as new mortgage (workaround)

**Recommendations:**

- Add mortgage portability data model
- Add portability calculation service
- Add portability UI workflow

---

### 4. Lender-Specific Penalty Calculations ⚠️ **NEEDS IMPROVEMENT**

**Status:** ⚠️ Partially Implemented  
**Priority:** HIGH

**What It Is:**

- Accurate IRD (Interest Rate Differential) calculations
- Lender-specific penalty methodologies
- Posted rate vs discounted rate handling

**Current State:**

- ✅ Basic IRD calculation implemented
- ✅ 3-month interest penalty implemented
- ✅ "Greater of" rule implemented
- ❌ IRD calculation is simplified (approximation)
- ❌ No lender-specific methods
- ❌ Missing variable rate penalty logic (typically 3-month interest only)

**Impact:**

- **HIGH** - Penalty estimates may not match actual lender calculations
- Users need accurate penalty estimates for refinancing decisions

**Recommendations:**

- Research and implement lender-specific IRD methodologies
- Add `penaltyCalculationMethod` field to `mortgageTerms`
- Implement variable rate penalty logic
- Add penalty calculator UI with lender selection
- Document that current IRD is an approximation

---

## Medium Priority Missing Features

### 5. Smith Maneuver Tax Optimization ⚠️ **PARTIAL**

**Status:** ⚠️ Partially Implemented  
**Priority:** MEDIUM

**Current State:**

- ✅ Smith Maneuver strategy tracking
- ✅ HELOC borrowing linked to investments
- ✅ Investment transaction tracking
- ✅ Tax calculation structure
- ❌ Detailed tax deduction calculations incomplete
- ❌ Investment income tax treatment incomplete
- ❌ Net tax benefit calculations incomplete

**Recommendations:**

- Enhance tax calculation service with detailed Canadian tax rules
- Add dividend tax credit calculations
- Add capital gains tax calculations
- Add Smith Maneuver vs prepayment comparison
- Add ROI analysis for Smith Maneuver strategies

---

### 6. Property Value Tracking ❌ **MISSING**

**Status:** ❌ Not Implemented  
**Priority:** MEDIUM

**What It Is:**

- Track home value over time
- Update HELOC credit limits based on value appreciation
- Historical value tracking

**Impact:**

- **MEDIUM** - Needed for accurate HELOC credit limit updates
- Credit limits should increase with property value

**Recommendations:**

- Add `propertyValueHistory` table
- Add property value update workflow
- Recalculate HELOC credit limits on value updates

---

### 7. Refinancing Closing Costs ❌ **MISSING**

**Status:** ❌ Not Implemented  
**Priority:** MEDIUM

**What It Is:**

- Track closing costs in refinancing analysis
- Include in break-even calculations
- Legal fees, appraisal, etc.

**Current State:**

- ✅ Refinancing benefit calculation exists
- ❌ Closing costs not included in analysis
- ❌ Break-even analysis incomplete without costs

**Recommendations:**

- Add closing costs to refinancing analysis
- Include in break-even calculations
- Add closing cost input to refinancing UI

---

### 8. Renewal Workflow Wizard ⚠️ **PARTIAL**

**Status:** ⚠️ Partially Implemented  
**Priority:** MEDIUM

**Current State:**

- ✅ Renewal date tracking
- ✅ Renewal reminders
- ✅ Blend-and-extend calculation and UI
- ❌ No guided term creation workflow
- ❌ No renewal rate negotiation tracking

**Recommendations:**

- Add renewal workflow wizard (guided term creation)
- Add renewal rate negotiation tracking
- Add renewal options comparison (stay vs switch)

---

## Low Priority Missing Features

### 9. HELOC Minimum Payment Calculations ⚠️ **PARTIAL**

**Status:** ⚠️ Partially Implemented

**Current State:**

- ✅ HELOC account management
- ✅ HELOC transaction tracking
- ❌ Minimum payment calculations missing
- ❌ Interest-only vs principal+interest payment types

**Recommendations:**

- Add `helocPaymentType` field
- Implement minimum payment calculation logic

---

### 10. HELOC Draw Period Tracking ⚠️ **PARTIAL**

**Status:** ⚠️ Partially Implemented

**Current State:**

- ✅ HELOC credit limit calculations
- ❌ Draw period vs repayment period not tracked

**Recommendations:**

- Add `helocDrawPeriodEndDate` field
- Track draw period vs repayment period

---

### 11. Prepayment Limit Reset Date Tracking ⚠️ **PARTIAL**

**Status:** ⚠️ Partially Implemented

**Current State:**

- ✅ Annual prepayment limits enforced
- ✅ Calendar year reset implemented
- ❌ Some lenders reset on anniversary date (not tracked)

**Recommendations:**

- Add `prepaymentLimitResetDate` field
- Support both calendar year and anniversary date resets

---

### 12. Prepayment Privilege Carry-Forward ❌ **MISSING**

**Status:** ❌ Not Implemented

**What It Is:**

- Unused prepayment room from previous year carries forward
- Some lenders allow this

**Recommendations:**

- Implement prepayment privilege carry-forward logic
- Add carry-forward tracking

---

### 13. Payment Skipping UI ⚠️ **PARTIAL**

**Status:** ⚠️ Partially Implemented

**Current State:**

- ✅ Calculation logic exists
- ✅ Can be modeled manually
- ❌ No UI for skipping payments

**Recommendations:**

- Add "Skip Payment" button in payment dialog
- Validate skip eligibility (once per year, etc.)

---

### 14. Variable Rate Cap/Floor Tracking ❌ **MISSING**

**Status:** ❌ Not Implemented

**What It Is:**

- Maximum rate increase per period (cap)
- Minimum rate (floor)
- Some variable mortgages have these limits

**Recommendations:**

- Add rate cap/floor fields to `mortgageTerms`
- Add rate cap/floor alerts

---

### 15. Open vs Closed Mortgage Distinction ❌ **MISSING**

**Status:** ❌ Not Implemented

**What It Is:**

- Open: Can prepay any amount, any time (higher rate)
- Closed: Prepayment limits apply (lower rate)

**Current State:**

- System assumes closed mortgages (prepayment limits)
- No open mortgage option

**Workaround:**

- Set annual prepayment limit to 100%

---

## Previously Listed as Missing (Now Implemented ✅)

The following features were previously listed as "not implemented" but are now **fully implemented**:

- ✅ **Mortgage Penalties (IRD & 3-Month Interest)** - Implemented with market rate service
- ✅ **Penalty Calculator UI** - Fully implemented
- ✅ **HELOC Support** - Fully implemented
- ✅ **Re-advanceable Mortgages** - Fully implemented
- ✅ **CMHC Insurance Calculator** - Fully implemented
- ✅ **Blend-and-Extend UI** - Fully implemented
- ✅ **Market Rate Service** - Fully implemented
- ✅ **Trigger Rate Monitoring** - Fully implemented
- ✅ **Notification System** - Fully implemented

---

## Summary

### High Priority Gaps

1. Mortgage Recast
2. Lender-Specific Penalty Calculations
3. Payment Frequency Changes

### Medium Priority Gaps

1. Smith Maneuver Tax Optimization
2. Property Value Tracking
3. Refinancing Closing Costs
4. Renewal Workflow Wizard

### Low Priority Gaps

1. HELOC minimum payments
2. Prepayment privilege carry-forward
3. Payment skipping UI
4. Variable rate caps/floors
5. Open vs closed mortgage distinction

---

## Reference

For comprehensive product assessment, feature completeness matrix, and strategic recommendations, see:

**[PRODUCT_OWNER_REVIEW.md](../PRODUCT_OWNER_REVIEW.md)**

---

**Last Updated:** January 2025
