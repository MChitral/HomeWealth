# Yearly Total Paid Calculation Bug

**Date:** 2025-01-27  
**Status:** 🔍 Investigating

---

## Problem

User reports that the "Total Paid" for 2025 in the Yearly Amortization Schedule should be **$33,008** but is showing **$16,508**.

**Expected Calculation:**
- Regular payments for 2025: ~$18,008 (based on 2026 showing $18,008)
- Annual prepayment event (March): $15,000
- **Total Expected:** $18,008 + $15,000 = **$33,008**

**Actual Display:** $16,508

**Difference:** Missing $16,500 ($15,000 prepayment + ~$1,500 one payment)

---

## Analysis

### Current Calculation Logic

**File:** `server/src/api/routes/mortgage.routes.ts` (line 730)

```typescript
existing.totalPaid += payment.paymentAmount + payment.extraPrepayment;
```

The backend **does include** `extraPrepayment` in the totalPaid calculation.

### Possible Causes

1. **2025 is a Partial Year**
   - If mortgage started mid-2025, only partial year payments exist
   - $16,508 might be correct for partial year
   - But prepayment should still be included

2. **Prepayment Event Not Applied**
   - Annual prepayment event might not be triggering correctly
   - Month matching logic might be failing
   - Payment number calculation might be wrong

3. **Historical + Projected Merge Issue**
   - If 2025 has historical payments, they might not include prepayment
   - Projected portion might not be adding prepayment correctly
   - Merge logic might be excluding prepayment

4. **Payment Amount vs Total Payment**
   - `payment.paymentAmount` might not include prepayment
   - `payment.extraPrepayment` might be 0 when it should be $15,000

---

## Investigation Steps

1. **Check if 2025 is partial year:**
   - Verify mortgage start date
   - Check how many payments exist in 2025
   - Verify if prepayment event should apply

2. **Check prepayment event application:**
   - Verify annual prepayment event is configured correctly
   - Check if month matching logic works for March 2025
   - Verify payment number calculation

3. **Check yearly aggregation:**
   - Verify all payments in 2025 are included
   - Check if `extraPrepayment` is being added correctly
   - Verify historical + projected merge logic

---

## Expected Behavior

**For 2025 with annual prepayment in March:**
- Regular monthly payments: ~$1,500.69 × 12 = ~$18,008
- Annual prepayment (March): $15,000
- **Total Paid: $33,008**

**If 2025 is partial year (e.g., started in February):**
- Regular payments: ~$1,500.69 × 11 = ~$16,508
- Annual prepayment (March): $15,000
- **Total Paid: $31,508**

---

## Related Files

- `server/src/api/routes/mortgage.routes.ts` - Yearly aggregation logic
- `server/src/shared/calculations/mortgage.ts` - Prepayment event application
- `client/src/features/scenario-management/components/projected-mortgage-outcome-card.tsx` - Display

