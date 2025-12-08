# Mortgage Creation Manual Test Guide

**Date:** 2025-01-27  
**Status:** ✅ Ready for Testing

---

## Pre-Test Checklist

- [ ] Server is running (`npm run dev` or `npm start`)
- [ ] Database is accessible
- [ ] Browser console is open (F12)
- [ ] No existing mortgages in database (for clean test)

---

## Test Steps

### Step 1: Navigate to Mortgage Page

1. Open browser and navigate to `http://localhost:5000/mortgage`
2. **Expected:** Empty state displays with "Welcome to Mortgage Tracking"
3. **Expected:** "Create Your First Mortgage" button is visible

---

### Step 2: Open Create Mortgage Dialog

1. Click "Create Your First Mortgage" button
2. **Expected:** Dialog opens with "Step 1: Mortgage Details"
3. **Expected:** Dialog shows:
   - Property Price ($) input
   - Down Payment ($) input
   - Mortgage Start Date input
   - Amortization (years) dropdown
   - Payment Frequency dropdown
   - "Cancel" and "Next: Term Detail" buttons

---

### Step 3: Fill Step 1 Form

Fill in the following values:

1. **Property Price:** `500000`
   - Type in the Property Price field
   - **Expected:** Value appears correctly

2. **Down Payment:** `100000`
   - Type in the Down Payment field
   - **Expected:** Value appears correctly
   - **Expected:** "Loan amount: $400,000" appears below the field

3. **Mortgage Start Date:** `2024-01-01`
   - Select or type the date
   - **Expected:** Date appears correctly

4. **Amortization:** `25 Years`
   - Click the dropdown
   - Select "25 Years"
   - **Expected:** "25 Years" is selected

5. **Payment Frequency:** `Monthly`
   - Click the dropdown
   - Select "Monthly"
   - **Expected:** "Monthly" is selected

---

### Step 4: Navigate to Step 2

1. **Verify "Next: Term Detail" button is enabled**
   - **Expected:** Button should be enabled (not grayed out)
   - **Expected:** Button text is "Next: Term Detail"

2. Click "Next: Term Detail" button
3. **Expected:** Dialog transitions to "Step 2: Term Details"
4. **Expected:** Step 1 fields are hidden
5. **Expected:** Step 2 fields are visible:
   - Mortgage Type dropdown
   - Prime Rate display
   - Regular Payment Amount input
   - Term Length dropdown
   - Spread input (for variable rate)
   - Effective Rate display

---

### Step 5: Fill Step 2 Form

Fill in the following values:

1. **Mortgage Type:** `Variable (Fixed Payment)`
   - Click the dropdown
   - Select "Variable (Fixed Payment)"
   - **Expected:** "Variable (Fixed Payment)" is selected
   - **Expected:** Spread input appears

2. **Prime Rate:** Display only (should show current rate)
   - **Expected:** Shows current Bank of Canada prime rate
   - **Expected:** Refresh button is available

3. **Spread:** `-1.9`
   - Type `-1.9` in the Spread field
   - **Expected:** Value appears correctly
   - **Expected:** Effective Rate updates automatically

4. **Regular Payment Amount:** `1500.69`
   - Type `1500.69` in the Payment Amount field
   - **Expected:** Value appears correctly
   - **Expected:** "Use Auto-Calculated Payment" button is available

5. **Term Length:** `5 Years`
   - Click the dropdown
   - Select "5 Years"
   - **Expected:** "5 Years" is selected

6. **Effective Rate:** Display only (calculated)
   - **Expected:** Shows calculated effective rate (e.g., 4.55%)
   - **Expected:** Updates when Spread changes

---

### Step 6: Create Mortgage

1. **Verify "Create Mortgage" button is enabled**
   - **Expected:** Button should be enabled (not grayed out)
   - **Expected:** Button text is "Create Mortgage"

2. Click "Create Mortgage" button
3. **Expected:** Button shows loading state (spinner)
4. **Expected:** Dialog closes after successful creation
5. **Expected:** Success toast notification appears
6. **Expected:** Page refreshes to show mortgage details
7. **Expected:** No console errors

---

### Step 7: Verify Mortgage Created

1. **Expected:** Mortgage appears in mortgage selector (if multiple mortgages)
2. **Expected:** Mortgage details page shows:
   - Property Price: $500,000
   - Down Payment: $100,000
   - Loan Amount: $400,000
   - Start Date: 2024-01-01
   - Amortization: 25 years
   - Payment Frequency: Monthly

3. **Expected:** Term details section shows:
   - Mortgage Type: Variable (Fixed Payment)
   - Prime Rate: Current rate
   - Spread: -1.9%
   - Effective Rate: 4.55%
   - Payment Amount: $1,500.69
   - Term Length: 5 years

4. **Expected:** No "No Term Created" state
5. **Expected:** Payment history section is empty (no payments logged yet)

---

## Error Scenarios to Test

### Test 1: Invalid Property Price
1. Enter `0` or negative number in Property Price
2. **Expected:** Validation error appears
3. **Expected:** "Next: Term Detail" button remains disabled

### Test 2: Down Payment > Property Price
1. Enter Property Price: `100000`
2. Enter Down Payment: `150000`
3. **Expected:** Validation error appears
4. **Expected:** "Next: Term Detail" button remains disabled

### Test 3: Missing Required Fields
1. Leave one or more fields empty
2. **Expected:** "Next: Term Detail" button remains disabled

### Test 4: Invalid Date
1. Enter invalid date format
2. **Expected:** Date picker shows error or prevents invalid input

### Test 5: Server Error (if server is down)
1. Stop the server
2. Try to create mortgage
3. **Expected:** Error toast appears
4. **Expected:** Dialog remains open
5. **Expected:** Error message is user-friendly

---

## Browser Console Checks

While testing, check the browser console (F12) for:

- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No network errors (except intentional server-down test)
- [ ] API calls are successful (check Network tab):
  - `POST /api/mortgages` - Should return 201 Created
  - `POST /api/mortgage-terms` - Should return 201 Created

---

## Success Criteria

✅ **All steps complete without errors**  
✅ **Mortgage created successfully**  
✅ **Data persists after page refresh**  
✅ **No console errors**  
✅ **UI updates correctly**  
✅ **Validation works as expected**

---

## Known Issues Fixed

- ✅ **BUG-6:** "Next: Term Detail" button now enables correctly
- ✅ **BUG-7:** Foreign key constraint error fixed (dev user auto-created)
- ✅ **BUG-1:** Step 1 validation fixed
- ✅ **BUG-2:** fieldState access fixed
- ✅ **BUG-3, BUG-4, BUG-5:** Null checks added

---

## Notes

- If you encounter the "Element not found" error overlay, dismiss it (click outside or press Esc)
- The error overlay is from browser automation and doesn't affect functionality
- Debug logging has been removed for cleaner console output
- Server restart may be needed for BUG-7 fix to take effect

---

## Next Steps After Successful Test

1. Test mortgage editing
2. Test term creation
3. Test payment logging
4. Test backfill payments
5. Test term renewal
6. Test mortgage deletion

