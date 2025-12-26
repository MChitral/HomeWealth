# Calculation Methodologies

This document describes all calculation methodologies used in the HomeWealth application, including formulas, examples, and implementation details.

## Table of Contents

1. [Mortgage Payment Calculations](#mortgage-payment-calculations)
2. [Prepayment Calculations](#prepayment-calculations)
3. [Penalty Calculations](#penalty-calculations)
4. [Interest Calculations](#interest-calculations)
5. [HELOC Calculations](#heloc-calculations)
6. [Tax Calculations](#tax-calculations)
7. [Stress Test Calculations](#stress-test-calculations)
8. [Debt Service Ratios](#debt-service-ratios)
9. [Recast Calculations](#recast-calculations)
10. [Variable Rate Calculations](#variable-rate-calculations)
11. [Smith Maneuver Calculations](#smith-maneuver-calculations)

---

## Mortgage Payment Calculations

### Standard Amortization Formula

The standard mortgage payment is calculated using the amortization formula:

```
P = (P₀ × r × (1 + r)ⁿ) / ((1 + r)ⁿ - 1)
```

Where:
- `P` = Monthly payment amount
- `P₀` = Principal (mortgage balance)
- `r` = Monthly interest rate (annual rate / 12)
- `n` = Total number of payments (amortization period in months)

**Example:**
- Principal: $500,000
- Annual rate: 5.49% (0.0549)
- Amortization: 25 years (300 months)
- Monthly rate: 0.0549 / 12 = 0.004575
- Payment = (500,000 × 0.004575 × (1.004575)³⁰⁰) / ((1.004575)³⁰⁰ - 1) = $3,055.23

### Payment Frequency Adjustments

Different payment frequencies require adjustments:

- **Monthly**: 12 payments per year
- **Bi-weekly**: 26 payments per year (payment = monthly / 2)
- **Accelerated Bi-weekly**: 26 payments per year (payment = monthly × 12 / 26)
- **Semi-monthly**: 24 payments per year (payment = monthly / 2)
- **Weekly**: 52 payments per year (payment = monthly / 4)
- **Accelerated Weekly**: 52 payments per year (payment = monthly × 12 / 52)

**Implementation**: `server/src/shared/calculations/mortgage.ts`

---

## Prepayment Calculations

### Prepayment Limit Calculation

Canadian mortgages typically allow prepayments up to a percentage of the original principal per year:

```
Annual Prepayment Limit = Original Principal × Prepayment Limit %
```

**Example:**
- Original principal: $500,000
- Prepayment limit: 20%
- Annual limit: $500,000 × 0.20 = $100,000

### Prepayment Year Determination

Prepayment limits reset either:
- **Calendar Year**: January 1st
- **Anniversary Date**: Based on mortgage start date

**Implementation**: `server/src/shared/calculations/prepayment-year.ts`

### Prepayment Carry-Forward

Unused prepayment room from the previous year can be carried forward:

```
Available Prepayment Room = Annual Limit + Carry-Forward - Year-to-Date Prepayments
```

**Example:**
- Annual limit: $100,000
- Carry-forward: $20,000
- Year-to-date prepayments: $50,000
- Available room: $100,000 + $20,000 - $50,000 = $70,000

### Over-Limit Prepayment Penalty

If prepayments exceed the limit, a penalty may apply:

```
Penalty = Over-Limit Amount × Penalty Rate
```

**Example:**
- Over-limit amount: $10,000
- Penalty rate: 3%
- Penalty: $10,000 × 0.03 = $300

**Implementation**: `server/src/domain/calculations/prepayment-penalty.ts`

---

## Penalty Calculations

### Interest Rate Differential (IRD) - Posted Rate Method

```
IRD = (Posted Rate - Contract Rate) × Remaining Balance × Remaining Term (years)
```

**Example:**
- Posted rate: 5.5%
- Contract rate: 3.5%
- Remaining balance: $400,000
- Remaining term: 2 years
- IRD = (0.055 - 0.035) × 400,000 × 2 = $16,000

### IRD - Discounted Rate Method

Uses the discounted rate instead of posted rate:

```
IRD = (Discounted Rate - Contract Rate) × Remaining Balance × Remaining Term (years)
```

### IRD - Origination Comparison Method

Compares current rate to rate at origination:

```
IRD = (Origination Rate - Contract Rate) × Remaining Balance × Remaining Term (years)
```

### Three-Month Interest Penalty

```
Penalty = Remaining Balance × Annual Rate × (3 / 12)
```

**Example:**
- Remaining balance: $400,000
- Annual rate: 5.49%
- Penalty = 400,000 × 0.0549 × 0.25 = $5,490

### Variable Rate Penalty

Typically three months' interest:

```
Penalty = Remaining Balance × Annual Rate × (3 / 12)
```

**Implementation**: `server/src/domain/calculations/penalty.ts`

---

## Interest Calculations

### Monthly Interest Calculation

```
Monthly Interest = Outstanding Balance × Monthly Rate
```

**Example:**
- Outstanding balance: $400,000
- Monthly rate: 0.004575 (5.49% / 12)
- Monthly interest = 400,000 × 0.004575 = $1,830

### Principal Reduction

```
Principal Payment = Total Payment - Interest Payment
```

**Example:**
- Total payment: $3,055.23
- Interest payment: $1,830.00
- Principal payment = 3,055.23 - 1,830.00 = $1,225.23

### Total Interest Paid

Sum of all interest payments over the mortgage term.

**Implementation**: `server/src/shared/calculations/mortgage.ts`

---

## HELOC Calculations

### HELOC Interest Calculation

```
Monthly Interest = Outstanding Balance × (Prime Rate + Spread) / 12
```

**Example:**
- Outstanding balance: $50,000
- Prime rate: 7.20%
- Spread: -0.50%
- Effective rate: 6.70%
- Monthly interest = 50,000 × 0.067 / 12 = $279.17

### HELOC Minimum Payment - Interest Only

```
Minimum Payment = Outstanding Balance × Annual Rate / 12
```

### HELOC Minimum Payment - Principal + Interest

```
Minimum Payment = (Outstanding Balance × Monthly Rate × (1 + Monthly Rate)ⁿ) / ((1 + Monthly Rate)ⁿ - 1)
```

Where `n` is the remaining amortization period.

**Implementation**: `server/src/domain/calculations/heloc-payment.ts`

### HELOC Credit Limit

```
Credit Limit = (Property Value × LTV) - Outstanding Mortgage Balance
```

**Example:**
- Property value: $800,000
- LTV: 65%
- Outstanding mortgage: $400,000
- Credit limit = (800,000 × 0.65) - 400,000 = $120,000

**Implementation**: `server/src/shared/calculations/heloc/credit-limit.ts`

---

## Tax Calculations

### Interest Deduction (Smith Maneuver)

Interest paid on borrowed funds used for investment is tax-deductible:

```
Tax Savings = Interest Paid × Marginal Tax Rate
```

**Example:**
- Interest paid: $5,000
- Marginal tax rate: 40%
- Tax savings = 5,000 × 0.40 = $2,000

**Implementation**: `server/src/domain/calculations/tax/interest-deduction.ts`

### Dividend Tax Credit

Canadian dividends receive a tax credit:

```
Tax Credit = Dividend Amount × Dividend Tax Credit Rate
```

**Implementation**: `server/src/domain/calculations/tax/dividend-tax-credit.ts`

### Capital Gains Tax

Only 50% of capital gains are taxable:

```
Taxable Capital Gains = (Sale Price - Cost Basis) × 0.5
Tax = Taxable Capital Gains × Marginal Tax Rate
```

**Implementation**: `server/src/domain/calculations/tax/capital-gains-tax.ts`

### Net Tax Benefit (Smith Maneuver)

```
Net Tax Benefit = Interest Deduction Tax Savings + Dividend Tax Credit - Capital Gains Tax
```

**Implementation**: `server/src/domain/calculations/tax/net-tax-benefit.ts`

---

## Stress Test Calculations

### B-20 Stress Test Qualifying Rate

The qualifying rate is the higher of:
- Contract rate + 2%
- Bank of Canada 5-year posted rate

```
Qualifying Rate = max(Contract Rate + 0.02, BoC 5-Year Posted Rate)
```

**Example:**
- Contract rate: 5.49%
- Contract + 2%: 7.49%
- BoC 5-year posted: 6.49%
- Qualifying rate: 7.49% (higher of the two)

### Qualifying Payment

Payment calculated using qualifying rate:

```
Qualifying Payment = (Principal × Qualifying Rate / 12 × (1 + Qualifying Rate / 12)ⁿ) / ((1 + Qualifying Rate / 12)ⁿ - 1)
```

Where `n` is the amortization period in months.

**Implementation**: `server/src/domain/calculations/stress-test.ts`

---

## Debt Service Ratios

### Gross Debt Service (GDS) Ratio

```
GDS = (Housing Costs / Gross Income) × 100
```

Housing costs include:
- Mortgage payment (principal + interest)
- Property taxes
- Heating costs
- 50% of condo fees (if applicable)

**Example:**
- Housing costs: $3,500/month
- Gross income: $10,000/month
- GDS = (3,500 / 10,000) × 100 = 35%

### Total Debt Service (TDS) Ratio

```
TDS = ((Housing Costs + Other Debt Payments) / Gross Income) × 100
```

Other debt payments include:
- Credit card minimum payments
- Car loans
- Personal loans
- Other mortgages

**Example:**
- Housing costs: $3,500/month
- Other debt: $500/month
- Gross income: $10,000/month
- TDS = ((3,500 + 500) / 10,000) × 100 = 40%

**Limits:**
- GDS should not exceed 39%
- TDS should not exceed 44%

**Implementation**: `server/src/domain/calculations/debt-service-ratios.ts`

---

## Recast Calculations

### Recast Opportunity Detection

A recast opportunity exists when a large prepayment could reduce the monthly payment:

```
New Payment = (New Balance × Monthly Rate × (1 + Monthly Rate)ⁿ) / ((1 + Monthly Rate)ⁿ - 1)
```

Where:
- `New Balance` = Current Balance - Prepayment Amount
- `n` = Remaining amortization period

**Recast is beneficial if:**
- New payment < Current payment
- Prepayment amount > Threshold (typically $10,000+)

**Implementation**: `server/src/domain/calculations/recast.ts`

---

## Variable Rate Calculations

### Variable Rate Validation

Variable rates must respect caps and floors:

```
Effective Rate = Prime Rate + Spread
```

**Constraints:**
- `Effective Rate ≤ Rate Cap` (if cap exists)
- `Effective Rate ≥ Rate Floor` (if floor exists)

**Example:**
- Prime rate: 7.20%
- Spread: -0.50%
- Effective rate: 6.70%
- Rate cap: 7.00%
- Rate floor: 2.00%
- Valid: 2.00% ≤ 6.70% ≤ 7.00% ✓

**Implementation**: `server/src/domain/calculations/variable-rate.ts`

### Trigger Rate Calculation

For variable rate mortgages with fixed payments:

```
Trigger Rate = (Fixed Payment / Outstanding Balance) × 12
```

**Example:**
- Fixed payment: $3,000/month
- Outstanding balance: $500,000
- Trigger rate = (3,000 / 500,000) × 12 = 7.2%

If the effective rate exceeds the trigger rate, negative amortization occurs.

---

## Smith Maneuver Calculations

### Credit Room Calculation

Available credit room for Smith Maneuver:

```
Credit Room = HELOC Credit Limit - HELOC Outstanding Balance
```

**Implementation**: `server/src/shared/calculations/smith-maneuver/credit-room.ts`

### Net Benefit Calculation

```
Net Benefit = Investment Returns - Mortgage Interest Savings - HELOC Interest + Tax Benefits
```

**Implementation**: `server/src/shared/calculations/smith-maneuver/net-benefit.ts`

### Risk Metrics

- **Leverage Ratio**: HELOC Balance / Investment Portfolio Value
- **Interest Coverage**: Investment Income / HELOC Interest
- **Margin Call Risk**: Probability of HELOC balance exceeding credit limit

**Implementation**: `server/src/shared/calculations/smith-maneuver/risk-metrics.ts`

---

## Rounding Conventions

All monetary values are rounded to 2 decimal places.

Interest rates are stored with 3 decimal places (e.g., 5.490%).

Payment amounts are rounded to the nearest cent.

Percentages are calculated and displayed with 1-2 decimal places.

---

## References

- **Implementation Files**: See `server/src/domain/calculations/` and `server/src/shared/calculations/`
- **Test Files**: See `server/src/shared/calculations/__tests__/`
- **Canadian Mortgage Regulations**: OSFI B-20 Guidelines
- **Tax Regulations**: Canada Revenue Agency (CRA) guidelines

