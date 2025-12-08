# Backfill Endpoint Review
**Date:** 2025-01-27  
**Endpoint:** `POST /api/mortgages/:mortgageId/payments/bulk`

## Overview

The backfill endpoint allows users to create multiple historical payments at once (up to 60). The frontend generates payment data with calculated breakdowns, and the backend validates and creates them in a transaction.

---

## Critical Issues Found

### ✅ Issue #1: Previous Payment Lookup Bug - FIXED
**Location:** `server/src/application/services/mortgage-payment.service.ts:193`

**Problem:**
When creating multiple payments in a batch, the `createBulk` method calls `getPreviousPayment()` for each payment, which queries the database. However, if payments are being backfilled in chronological order, the previous payment might be in the current batch, not yet in the database.

**Current Code:**
```typescript
for (const payload of payments) {
  // ...
  const previousPayment = await this.getPreviousPayment(payload.termId); // ❌ Queries DB, misses batch payments
  const normalized = this.validateAndNormalizePayment(
    mortgage,
    term,
    payload,
    previousPayment, // ❌ Wrong previous payment for batch payments
  );
}
```

**Impact:**
- Validation uses wrong balance for payments 2-N in the batch
- Principal/interest calculations will be incorrect
- Remaining balance will be wrong for all but the first payment
- Can cause validation failures or incorrect data

**Example Scenario:**
1. User backfills 12 monthly payments starting Jan 2024
2. Payment 1 uses `mortgage.currentBalance` (correct)
3. Payment 2 queries DB for previous payment, finds none (because Payment 1 isn't saved yet)
4. Payment 2 also uses `mortgage.currentBalance` (WRONG - should use Payment 1's remaining balance)
5. All subsequent payments have incorrect calculations

---

### ✅ Issue #2: Payment Order Not Guaranteed - FIXED
**Location:** `server/src/application/services/mortgage-payment.service.ts:185`

**Problem:**
The backend doesn't ensure payments are processed in chronological order. If the frontend sends payments out of order, validation will use incorrect previous payments.

**Impact:**
- Out-of-order payments will have incorrect balance calculations
- Validation might fail or produce wrong results

**Recommendation:**
Sort payments by date before processing.

---

### ✅ Issue #3: Rate Calculation Mismatch - FIXED
**Location:** Frontend vs Backend

**Problem:**
- Frontend calculates rates using historical prime rates from Bank of Canada API
- Backend validation was using the term's current rate (from `getTermEffectiveRate(term)`)
- For variable rate mortgages, this could cause validation failures

**Solution Implemented:**
- Updated `PaymentValidationInput` to accept optional `effectiveRateOverride` parameter
- Updated `validateMortgagePayment()` to use the provided rate from payload if available
- Updated `validateAndNormalizePayment()` to extract `effectiveRate` from payload and pass it to validation
- Updated stored `effectiveRate` to use payload value when provided

**Code Changes:**
```typescript
// payment-validation.ts
const annualRate = effectiveRateOverride !== undefined
  ? effectiveRateOverride / 100  // Convert percentage to decimal
  : getTermEffectiveRate(term);

// mortgage-payment.service.ts
const effectiveRateOverride = payload.effectiveRate
  ? Number(payload.effectiveRate)  // Already in percentage format
  : undefined;
```

**Impact:**
- ✅ Validation now accepts historical rates from frontend
- ✅ Backfilled payments with historical rate changes will validate correctly
- ✅ Falls back to term's current rate if no override provided (backward compatible)

---

### ✅ Issue #4: Missing Payment Date Sorting - FIXED
**Location:** `server/src/application/services/mortgage-payment.service.ts:185`

**Problem:**
Payments are processed in the order received, not sorted by date. This can cause issues if frontend sends them out of order.

---

## Recommended Fixes

### Fix #1: Track Previous Payment Within Batch (CRITICAL)

```typescript
async createBulk(
  mortgageId: string,
  userId: string,
  payments: Array<Omit<MortgagePaymentCreateInput, "mortgageId">>,
): Promise<{ created: number; payments: MortgagePayment[] }> {
  const mortgage = await this.authorizeMortgage(mortgageId, userId);
  if (!mortgage) {
    throw new Error("Mortgage not found or not authorized");
  }

  // ✅ Sort payments by date to ensure chronological processing
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
  );

  // ✅ Get the latest existing payment once (before batch)
  const latestExistingPayment = await this.getPreviousPayment(sortedPayments[0]?.termId);

  const yearToDatePrepayments = new Map<number, number>();
  const validatedPayments: Array<{
    payload: Omit<MortgagePaymentCreateInput, "mortgageId">;
    normalized: Omit<MortgagePaymentCreateInput, "mortgageId">;
    previousPayment?: MortgagePayment; // Track for next iteration
  }> = [];

  let previousPaymentInBatch: MortgagePayment | undefined = latestExistingPayment;

  for (const payload of sortedPayments) {
    const term = await this.mortgageTerms.findById(payload.termId);
    if (!term || term.mortgageId !== mortgageId) {
      throw new Error(`Invalid term ID ${payload.termId} for mortgage ${mortgageId}`);
    }

    // ✅ Use previous payment from batch if available, otherwise from DB
    const previousPayment = previousPaymentInBatch;

    const normalized = this.validateAndNormalizePayment(
      mortgage,
      term,
      payload,
      previousPayment,
    );

    // Check prepayment limits...
    const paymentYear = new Date(payload.paymentDate).getFullYear();
    const existingYearToDate = await this.getYearToDatePrepayments(mortgageId, paymentYear);
    const batchYearToDate = yearToDatePrepayments.get(paymentYear) || 0;
    const totalYearToDate = existingYearToDate + batchYearToDate;
    
    const prepaymentAmount = Number(normalized.prepaymentAmount || 0);
    this.enforcePrepaymentLimit(
      mortgage,
      payload.paymentDate,
      prepaymentAmount,
      totalYearToDate,
    );

    yearToDatePrepayments.set(paymentYear, batchYearToDate + prepaymentAmount);

    // ✅ Create a mock payment object for next iteration
    // This simulates what the payment will look like after creation
    const mockPayment: MortgagePayment = {
      id: `temp-${validatedPayments.length}`,
      mortgageId,
      termId: payload.termId,
      paymentDate: payload.paymentDate,
      paymentPeriodLabel: payload.paymentPeriodLabel || '',
      regularPaymentAmount: normalized.regularPaymentAmount,
      prepaymentAmount: normalized.prepaymentAmount || '0',
      paymentAmount: normalized.paymentAmount,
      principalPaid: normalized.principalPaid,
      interestPaid: normalized.interestPaid,
      remainingBalance: normalized.remainingBalance,
      primeRate: payload.primeRate || null,
      effectiveRate: normalized.effectiveRate,
      triggerRateHit: normalized.triggerRateHit,
      remainingAmortizationMonths: normalized.remainingAmortizationMonths,
      createdAt: new Date(),
    } as MortgagePayment;

    previousPaymentInBatch = mockPayment;

    validatedPayments.push({ payload, normalized });
  }

  // Create all in transaction...
  return await db.transaction(async (tx) => {
    const created: MortgagePayment[] = [];

    for (const { normalized } of validatedPayments) {
      const payment = await this.mortgagePayments.create(
        {
          ...normalized,
          mortgageId,
        },
        tx,
      );
      created.push(payment);
    }

    return {
      created: created.length,
      payments: created,
    };
  });
}
```

### Fix #2: Handle Rate Validation for Variable Rate Mortgages

The backend should accept the rate provided by the frontend for variable rate mortgages, or fetch historical rates itself. Alternatively, make rate validation more lenient for backfilled payments.

---

## Testing Recommendations

1. **Test chronological backfill:**
   - Create 12 payments starting from 1 year ago
   - Verify each payment's balance is based on previous payment in batch

2. **Test out-of-order payments:**
   - Send payments in reverse chronological order
   - Verify they're sorted and processed correctly

3. **Test variable rate backfill:**
   - Backfill payments spanning rate changes
   - Verify validation accepts historical rates

4. **Test prepayment limits:**
   - Backfill payments with prepayments that exceed annual limit
   - Verify limit is enforced correctly across the batch

---

## Summary

**Status: All Issues Fixed ✅**

1. ✅ **Fix #1 (CRITICAL):** Previous payment lookup bug - FIXED
   - Now tracks previous payment within batch
   - Each payment uses correct balance from previous payment in batch

2. ✅ **Fix #2 (HIGH):** Payment order guarantee - FIXED
   - Payments are sorted by date before processing

3. ✅ **Fix #3 (MEDIUM):** Rate validation for historical rates - FIXED
   - Validation now accepts `effectiveRate` from payload
   - Supports historical rates for variable rate mortgages

4. ✅ **Fix #4 (LOW):** Payment date sorting - FIXED
   - Same as Fix #2

**All critical and high-priority issues have been resolved. The backfill endpoint now:**
- ✅ Correctly calculates balances for all payments in a batch
- ✅ Processes payments in chronological order
- ✅ Accepts historical rates for variable rate mortgages
- ✅ Uses transaction support for data integrity
- ✅ Properly tracks prepayment limits across the batch

