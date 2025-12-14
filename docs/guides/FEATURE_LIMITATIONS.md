# Feature Limitations & Future Roadmap

**Date:** December 2025  
**Purpose:** Comprehensive list of Canadian mortgage features NOT currently implemented, with rationale and future considerations

---

## Overview

This document lists mortgage-related features that are **not currently implemented** in the application. This helps set proper expectations and guides future development priorities.

---

## Mortgage Penalties

### Interest Rate Differential (IRD)

**Status:** ❌ Not Implemented

**What It Is:**
- Penalty charged when breaking a fixed-rate mortgage before term end
- Calculated as the difference between the mortgage rate and current market rate
- Typically the higher of IRD or 3-month interest

**Why Not Implemented:**
- Complex calculation with lender-specific formulas
- Requires current market rate data
- Varies significantly by lender
- Not needed for basic mortgage tracking

**Future Consideration:**
- Medium priority
- Would require lender-specific penalty calculation rules
- Useful for refinancing decision support

### 3-Month Interest Penalty

**Status:** ❌ Not Implemented

**What It Is:**
- Alternative penalty calculation for variable-rate mortgages
- Simple: 3 months of interest payments
- Often used for VRM mortgages or when IRD doesn't apply

**Why Not Implemented:**
- Less critical than IRD for fixed-rate mortgages
- Can be calculated manually if needed
- Lower priority than core features

**Future Consideration:**
- Low priority
- Simpler to implement than IRD
- Could be added alongside IRD

---

## HELOC & Re-advanceable Mortgages

### Home Equity Line of Credit (HELOC)

**Status:** ❌ Not Implemented

**What It Is:**
- Revolving credit line secured by home equity
- Can borrow up to credit limit
- Interest-only payments typically
- Balance can increase or decrease

**Why Not Implemented:**
- Fundamentally different product structure
- Requires different calculation engine
- Complex credit limit calculations
- Not a traditional mortgage product

**Future Consideration:**
- Low priority
- Would require significant architecture changes
- Separate product category

### Re-advanceable Mortgages

**Status:** ❌ Not Implemented

**What It Is:**
- Mortgage that allows re-borrowing paid principal
- Combines mortgage + HELOC
- Credit limit increases as principal is paid
- Complex balance tracking

**Why Not Implemented:**
- Very complex product structure
- Requires HELOC functionality first
- Less common than standard mortgages
- Significant development effort

**Future Consideration:**
- Very low priority
- Would require HELOC implementation first
- Niche product market

---

## Recast Functionality

**Status:** ❌ Not Implemented

**What It Is:**
- Recalculate payment after large prepayment
- Lower payment amount while keeping same rate/term
- Extends effective amortization
- Common after large lump sum prepayments

**Why Not Implemented:**
- Not standard Canadian mortgage feature
- More common in US mortgages
- Can be modeled via refinancing events
- Lower user demand

**Future Consideration:**
- Low priority
- Could be added as optional feature
- Workaround exists (refinancing events)

**Workaround:**
- Use refinancing event with same rate
- Adjust payment frequency if needed
- Extend amortization if desired

---

## CMHC Insurance Calculations

**Status:** ❌ Not Implemented

**What It Is:**
- Mortgage default insurance for high-ratio mortgages
- Required for mortgages with <20% down payment
- Premium calculated as percentage of mortgage amount
- Added to mortgage principal

**Why Not Implemented:**
- Insurance premium is one-time at origination
- Already included in mortgage amount if applicable
- Doesn't affect ongoing calculations
- Lower priority than core features

**Future Consideration:**
- Low priority
- Could add insurance premium calculator
- Useful for mortgage origination planning
- Doesn't affect existing mortgage tracking

**Note:**
- If mortgage includes CMHC insurance, it's already in the `originalAmount`
- No separate tracking needed for existing mortgages
- Could add calculator for new mortgage planning

---

## High-Ratio vs Conventional Distinction

**Status:** ⚠️ Partially Implemented

**What It Is:**
- High-ratio: <20% down payment (requires CMHC insurance)
- Conventional: ≥20% down payment (no insurance required)
- Different rules for prepayments, penalties, etc.

**Current State:**
- System tracks down payment and original amount
- No explicit high-ratio flag
- No insurance premium calculations
- No different rules based on ratio

**Why Not Fully Implemented:**
- Most rules are the same regardless
- Insurance is one-time at origination
- Can infer ratio from down payment percentage
- Lower priority than core features

**Future Consideration:**
- Low priority
- Could add explicit high-ratio flag
- Could add insurance premium calculator
- Could add different prepayment rules if needed

**Workaround:**
- Calculate down payment percentage manually
- If <20%, assume CMHC insurance included in amount
- Use standard prepayment rules (same for both types)

---

## Payment Skipping

**Status:** ⚠️ Partially Implemented

**What It Is:**
- Skip a payment (typically once per year)
- Interest still accrues
- Balance increases (negative amortization)
- Common feature with some lenders

**Current State:**
- Calculation logic exists in `server/src/shared/calculations/payment-skipping.ts`
- No UI for skipping payments
- No automatic payment skipping feature
- Can be manually modeled by logging $0 payment

**Why Not Fully Implemented:**
- Less common feature
- Can be worked around manually
- Lower user demand
- UI complexity for edge case

**Future Consideration:**
- Low priority
- Could add "Skip Payment" button in payment dialog
- Would need to validate skip eligibility (once per year, etc.)
- Calculation engine already supports it

**Workaround:**
- Log payment with $0 amount
- System will calculate interest accrual
- Balance will increase appropriately

---

## Blend-and-Extend UI

**Status:** ⚠️ Partially Implemented

**What It Is:**
- Renewal option that blends old and new rates
- Extends amortization period
- Calculates new payment amount

**Current State:**
- ✅ Calculation engine implemented (`server/src/shared/calculations/blend-and-extend.ts`)
- ✅ API endpoint exists (`POST /api/mortgage-terms/:id/blend-and-extend`)
- ❌ No UI for blend-and-extend
- ❌ Not integrated into term renewal flow

**Why Not Fully Implemented:**
- Calculation exists but UI not built
- Can be calculated via API if needed
- Lower priority than core renewal flow
- Niche feature

**Future Consideration:**
- Medium priority
- Add "Blend-and-Extend" option in term renewal dialog
- Show blended rate and new payment
- Integrate with renewal workflow

**Workaround:**
- Use API endpoint directly
- Calculate manually using formula
- Use refinancing event to approximate

---

## Multi-Property Support

**Status:** ❌ Not Implemented

**What It Is:**
- Track multiple mortgages (primary residence, rental, etc.)
- Compare strategies across properties
- Aggregate net worth calculations

**Current State:**
- System supports multiple mortgages per user
- No property categorization
- No rental income tracking
- No multi-property scenarios

**Why Not Implemented:**
- Focus on single primary residence
- Rental properties have different considerations
- Would require significant UI changes
- Lower priority than core features

**Future Consideration:**
- Medium priority
- Add property type field (primary, rental, vacation)
- Add rental income/expense tracking
- Multi-property dashboard views

---

## Mortgage Portability

**Status:** ❌ Not Implemented

**What It Is:**
- Transfer existing mortgage to new property
- Keep same rate and terms
- Avoid penalties
- Common feature with some lenders

**Why Not Implemented:**
- Complex feature with many edge cases
- Lender-specific rules
- Less common than core features
- Can be modeled as new mortgage

**Future Consideration:**
- Low priority
- Would require property transfer workflow
- Lender-specific rule configuration
- Niche use case

**Workaround:**
- Create new mortgage for new property
- Manually track that it's a ported mortgage
- Use same rate/terms if applicable

---

## Payment Frequency Changes Mid-Term

**Status:** ⚠️ Partially Implemented

**What It Is:**
- Change payment frequency during term (e.g., monthly to biweekly)
- Recalculate payment amount
- Maintain same rate and term end date

**Current State:**
- ✅ Can change frequency at term renewal
- ❌ Cannot change frequency mid-term
- ❌ No payment recalculation for mid-term changes

**Why Not Fully Implemented:**
- Less common feature
- Can be modeled via term renewal
- Lower priority
- Some lenders don't allow it

**Future Consideration:**
- Low priority
- Could add "Change Frequency" option
- Would recalculate payment for remaining term
- Validate lender allows it

**Workaround:**
- Wait until term renewal
- Use refinancing event to model change
- Create new term with different frequency

---

## Other Canadian Mortgage Features

### Portability with Top-Up

**Status:** ❌ Not Implemented

**What It Is:**
- Port mortgage to new property
- Add additional funds (top-up)
- Blend rates for ported + new funds

**Why Not Implemented:**
- Very complex calculation
- Requires portability feature first
- Niche use case
- Low priority

### Open vs Closed Mortgages

**Status:** ⚠️ Partially Implemented

**What It Is:**
- Open: Can prepay any amount, any time (higher rate)
- Closed: Prepayment limits apply (lower rate)

**Current State:**
- System assumes closed mortgages (prepayment limits)
- No open mortgage option
- No different rate for open mortgages

**Why Not Fully Implemented:**
- Most mortgages are closed
- Open mortgages are rare
- Can be modeled by setting high prepayment limit
- Lower priority

**Workaround:**
- Set annual prepayment limit to 100%
- Effectively allows unlimited prepayments
- Rate difference not modeled

---

## Summary

### High Priority Missing Features
- None currently identified

### Medium Priority Missing Features
- Blend-and-Extend UI integration
- Multi-property support
- Payment skipping UI

### Low Priority Missing Features
- Mortgage penalties (IRD, 3-month interest)
- HELOC support
- Recast functionality
- CMHC insurance calculator
- High-ratio explicit tracking
- Payment frequency changes mid-term
- Re-advanceable mortgages
- Mortgage portability

### Workarounds Available
- Most missing features can be approximated using existing features
- Refinancing events can model many scenarios
- Manual calculations possible for edge cases

---

## Future Roadmap Considerations

When prioritizing new features, consider:

1. **User Demand:** Which features are most requested?
2. **Competitive Advantage:** What differentiates from other tools?
3. **Development Complexity:** How much effort required?
4. **Domain Accuracy:** Does it improve mortgage modeling accuracy?
5. **User Value:** Does it help users make better decisions?

---

## Conclusion

The application focuses on core Canadian mortgage features that provide the most value to users. Missing features are either:
- Niche use cases with low demand
- Complex features requiring significant development
- Features with acceptable workarounds
- Features planned for future releases

This document will be updated as features are added or priorities change.

