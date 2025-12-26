# Rounding Conventions

This document describes the rounding conventions used throughout the HomeWealth application for monetary values, percentages, interest rates, and other numeric calculations.

## Table of Contents

1. [Monetary Values](#monetary-values)
2. [Interest Rates](#interest-rates)
3. [Percentages](#percentages)
4. [Payment Amounts](#payment-amounts)
5. [Interest Calculations](#interest-calculations)
6. [Prepayment Calculations](#prepayment-calculations)
7. [Penalty Calculations](#penalty-calculations)
8. [Tax Calculations](#tax-calculations)
9. [Database Storage](#database-storage)
10. [Display Formatting](#display-formatting)

---

## Monetary Values

### General Rule

All monetary values are rounded to **2 decimal places** (cents).

### Rounding Method

Uses **banker's rounding** (round half to even) for consistency:

```typescript
function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
```

### Examples

- `$1,234.567` → `$1,234.57`
- `$1,234.565` → `$1,234.56` (banker's rounding)
- `$1,234.564` → `$1,234.56`
- `$1,234.566` → `$1,234.57`

### Application

- Mortgage balances
- Payment amounts
- Prepayment amounts
- Interest amounts
- Penalty amounts
- HELOC balances
- Investment values
- Tax amounts

---

## Interest Rates

### Storage Format

Interest rates are stored with **3 decimal places** in the database.

**Example**: `5.490%` is stored as `0.05490` (decimal) or `5.490` (percentage)

### Display Format

Interest rates are displayed with **2-3 decimal places**:

- **Standard Display**: `5.49%` (2 decimal places)
- **Precise Display**: `5.490%` (3 decimal places)
- **Variable Rates**: `Prime - 0.50%` (spread with 2 decimal places)

### Calculation Precision

During calculations, rates maintain full precision (no rounding until final result):

```typescript
// During calculation
const monthlyRate = annualRate / 12; // Full precision

// Final result rounded
const interest = Math.round(balance * monthlyRate * 100) / 100;
```

### Examples

- `5.49%` → Stored as `0.05490`
- `5.495%` → Stored as `0.05495`
- `Prime - 0.50%` → Spread stored as `-0.500`

---

## Percentages

### Display Format

Percentages are displayed with **1-2 decimal places** depending on context:

- **Prepayment Percentages**: `20%` (whole number) or `20.5%` (1 decimal)
- **Investment Returns**: `6.5%` (1 decimal) or `6.50%` (2 decimals)
- **Debt Service Ratios**: `35.0%` (1 decimal)
- **LTV Ratios**: `80.0%` (1 decimal)

### Calculation Precision

Percentages are calculated with full precision, then rounded for display:

```typescript
const percentage = (value / total) * 100;
const rounded = Math.round(percentage * 10) / 10; // 1 decimal place
```

### Examples

- `0.205` → `20.5%`
- `0.065` → `6.5%`
- `0.35` → `35.0%`
- `0.80` → `80.0%`

---

## Payment Amounts

### Regular Payments

Regular mortgage payments are rounded to **2 decimal places**:

```typescript
const payment = calculatePayment(principal, rate, months);
const roundedPayment = Math.round(payment * 100) / 100;
```

**Example**: `$3,055.234567` → `$3,055.23`

### Final Payment Adjustment

The final payment may be adjusted to account for rounding differences:

```typescript
// If balance after second-to-last payment is small
if (remainingBalance < payment) {
  finalPayment = remainingBalance; // Exact amount, no rounding needed
}
```

### Payment Frequency Adjustments

When converting between payment frequencies, amounts are rounded:

- **Monthly to Bi-weekly**: `$3,055.23 / 2 = $1,527.615` → `$1,527.62`
- **Monthly to Weekly**: `$3,055.23 / 4 = $763.8075` → `$763.81`

---

## Interest Calculations

### Monthly Interest

Monthly interest is rounded to **2 decimal places**:

```typescript
const monthlyInterest = balance * monthlyRate;
const roundedInterest = Math.round(monthlyInterest * 100) / 100;
```

**Example**: `$1,830.456789` → `$1,830.46`

### Total Interest

Total interest paid is the sum of all monthly interest payments, each rounded individually:

```typescript
let totalInterest = 0;
for (let month = 0; month < months; month++) {
  const monthlyInterest = Math.round(balance * monthlyRate * 100) / 100;
  totalInterest += monthlyInterest;
  balance -= (payment - monthlyInterest);
}
```

**Note**: Small rounding differences may accumulate over time.

---

## Prepayment Calculations

### Prepayment Amounts

Prepayment amounts are rounded to **2 decimal places**:

```typescript
const prepayment = Math.round(prepaymentAmount * 100) / 100;
```

### Prepayment Limits

Prepayment limits are calculated and rounded:

```typescript
const limit = originalAmount * (prepaymentLimitPercent / 100);
const roundedLimit = Math.round(limit * 100) / 100;
```

**Example**: `$500,000 × 0.20 = $100,000.00`

### Prepayment Carry-Forward

Carry-forward amounts are rounded to **2 decimal places**:

```typescript
const carryForward = Math.round(carryForwardAmount * 100) / 100;
```

---

## Penalty Calculations

### IRD Penalties

IRD penalties are rounded to **2 decimal places**:

```typescript
const ird = (postedRate - contractRate) * balance * remainingYears;
const roundedIrd = Math.round(ird * 100) / 100;
```

**Example**: `$16,000.456` → `$16,000.46`

### Three-Month Interest Penalty

Three-month interest penalties are rounded to **2 decimal places**:

```typescript
const penalty = balance * annualRate * (3 / 12);
const roundedPenalty = Math.round(penalty * 100) / 100;
```

**Example**: `$5,490.123` → `$5,490.12`

---

## Tax Calculations

### Tax Amounts

All tax amounts are rounded to **2 decimal places**:

```typescript
const tax = taxableAmount * taxRate;
const roundedTax = Math.round(tax * 100) / 100;
```

### Tax Credits

Tax credits are rounded to **2 decimal places**:

```typescript
const credit = amount * creditRate;
const roundedCredit = Math.round(credit * 100) / 100;
```

### Net Tax Benefit

Net tax benefits are calculated and rounded:

```typescript
const netBenefit = taxSavings + taxCredits - taxOwed;
const roundedBenefit = Math.round(netBenefit * 100) / 100;
```

---

## Database Storage

### Decimal Precision

Database columns use appropriate precision:

- **Monetary Values**: `DECIMAL(12, 2)` - 12 digits total, 2 decimal places
- **Interest Rates**: `DECIMAL(5, 3)` - 5 digits total, 3 decimal places
- **Percentages**: `INTEGER` (for whole percentages) or `DECIMAL(5, 2)` (for decimal percentages)

### Examples

```sql
-- Monetary value
current_balance DECIMAL(12, 2) -- e.g., 400000.00

-- Interest rate
fixed_rate DECIMAL(5, 3) -- e.g., 5.490

-- Percentage
prepayment_monthly_percent INTEGER -- e.g., 20 (for 20%)
```

---

## Display Formatting

### Currency Formatting

Monetary values are formatted with:
- **Currency Symbol**: `$`
- **Thousands Separator**: `,`
- **Decimal Places**: `2`
- **Negative Sign**: `-` (before currency symbol)

**Examples**:
- `1234.56` → `$1,234.56`
- `-500.00` → `-$500.00`
- `1000000.00` → `$1,000,000.00`

### Percentage Formatting

Percentages are formatted with:
- **Percent Symbol**: `%`
- **Decimal Places**: `1-2` (context-dependent)

**Examples**:
- `0.205` → `20.5%`
- `0.065` → `6.5%`
- `0.35` → `35.0%`

### Rate Formatting

Interest rates are formatted with:
- **Percent Symbol**: `%`
- **Decimal Places**: `2-3`

**Examples**:
- `0.0549` → `5.49%`
- `0.05495` → `5.495%`
- `Prime - 0.50%` → Spread format

---

## Implementation Notes

### JavaScript Rounding

JavaScript's `Math.round()` uses standard rounding (round half up):

```typescript
Math.round(1.235 * 100) / 100; // 1.24
Math.round(1.234 * 100) / 100; // 1.23
```

### Banker's Rounding

For banker's rounding (round half to even), use:

```typescript
function bankersRound(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(value * factor);
  const lastDigit = rounded % 10;
  
  // If last digit is 5, round to even
  if (lastDigit === 5) {
    const previousDigit = Math.floor(rounded / 10) % 10;
    if (previousDigit % 2 === 0) {
      return (rounded - 1) / factor;
    }
  }
  
  return rounded / factor;
}
```

### Consistency

All rounding should be consistent across:
- Calculations
- Database storage
- Display formatting
- API responses

---

## Best Practices

1. **Round at the End**: Perform calculations with full precision, round only at final step
2. **Consistent Precision**: Use same precision for related calculations
3. **Document Exceptions**: Document any cases where different rounding is used
4. **Test Edge Cases**: Test rounding with values ending in 5
5. **Currency Consistency**: Always use 2 decimal places for currency
6. **Rate Precision**: Maintain 3 decimal places for rates in storage
7. **Display Appropriately**: Round for display but maintain precision in calculations

---

## References

- **Implementation**: See calculation files in `server/src/domain/calculations/` and `server/src/shared/calculations/`
- **Formatting Utilities**: See `client/src/shared/lib/utils.ts`
- **Database Schema**: See `shared/schema.ts`

