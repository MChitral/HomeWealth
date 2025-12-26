# Mortgage Creation Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Mortgage creation is the foundational feature that enables all mortgage tracking and optimization capabilities. Creating an accurate mortgage record with complete details is essential for:

- **Accurate Calculations:** All mortgage calculations (payments, interest, amortization) depend on accurate initial data
- **Feature Enablement:** Mortgage creation unlocks all other features (prepayments, renewals, refinancing, scenario planning)
- **Data Integrity:** Proper validation ensures mortgage data meets Canadian regulatory requirements
- **User Onboarding:** First-time mortgage creation is a critical user onboarding experience
- **Multi-Mortgage Support:** Users can track multiple mortgages for portfolio analysis

### Market Context

**Canadian Mortgage Creation Process:**

- **Typical Down Payment:** 5-20% (minimum 5% for insured, 20% for uninsured)
- **Loan-to-Value (LTV):** Up to 95% for insured mortgages, up to 80% for uninsured
- **Amortization Periods:** 15, 20, 25, or 30 years (25 and 30 most common)
- **Payment Frequencies:** Monthly, biweekly, accelerated biweekly, semi-monthly, weekly, accelerated weekly
- **Term Types:** Fixed rate or variable rate (variable-changing or variable-fixed-payment)
- **Insurance Requirements:** CMHC/Sagen/Genworth insurance required for high-ratio mortgages (down payment < 20%)

**Industry Statistics:**

- Average first-time homebuyer down payment: 20% ($80,000 on $400,000 home)
- Average mortgage amount: $400,000-$600,000
- Most common amortization: 25-30 years
- Most common payment frequency: Biweekly (42% of mortgages)
- Most common term type: 5-year fixed (majority of mortgages)

**Strategic Importance:**

- First user experience - sets expectations for data accuracy and feature richness
- Foundation for all mortgage calculations and features
- Enables multi-mortgage portfolio tracking
- Critical for user trust and data accuracy

### Strategic Positioning

- **Foundation Feature:** Mortgage creation is prerequisite for all other mortgage features
- **User Onboarding:** First mortgage creation is critical onboarding experience
- **Data Quality:** Validation ensures regulatory compliance and calculation accuracy
- **Competitive Differentiation:** Comprehensive mortgage creation with insurance calculations and validation exceeds basic tools

---

## Domain Overview

### Mortgage Creation Fundamentals

**Mortgage Creation** is the process of recording a new mortgage with all its characteristics and terms. Key components:

1. **Mortgage Details:**
   - Property price
   - Down payment amount
   - Loan amount (calculated: property price - down payment)
   - Start date
   - Amortization period (years)
   - Payment frequency

2. **Mortgage Term:**
   - Term type (fixed, variable-changing, variable-fixed-payment)
   - Term length (years: 1, 2, 3, 4, 5, 7, 10)
   - Interest rate
   - Start date
   - End date (calculated from start date + term length)

3. **Prepayment Limits:**
   - Annual prepayment limit percentage (typically 10-20%)
   - Prepayment limit reset date (calendar year or anniversary date)
   - Prepayment carry-forward (unused room from previous year)

4. **Insurance (High-Ratio Mortgages):**
   - Insurance provider (CMHC, Sagen, Genworth)
   - Insurance premium amount
   - Insurance premium payment method (added to principal or paid separately)
   - High-ratio flag (down payment < 20%)

5. **Lender Information:**
   - Lender name (optional, for lender-specific rules)

6. **Re-Advanceable Mortgage:**
   - Re-advanceable flag (for re-advanceable mortgages)
   - Linked HELOC account (if applicable)

### Mortgage Calculation Requirements

1. **Loan Amount Calculation:**
   ```
   Loan Amount = Property Price - Down Payment
   
   If insurance premium added to principal:
   Adjusted Loan Amount = Loan Amount + Insurance Premium
   ```

2. **Payment Amount Calculation:**
   - Uses standard mortgage payment formula (semi-annual compounding for Canadian mortgages)
   - Payment frequency affects payment amount (biweekly ≠ monthly/2)
   - Insurance premium may be included in payment if not added to principal

3. **LTV Calculation:**
   ```
   LTV = (Loan Amount / Property Price) × 100
   
   If insurance premium added to principal:
   LTV = ((Loan Amount + Insurance Premium) / Property Price) × 100
   ```

4. **Insurance Premium Calculation:**
   - Based on loan amount and down payment percentage
   - CMHC/Sagen/Genworth have rate tables
   - Premium can be added to principal or paid separately
   - Premium varies by down payment percentage (lower down payment = higher premium percentage)

### Validation Requirements

1. **Property Price:**
   - Must be > 0
   - Must be reasonable (e.g., > $10,000, < $50,000,000)

2. **Down Payment:**
   - Must be >= 0
   - Must be < property price
   - Must meet minimum down payment requirements (5% minimum for insured, 20% for uninsured)

3. **Loan Amount:**
   - Must be > 0
   - Must be <= property price
   - Must meet maximum LTV requirements (95% insured, 80% uninsured)

4. **Amortization:**
   - Must be 15, 20, 25, or 30 years (Canadian standard)
   - Maximum 25 years for insured mortgages (down payment < 20%)
   - Maximum 30 years for uninsured mortgages (down payment >= 20%)

5. **LTV Validation:**
   - Maximum 95% LTV for insured mortgages
   - Maximum 80% LTV for uninsured mortgages
   - If LTV > limits, mortgage creation should be prevented or insurance required

6. **Insurance Requirements:**
   - If down payment < 20%, insurance is required
   - Insurance provider must be specified (CMHC, Sagen, or Genworth)
   - Insurance premium must be calculated and included

7. **Start Date:**
   - Must be valid date
   - Typically not in future (but can be for planning purposes)

8. **Term Details:**
   - Term length must be valid (1, 2, 3, 4, 5, 7, or 10 years)
   - Interest rate must be > 0 and reasonable (e.g., 0.1% - 20%)
   - Term start date must be >= mortgage start date

### Canadian Regulatory Requirements

1. **B-20 Stress Test (Qualifying Rate):**
   - For uninsured mortgages (down payment >= 20%): Greater of contract rate + 2% or Bank of Canada 5-year posted rate
   - For insured mortgages (down payment < 20%): Greater of contract rate + 2% or Bank of Canada 5-year posted rate
   - Payment must be affordable at qualifying rate

2. **Maximum Amortization:**
   - 25 years for insured mortgages
   - 30 years for uninsured mortgages

3. **Maximum LTV:**
   - 95% for insured mortgages
   - 80% for uninsured mortgages

4. **Debt Service Ratios (GDS/TDS):**
   - GDS (Gross Debt Service) ratio typically <= 32%
   - TDS (Total Debt Service) ratio typically <= 40%
   - Used by lenders for mortgage qualification (tracked but not enforced in app)

---

## User Personas & Use Cases

### Primary Personas

1. **First-Time Homebuyer:**
   - Creating first mortgage
   - Needs guidance on down payment, insurance, and amortization
   - May be unfamiliar with mortgage terminology

2. **Existing Homeowner:**
   - Adding additional mortgage to portfolio
   - Familiar with mortgage details
   - Needs efficient data entry

3. **Refinanced Mortgage:**
   - Creating new mortgage after refinancing
   - May need to close old mortgage and create new one

### Use Cases

#### UC-1: Create Standard Mortgage

**Actor:** Homeowner  
**Goal:** Create a new mortgage with standard terms

**Steps:**
1. User navigates to mortgages page
2. User clicks "Add Mortgage" button
3. User enters property price and down payment
4. System calculates loan amount and LTV
5. System determines if insurance is required (down payment < 20%)
6. User selects amortization period (15, 20, 25, or 30 years)
7. User selects payment frequency
8. User enters mortgage start date
9. User enters term details (type, length, rate)
10. User enters prepayment limits (optional, defaults provided)
11. User enters lender name (optional)
12. System validates all fields
13. System calculates payment amount
14. System creates mortgage and initial term
15. System redirects to mortgage details page

**Success Criteria:**
- Mortgage created with all required fields
- Loan amount calculated correctly
- LTV calculated correctly
- Insurance calculated if required
- Payment amount calculated correctly
- Validation prevents invalid data
- Mortgage appears in mortgage list

#### UC-2: Create High-Ratio Mortgage with Insurance

**Actor:** Homeowner  
**Goal:** Create mortgage with down payment < 20% requiring insurance

**Steps:**
1. User enters property price and down payment (< 20%)
2. System detects high-ratio mortgage (LTV > 80%)
3. System prompts for insurance calculation
4. User selects insurance provider (CMHC, Sagen, Genworth)
5. System calculates insurance premium
6. User selects premium payment method (added to principal or separate)
7. If added to principal, system adjusts loan amount
8. System validates LTV still within limits (95% max)
9. User completes remaining mortgage details
10. System creates mortgage with insurance details

**Success Criteria:**
- Insurance requirement detected automatically
- Insurance premium calculated correctly
- Loan amount adjusted if premium added to principal
- LTV validated (must be <= 95%)
- Insurance details saved with mortgage

#### UC-3: Create Variable Rate Mortgage

**Actor:** Homeowner  
**Goal:** Create variable rate mortgage with prime rate tracking

**Steps:**
1. User selects variable rate term type (variable-changing or variable-fixed-payment)
2. System fetches current prime rate (if not provided)
3. User enters term spread (e.g., Prime - 0.50%)
4. System calculates effective rate (Prime + Spread)
5. User completes remaining mortgage details
6. System creates mortgage with variable rate term
7. System sets up prime rate tracking

**Success Criteria:**
- Prime rate fetched or provided
- Effective rate calculated correctly
- Variable rate term created
- Prime rate tracking configured

---

## Feature Requirements

### Data Models

#### mortgages Table

```typescript
{
  id: string (UUID, primary key)
  userId: string (foreign key → users.id)
  propertyPrice: decimal (not null, precision 12, scale 2)
  originalAmount: decimal (not null, precision 12, scale 2) // Loan amount
  currentBalance: decimal (not null, precision 12, scale 2) // Starts = originalAmount
  startDate: date (not null)
  amortizationYears: integer (not null)
  amortizationMonths: integer (default 0)
  paymentFrequency: text (not null) // monthly, biweekly, etc.
  
  // Prepayment limits
  annualPrepaymentLimitPercent: integer (default 20)
  prepaymentLimitResetDate: date? (optional, null = calendar year)
  prepaymentCarryForward: decimal (default 0.00)
  
  // Insurance
  insuranceProvider: text? // "CMHC" | "Sagen" | "Genworth" | null
  insurancePremium: decimal?
  insuranceAddedToPrincipal: integer (default 0) // boolean
  isHighRatio: integer (default 0) // boolean
  
  // Re-advanceable
  isReAdvanceable: integer (default 0) // boolean
  reAdvanceableHelocId: varchar? // foreign key to heloc_accounts.id
  
  // Lender
  lenderName: text?
  
  // Open/Closed
  openClosedMortgageType: text? // "open" | "closed"
  
  createdAt: timestamp (default now)
  updatedAt: timestamp (default now)
}
```

#### mortgage_terms Table

```typescript
{
  id: string (UUID, primary key)
  mortgageId: string (foreign key → mortgages.id)
  termType: text (not null) // "fixed" | "variable-changing" | "variable-fixed-payment"
  termYears: integer (not null) // 1, 2, 3, 4, 5, 7, 10
  startDate: date (not null)
  endDate: date (not null)
  
  // Rate (fixed or variable)
  fixedRate: decimal? // for fixed mortgages
  primeRate: decimal? // for variable mortgages (Prime at term start)
  termSpread: decimal? // for variable mortgages (e.g., -0.50)
  
  // Payment
  regularPaymentAmount: decimal (not null)
  
  // Variable rate specific
  variableRateCap: decimal?
  variableRateFloor: decimal?
  
  // Penalty
  penaltyCalculationMethod: text? // "ird" | "three_month_interest" | "greater_of" | "open_mortgage"
  
  createdAt: timestamp (default now)
}
```

### Business Logic

#### Mortgage Creation Workflow

1. **Input Validation:**
   - Validate property price (> 0, reasonable range)
   - Validate down payment (>= 0, < property price, >= minimum)
   - Calculate loan amount
   - Calculate LTV
   - Validate LTV (<= 95% insured, <= 80% uninsured)
   - Validate amortization (15, 20, 25, or 30 years, max 25 for insured)
   - Validate payment frequency
   - Validate start date

2. **Insurance Calculation (if required):**
   - Determine if insurance required (down payment < 20%)
   - Calculate insurance premium using provider rate table
   - If premium added to principal, adjust loan amount
   - Recalculate LTV with adjusted loan amount
   - Validate final LTV <= 95%

3. **Payment Calculation:**
   - Calculate payment amount using mortgage payment formula
   - Use effective interest rate (fixed rate or Prime + Spread)
   - Account for payment frequency
   - Use semi-annual compounding (Canadian standard)

4. **Mortgage Creation:**
   - Create mortgage record with all fields
   - Set currentBalance = originalAmount (or adjusted loan amount if insurance added)
   - Set prepayment defaults (20% annual limit, calendar year reset)

5. **Term Creation:**
   - Create initial mortgage term
   - Set term start date = mortgage start date
   - Set term end date = start date + term years
   - Store rate information (fixed or variable)

6. **Post-Creation:**
   - Link re-advanceable HELOC if applicable
   - Set up prime rate tracking if variable mortgage
   - Initialize prepayment tracking

#### Loan Amount Calculation

```typescript
function calculateLoanAmount(
  propertyPrice: number,
  downPayment: number,
  insurancePremium?: number,
  insuranceAddedToPrincipal?: boolean
): number {
  let loanAmount = propertyPrice - downPayment;
  
  if (insuranceAddedToPrincipal && insurancePremium) {
    loanAmount += insurancePremium;
  }
  
  return loanAmount;
}
```

#### LTV Calculation

```typescript
function calculateLTV(loanAmount: number, propertyPrice: number): number {
  return (loanAmount / propertyPrice) * 100;
}
```

#### Insurance Premium Calculation

See CMHC Insurance Rates documentation for detailed calculation. Basic logic:

```typescript
function calculateInsurancePremium(
  loanAmount: number,
  downPaymentPercent: number,
  provider: "CMHC" | "Sagen" | "Genworth"
): number {
  // Use provider rate table based on down payment percentage
  // Premium = Loan Amount × Premium Rate
  // Premium rates vary by provider and down payment percentage
  // Lower down payment = higher premium rate
}
```

### Validation

1. **Property Price:**
   - Must be > 0
   - Must be reasonable (e.g., $10,000 - $50,000,000)

2. **Down Payment:**
   - Must be >= 0
   - Must be < property price
   - Minimum 5% for insured mortgages (high-ratio)
   - Minimum 20% for uninsured mortgages (conventional)

3. **Loan Amount:**
   - Must be > 0
   - Must be <= property price
   - If insurance added to principal, must account for premium

4. **LTV:**
   - Maximum 95% for insured mortgages (down payment < 20%)
   - Maximum 80% for uninsured mortgages (down payment >= 20%)

5. **Amortization:**
   - Must be 15, 20, 25, or 30 years
   - Maximum 25 years for insured mortgages
   - Maximum 30 years for uninsured mortgages

6. **Payment Frequency:**
   - Must be valid frequency: monthly, biweekly, accelerated-biweekly, semi-monthly, weekly, accelerated-weekly

7. **Term Details:**
   - Term length must be 1, 2, 3, 4, 5, 7, or 10 years
   - Interest rate must be > 0 and reasonable (0.1% - 20%)
   - Term start date >= mortgage start date

8. **Insurance (if required):**
   - Insurance provider must be specified (CMHC, Sagen, or Genworth)
   - Insurance premium must be calculated
   - Final LTV must be <= 95%

### Integrations

1. **Insurance Calculation Service:**
   - Calculate CMHC/Sagen/Genworth insurance premiums
   - Determine insurance requirements based on LTV

2. **Prime Rate Service:**
   - Fetch current prime rate for variable mortgages
   - Store prime rate at term start for historical tracking

3. **Payment Calculation Service:**
   - Calculate mortgage payment amount
   - Use Canadian mortgage formula (semi-annual compounding)

4. **Validation Service:**
   - B-20 stress test calculations (qualifying rate)
   - GDS/TDS ratio calculations (if income/expense data available)

---

## User Stories & Acceptance Criteria

### US-1: Create Standard Mortgage

**As a** homeowner  
**I want to** create a new mortgage  
**So that** I can track my mortgage payments and optimize my strategy

**Acceptance Criteria:**
- ✅ Property price input (required)
- ✅ Down payment input (required)
- ✅ Loan amount calculated automatically
- ✅ LTV calculated and displayed
- ✅ Amortization selection (15, 20, 25, 30 years)
- ✅ Payment frequency selection
- ✅ Start date input
- ✅ Term details input (type, length, rate)
- ✅ Prepayment limit inputs (optional, defaults provided)
- ✅ Lender name input (optional)
- ✅ System validates all fields
- ✅ System calculates payment amount
- ✅ Mortgage created successfully
- ✅ Redirect to mortgage details page

### US-2: Create High-Ratio Mortgage with Insurance

**As a** homeowner  
**I want to** create a mortgage with down payment < 20%  
**So that** I can track my high-ratio mortgage with insurance

**Acceptance Criteria:**
- ✅ System detects high-ratio mortgage (down payment < 20%)
- ✅ Insurance requirement prompt displayed
- ✅ Insurance provider selection (CMHC, Sagen, Genworth)
- ✅ Insurance premium calculated automatically
- ✅ Premium payment method selection (added to principal or separate)
- ✅ Loan amount adjusted if premium added to principal
- ✅ Final LTV validated (<= 95%)
- ✅ Insurance details saved with mortgage
- ✅ Mortgage created successfully

### US-3: Create Variable Rate Mortgage

**As a** homeowner  
**I want to** create a variable rate mortgage  
**So that** I can track my variable rate mortgage with prime rate

**Acceptance Criteria:**
- ✅ Variable rate term type selection (variable-changing or variable-fixed-payment)
- ✅ Prime rate fetched automatically (or user-provided)
- ✅ Term spread input (e.g., Prime - 0.50%)
- ✅ Effective rate calculated (Prime + Spread)
- ✅ Variable rate cap/floor inputs (optional)
- ✅ Mortgage created with variable rate term
- ✅ Prime rate tracking configured

### US-4: Validate Mortgage Data

**As a** system  
**I want to** validate mortgage data  
**So that** only valid mortgages are created

**Acceptance Criteria:**
- ✅ Property price validation (> 0, reasonable range)
- ✅ Down payment validation (>= minimum, < property price)
- ✅ LTV validation (<= 95% insured, <= 80% uninsured)
- ✅ Amortization validation (15, 20, 25, 30 years, max 25 for insured)
- ✅ Payment frequency validation
- ✅ Term details validation
- ✅ Insurance validation (if required)
- ✅ Error messages displayed for invalid data
- ✅ Invalid mortgages cannot be created

---

## Technical Implementation Notes

### API Endpoints

#### POST /api/mortgages

**Request Body:**
```typescript
{
  propertyPrice: number
  downPayment: number
  startDate: string (ISO date)
  amortizationYears: number (15, 20, 25, 30)
  paymentFrequency: "monthly" | "biweekly" | "accelerated-biweekly" | "semi-monthly" | "weekly" | "accelerated-weekly"
  
  // Term details
  termType: "fixed" | "variable-changing" | "variable-fixed-payment"
  termYears: number (1, 2, 3, 4, 5, 7, 10)
  fixedRate?: number (for fixed mortgages)
  primeRate?: number (for variable mortgages)
  termSpread?: number (for variable mortgages)
  
  // Prepayment limits (optional)
  annualPrepaymentLimitPercent?: number (default 20)
  prepaymentLimitResetDate?: string (ISO date, optional)
  
  // Insurance (if required)
  insuranceProvider?: "CMHC" | "Sagen" | "Genworth"
  insurancePremium?: number
  insuranceAddedToPrincipal?: boolean
  
  // Lender (optional)
  lenderName?: string
  
  // Re-advanceable (optional)
  isReAdvanceable?: boolean
  reAdvanceableHelocId?: string
  
  // Open/Closed (optional)
  openClosedMortgageType?: "open" | "closed"
}
```

**Response:**
```typescript
{
  id: string
  userId: string
  propertyPrice: number
  originalAmount: number
  currentBalance: number
  startDate: string
  amortizationYears: number
  paymentFrequency: string
  // ... other mortgage fields
  createdAt: string
}
```

### Database Schema

See "Data Models" section above for table schemas.

### Service Layer

#### MortgageService

**Methods:**
- `createMortgage(userId, input): Promise<Mortgage>`
- `validateMortgageData(input): Promise<ValidationResult>`
- `calculateLoanAmount(propertyPrice, downPayment, insurance?): number`
- `calculateLTV(loanAmount, propertyPrice): number`
- `determineInsuranceRequired(downPaymentPercent): boolean`

### Frontend Components

#### CreateMortgageDialog

**Props:**
```typescript
{
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (mortgage: Mortgage) => void
}
```

**Features:**
- Multi-step wizard (Step 1: Mortgage Details, Step 2: Term Details)
- Property price and down payment inputs
- Loan amount and LTV calculation and display
- Insurance calculator integration (if high-ratio)
- Amortization selection
- Payment frequency selection
- Term details form
- Validation and error display
- Payment amount preview
- Submit button

#### CMHCInsuranceCalculator

**Props:**
```typescript
{
  loanAmount: number
  downPaymentPercent: number
  onResultChange: (result: InsuranceCalculationResult) => void
}
```

**Features:**
- Insurance premium calculation
- Provider selection (CMHC, Sagen, Genworth)
- Premium payment method selection
- Adjusted loan amount calculation (if premium added to principal)
- LTV validation

---

## Edge Cases & Error Handling

### Edge Cases

1. **Down Payment Exactly 20%:**
   - Insurance not required (conventional mortgage)
   - Maximum amortization = 30 years
   - Maximum LTV = 80%

2. **Down Payment < 5%:**
   - Error: "Minimum down payment is 5% for insured mortgages"
   - Prevent mortgage creation

3. **LTV > 95% After Insurance Added:**
   - Error: "Loan-to-Value ratio exceeds 95% maximum"
   - Suggest increasing down payment
   - Prevent mortgage creation

4. **Future Start Date:**
   - Allow future dates (for planning purposes)
   - Warn if start date is far in future

5. **Variable Rate Without Prime Rate:**
   - Fetch current prime rate automatically
   - If fetch fails, require user to provide prime rate
   - Show error if prime rate not available

### Error Handling

1. **Validation Errors:**
   - Display field-level errors
   - Prevent submission until errors resolved
   - Clear, actionable error messages

2. **Server Errors:**
   - Display user-friendly error messages
   - Log detailed errors for debugging
   - Allow user to retry

3. **Insurance Calculation Errors:**
   - Show error if insurance calculation fails
   - Allow manual insurance premium entry
   - Warn if premium seems incorrect

---

## Testing Considerations

### Unit Tests

1. **Loan Amount Calculation:**
   - Standard calculation (property price - down payment)
   - With insurance added to principal
   - Edge cases (zero down payment, property price = down payment)

2. **LTV Calculation:**
   - Standard LTV calculation
   - With insurance added to principal
   - Edge cases (0% down payment, 20% down payment)

3. **Insurance Calculation:**
   - CMHC premium calculation
   - Sagen premium calculation
   - Genworth premium calculation
   - Different down payment percentages

4. **Validation:**
   - Property price validation
   - Down payment validation
   - LTV validation
   - Amortization validation

### Integration Tests

1. **Mortgage Creation:**
   - Full mortgage creation flow
   - Insurance calculation integration
   - Term creation
   - Payment calculation

2. **Validation:**
   - All validation rules
   - Error messages
   - Invalid data prevention

### End-to-End Tests

1. **Create Standard Mortgage:**
   - User creates standard mortgage
   - Mortgage appears in list
   - Mortgage details correct

2. **Create High-Ratio Mortgage:**
   - User creates high-ratio mortgage
   - Insurance calculated
   - Mortgage created with insurance

---

## Future Enhancements

### Phase 1: Enhanced Validation

- **B-20 Stress Test Integration:** Calculate qualifying rate and validate payment affordability
- **GDS/TDS Ratio Integration:** Calculate and validate debt service ratios (if income/expense data available)
- **Credit Score Integration:** Factor credit score into rate suggestions

### Phase 2: Mortgage Templates

- **Lender Templates:** Pre-configured mortgage templates for major lenders
- **Common Scenarios:** Templates for common mortgage scenarios (first-time buyer, investor, etc.)
- **Rate Suggestions:** Suggest competitive rates based on market data

### Phase 3: Mortgage Import

- **Lender Statement Import:** Import mortgage details from lender statements
- **PDF Parsing:** Extract mortgage details from PDF documents
- **Bank Integration:** Connect with bank APIs to import mortgage data

### Phase 4: Mortgage Comparison

- **Side-by-Side Comparison:** Compare multiple mortgage options during creation
- **Rate Comparison:** Compare rates across different lenders
- **Total Cost Analysis:** Compare total cost of different mortgage options

---

**End of Mortgage Creation Feature Specification**

