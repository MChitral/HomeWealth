# CMHC Mortgage Default Insurance Premium Rates

**Last Updated:** December 2024  
**Source:** CMHC, Sagen, Genworth official documentation  
**Note:** Rates should be verified with current official sources before production use

## Overview

Mortgage default insurance (also called mortgage loan insurance) is required for high-ratio mortgages in Canada. A high-ratio mortgage is one where the down payment is less than 20% of the property purchase price.

Three providers offer mortgage default insurance in Canada:
1. **CMHC (Canada Mortgage and Housing Corporation)** - Crown corporation
2. **Sagen** (formerly Genworth Canada) - Private insurer
3. **Genworth** - Private insurer

## Premium Rate Tables

### CMHC Premium Rates

Premium is calculated as a percentage of the mortgage amount (loan amount), not the property value.

| Loan-to-Value (LTV) Ratio | Premium Rate (% of Mortgage Amount) |
|---------------------------|-------------------------------------|
| 65.01% - 75.00%           | 0.60%                                |
| 75.01% - 80.00%           | 1.70%                                |
| 80.01% - 85.00%           | 2.40%                                |
| 85.01% - 90.00%           | 2.80%                                |
| 90.01% - 95.00%           | 3.10%                                |
| 95.01% - 100.00%          | 4.00%                                |

**Note:** 
- Minimum down payment in Canada is typically 5% for properties under $500,000
- For properties $500,000-$999,999, minimum is 5% on first $500,000 and 10% on remainder
- For properties $1,000,000+, minimum is 20% (no insurance available)

### Sagen Premium Rates

Sagen rates are typically similar to CMHC but may vary slightly. Rates should be verified with current Sagen documentation.

| Loan-to-Value (LTV) Ratio | Premium Rate (% of Mortgage Amount) |
|---------------------------|-------------------------------------|
| 65.01% - 75.00%           | 0.60%                                |
| 75.01% - 80.00%           | 1.70%                                |
| 80.01% - 85.00%           | 2.40%                                |
| 85.01% - 90.00%           | 2.80%                                |
| 90.01% - 95.00%           | 3.10%                                |
| 95.01% - 100.00%          | 4.00%                                |

### Genworth Premium Rates

Genworth rates are typically similar to CMHC but may vary slightly. Rates should be verified with current Genworth documentation.

| Loan-to-Value (LTV) Ratio | Premium Rate (% of Mortgage Amount) |
|---------------------------|-------------------------------------|
| 65.01% - 75.00%           | 0.60%                                |
| 75.01% - 80.00%           | 1.70%                                |
| 80.01% - 85.00%           | 2.40%                                |
| 85.01% - 90.00%           | 2.80%                                |
| 90.01% - 95.00%           | 3.10%                                |
| 95.01% - 100.00%          | 4.00%                                |

## Calculation Formula

### Step 1: Calculate Loan-to-Value (LTV) Ratio

```
LTV Ratio = (Mortgage Amount / Property Price) × 100
```

Where:
- Mortgage Amount = Property Price - Down Payment
- Property Price = Purchase price or appraised value
- Down Payment = Amount paid upfront

### Step 2: Determine Premium Rate

Based on LTV ratio, find the corresponding premium rate from the rate table for the selected provider.

**Important:** LTV boundaries are exclusive on the lower end and inclusive on the upper end:
- 75.00% falls in the 65.01-75.00% bracket
- 75.01% falls in the 75.01-80.00% bracket

### Step 3: Calculate Base Premium

```
Base Premium = Mortgage Amount × (Premium Rate / 100)
```

### Step 4: Apply MLI Select Discount (if applicable)

```
Discount Amount = Base Premium × (MLI Select Discount % / 100)
Final Premium = Base Premium - Discount Amount
```

### Step 5: Calculate Total Mortgage Amount (if premium added to principal)

```
Total Mortgage Amount = Mortgage Amount + Final Premium
```

## MLI Select Discounts

MLI Select is a program that offers premium discounts for certain properties and borrower profiles. Discounts are applied to the base premium.

### Discount Tiers

- **10% Discount:** Standard properties, certain borrower profiles
- **20% Discount:** Energy-efficient homes, certain locations, specific programs
- **30% Discount:** Specific programs (verify current eligibility with CMHC)

### Eligibility Criteria (General Guidelines - Verify with Current CMHC Documentation)

**10% Discount:**
- Standard residential properties
- Certain borrower profiles (verify current criteria)

**20% Discount:**
- Energy-efficient homes (ENERGY STAR certified, etc.)
- Properties in certain locations
- Specific housing programs

**30% Discount:**
- Specific CMHC programs (verify current availability)
- May include affordable housing initiatives

**Note:** MLI Select eligibility criteria change over time. Always verify current eligibility requirements with the insurance provider.

## Premium Payment Options

### Option 1: Upfront Payment

The premium is paid in full at closing. The mortgage amount remains the original loan amount.

**Example:**
- Property Price: $500,000
- Down Payment: $50,000 (10%)
- Mortgage Amount: $450,000
- LTV: 90%
- Premium Rate: 3.10%
- Premium: $450,000 × 3.10% = $13,950 (paid upfront)
- Total Mortgage Amount: $450,000

### Option 2: Added to Principal

The premium is added to the mortgage principal and paid over the life of the mortgage.

**Example:**
- Property Price: $500,000
- Down Payment: $50,000 (10%)
- Mortgage Amount: $450,000
- LTV: 90%
- Premium Rate: 3.10%
- Premium: $450,000 × 3.10% = $13,950
- Total Mortgage Amount: $450,000 + $13,950 = $463,950

**Note:** When premium is added to principal, the LTV calculation for premium rate determination uses the original mortgage amount (before adding premium).

## High-Ratio Mortgage Detection

- **High-Ratio Mortgage:** Down payment < 20% of property price
  - Insurance is required
  - Premium must be calculated

- **Conventional Mortgage:** Down payment ≥ 20% of property price
  - Insurance is not required
  - No premium calculation needed

## Important Notes

1. **Rate Verification:** Premium rates may change. Always verify current rates with official sources before production use.

2. **LTV Boundaries:** Pay careful attention to LTV boundary conditions. The rate brackets are:
   - Exclusive on lower bound (e.g., 75.00% is in 65.01-75.00% bracket)
   - Inclusive on upper bound (e.g., 75.01% is in 75.01-80.00% bracket)

3. **Minimum Down Payment Rules:**
   - Properties < $500,000: Minimum 5% down
   - Properties $500,000-$999,999: 5% on first $500,000, 10% on remainder
   - Properties ≥ $1,000,000: Minimum 20% down (no insurance available)

4. **Property Value:** Use the lower of purchase price or appraised value for LTV calculations.

5. **Refinancing:** Insurance may be required for refinancing high-ratio mortgages, but rates and rules may differ.

## References

- CMHC Official Website: https://www.cmhc.ca
- Sagen Official Website: https://www.sagen.ca
- Genworth Official Website: https://www.genworth.ca
- MLI Select Program: Verify current eligibility with CMHC

## Implementation Notes

- Premium rates should be stored as constants in the codebase
- Rates should be easily updatable when they change
- Consider creating a rate update mechanism for future enhancements
- Always validate LTV ratios are within acceptable ranges (65% - 100% for insurance)
- Handle edge cases (exact boundary values) carefully

