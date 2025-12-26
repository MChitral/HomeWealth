# Regulatory Compliance Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Regulatory compliance ensures the application adheres to Canadian mortgage regulations, protecting users from non-compliant mortgage scenarios and providing accurate calculations aligned with lender practices. Key benefits:

- **Regulatory Alignment:** Ensures mortgage calculations comply with OSFI (Office of the Superintendent of Financial Institutions) and federal regulations
- **User Protection:** Prevents users from creating mortgages that violate regulatory limits
- **Calculation Accuracy:** B-20 stress test and debt service ratio calculations match lender qualification processes
- **Professional Credibility:** Regulatory compliance demonstrates professional-grade mortgage management capabilities

### Market Context

**Canadian Mortgage Regulations:**

- **OSFI B-20 Guidelines:** Stress test rules for uninsured mortgages (contract rate + 2% or Bank of Canada 5-year posted rate, whichever is greater)
- **Maximum Amortization:** 25 years for insured mortgages, 30 years for uninsured mortgages
- **Maximum LTV:** 95% for insured mortgages (down payment >= 5%), 80% for uninsured mortgages (down payment >= 20%)
- **CMHC Insurance:** Required for high-ratio mortgages (down payment < 20%)
- **Debt Service Ratios:** GDS (Gross Debt Service) <= 32%, TDS (Total Debt Service) <= 40% for qualification

**Industry Statistics:**

- 60% of Canadian mortgages are insured (high-ratio)
- Average down payment: 20% (uninsured mortgages)
- Average mortgage qualification uses stress test rate
- Lenders enforce all regulatory limits strictly

**Strategic Importance:**

- Professional credibility and trust
- Regulatory compliance is non-negotiable for financial applications
- Accurate calculations essential for user decisions
- Protects users from creating non-compliant mortgages

---

## Domain Overview

### Regulatory Compliance Areas

1. **B-20 Stress Test (Qualifying Rate):**
   - Uninsured mortgages: Greater of (contract rate + 2%) or Bank of Canada 5-year posted rate
   - Insured mortgages: Greater of (contract rate + 2%) or Bank of Canada 5-year posted rate
   - Payment must be affordable at qualifying rate

2. **Maximum Amortization Period:**
   - 25 years maximum for insured mortgages (down payment < 20%)
   - 30 years maximum for uninsured mortgages (down payment >= 20%)
   - Validation prevents creating mortgages with excessive amortization

3. **Maximum Loan-to-Value (LTV):**
   - 95% maximum for insured mortgages (down payment >= 5%)
   - 80% maximum for uninsured mortgages (down payment >= 20%)
   - Validation prevents creating mortgages with excessive LTV

4. **CMHC Insurance Requirements:**
   - Required for high-ratio mortgages (down payment < 20%)
   - Insurance providers: CMHC, Sagen, Genworth
   - Premium calculation based on loan amount and down payment percentage

5. **Debt Service Ratios:**
   - GDS (Gross Debt Service) ratio: (Housing costs / Gross income) × 100
   - TDS (Total Debt Service) ratio: (Total debt payments / Gross income) × 100
   - Typical limits: GDS <= 32%, TDS <= 40%

### B-20 Stress Test Calculation

**Qualifying Rate (Uninsured Mortgages):**

```
Qualifying Rate = Max(Contract Rate + 2%, Bank of Canada 5-Year Posted Rate)

Example:
  Contract Rate: 5.5%
  Bank of Canada 5-Year Posted Rate: 5.25%
  
  Qualifying Rate = Max(5.5% + 2%, 5.25%) = Max(7.5%, 5.25%) = 7.5%
  
  Payment at Qualifying Rate must be affordable
```

**Qualifying Rate (Insured Mortgages):**

```
Same calculation as uninsured mortgages

Qualifying Rate = Max(Contract Rate + 2%, Bank of Canada 5-Year Posted Rate)
```

### GDS/TDS Calculation

**Gross Debt Service (GDS) Ratio:**

```
GDS = ((Mortgage Payment + Property Tax + Heating + 50% of Condo Fees) / Gross Income) × 100

Typical Limit: GDS <= 32%
```

**Total Debt Service (TDS) Ratio:**

```
TDS = ((Mortgage Payment + Property Tax + Heating + 50% of Condo Fees + Other Debt Payments) / Gross Income) × 100

Typical Limit: TDS <= 40%
```

### Validation Rules

1. **Amortization Validation:**
   - Insured mortgages: Maximum 25 years
   - Uninsured mortgages: Maximum 30 years
   - Validation on mortgage creation and term renewal

2. **LTV Validation:**
   - Insured mortgages: Maximum 95% LTV (down payment >= 5%)
   - Uninsured mortgages: Maximum 80% LTV (down payment >= 20%)
   - Validation on mortgage creation

3. **Insurance Requirement:**
   - If down payment < 20%, insurance is required
   - Insurance provider must be specified (CMHC, Sagen, or Genworth)
   - Premium must be calculated and included

4. **B-20 Stress Test:**
   - Qualifying rate calculated for all mortgages
   - Payment at qualifying rate should be affordable (calculated, not enforced)

---

## Feature Requirements

### Validation Logic

#### Amortization Validation

```typescript
function validateAmortization(
  amortizationYears: number,
  isHighRatio: boolean
): ValidationResult {
  const maxAmortization = isHighRatio ? 25 : 30;
  
  if (amortizationYears > maxAmortization) {
    return {
      valid: false,
      error: `Maximum amortization for ${isHighRatio ? 'insured' : 'uninsured'} mortgages is ${maxAmortization} years`
    };
  }
  
  if (![15, 20, 25, 30].includes(amortizationYears)) {
    return {
      valid: false,
      error: 'Amortization must be 15, 20, 25, or 30 years'
    };
  }
  
  return { valid: true };
}
```

#### LTV Validation

```typescript
function validateLTV(
  loanAmount: number,
  propertyPrice: number,
  downPaymentPercent: number
): ValidationResult {
  const ltv = (loanAmount / propertyPrice) * 100;
  const isHighRatio = downPaymentPercent < 20;
  const maxLTV = isHighRatio ? 95 : 80;
  
  if (ltv > maxLTV) {
    return {
      valid: false,
      error: `Maximum LTV for ${isHighRatio ? 'insured' : 'uninsured'} mortgages is ${maxLTV}%`
    };
  }
  
  if (isHighRatio && downPaymentPercent < 5) {
    return {
      valid: false,
      error: 'Minimum down payment for insured mortgages is 5%'
    };
  }
  
  if (!isHighRatio && downPaymentPercent < 20) {
    return {
      valid: false,
      error: 'Minimum down payment for uninsured mortgages is 20%'
    };
  }
  
  return { valid: true };
}
```

#### B-20 Stress Test Calculation

```typescript
function calculateQualifyingRate(
  contractRate: number, // as percentage (e.g., 5.5 for 5.5%)
  boc5YearPostedRate: number // Bank of Canada 5-year posted rate
): number {
  const contractPlus2 = contractRate + 2;
  return Math.max(contractPlus2, boc5YearPostedRate);
}

function calculatePaymentAtQualifyingRate(
  loanAmount: number,
  qualifyingRate: number, // as percentage
  amortizationYears: number,
  paymentFrequency: PaymentFrequency
): number {
  // Calculate payment using standard mortgage formula
  // Using qualifying rate instead of contract rate
  return calculatePayment(loanAmount, qualifyingRate / 100, amortizationYears, paymentFrequency);
}
```

#### GDS/TDS Calculation

```typescript
function calculateGDS(
  mortgagePayment: number,
  propertyTax: number,
  heating: number,
  condoFees: number,
  grossIncome: number
): number {
  const housingCosts = mortgagePayment + propertyTax + heating + (condoFees * 0.5);
  return (housingCosts / grossIncome) * 100;
}

function calculateTDS(
  mortgagePayment: number,
  propertyTax: number,
  heating: number,
  condoFees: number,
  otherDebtPayments: number,
  grossIncome: number
): number {
  const totalDebtPayments = mortgagePayment + propertyTax + heating + (condoFees * 0.5) + otherDebtPayments;
  return (totalDebtPayments / grossIncome) * 100;
}
```

### Integration Points

1. **Mortgage Creation:**
   - Validate amortization and LTV on creation
   - Calculate and display qualifying rate
   - Require insurance for high-ratio mortgages

2. **Mortgage Renewal:**
   - Validate amortization on renewal (if changed)
   - Calculate qualifying rate for new term
   - Display stress test payment

3. **Refinancing Analysis:**
   - Calculate qualifying rate for refinanced mortgage
   - Display stress test impact
   - Validate regulatory compliance

4. **Cash Flow Planning:**
   - Calculate GDS/TDS ratios (if income/expense data available)
   - Display debt service ratios
   - Validate against typical limits

---

## User Stories & Acceptance Criteria

### US-1: Validate Amortization Period

**As a** system  
**I want to** validate amortization period  
**So that** mortgages comply with regulatory limits

**Acceptance Criteria:**
- ✅ Maximum 25 years for insured mortgages (down payment < 20%)
- ✅ Maximum 30 years for uninsured mortgages (down payment >= 20%)
- ✅ Error displayed if amortization exceeds limits
- ✅ Validation on mortgage creation
- ✅ Validation on mortgage renewal (if amortization changed)

### US-2: Validate Loan-to-Value (LTV)

**As a** system  
**I want to** validate LTV ratio  
**So that** mortgages comply with regulatory limits

**Acceptance Criteria:**
- ✅ Maximum 95% LTV for insured mortgages
- ✅ Maximum 80% LTV for uninsured mortgages
- ✅ Minimum 5% down payment for insured mortgages
- ✅ Minimum 20% down payment for uninsured mortgages
- ✅ Error displayed if LTV exceeds limits
- ✅ Validation on mortgage creation

### US-3: Calculate B-20 Stress Test

**As a** homeowner  
**I want to** see B-20 stress test calculation  
**So that** I understand qualifying rate requirements

**Acceptance Criteria:**
- ✅ Qualifying rate calculated: Max(Contract Rate + 2%, Bank of Canada 5-Year Posted Rate)
- ✅ Payment at qualifying rate calculated and displayed
- ✅ Stress test information displayed on mortgage details
- ✅ Stress test calculated for insured and uninsured mortgages

### US-4: Calculate GDS/TDS Ratios

**As a** homeowner  
**I want to** see debt service ratios  
**So that** I understand my debt service position

**Acceptance Criteria:**
- ✅ GDS ratio calculated (if income/expense data available)
- ✅ TDS ratio calculated (if income/expense data available)
- ✅ Ratios displayed with typical limits (GDS <= 32%, TDS <= 40%)
- ✅ Ratios updated when mortgage or income/expense data changes

---

## Technical Implementation Notes

### Validation Service

**Methods:**
- `validateAmortization(amortizationYears, isHighRatio): ValidationResult`
- `validateLTV(loanAmount, propertyPrice, downPaymentPercent): ValidationResult`
- `calculateQualifyingRate(contractRate, boc5YearPostedRate): number`
- `calculatePaymentAtQualifyingRate(loanAmount, qualifyingRate, amortizationYears, paymentFrequency): number`
- `calculateGDS(mortgagePayment, propertyTax, heating, condoFees, grossIncome): number`
- `calculateTDS(mortgagePayment, propertyTax, heating, condoFees, otherDebtPayments, grossIncome): number`

### Integration Points

1. **Mortgage Creation Validation:**
   - Validate amortization and LTV
   - Calculate qualifying rate
   - Display stress test information

2. **Mortgage Renewal Validation:**
   - Validate amortization if changed
   - Calculate qualifying rate for new term

3. **Refinancing Analysis:**
   - Calculate qualifying rate
   - Display stress test impact

4. **Debt Service Ratios:**
   - Calculate GDS/TDS if income/expense data available
   - Display ratios with limits

---

## Edge Cases & Error Handling

### Edge Cases

1. **Bank of Canada Rate Unavailable:**
   - Use contract rate + 2% as qualifying rate
   - Log warning if BOC rate unavailable
   - Allow manual BOC rate entry

2. **Income/Expense Data Missing:**
   - GDS/TDS calculation skipped
   - Display message: "Income/expense data required for debt service ratio calculation"

3. **Amortization Changed on Renewal:**
   - Validate new amortization against limits
   - Error if new amortization exceeds limits

### Error Handling

1. **Validation Errors:**
   - Display clear error messages
   - Prevent mortgage creation/renewal if validation fails
   - Suggest corrections

2. **Calculation Errors:**
   - Log error
   - Display error message
   - Don't block mortgage creation if calculation fails (non-critical)

---

## Testing Considerations

### Unit Tests

1. **Amortization Validation:**
   - Valid amortization periods (15, 20, 25, 30)
   - Invalid amortization (exceeds limits)
   - Insured vs uninsured limits

2. **LTV Validation:**
   - Valid LTV ratios
   - Invalid LTV (exceeds limits)
   - Insured vs uninsured limits
   - Minimum down payment validation

3. **B-20 Stress Test:**
   - Qualifying rate calculation
   - Payment at qualifying rate calculation
   - Edge cases (contract rate + 2% vs BOC rate)

4. **GDS/TDS Calculation:**
   - GDS calculation
   - TDS calculation
   - Edge cases (zero income, missing data)

### Integration Tests

1. **Mortgage Creation Validation:**
   - Full validation flow
   - Error handling
   - Stress test calculation

2. **Mortgage Renewal Validation:**
   - Amortization validation
   - Stress test calculation

---

## Future Enhancements

### Phase 1: Enhanced Compliance

- **Dynamic BOC Rate Integration:** Real-time Bank of Canada 5-year posted rate updates
- **Lender-Specific Rules:** Support for lender-specific regulatory variations
- **Regulatory History:** Track regulatory changes over time

### Phase 2: Compliance Reporting

- **Compliance Report:** Generate compliance report for mortgage
- **Regulatory Audit Trail:** Track all compliance validations
- **Regulatory Alerts:** Alert users to regulatory changes affecting their mortgages

---

**End of Regulatory Compliance Feature Specification**

