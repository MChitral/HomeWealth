# Rounding Conventions

**Date:** 2025-01-27  
**Purpose:** Document rounding conventions used in Canadian mortgage calculations

---

## Overview

All monetary amounts in the mortgage calculation engine are rounded to the **nearest cent** (2 decimal places). This matches the convention used by major Canadian lenders including RBC, TD, BMO, Scotiabank, and CIBC.

---

## Rounding Method

### Standard Rounding
- **Method:** Round to nearest cent using `Math.round(value * 100) / 100`
- **Display:** Format to 2 decimal places using `.toFixed(2)`
- **Behavior:** Standard mathematical rounding (0.5 rounds up)

### Examples
```typescript
// Payment amount: $2,345.6789 → $2,345.68
Math.round(2345.6789 * 100) / 100 = 2345.68

// Interest payment: $1,234.567 → $1,234.57
Math.round(1234.567 * 100) / 100 = 1234.57

// Principal payment: $999.995 → $1,000.00
Math.round(999.995 * 100) / 100 = 1000.00
```

---

## Where Rounding is Applied

### Calculation Functions
1. **`calculatePayment()`** - Payment amounts
2. **`calculateInterestPayment()`** - Interest portions
3. **`calculatePrincipalPayment()`** - Principal portions
4. **`calculateRemainingBalance()`** - Remaining balances
5. **`calculateMonthlyPayment()`** - Monthly payments (for accelerated calculations)

### Validation Functions
- **`validateMortgagePayment()`** - All monetary outputs use `.toFixed(2)`

### Amortization Schedule
- All payment entries in amortization schedules are rounded to nearest cent
- Cumulative totals are calculated from rounded individual payments

---

## Canadian Lender Conventions

### Standard Practice (Our Implementation)
- **RBC, TD, BMO, Scotiabank, CIBC:** Round to nearest cent
- Most common approach
- Fair to both borrower and lender

### Alternative Practices (Not Implemented)
- **Some smaller lenders:** Round down (never in borrower's favor)
- **Rare cases:** Round to nearest 5 cents (very uncommon)

---

## Implementation Details

### Calculation Engine (`server/src/shared/calculations/mortgage.ts`)
```typescript
/**
 * Rounding Conventions:
 * - All monetary amounts are rounded to nearest cent (2 decimal places)
 * - Uses standard JavaScript rounding: Math.round() and .toFixed(2)
 * - This matches the convention used by major Canadian lenders
 */
```

### Payment Validation (`server/src/shared/calculations/payment-validation.ts`)
```typescript
/**
 * Rounding: All monetary amounts are rounded to nearest cent (2 decimal places) 
 * using .toFixed(2), which matches the convention used by major Canadian lenders.
 */
```

---

## Testing Considerations

When writing tests:
- Account for rounding differences (typically ±$0.01)
- Use approximate equality for monetary comparisons: `Math.abs(actual - expected) < 0.01`
- Test edge cases around rounding boundaries (e.g., $0.005)

---

## Future Enhancements

If needed, we could add:
- Configurable rounding method per mortgage (round down, round up, nearest cent)
- Lender-specific rounding rules
- Rounding to nearest 5 cents support (rare)

---

## Conclusion

The system uses **standard nearest-cent rounding**, which is the most common and fair approach used by major Canadian lenders. This ensures calculations are predictable and match user expectations when comparing to lender statements.

