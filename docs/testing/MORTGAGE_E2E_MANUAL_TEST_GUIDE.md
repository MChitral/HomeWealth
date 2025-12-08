# Mortgage E2E Manual Test Guide

**Date:** 2025-01-27  
**Purpose:** Comprehensive manual testing guide for remaining E2E scenarios

---

## Quick Test Checklist

### ✅ Completed Tests
- [x] TC-1.1: Create Fixed-Rate Mortgage
- [x] TC-2.1: Edit Mortgage Basic Details (Partially)

### 🔄 Next Tests to Execute

1. **TC-4.1: Log Single Payment**
2. **TC-4.4: Backfill Payments**
3. **TC-3.6: Edit Term Details**
4. **TC-5.1: View Payment History**
5. **TC-7.1: Summary Stats Display**
6. **TC-3.2: Term Renewal**

---

## TC-4.1: Log Single Payment

### Steps:
1. On mortgage page, click **"Log Payment"** button
2. **Expected:** Dialog opens with payment form
3. Enter payment date (e.g., today's date)
4. Enter payment amount (e.g., 1500.69)
5. **Expected:** Breakdown shows:
   - Principal amount
   - Interest amount
   - Total payment
6. **Expected:** Balance updates automatically
7. Click **"Submit"** or **"Log Payment"**
8. **Expected:** 
   - Dialog closes
   - Success toast appears
   - Payment appears in payment history table
   - Balance updates on page
   - Amortization recalculates

### Verification:
- [ ] Payment appears in history table
- [ ] Payment date is correct
- [ ] Payment amount is correct
- [ ] Principal and interest breakdown is correct
- [ ] Balance is updated correctly
- [ ] Summary stats update

### Test Data:
- Payment Date: Today's date
- Payment Amount: $1,500.69
- Expected Principal: ~$XXX (calculated)
- Expected Interest: ~$XXX (calculated)

---

## TC-4.4: Backfill Payments

### Steps:
1. Click **"Backfill"** button
2. **Expected:** Dialog opens with backfill form
3. Enter start date (e.g., 3 months ago)
4. Enter number of payments (e.g., 3)
5. Enter payment amount (e.g., 1500.69)
6. **Expected:** 
   - Historical prime rates fetched (if variable rate)
   - Payment dates calculated automatically
7. Click **"Backfill Payments"** or **"Submit"**
8. **Expected:**
   - Dialog closes
   - Success toast appears
   - All payments appear in history table
   - Balances calculated correctly
   - Payment dates advance correctly

### Verification:
- [ ] All payments created
- [ ] Payments in chronological order
- [ ] Payment dates advance correctly (monthly = +1 month)
- [ ] Balances calculated correctly
- [ ] Historical rates applied (if variable rate)
- [ ] Summary stats updated

### Test Data:
- Start Date: 3 months ago
- Number of Payments: 3
- Payment Amount: $1,500.69

---

## TC-3.6: Edit Term Details

### Steps:
1. Click **"Edit Term"** button
2. **Expected:** Dialog opens with current term values
3. Change rate (e.g., from 4.55% to 5.00%)
4. **Expected:** Payment amount recalculates (if applicable)
5. Change payment amount (if VRM-Changing-Payment type)
6. Click **"Save"** or **"Update Term"**
7. **Expected:**
   - Dialog closes
   - Success toast appears
   - Term details update on page
   - Payment history recalculates (if needed)

### Verification:
- [ ] Term rate updated
- [ ] Payment amount updated (if changed)
- [ ] Effective rate updated
- [ ] UI reflects changes
- [ ] No data corruption

### Test Data:
- New Rate: 5.00%
- New Payment Amount: $1,600.00 (if applicable)

---

## TC-5.1: View Payment History

### Steps:
1. View payment history section on mortgage page
2. **Expected:** Payment history table visible
3. **Expected:** Columns show:
   - Date
   - Payment Amount
   - Principal
   - Interest
   - Balance
4. **Expected:** Payments listed in chronological order
5. Test year filter (if available)
6. **Expected:** Filter updates table

### Verification:
- [ ] All payments visible
- [ ] Payment details accurate
- [ ] Formatting correct
- [ ] Year filter works (if available)
- [ ] Empty state shows if no payments

---

## TC-7.1: Summary Stats Display

### Steps:
1. View summary statistics section
2. **Expected:** Stats display:
   - Total Payments
   - Total Paid
   - Total Principal Paid
   - Total Interest Paid
   - Current Balance
   - Remaining Amortization
3. Log a payment
4. **Expected:** Stats update immediately
5. Delete a payment
6. **Expected:** Stats update immediately

### Verification:
- [ ] All stats display
- [ ] Values accurate
- [ ] Formatting correct
- [ ] Stats update on payment changes
- [ ] Calculations correct

---

## TC-3.2: Term Renewal (Fixed to Fixed)

### Steps:
1. Click **"Renew Term"** button
2. **Expected:** Dialog opens with renewal form
3. Enter new fixed rate (e.g., 5.50%)
4. Enter new term length (e.g., 5 years)
5. **Expected:** Payment amount recalculates
6. **Expected:** Amortization updates
7. Click **"Renew Term"** or **"Submit"**
8. **Expected:**
   - Dialog closes
   - Success toast appears
   - New term appears
   - Old term marked as completed
   - Payment amount updated

### Verification:
- [ ] New term created
- [ ] Old term marked as completed
- [ ] Payment amount updated
- [ ] Amortization updated
- [ ] Balance continues correctly

### Test Data:
- New Rate: 5.50%
- New Term Length: 5 years

---

## Common Issues to Watch For

### UI Issues:
- [ ] Buttons not responding
- [ ] Dialogs not opening/closing
- [ ] Forms not submitting
- [ ] Loading states not showing
- [ ] Error messages not displaying

### Data Issues:
- [ ] Values not saving
- [ ] Calculations incorrect
- [ ] Dates incorrect
- [ ] Balances incorrect
- [ ] Payment order incorrect

### API Issues:
- [ ] Network errors
- [ ] 400/500 errors
- [ ] Slow responses
- [ ] Missing data

---

## Browser Console Checks

While testing, check browser console (F12) for:

- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] API calls successful (check Network tab)
- [ ] No console errors
- [ ] Proper error handling

---

## Test Results Template

For each test, document:

```markdown
### TC-XX.X: [Test Name]
**Status:** ✅ Passed / ❌ Failed / ⚠️ Partial
**Date:** YYYY-MM-DD
**Tester:** [Name]

**Steps Executed:**
1. ✅ Step 1
2. ✅ Step 2
3. ❌ Step 3 - Issue: [description]

**Issues Found:**
- Issue 1: [description]
- Issue 2: [description]

**Screenshots:** [if applicable]
**Notes:** [any additional observations]
```

---

## Next Steps After Testing

1. Document all findings
2. Create bug reports for issues found
3. Prioritize fixes
4. Re-test after fixes
5. Continue with remaining test cases

