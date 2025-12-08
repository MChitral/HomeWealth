# Prepayment Limit Calculation Guide

**Date:** 2025-01-27  
**Purpose:** Document how annual prepayment limits are calculated and enforced

---

## Overview

Canadian mortgages have annual prepayment limits that restrict how much extra principal can be paid each year. This guide explains how these limits are calculated and enforced in the system.

---

## Calculation Method

### Standard Method (Implemented)

**Base Amount:** Original mortgage amount (not current balance)

**Formula:**
```
maxAnnualPrepayment = originalMortgageAmount × (annualLimitPercent / 100)
```

**Example:**
- Original mortgage amount: $500,000
- Annual prepayment limit: 20%
- Maximum annual prepayment: $500,000 × 0.20 = **$100,000**

### Why Original Amount?

This is the **standard method** used by major Canadian lenders:
- ✅ **RBC (Royal Bank of Canada)**
- ✅ **TD (Toronto-Dominion Bank)**
- ✅ **BMO (Bank of Montreal)**
- ✅ **Scotiabank**
- ✅ **CIBC (Canadian Imperial Bank of Commerce)**

**Advantages:**
- Predictable limit that doesn't change as balance decreases
- Easy to understand and calculate
- Industry standard approach

---

## Alternative Method (Not Implemented)

Some smaller lenders may use **current balance** as the base:

**Formula:**
```
maxAnnualPrepayment = currentBalance × (annualLimitPercent / 100)
```

**Example:**
- Current balance: $400,000 (after 2 years of payments)
- Annual prepayment limit: 20%
- Maximum annual prepayment: $400,000 × 0.20 = **$80,000**

**Why Not Implemented:**
- Less common (used by smaller lenders)
- Original amount method is industry standard
- Can be added as a configurable option in the future if needed

---

## Year-to-Date Tracking

### Calendar Year Basis
- Prepayments are tracked per **calendar year** (January 1 - December 31)
- Limit resets automatically on January 1st at midnight
- Each year starts with $0 in prepayments
- **Year Boundary Behavior:**
  - Payments on **December 31** count toward the current year's limit
  - Payments on **January 1** count toward the new year's limit (fresh start)
  - The system automatically filters payments by `paymentDate.getFullYear()` to determine which year they belong to
  - No manual reset is needed - the limit calculation automatically resets each calendar year

### What Counts Toward Limit
All prepayment types count toward the annual limit:
- ✅ **Monthly-percent prepayments** (e.g., 20% of regular payment)
- ✅ **Annual prepayments** (e.g., $5,000 every January)
- ✅ **One-time prepayments** (e.g., $10,000 lump sum)

### Example Timeline
```
Year 2024:
- Jan 1: Limit resets to $0
- Jan 15: $5,000 prepayment → Year-to-date: $5,000
- Mar 1: $2,000 prepayment → Year-to-date: $7,000
- Dec 15: $3,000 prepayment → Year-to-date: $10,000
- Total for 2024: $10,000 (within $100,000 limit)

Year 2025:
- Jan 1: Limit resets to $0
- Year-to-date: $0 (fresh start)
```

---

## Implementation Details

### Code Location
**Function:** `isWithinPrepaymentLimit()`  
**File:** `server/src/shared/calculations/mortgage.ts`

**Service Method:** `enforcePrepaymentLimit()`  
**File:** `server/src/application/services/mortgage-payment.service.ts`

### Validation Flow
1. Calculate year-to-date prepayments for the calendar year
2. Add current prepayment amount to year-to-date total
3. Calculate maximum allowed: `originalAmount × (limitPercent / 100)`
4. Compare: `(yearToDate + currentPrepayment) <= maxAnnualPrepayment`
5. Throw error if limit exceeded

### Error Handling
If limit is exceeded, throws `PrepaymentLimitError` with message:
```
"Annual prepayment limit exceeded. Max {limitPercent}% of original balance (${maxAnnual}) has already been used."
```

---

## Configuration

### Default Limit
- **Default:** 20% of original amount
- **Configurable:** Per mortgage via `annualPrepaymentLimitPercent` field
- **Typical Range:** 10-20% (varies by lender)

### Database Schema
```typescript
mortgages.annualPrepaymentLimitPercent: integer
// Default: 20
// Range: Typically 10-20
```

---

## Examples

### Example 1: Standard Prepayment
- **Original Amount:** $600,000
- **Limit:** 20%
- **Max Annual:** $120,000
- **Year-to-Date:** $50,000
- **Current Prepayment:** $10,000
- **Result:** ✅ Allowed ($60,000 total < $120,000 limit)

### Example 2: Limit Exceeded
- **Original Amount:** $600,000
- **Limit:** 20%
- **Max Annual:** $120,000
- **Year-to-Date:** $115,000
- **Current Prepayment:** $10,000
- **Result:** ❌ Rejected ($125,000 total > $120,000 limit)

### Example 3: Year Reset
- **Original Amount:** $600,000
- **Limit:** 20%
- **Max Annual:** $120,000
- **Previous Year (2024):** Used $120,000 (at limit)
- **New Year (2025):** Year-to-date resets to $0
- **Current Prepayment:** $10,000
- **Result:** ✅ Allowed (fresh year, $10,000 < $120,000 limit)

---

## Edge Cases

### Year Boundary
- Payments on **December 31** count toward current year
- Payments on **January 1** count toward new year (limit resets)
- Limit resets automatically at midnight on January 1st
- **Implementation:** The system uses `new Date(paymentDate).getFullYear()` to filter payments by calendar year
- **No Manual Reset Required:** The limit calculation automatically resets each year - no explicit reset logic needed

### Multiple Payments Same Day
- All prepayments on the same day are summed
- Total for the day is checked against limit
- Example: $5,000 + $3,000 on same day = $8,000 checked together

### Bulk Payment Creation
- When creating multiple payments via bulk endpoint
- Each payment's prepayment is validated individually
- Year-to-date is tracked cumulatively within the batch

---

## Future Enhancements

### Configurable Base Amount
Could add support for lenders that use current balance:
```typescript
mortgages.prepaymentLimitBase: 'original' | 'current'
// Default: 'original'
```

### Per-Lender Rules
Could add lender-specific prepayment rules:
- Different limits for different lenders
- Special rules for certain mortgage types
- Grace periods or exceptions

---

## Testing

### Test Coverage
**File:** `server/src/shared/calculations/__tests__/payment-validation.test.ts`

Tests verify:
- ✅ Prepayment limit enforcement
- ✅ Year-to-date tracking
- ✅ Limit calculation using original amount
- ✅ Error messages when limit exceeded

---

## Conclusion

The system uses the **standard Canadian lender convention** of calculating prepayment limits based on the **original mortgage amount**. This provides:
- ✅ Predictable limits
- ✅ Industry-standard behavior
- ✅ Easy to understand calculations
- ✅ Consistent with major Canadian banks

The implementation is correct and matches the practices of RBC, TD, BMO, Scotiabank, and CIBC.

