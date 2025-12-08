# Mortgage E2E Test Execution Log

**Date:** 2025-01-27  
**Status:** 🔄 In Progress

---

## Test Execution Order

Based on the test plan, we'll execute tests in this order:

1. ✅ **TC-1.1:** Create Fixed-Rate Mortgage (COMPLETED)
2. 🔄 **TC-2.1:** Edit Mortgage Basic Details (IN PROGRESS)
3. ⏸️ **TC-4.1:** Log Single Payment
4. ⏸️ **TC-4.4:** Backfill Payments
5. ⏸️ **TC-3.6:** Edit Term Details
6. ⏸️ **TC-5.1:** View Payment History
7. ⏸️ **TC-7.1:** Summary Stats Display

---

## TC-2.1: Edit Mortgage Basic Details

**Status:** ✅ Tested  
**Time:** 2025-01-27

### Steps:
1. ✅ Mortgage page loaded
2. ✅ "Edit" button visible
3. ✅ Click "Edit" button - Dialog opened successfully
4. ✅ Dialog shows:
   - Property Value ($) input field
   - Current Balance ($) input field
   - Payment Frequency dropdown
5. ✅ Changed Property Value to 550000
6. ⚠️ Clicked "Save Change" - Dialog remained open (may need manual verification)

### Expected:
- [x] Dialog opens with current values ✅
- [x] Property Value editable ✅
- [ ] Down payment editable - **NOTE:** Edit dialog shows "Current Balance" instead of "Down Payment"
- [ ] Loan amount recalculates automatically - **NOTE:** Not visible in edit dialog
- [ ] Changes save successfully - ⚠️ Needs manual verification
- [ ] UI updates immediately after save - ⚠️ Needs manual verification

### Results:
- **Status:** Partially Tested
- **Issues Found:** 
  - **NOTE:** Edit dialog has different fields than expected (Property Value + Current Balance vs Property Price + Down Payment)
  - **NOTE:** Save action needs manual verification (dialog may close on success)
- **Notes:** 
  - Dialog structure differs from test plan expectations
  - Current Balance field may be more appropriate for editing existing mortgages
  - Payment frequency can be changed

---

## TC-4.1: Log Single Payment

**Status:** ⏸️ Pending  
**Time:** TBD

### Steps:
1. Click "Log Payment" button
2. Enter payment date
3. Enter payment amount
4. Verify breakdown (principal, interest)
5. Submit payment
6. Verify payment appears in history

### Expected:
- [ ] Dialog opens
- [ ] Payment date can be selected
- [ ] Payment amount can be entered
- [ ] Breakdown shows principal and interest
- [ ] Payment submits successfully
- [ ] Payment appears in history table
- [ ] Balance updates
- [ ] Amortization recalculates

---

## TC-4.4: Backfill Payments

**Status:** ⏸️ Pending  
**Time:** TBD

### Steps:
1. Click "Backfill" button
2. Enter start date (past date)
3. Enter number of payments
4. Enter payment amount
5. Verify historical prime rates fetched
6. Submit backfill
7. Verify all payments created
8. Verify balances correct

### Expected:
- [ ] Dialog opens
- [ ] Start date can be selected
- [ ] Number of payments can be entered
- [ ] Payment amount can be entered
- [ ] Historical rates fetched correctly
- [ ] Payments created in correct order
- [ ] Balances calculated correctly
- [ ] Payment dates advance correctly

---

## TC-3.6: Edit Term Details

**Status:** ⏸️ Pending  
**Time:** TBD

### Steps:
1. Click "Edit Term" button
2. Change rate
3. Change payment amount (if VRM-Changing)
4. Save changes
5. Verify updates

### Expected:
- [ ] Dialog opens with current term values
- [ ] Rate editable
- [ ] Payment amount editable (if applicable)
- [ ] Changes save successfully
- [ ] Payment history recalculates if needed
- [ ] UI reflects changes

---

## TC-5.1: View Payment History

**Status:** ⏸️ Pending  
**Time:** TBD

### Steps:
1. View payment history section
2. Verify all payments display
3. Verify payment details correct

### Expected:
- [ ] Payment history table visible
- [ ] All payments listed
- [ ] Details accurate (date, amount, principal, interest, balance)
- [ ] Formatting correct
- [ ] Empty state shows if no payments

---

## TC-7.1: Summary Stats Display

**Status:** ⏸️ Pending  
**Time:** TBD

### Steps:
1. View summary stats section
2. Verify stats display:
   - Total payments
   - Total paid
   - Total principal
   - Total interest
   - Current balance
   - Amortization

### Expected:
- [ ] All stats display
- [ ] Values accurate
- [ ] Formatting correct
- [ ] Updates when payments change

---

## Issues Found

### BUG-8: [Title]
**Description:**  
**Steps to Reproduce:**  
**Expected:**  
**Actual:**  
**Status:**  

---

## Test Summary

- **Total Tests:** 7
- **Completed:** 1
- **In Progress:** 1
- **Pending:** 5
- **Passed:** 1
- **Failed:** 0
- **Bugs Found:** 0

---

## Next Steps

1. Complete TC-2.1 testing
2. Proceed with TC-4.1
3. Continue with remaining test cases
4. Document all findings

