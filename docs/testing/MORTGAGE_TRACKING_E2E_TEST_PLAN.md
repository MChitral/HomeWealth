# Mortgage Tracking E2E Test Plan

**Date:** 2025-01-27  
**Feature:** Mortgage Tracking  
**Status:** In Progress

---

## Test Scope

This document outlines comprehensive end-to-end testing for the Mortgage Tracking feature, covering all user workflows, edge cases, and domain logic validation.

---

## Test Categories

### 1. Mortgage Creation
### 2. Mortgage Editing
### 3. Term Management (First Term & Renewals)
### 4. Payment Operations (Log, Backfill, Delete)
### 5. Payment History & Filtering
### 6. Prime Rate Integration
### 7. Summary Statistics
### 8. Multiple Mortgages
### 9. Edge Cases & Error Handling
### 10. Data Validation & Business Rules

---

## Test Cases

### Category 1: Mortgage Creation

#### TC-1.1: Create Fixed-Rate Mortgage (Complete Flow)
**Steps:**
1. Navigate to Mortgage page
2. Click "Create Mortgage"
3. Step 1: Enter property price, down payment
4. Verify loan amount calculation
5. Step 2: Enter term details (fixed rate, term length, payment frequency)
6. Verify auto-calculated payment amount
7. Submit mortgage creation
8. Verify mortgage appears in selector
9. Verify mortgage details display correctly

**Expected:**
- Loan amount = property price - down payment
- Payment amount calculated correctly for fixed rate
- Mortgage created successfully
- All fields display correctly

---

#### TC-1.2: Create Variable-Rate Mortgage (VRM-Fixed-Payment)
**Steps:**
1. Create mortgage with variable rate term
2. Enter prime rate spread
3. Verify payment amount calculation
4. Verify prime rate banner appears
5. Submit and verify

**Expected:**
- Payment amount calculated correctly
- Prime rate integration works
- Effective rate = prime + spread

---

#### TC-1.3: Create Variable-Rate Mortgage (VRM-Changing-Payment)
**Steps:**
1. Create mortgage with VRM-Changing-Payment term
2. Verify payment amount can be edited
3. Verify payment updates when prime rate changes
4. Submit and verify

**Expected:**
- Payment amount editable
- Payment recalculates on prime rate change

---

#### TC-1.4: Create Mortgage with Different Payment Frequencies
**Test Frequencies:**
- Monthly
- Semi-monthly
- Biweekly
- Accelerated biweekly
- Weekly
- Accelerated weekly

**Expected:**
- Payment amounts calculated correctly for each frequency
- Payment dates advance correctly
- Accelerated payments show correct amounts

---

#### TC-1.5: Create Mortgage - Validation Errors
**Test Cases:**
- Empty property price
- Down payment > property price
- Invalid term dates
- Missing required fields
- Invalid rate values

**Expected:**
- Validation errors display correctly
- Form prevents submission
- Error messages are clear

---

### Category 2: Mortgage Editing

#### TC-2.1: Edit Mortgage Basic Details
**Steps:**
1. Open existing mortgage
2. Click "Edit Mortgage"
3. Change property price
4. Change down payment
5. Save changes
6. Verify updates reflected

**Expected:**
- Changes saved correctly
- Loan amount recalculates
- UI updates immediately

---

#### TC-2.2: Edit Mortgage - Validation
**Steps:**
1. Try to set down payment > property price
2. Try invalid values
3. Verify validation

**Expected:**
- Validation prevents invalid changes
- Error messages clear

---

### Category 3: Term Management

#### TC-3.1: Create First Term (No Existing Term)
**Steps:**
1. Create mortgage without term
2. Verify "No Term" state appears
3. Create first term
4. Verify term details display

**Expected:**
- No term state shows correctly
- First term creation works
- Term details display correctly

---

#### TC-3.2: Term Renewal (Fixed to Fixed)
**Steps:**
1. Create fixed-rate term
2. Wait for term to end (or manually set end date)
3. Click "Renew Term"
4. Enter new fixed rate
5. Verify payment recalculation
6. Submit renewal

**Expected:**
- Renewal creates new term
- Payment recalculates correctly
- Amortization updates

---

#### TC-3.3: Term Renewal (Fixed to Variable)
**Steps:**
1. Create fixed-rate term
2. Renew to variable rate
3. Enter prime spread
4. Verify payment calculation
5. Submit

**Expected:**
- Renewal works correctly
- Payment uses prime + spread
- Prime rate banner appears

---

#### TC-3.4: Term Renewal (Variable to Fixed)
**Steps:**
1. Create variable-rate term
2. Renew to fixed rate
3. Verify payment calculation
4. Submit

**Expected:**
- Renewal works correctly
- Payment uses fixed rate
- Prime rate banner disappears

---

#### TC-3.5: Blend-and-Extend Renewal
**Steps:**
1. Create term with remaining balance
2. Renew with blend-and-extend
3. Enter new rate and extended amortization
4. Verify blended rate calculation
5. Submit

**Expected:**
- Blend-and-extend calculates correctly
- Amortization extends as expected
- Payment recalculates

---

#### TC-3.6: Edit Term Details
**Steps:**
1. Open existing term
2. Click "Edit Term"
3. Change rate
4. Change payment amount (if VRM-Changing)
5. Save changes
6. Verify updates

**Expected:**
- Term updates correctly
- Payment history recalculates if needed
- UI reflects changes

---

#### TC-3.7: Term Overlap Validation
**Steps:**
1. Try to create term with overlapping dates
2. Verify validation error

**Expected:**
- Overlap validation prevents invalid terms
- Error message clear

---

### Category 4: Payment Operations

#### TC-4.1: Log Single Payment
**Steps:**
1. Open mortgage with term
2. Click "Log Payment"
3. Enter payment date
4. Enter payment amount
5. Verify breakdown (principal, interest)
6. Submit payment
7. Verify payment appears in history

**Expected:**
- Payment logged correctly
- Balance updates
- Amortization recalculates
- Payment appears in history

---

#### TC-4.2: Log Payment with Prepayment
**Steps:**
1. Log payment with extra prepayment
2. Verify prepayment applied to principal
3. Verify balance reduction
4. Verify amortization reduction

**Expected:**
- Prepayment applied correctly
- Balance reduces by prepayment amount
- Amortization recalculates

---

#### TC-4.3: Log Payment - Trigger Rate Hit
**Steps:**
1. Create VRM with low payment
2. Increase prime rate significantly
3. Log payment
4. Verify trigger rate warning
5. Verify negative amortization

**Expected:**
- Trigger rate detected correctly
- Warning displays
- Negative amortization calculated

---

#### TC-4.4: Backfill Payments (Historical)
**Steps:**
1. Click "Backfill Payments"
2. Enter start date (past date)
3. Enter number of payments
4. Enter payment amount
5. Verify historical prime rates fetched
6. Submit backfill
7. Verify all payments created
8. Verify balances correct

**Expected:**
- Payments created in correct order
- Historical rates applied correctly
- Balances calculated correctly
- Payment dates advance correctly

---

#### TC-4.5: Backfill Payments - Validation
**Steps:**
1. Try to backfill with invalid dates
2. Try to backfill without balance
3. Try to backfill with missing payment amount
4. Verify validation

**Expected:**
- Validation prevents invalid backfill
- Error messages clear

---

#### TC-4.6: Delete Payment
**Steps:**
1. Log a payment
2. Delete the payment
3. Verify payment removed from history
4. Verify balance recalculates
5. Verify amortization recalculates

**Expected:**
- Payment deleted correctly
- Balance updates
- Amortization updates
- Subsequent payments recalculate

---

#### TC-4.7: Delete Payment - Cascade Effects
**Steps:**
1. Create multiple payments
2. Delete middle payment
3. Verify subsequent payments recalculate
4. Verify balances correct

**Expected:**
- Cascade recalculation works
- All balances correct
- No data corruption

---

### Category 5: Payment History & Filtering

#### TC-5.1: View Payment History
**Steps:**
1. Create mortgage with multiple payments
2. View payment history
3. Verify all payments display
4. Verify payment details correct

**Expected:**
- All payments visible
- Details accurate
- Formatting correct

---

#### TC-5.2: Filter by Year
**Steps:**
1. Create payments across multiple years
2. Filter by specific year
3. Verify only that year's payments show
4. Change filter
5. Verify filter updates

**Expected:**
- Filtering works correctly
- Only selected year shows
- Filter updates immediately

---

#### TC-5.3: Payment History - Empty State
**Steps:**
1. Create mortgage with no payments
2. Verify empty state message

**Expected:**
- Empty state displays correctly
- Message helpful

---

### Category 6: Prime Rate Integration

#### TC-6.1: Prime Rate Banner Display
**Steps:**
1. Create variable-rate mortgage
2. Verify prime rate banner appears
3. Verify rate displays correctly
4. Verify effective date shows

**Expected:**
- Banner appears for VRMs
- Rate accurate
- Date accurate

---

#### TC-6.2: Refresh Prime Rate
**Steps:**
1. Click "Refresh Prime Rate"
2. Verify loading state
3. Verify rate updates
4. Verify effective date updates

**Expected:**
- Refresh works
- Loading state shows
- Rate updates correctly

---

#### TC-6.3: Prime Rate Update - Payment Recalculation
**Steps:**
1. Create VRM-Changing-Payment term
2. Update prime rate
3. Verify payment recalculates
4. Verify effective rate updates

**Expected:**
- Payment recalculates automatically
- Effective rate updates
- UI reflects changes

---

### Category 7: Summary Statistics

#### TC-7.1: Summary Stats Display
**Steps:**
1. Create mortgage with payments
2. Verify summary stats display:
   - Total payments
   - Total paid
   - Total principal
   - Total interest
   - Current balance
   - Amortization

**Expected:**
- All stats display
- Values accurate
- Formatting correct

---

#### TC-7.2: Summary Stats - Updates
**Steps:**
1. View summary stats
2. Log new payment
3. Verify stats update
4. Delete payment
5. Verify stats update

**Expected:**
- Stats update immediately
- Values accurate after changes

---

#### TC-7.3: Trigger Rate Count
**Steps:**
1. Create payments that hit trigger rate
2. Verify trigger rate count displays
3. Verify warning appears

**Expected:**
- Count accurate
- Warning displays
- Message helpful

---

### Category 8: Multiple Mortgages

#### TC-8.1: Create Multiple Mortgages
**Steps:**
1. Create first mortgage
2. Create second mortgage
3. Verify both in selector
4. Switch between mortgages
5. Verify data persists

**Expected:**
- Multiple mortgages supported
- Selector works correctly
- Data isolated per mortgage

---

#### TC-8.2: Delete Mortgage
**Steps:**
1. Create mortgage with payments
2. Delete mortgage
3. Verify mortgage removed
4. Verify empty state if last mortgage

**Expected:**
- Mortgage deleted correctly
- Empty state shows if needed
- No orphaned data

---

### Category 9: Edge Cases & Error Handling

#### TC-9.1: Empty Database State
**Steps:**
1. Start with empty database
2. Navigate to Mortgage page
3. Verify empty state
4. Verify "Create Mortgage" button works

**Expected:**
- Empty state displays correctly
- Create button works
- No errors

---

#### TC-9.2: Missing Required Data
**Steps:**
1. Try operations with missing data
2. Verify error handling
3. Verify user-friendly messages

**Expected:**
- Errors handled gracefully
- Messages clear
- No crashes

---

#### TC-9.3: Invalid Date Ranges
**Steps:**
1. Try to create term with end < start
2. Try to log payment with future date
3. Try to backfill with invalid range
4. Verify validation

**Expected:**
- Validation prevents invalid dates
- Error messages clear

---

#### TC-9.4: Payment Date Business Day Adjustment
**Steps:**
1. Log payment on weekend
2. Log payment on holiday
3. Verify dates adjust to business days

**Expected:**
- Dates adjust correctly
- Canadian holidays recognized
- Weekends handled

---

### Category 10: Data Validation & Business Rules

#### TC-10.1: Prepayment Limit Enforcement
**Steps:**
1. Create mortgage with prepayment limit
2. Try to exceed annual limit
3. Verify limit enforced
4. Verify year boundary resets

**Expected:**
- Limit enforced correctly
- Year boundary works
- Error message clear

---

#### TC-10.2: Payment Skipping Logic
**Steps:**
1. Create mortgage with skip payment feature
2. Skip a payment
3. Verify interest accrues
4. Verify skip limits enforced

**Expected:**
- Skipping works correctly
- Interest accrues
- Limits enforced

---

#### TC-10.3: Amortization Recalculation
**Steps:**
1. Create mortgage
2. Make prepayments
3. Verify amortization reduces
4. Change rate
5. Verify amortization recalculates

**Expected:**
- Amortization accurate
- Updates correctly
- Recalculates on changes

---

#### TC-10.4: Canadian Mortgage Rules
**Steps:**
1. Verify semi-annual compounding
2. Verify payment frequency calculations
3. Verify effective rate calculations
4. Verify trigger rate calculations

**Expected:**
- All Canadian rules followed
- Calculations accurate
- Domain logic correct

---

## Test Execution

Tests will be executed using browser automation and documented in the test results document.

---

## Bug Tracking

All bugs and issues found during testing will be documented in:
`docs/testing/MORTGAGE_TRACKING_E2E_TEST_RESULTS.md`

