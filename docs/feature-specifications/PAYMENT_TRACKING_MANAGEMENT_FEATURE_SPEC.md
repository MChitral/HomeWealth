# Payment Tracking & Management Feature Specification

**Document Version:** 1.0  
**Date:** January 2025  
**Author:** Product Owner (Mortgage Domain Expert)  
**Status:** Feature Specification - Strategic Requirements  
**Target Audience:** Product Team, Development Team, Stakeholders

---

## Executive Summary

### Business Value

Payment tracking is the foundation of mortgage management. Accurate payment recording, history tracking, and corrections are essential for:

- **Accurate Balance Tracking:** Ensures mortgage balance reflects all payments accurately
- **Financial Audit Trail:** Complete payment history for tax records and lender verification
- **Payment Analysis:** Understanding payment patterns, trends, and breakdown (principal vs interest)
- **Error Correction:** Ability to fix mistakes with full audit trail
- **Payment Validation:** Ensures payments comply with mortgage terms and limits
- **Reporting & Export:** CSV export for tax preparation and financial planning

### Market Context

**Canadian Mortgage Payment Tracking Standards:**

- **Payment Breakdown:** Principal, interest, and prepayment must be tracked separately
- **Payment History:** Lenders maintain complete payment history for entire mortgage term
- **Audit Requirements:** Full audit trail required for payment corrections
- **Payment Validation:** Payments must be validated against mortgage terms (rate, frequency, limits)
- **Export Capabilities:** Tax records require payment history export (principal and interest breakdown)

**Industry Statistics:**

- Average mortgage term: 5 years (most common in Canada)
- Average payments per mortgage: 60 payments (monthly) to 260 payments (weekly)
- Payment errors: ~2-3% of payments require correction
- Tax reporting: 80% of homeowners need payment history for tax filing

**Strategic Importance:**

- Core foundational feature - required for all mortgage calculations
- High accuracy requirements (financial data)
- Essential for regulatory compliance and audit trails
- User trust depends on accurate payment tracking

### Strategic Positioning

- **Foundation Feature:** Payment tracking is fundamental to all mortgage features
- **Accuracy Critical:** Financial data accuracy is non-negotiable
- **User Value:** Complete payment history provides transparency and trust
- **Integration Value:** Required for balance updates, prepayment tracking, trigger rate monitoring, scenario planning

---

## Domain Overview

### Payment Fundamentals

**Mortgage Payment** is a regular payment made toward the mortgage that consists of:

1. **Principal:** The portion that reduces the mortgage balance
2. **Interest:** The portion that goes to the lender as interest charges
3. **Prepayment (Optional):** Additional amount beyond required payment

**Payment Breakdown:**

```
Total Payment = Regular Payment Amount + Prepayment Amount

Regular Payment = Principal Paid + Interest Paid
Prepayment Amount = Additional principal reduction (optional)
```

### Payment Types

1. **Regular Payment:**
   - Standard scheduled payment based on mortgage terms
   - Includes principal and interest portions
   - Amount calculated from mortgage terms (rate, balance, amortization, frequency)

2. **Prepayment Payment:**
   - Payment that includes additional amount beyond regular payment
   - Prepayment portion goes directly to principal
   - Subject to annual prepayment limits

3. **Skipped Payment:**
   - Payment that was skipped (Canadian lender feature)
   - Interest accrues during skip period
   - Tracked separately with accrued interest

### Payment Recording Requirements

1. **Payment Date:** Date payment was made (cannot be in future)
2. **Payment Period Label:** Human-readable period identifier (e.g., "January 2025", "Payment #23")
3. **Payment Amounts:**
   - Regular payment amount
   - Prepayment amount (if any)
   - Total payment amount
4. **Payment Breakdown:**
   - Principal paid
   - Interest paid
   - Skipped interest accrued (if payment was skipped)
5. **Balance Tracking:**
   - Remaining balance after payment
   - Remaining amortization (in months)
6. **Rate Tracking (Variable Mortgages):**
   - Prime rate at payment date
   - Effective rate (Prime + Spread)
   - Term spread
7. **Trigger Rate Tracking (VRM-Fixed Payment):**
   - Flag indicating if trigger rate was hit
   - Balance increase tracking (negative amortization)

### Payment Corrections

**Payment Correction** is a mechanism to fix payment recording errors:

1. **Correction Types:**
   - Amount corrections (payment was recorded incorrectly)
   - Date corrections (payment date was wrong)
   - Deletion (payment was recorded by mistake)

2. **Audit Trail Requirements:**
   - Original payment amount
   - Corrected payment amount
   - Reason for correction
   - User who made correction
   - Timestamp of correction

3. **Balance Impact:**
   - Corrections must trigger balance recalculation
   - All subsequent payments must be recalculated if balance changes

### Payment History Features

1. **Filtering:**
   - Filter by year (calendar year)
   - Filter by date range (start date, end date)
   - Filter by payment type (regular, prepayment, skipped)
   - Search by amount

2. **Sorting:**
   - Default: Most recent first
   - Option: Oldest first

3. **Export:**
   - CSV export of filtered payment history
   - Includes all payment fields (date, amounts, breakdown, rates, balance)
   - Format suitable for tax preparation and financial planning

### Payment Amount Change Events

**Payment Amount Change Event** tracks when regular payment amount changes during mortgage term:

1. **Change Reasons:**
   - Rate change (variable-changing mortgages)
   - Mortgage recast (after large prepayment)
   - Payment frequency change
   - Lender adjustment

2. **Event Tracking:**
   - Old payment amount
   - New payment amount
   - Change date
   - Reason for change
   - Associated term ID

### Payment Frequency Change Events

**Payment Frequency Change Event** tracks when payment frequency changes mid-term:

1. **Frequency Change:**
   - Monthly → Biweekly
   - Biweekly → Weekly
   - Monthly → Accelerated Biweekly
   - Etc.

2. **Impact:**
   - Payment amount recalculated
   - Amortization remains constant
   - Payment schedule adjusted

### Canadian Lender Conventions

1. **Payment Date Validation:**
   - Payment date cannot be in future (for logged payments)
   - Payment date must be within term period
   - Payment date must be after mortgage start date

2. **Payment Amount Validation:**
   - Regular payment must match mortgage terms (within tolerance)
   - Prepayment amount must be within annual limits
   - Total payment must equal principal + interest + prepayment

3. **Payment Period Labeling:**
   - Format: "MMM-YYYY" (e.g., "Jan-2025")
   - Can be custom label for specific periods
   - Used for display and reporting

4. **Balance Accuracy:**
   - Balance must be recalculated after each payment
   - Balance must account for prepayments, corrections, recasts
   - Balance used for all subsequent calculations

---

## User Personas & Use Cases

### Primary Personas

1. **Homeowner (Primary User):**
   - Records mortgage payments regularly
   - Reviews payment history for accuracy
   - Exports payment history for tax purposes
   - Corrects payment errors when discovered

2. **Financial Advisor:**
   - Reviews payment history for clients
   - Exports payment data for financial planning
   - Validates payment accuracy

### Use Cases

#### UC-1: Record Regular Payment

**Actor:** Homeowner  
**Goal:** Record a regular mortgage payment

**Steps:**
1. User navigates to mortgage details page
2. User clicks "Record Payment" button
3. System pre-fills payment date (today) and payment amount (from mortgage terms)
4. User confirms payment details
5. System validates payment (date, amount, balance)
6. System records payment and updates mortgage balance
7. System displays updated payment history

**Success Criteria:**
- Payment recorded with correct principal/interest breakdown
- Mortgage balance updated accurately
- Payment appears in payment history
- Remaining amortization updated

#### UC-2: Record Prepayment Payment

**Actor:** Homeowner  
**Goal:** Record a payment that includes prepayment

**Steps:**
1. User navigates to mortgage details page
2. User clicks "Record Payment" button
3. User enters regular payment amount
4. User enters prepayment amount
5. System validates prepayment amount against annual limit
6. System records payment with prepayment
7. System updates mortgage balance and prepayment tracking

**Success Criteria:**
- Payment recorded with prepayment portion
- Prepayment counted toward annual limit
- Balance updated accurately
- Prepayment tracked for limit enforcement

#### UC-3: View Payment History

**Actor:** Homeowner  
**Goal:** View payment history with filtering

**Steps:**
1. User navigates to mortgage details page
2. User clicks "Payment History" tab
3. System displays payment history (most recent first)
4. User applies filters (year, date range, payment type, amount search)
5. System displays filtered payment history

**Success Criteria:**
- All payments displayed with correct details
- Filters work correctly
- Payment breakdown visible (principal, interest, prepayment)
- Balance progression visible

#### UC-4: Export Payment History

**Actor:** Homeowner  
**Goal:** Export payment history for tax purposes

**Steps:**
1. User navigates to payment history
2. User applies filters if needed
3. User clicks "Export CSV" button
4. System generates CSV file with payment data
5. File downloads to user's device

**Success Criteria:**
- CSV file contains all payment fields
- CSV format is suitable for tax preparation
- Filtered payments exported (if filters applied)
- File name includes date for organization

#### UC-5: Correct Payment Error

**Actor:** Homeowner  
**Goal:** Fix a payment recording error

**Steps:**
1. User navigates to payment history
2. User identifies incorrect payment
3. User clicks "Correct Payment" button
4. User enters correction details (reason, corrected amount/date)
5. System records correction with audit trail
6. System recalculates balance and subsequent payments
7. System displays updated payment history

**Success Criteria:**
- Correction recorded with audit trail
- Balance recalculated correctly
- Correction reason saved
- User who made correction tracked
- Payment history reflects correction

#### UC-6: Delete Incorrect Payment

**Actor:** Homeowner  
**Goal:** Remove a payment that was recorded by mistake

**Steps:**
1. User navigates to payment history
2. User identifies payment to delete
3. User clicks "Delete Payment" button
4. System confirms deletion
5. User confirms deletion
6. System deletes payment and recalculates balance
7. System displays updated payment history

**Success Criteria:**
- Payment removed from history
- Balance recalculated correctly
- Subsequent payments remain valid
- Deletion cannot be undone (intentional for audit integrity)

---

## Feature Requirements

### Data Models

#### mortgage_payments Table

```typescript
{
  id: string (UUID, primary key)
  mortgageId: string (foreign key → mortgages.id)
  termId: string (foreign key → mortgageTerms.id)
  paymentDate: date (not null)
  paymentPeriodLabel: string? (optional, e.g., "Jan-2025")
  
  // Payment amounts
  regularPaymentAmount: decimal (not null, precision 10, scale 2)
  prepaymentAmount: decimal (not null, default 0.00, precision 10, scale 2)
  paymentAmount: decimal (not null, precision 10, scale 2) // total = regular + prepayment
  
  // Payment breakdown
  principalPaid: decimal (not null, precision 10, scale 2)
  interestPaid: decimal (not null, precision 10, scale 2)
  remainingBalance: decimal (not null, precision 12, scale 2)
  
  // Rate tracking (variable mortgages)
  primeRate: decimal? (precision 5, scale 3)
  effectiveRate: decimal (not null, precision 5, scale 3)
  
  // Trigger rate tracking (VRM-Fixed Payment)
  triggerRateHit: boolean (default false)
  
  // Payment skipping
  isSkipped: boolean (default false)
  skippedInterestAccrued: decimal (default 0.00, precision 10, scale 2)
  
  // Amortization tracking
  remainingAmortizationMonths: integer (not null)
  
  createdAt: timestamp (default now)
}
```

#### payment_corrections Table

```typescript
{
  id: string (UUID, primary key)
  paymentId: string (foreign key → mortgage_payments.id, cascade delete)
  originalAmount: decimal (not null, precision 10, scale 2)
  correctedAmount: decimal (not null, precision 10, scale 2)
  reason: string (not null)
  correctedBy: string? (user ID)
  createdAt: timestamp (default now)
}
```

#### payment_amount_change_events Table

```typescript
{
  id: string (UUID, primary key)
  mortgageId: string (foreign key → mortgages.id, cascade delete)
  termId: string (foreign key → mortgageTerms.id, cascade delete)
  changeDate: date (not null)
  oldAmount: decimal (not null, precision 10, scale 2)
  newAmount: decimal (not null, precision 10, scale 2)
  reason: string? (optional)
  createdAt: timestamp (default now)
}
```

#### payment_frequency_change_events Table

```typescript
{
  id: string (UUID, primary key)
  mortgageId: string (foreign key → mortgages.id, cascade delete)
  termId: string (foreign key → mortgageTerms.id, cascade delete)
  changeDate: date (not null)
  oldFrequency: string (not null, e.g., "monthly", "biweekly")
  newFrequency: string (not null, e.g., "biweekly", "weekly")
  oldAmount: decimal (not null, precision 10, scale 2)
  newAmount: decimal (not null, precision 10, scale 2)
  reason: string? (optional)
  createdAt: timestamp (default now)
}
```

### Business Logic

#### Payment Recording

1. **Payment Validation:**
   - Payment date must not be in future
   - Payment date must be within term period
   - Payment date must be after mortgage start date
   - Regular payment amount must match expected amount (within tolerance)
   - Prepayment amount must be within annual limits
   - Total payment must equal principal + interest + prepayment

2. **Balance Calculation:**
   - Starting balance = previous payment's remaining balance (or mortgage start balance)
   - Principal paid = payment amount - interest paid
   - Interest paid = balance × effective rate × payment period fraction
   - Remaining balance = starting balance - principal paid - prepayment amount
   - Remaining amortization = calculated from remaining balance and payment amount

3. **Prepayment Limit Enforcement:**
   - Calculate year-to-date prepayments
   - Check against annual limit (based on original mortgage amount)
   - Include carry-forward if applicable
   - Throw error if limit exceeded (with penalty calculation)

4. **Rate Tracking:**
   - For variable mortgages, capture prime rate at payment date
   - Calculate effective rate (prime rate + term spread)
   - Store rate information for historical tracking

5. **Trigger Rate Tracking:**
   - For VRM-Fixed Payment mortgages, check if trigger rate hit
   - If hit, flag payment and track negative amortization
   - Balance increases when trigger rate hit

#### Payment Correction

1. **Correction Workflow:**
   - Create payment correction record (audit trail)
   - Update payment record (if amount/date correction)
   - Delete payment record (if deletion)
   - Recalculate balance from correction point forward
   - Recalculate all subsequent payments

2. **Balance Recalculation:**
   - Start from corrected payment
   - Recalculate balance for corrected payment
   - Recalculate all subsequent payments with new balance
   - Update mortgage current balance

#### Payment History Filtering

1. **Year Filter:**
   - Filter payments by calendar year
   - Include all payments with payment date in selected year

2. **Date Range Filter:**
   - Filter payments between start date and end date (inclusive)
   - Both dates optional (start only, end only, or both)

3. **Payment Type Filter:**
   - All payments (default)
   - Regular payments only (prepayment amount = 0)
   - Prepayment payments only (prepayment amount > 0)
   - Skipped payments only (isSkipped = true)

4. **Amount Search:**
   - Search payments by amount (exact match or range)
   - Useful for finding specific payments

#### Payment Export

1. **CSV Format:**
   - Headers: Date, Period, Prime Rate, Spread, Effective Rate, Regular Payment, Prepayment, Total Paid, Principal, Interest, Skipped Interest, Balance, Amortization
   - One row per payment
   - Export filtered payments only (if filters applied)

2. **File Naming:**
   - Format: `payment-history-YYYY-MM-DD.csv`
   - Includes export date for organization

### Calculations

#### Principal and Interest Calculation

```typescript
function calculatePrincipalAndInterest(
  balance: number,
  paymentAmount: number,
  effectiveRate: number,
  paymentFrequency: PaymentFrequency
): { principalPaid: number; interestPaid: number } {
  const paymentsPerYear = getPaymentsPerYear(paymentFrequency);
  const periodicRate = effectiveRate / 100 / paymentsPerYear;
  
  const interestPaid = balance * periodicRate;
  const principalPaid = paymentAmount - interestPaid;
  
  return { principalPaid, interestPaid };
}
```

#### Remaining Balance Calculation

```typescript
function calculateRemainingBalance(
  previousBalance: number,
  principalPaid: number,
  prepaymentAmount: number
): number {
  return previousBalance - principalPaid - prepaymentAmount;
}
```

#### Remaining Amortization Calculation

```typescript
function calculateRemainingAmortization(
  balance: number,
  paymentAmount: number,
  effectiveRate: number,
  paymentFrequency: PaymentFrequency
): number {
  // Calculate remaining amortization in months
  // Using standard amortization formula
  const paymentsPerYear = getPaymentsPerYear(paymentFrequency);
  const periodicRate = effectiveRate / 100 / paymentsPerYear;
  
  if (periodicRate === 0) {
    return balance / paymentAmount / paymentsPerYear * 12;
  }
  
  const n = -Math.log(1 - (balance * periodicRate) / paymentAmount) / Math.log(1 + periodicRate);
  return (n / paymentsPerYear) * 12; // Convert to months
}
```

### Validation

1. **Payment Date Validation:**
   - Date cannot be in future (for logged payments)
   - Date must be within term period
   - Date must be after mortgage start date

2. **Payment Amount Validation:**
   - Regular payment amount must match expected amount (within 1% tolerance)
   - Total payment amount must equal regular payment + prepayment
   - Payment amount must be positive

3. **Prepayment Validation:**
   - Prepayment amount must be within annual limits
   - Prepayment amount must be non-negative

4. **Balance Validation:**
   - Remaining balance must be positive (or zero at payoff)
   - Balance must decrease after each payment (except trigger rate scenarios)

### Integrations

1. **Mortgage Service:**
   - Update mortgage current balance after payment
   - Update mortgage prepayment tracking

2. **Prepayment Service:**
   - Track prepayment usage for limit enforcement
   - Calculate prepayment opportunities

3. **HELOC Service:**
   - Update HELOC credit limit after principal reduction
   - Recalculate available credit room

4. **Trigger Rate Monitor:**
   - Track trigger rate hits for VRM-Fixed Payment mortgages
   - Alert user when trigger rate approached/hit

5. **Scenario Planning:**
   - Payment history used for scenario baseline
   - Payment patterns inform scenario projections

---

## User Stories & Acceptance Criteria

### US-1: Record Regular Payment

**As a** homeowner  
**I want to** record a regular mortgage payment  
**So that** my mortgage balance is updated accurately

**Acceptance Criteria:**
- ✅ Payment date can be selected (default: today)
- ✅ Payment amount pre-filled from mortgage terms
- ✅ System validates payment date (not in future, within term period)
- ✅ System calculates principal and interest breakdown
- ✅ System updates mortgage balance
- ✅ System updates remaining amortization
- ✅ Payment appears in payment history
- ✅ Payment period label auto-generated if not provided

### US-2: Record Prepayment Payment

**As a** homeowner  
**I want to** record a payment that includes prepayment  
**So that** I can track prepayment usage and save interest

**Acceptance Criteria:**
- ✅ User can enter prepayment amount
- ✅ System validates prepayment against annual limit
- ✅ System enforces prepayment limit (error if exceeded)
- ✅ Prepayment counted toward annual limit
- ✅ Prepayment reduces principal balance
- ✅ Balance updated correctly
- ✅ Prepayment tracked for limit enforcement

### US-3: View Payment History

**As a** homeowner  
**I want to** view my payment history  
**So that** I can review payment accuracy and trends

**Acceptance Criteria:**
- ✅ All payments displayed in reverse chronological order (newest first)
- ✅ Payment details visible (date, amounts, breakdown, balance)
- ✅ Payment period label displayed
- ✅ Rate information displayed (for variable mortgages)
- ✅ Trigger rate status displayed (for VRM-Fixed Payment)
- ✅ Skipped payment indicator displayed
- ✅ Amortization progression visible

### US-4: Filter Payment History

**As a** homeowner  
**I want to** filter payment history  
**So that** I can find specific payments or periods

**Acceptance Criteria:**
- ✅ Filter by calendar year (dropdown)
- ✅ Filter by date range (start date, end date)
- ✅ Filter by payment type (all, regular, prepayment, skipped)
- ✅ Search by amount (exact or range)
- ✅ Filters can be combined
- ✅ Clear filters button resets all filters
- ✅ Filtered results displayed correctly

### US-5: Export Payment History

**As a** homeowner  
**I want to** export payment history to CSV  
**So that** I can use it for tax preparation and financial planning

**Acceptance Criteria:**
- ✅ Export button available in payment history
- ✅ CSV file includes all payment fields
- ✅ CSV format suitable for Excel/Google Sheets
- ✅ Filtered payments exported (if filters applied)
- ✅ File name includes export date
- ✅ File downloads to user's device
- ✅ CSV headers are clear and descriptive

### US-6: Correct Payment Error

**As a** homeowner  
**I want to** correct a payment recording error  
**So that** my mortgage balance is accurate

**Acceptance Criteria:**
- ✅ Correction button available for each payment
- ✅ User can enter correction reason (required)
- ✅ User can correct payment amount or date
- ✅ Correction creates audit trail record
- ✅ System recalculates balance from correction point
- ✅ System recalculates subsequent payments
- ✅ Correction visible in payment history
- ✅ Original payment information preserved in audit trail

### US-7: Delete Incorrect Payment

**As a** homeowner  
**I want to** delete a payment that was recorded by mistake  
**So that** my payment history is accurate

**Acceptance Criteria:**
- ✅ Delete button available for each payment
- ✅ System confirms deletion before proceeding
- ✅ Payment removed from history
- ✅ System recalculates balance from deletion point
- ✅ System recalculates subsequent payments
- ✅ Deletion cannot be undone (audit integrity)

### US-8: View Payment Amount Change History

**As a** homeowner  
**I want to** view payment amount change history  
**So that** I can understand why payment amounts changed

**Acceptance Criteria:**
- ✅ Payment amount change events displayed
- ✅ Old amount and new amount visible
- ✅ Change date displayed
- ✅ Reason for change displayed (rate change, recast, etc.)
- ✅ Change events linked to specific term

### US-9: View Payment Frequency Change History

**As a** homeowner  
**I want to** view payment frequency change history  
**So that** I can track frequency changes over time

**Acceptance Criteria:**
- ✅ Payment frequency change events displayed
- ✅ Old frequency and new frequency visible
- ✅ Old amount and new amount visible
- ✅ Change date displayed
- ✅ Reason for change displayed
- ✅ Change events linked to specific term

---

## Technical Implementation Notes

### API Endpoints

#### POST /api/mortgages/:mortgageId/payments

**Request Body:**
```typescript
{
  termId: string
  paymentDate: string (ISO date)
  paymentPeriodLabel?: string
  regularPaymentAmount: number
  prepaymentAmount?: number (default 0)
  effectiveRate?: number (optional, for historical payments)
}
```

**Response:**
```typescript
{
  id: string
  mortgageId: string
  termId: string
  paymentDate: string
  paymentPeriodLabel?: string
  regularPaymentAmount: number
  prepaymentAmount: number
  paymentAmount: number
  principalPaid: number
  interestPaid: number
  remainingBalance: number
  primeRate?: number
  effectiveRate: number
  triggerRateHit: boolean
  isSkipped: boolean
  skippedInterestAccrued: number
  remainingAmortizationMonths: number
  createdAt: string
}
```

#### GET /api/mortgages/:mortgageId/payments

**Query Parameters:**
- `year?: number` - Filter by calendar year
- `startDate?: string` - Filter by start date (ISO date)
- `endDate?: string` - Filter by end date (ISO date)
- `paymentType?: "all" | "regular" | "prepayment" | "skipped"` - Filter by payment type
- `amount?: number` - Search by amount

**Response:**
```typescript
Array<MortgagePayment>
```

#### DELETE /api/mortgages/:mortgageId/payments/:paymentId

**Response:**
```typescript
{
  success: boolean
}
```

#### POST /api/mortgages/:mortgageId/payments/:paymentId/correction

**Request Body:**
```typescript
{
  reason: string
  correctedAmount?: number
  correctedDate?: string (ISO date)
}
```

**Response:**
```typescript
{
  id: string
  paymentId: string
  originalAmount: number
  correctedAmount: number
  reason: string
  correctedBy: string
  createdAt: string
}
```

#### GET /api/mortgages/:mortgageId/payment-amount-change-events

**Response:**
```typescript
Array<PaymentAmountChangeEvent>
```

#### GET /api/mortgages/:mortgageId/payment-frequency-change-events

**Response:**
```typescript
Array<PaymentFrequencyChangeEvent>
```

### Database Schema

See "Data Models" section above for table schemas.

### Service Layer

#### MortgagePaymentService

**Methods:**
- `createPayment(mortgageId, termId, input): Promise<MortgagePayment>`
- `listByMortgage(mortgageId, userId, filters?): Promise<MortgagePayment[]>`
- `listByTerm(termId, userId): Promise<MortgagePayment[]>`
- `deletePayment(paymentId, userId): Promise<void>`
- `correctPayment(paymentId, userId, correction): Promise<PaymentCorrection>`
- `getPaymentAmountChangeEvents(mortgageId, userId): Promise<PaymentAmountChangeEvent[]>`
- `getPaymentFrequencyChangeEvents(mortgageId, userId): Promise<PaymentFrequencyChangeEvent[]>`

### Frontend Components

#### PaymentHistorySection

**Props:**
```typescript
{
  filteredPayments: UiPayment[]
  availableYears: number[]
  filterYear: string
  onFilterYearChange: (year: string) => void
  filterDateRange: { start: string | null; end: string | null }
  onFilterDateRangeChange: (range: { start: string | null; end: string | null }) => void
  filterPaymentType: "all" | "regular" | "prepayment" | "skipped"
  onFilterPaymentTypeChange: (type: "all" | "regular" | "prepayment" | "skipped") => void
  searchAmount: string
  onSearchAmountChange: (amount: string) => void
  formatAmortization: (years: number) => string
  deletePaymentMutation: UseMutationResult
}
```

**Features:**
- Payment history table with sorting
- Filter controls (year, date range, payment type, amount search)
- Export CSV button
- Delete payment button (with confirmation)
- Payment details display

#### RecordPaymentDialog

**Props:**
```typescript
{
  mortgageId: string
  termId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Features:**
- Payment date picker
- Regular payment amount input (pre-filled)
- Prepayment amount input (optional)
- Payment period label input (optional, auto-generated)
- Validation and error display
- Submit button

#### PaymentCorrectionDialog

**Props:**
```typescript
{
  payment: MortgagePayment
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

**Features:**
- Correction reason input (required)
- Corrected amount input (optional)
- Corrected date input (optional)
- Validation and error display
- Submit button

### Data Flows

#### Payment Recording Flow

1. User clicks "Record Payment"
2. Frontend opens RecordPaymentDialog
3. Frontend pre-fills payment date and amount from mortgage terms
4. User enters payment details
5. Frontend validates input
6. Frontend calls POST /api/mortgages/:mortgageId/payments
7. Backend validates payment (date, amount, limits)
8. Backend calculates principal/interest breakdown
9. Backend calculates remaining balance
10. Backend creates payment record
11. Backend updates mortgage balance
12. Backend returns payment record
13. Frontend refreshes payment history
14. Frontend updates mortgage balance display

#### Payment Correction Flow

1. User clicks "Correct Payment" on payment
2. Frontend opens PaymentCorrectionDialog
3. User enters correction reason and details
4. Frontend validates input
5. Frontend calls POST /api/mortgages/:mortgageId/payments/:paymentId/correction
6. Backend creates correction audit trail
7. Backend updates/deletes payment record
8. Backend recalculates balance from correction point
9. Backend recalculates subsequent payments
10. Backend returns correction record
11. Frontend refreshes payment history
12. Frontend updates mortgage balance display

---

## Edge Cases & Error Handling

### Edge Cases

1. **Future Payment Date:**
   - Error: "Payment date cannot be in the future"
   - Solution: Validate payment date before recording

2. **Payment Before Mortgage Start:**
   - Error: "Payment date cannot be before mortgage start date"
   - Solution: Validate payment date against mortgage start date

3. **Payment Outside Term Period:**
   - Error: "Payment date must be within term period"
   - Solution: Validate payment date against term start/end dates

4. **Payment Amount Mismatch:**
   - Error: "Regular payment amount does not match expected amount"
   - Solution: Allow small tolerance (1%) or require exact match

5. **Prepayment Limit Exceeded:**
   - Error: "Annual prepayment limit exceeded"
   - Solution: Show available limit and penalty calculation

6. **Balance Recalculation Failure:**
   - Error: "Failed to recalculate balance after correction"
   - Solution: Rollback correction, show error to user

7. **Empty Payment History:**
   - Display: "No payments recorded yet"
   - Solution: Show empty state message

8. **Export with No Payments:**
   - Error: "No payments to export"
   - Solution: Disable export button or show error message

### Error Handling

1. **Validation Errors:**
   - Display field-level errors
   - Prevent submission until errors resolved

2. **Server Errors:**
   - Display user-friendly error messages
   - Log detailed errors for debugging

3. **Network Errors:**
   - Retry mechanism for failed requests
   - Show network error message

4. **Balance Calculation Errors:**
   - Rollback payment if balance calculation fails
   - Show error with details
   - Allow user to retry

---

## Testing Considerations

### Unit Tests

1. **Payment Calculation:**
   - Principal and interest calculation for different rates
   - Balance calculation after payment
   - Amortization calculation

2. **Payment Validation:**
   - Date validation (future, before start, outside term)
   - Amount validation (mismatch, negative)
   - Prepayment limit validation

3. **Payment Correction:**
   - Correction audit trail creation
   - Balance recalculation after correction
   - Subsequent payment recalculation

4. **Payment Filtering:**
   - Year filter
   - Date range filter
   - Payment type filter
   - Amount search

### Integration Tests

1. **Payment Recording:**
   - Full payment recording flow
   - Balance update after payment
   - Prepayment limit tracking

2. **Payment Correction:**
   - Full correction flow
   - Balance recalculation
   - Subsequent payment update

3. **Payment History:**
   - Filtering functionality
   - Export functionality
   - Payment display

### End-to-End Tests

1. **Record Payment:**
   - User records regular payment
   - Payment appears in history
   - Balance updated correctly

2. **Record Prepayment:**
   - User records prepayment
   - Prepayment tracked correctly
   - Limit enforced

3. **Correct Payment:**
   - User corrects payment error
   - Balance recalculated
   - Correction visible in history

4. **Export Payment History:**
   - User exports payment history
   - CSV file generated correctly
   - File downloads successfully

---

## Future Enhancements

### Phase 1: Payment Automation

- **Automatic Payment Scheduling:** Schedule future payments automatically
- **Payment Reminders:** Notifications before payment due date
- **Payment Templates:** Save payment templates for recurring prepayments

### Phase 2: Advanced Analytics

- **Payment Trends Analysis:** Visualize payment patterns over time
- **Interest Savings Calculator:** Calculate interest saved from prepayments
- **Payment Comparison:** Compare payment history across multiple mortgages

### Phase 3: Integration Enhancements

- **Bank Integration:** Import payments from bank statements
- **Lender Integration:** Sync payments with lender systems
- **Accounting Software Integration:** Export to QuickBooks, Xero, etc.

### Phase 4: Payment Optimization

- **Optimal Payment Timing:** Recommend best time to make prepayments
- **Payment Strategy Recommendations:** AI-powered payment optimization
- **Payment Impact Projections:** Project long-term impact of payment changes

---

**End of Payment Tracking & Management Feature Specification**

