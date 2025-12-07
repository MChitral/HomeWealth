# Backend Bug Fix Implementation Plan

## Overview
This document outlines the step-by-step approach to fix the 16 bugs identified in the backend audit, prioritized by severity and impact.

---

## Phase 1: Critical Fixes (Data Integrity & Security)

### Fix #1: Add Database Transactions for Cascading Deletes
**Priority:** 🔴 Critical  
**Estimated Time:** 1-2 hours  
**Files to Modify:**
- `server/src/application/services/mortgage.service.ts`
- `server/src/infrastructure/db/connection.ts` (if transaction helper needed)

**Implementation Steps:**
1. Check Drizzle ORM transaction support (neon-serverless vs node-postgres)
2. Create a transaction helper utility if needed
3. Wrap the delete operations in a transaction:
   ```typescript
   async delete(id: string, userId: string): Promise<boolean> {
     const mortgage = await this.getByIdForUser(id, userId);
     if (!mortgage) return false;
     
     // Use Drizzle transaction
     return await this.database.transaction(async (tx) => {
       await tx.delete(mortgagePayments).where(eq(mortgagePayments.mortgageId, id));
       await tx.delete(mortgageTerms).where(eq(mortgageTerms.mortgageId, id));
       const result = await tx.delete(mortgages).where(eq(mortgages.id, id));
       return Boolean(result.rowCount && result.rowCount > 0);
     });
   }
   ```
4. Update repository methods to accept optional transaction parameter
5. Add error handling for transaction rollback

**Testing:**
- Test successful deletion
- Test partial failure (simulate error mid-transaction)
- Verify all-or-nothing behavior

---

### Fix #2: Add Transaction Support to Bulk Payment Creation
**Priority:** 🔴 Critical  
**Estimated Time:** 1-2 hours  
**Files to Modify:**
- `server/src/api/routes/mortgage.routes.ts`
- `server/src/application/services/mortgage-payment.service.ts`

**Implementation Steps:**
1. Create a new service method `createBulk()` that accepts an array
2. Wrap all payment creations in a single transaction:
   ```typescript
   async createBulk(
     mortgageId: string,
     userId: string,
     payments: Array<Omit<MortgagePaymentCreateInput, "mortgageId">>
   ): Promise<{ created: number; payments: MortgagePayment[] }> {
     // Validate all payments first
     const mortgage = await this.authorizeMortgage(mortgageId, userId);
     if (!mortgage) throw new Error("Mortgage not found");
     
     // Validate all before creating any
     const validatedPayments = [];
     for (const payload of payments) {
       const term = await this.mortgageTerms.findById(payload.termId);
       if (!term || term.mortgageId !== mortgageId) {
         throw new Error(`Invalid term for payment`);
       }
       // ... validate each payment
     }
     
     // Create all in transaction
     return await this.database.transaction(async (tx) => {
       const created = [];
       for (const validated of validatedPayments) {
         const payment = await tx.insert(mortgagePayments).values(validated).returning();
         created.push(payment[0]);
       }
       return { created: created.length, payments: created };
     });
   }
   ```
3. Update route to use new bulk method
4. Add proper error handling with rollback

**Testing:**
- Test successful bulk creation
- Test validation failure (should rollback all)
- Test database error mid-creation (should rollback all)

---

### Fix #3: Sanitize Error Responses
**Priority:** 🔴 Critical  
**Estimated Time:** 1 hour  
**Files to Modify:**
- `server/src/api/middleware/error-handler.ts`
- All route files with error handlers

**Implementation Steps:**
1. Create error sanitization utility:
   ```typescript
   // server/src/shared/utils/error-sanitizer.ts
   export function sanitizeError(error: unknown, isDevelopment: boolean): {
     message: string;
     details?: unknown;
   } {
     if (isDevelopment) {
       return {
         message: error instanceof Error ? error.message : "Unknown error",
         details: error,
       };
     }
     
     // Production: only expose safe messages
     if (error instanceof z.ZodError) {
       return {
         message: "Validation failed",
         details: error.errors.map(e => ({
           path: e.path.join('.'),
           message: e.message,
         })),
       };
     }
     
     if (error instanceof Error) {
       // Only expose user-friendly errors
       const userFriendlyMessages = [
         "Mortgage not found",
         "Invalid payment data",
         // ... other safe messages
       ];
       
       if (userFriendlyMessages.some(msg => error.message.includes(msg))) {
         return { message: error.message };
       }
     }
     
     return { message: "An error occurred. Please try again." };
   }
   ```
2. Update error handler middleware to use sanitizer
3. Update all route catch blocks to use sanitized errors
4. Add environment check (NODE_ENV)

**Testing:**
- Test in development (should show details)
- Test in production (should hide sensitive info)
- Test Zod validation errors
- Test database errors

---

## Phase 2: High Priority Fixes (Calculation Correctness)

### Fix #5: Fix Baseline Balance in Projection Endpoint
**Priority:** 🟠 High  
**Estimated Time:** 30 minutes  
**Files to Modify:**
- `server/src/api/routes/mortgage.routes.ts` (line ~652)

**Implementation Steps:**
1. Change baseline calculation to use `lastPaymentBalance`:
   ```typescript
   // BEFORE
   const baselineSchedule = generateAmortizationSchedule(
     data.currentBalance,  // ❌ Wrong
     ...
   );
   
   // AFTER
   const baselineSchedule = generateAmortizationSchedule(
     lastPaymentBalance,  // ✅ Correct
     ...
   );
   ```
2. Ensure `lastPaymentBalance` is initialized correctly
3. Add fallback if no historical payments exist

**Testing:**
- Test with historical payments
- Test without historical payments
- Verify interest savings calculation is correct

---

### Fix #6: Fix Chart Data Calculation for Non-Monthly Frequencies
**Priority:** 🟠 High  
**Estimated Time:** 1 hour  
**Files to Modify:**
- `server/src/api/routes/mortgage.routes.ts` (line ~620-635)

**Implementation Steps:**
1. Calculate proper interval based on payment frequency:
   ```typescript
   // Calculate payments per 2 years based on frequency
   const paymentsPerYear = getPaymentsPerYear(projectionFrequency);
   const paymentsPerTwoYears = paymentsPerYear * 2;
   
   // Add data point every 2 years worth of payments
   if (i % paymentsPerTwoYears === 0) {
     const yearsFromNow = i / paymentsPerYear;
     chartData.push({
       year: Math.round(yearsFromNow * 10) / 10,
       balance: Math.round(payment.remainingBalance),
       principal: Math.round(cumulativePrincipal),
       interest: Math.round(cumulativeInterest),
     });
   }
   ```
2. Test with all payment frequencies
3. Ensure final point is always included

**Testing:**
- Test monthly (12/year)
- Test biweekly (26/year)
- Test weekly (52/year)
- Test semi-monthly (24/year)
- Verify 2-year intervals are correct

---

### Fix #7: Add Empty Array Check in getPreviousPayment
**Priority:** 🟠 High  
**Estimated Time:** 15 minutes  
**Files to Modify:**
- `server/src/application/services/mortgage-payment.service.ts` (line ~58-63)

**Implementation Steps:**
```typescript
// BEFORE
private async getPreviousPayment(termId: string): Promise<MortgagePayment | undefined> {
  const payments = await this.mortgagePayments.findByTermId(termId);
  return payments.sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  )[0];
}

// AFTER
private async getPreviousPayment(termId: string): Promise<MortgagePayment | undefined> {
  const payments = await this.mortgagePayments.findByTermId(termId);
  if (payments.length === 0) {
    return undefined;
  }
  return payments.sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  )[0];
}
```

**Testing:**
- Test with empty array
- Test with single payment
- Test with multiple payments

---

### Fix #8: Standardize Error Response Format
**Priority:** 🟠 High  
**Estimated Time:** 1-2 hours  
**Files to Modify:**
- All route files

**Implementation Steps:**
1. Create standard error response type:
   ```typescript
   // server/src/shared/types/api.ts
   export interface ApiErrorResponse {
     error: string;
     details?: Array<{ path?: string; message: string }> | string;
   }
   ```
2. Create helper function:
   ```typescript
   export function sendError(res: Response, status: number, message: string, details?: unknown) {
     const response: ApiErrorResponse = { error: message };
     if (details) {
       response.details = details;
     }
     res.status(status).json(response);
   }
   ```
3. Update all routes to use standardized format
4. Update frontend error handling if needed

**Testing:**
- Verify all error responses follow same format
- Test frontend error handling still works

---

## Phase 3: Medium Priority Fixes

### Fix #9: Improve Prime Rate Fallback Logging
**Priority:** 🟡 Medium  
**Estimated Time:** 30 minutes

**Implementation:**
- Add logging when prime rate fetch fails
- Consider returning error instead of silent fallback
- Add monitoring/alerting for API failures

---

### Fix #10: Fix Type Safety in Dev Auth
**Priority:** 🟡 Medium  
**Estimated Time:** 30 minutes

**Implementation:**
- Use proper Express type extensions
- Remove unsafe type assertions

---

### Fix #11: Add Input Sanitization
**Priority:** 🟡 Medium  
**Estimated Time:** 1-2 hours

**Implementation:**
- Create sanitization utility
- Trim strings, validate formats
- Add before Zod validation

---

### Fix #12: Enhance Error Handler
**Priority:** 🟡 Medium  
**Estimated Time:** 1 hour

**Implementation:**
- Distinguish Zod errors (400)
- Distinguish database errors (500)
- Add proper error categorization

---

## Phase 4: Low Priority Fixes

### Fix #13: Make Configuration Environment-Based
**Priority:** 🟢 Low  
**Estimated Time:** 30 minutes

### Fix #14: Document Database Indexes
**Priority:** 🟢 Low  
**Estimated Time:** 1 hour

### Fix #15: Standardize Date Handling
**Priority:** 🟢 Low  
**Estimated Time:** 2-3 hours

---

## Implementation Order Recommendation

### Week 1: Critical Fixes
1. ✅ Fix #4 (Effective Rate) - **DONE**
2. Fix #3 (Error Sanitization) - Quick win, high security impact
3. Fix #1 (Transaction for Deletes) - Prevents data corruption
4. Fix #2 (Transaction for Bulk Payments) - Prevents data corruption

### Week 2: High Priority Fixes
5. Fix #5 (Baseline Balance) - Quick fix, calculation correctness
6. Fix #7 (Empty Array Check) - Quick fix, prevents potential errors
7. Fix #6 (Chart Data) - Calculation correctness
8. Fix #8 (Standardize Errors) - Improves maintainability

### Week 3: Medium Priority
9. Fix #9-12 (Various improvements)

### Week 4: Low Priority & Testing
10. Fix #13-15 (Polish and documentation)
11. Comprehensive testing of all fixes
12. Update documentation

---

## Testing Strategy

### Unit Tests
- Test transaction rollback scenarios
- Test error sanitization in dev vs prod
- Test calculation fixes with known values

### Integration Tests
- Test cascading deletes with transactions
- Test bulk payment creation with failures
- Test error response formats

### Manual Testing
- Test all payment frequencies
- Test with/without historical payments
- Test error scenarios in production mode

---

## Risk Assessment

**Low Risk:**
- Fix #4, #5, #7 (Simple logic fixes)

**Medium Risk:**
- Fix #3, #6, #8 (Requires careful testing)

**High Risk:**
- Fix #1, #2 (Transaction changes - need thorough testing)

---

## Rollback Plan

1. Keep old code commented for quick rollback
2. Feature flags for new transaction logic (if possible)
3. Database backups before transaction changes
4. Monitor error rates after deployment

---

## Success Criteria

- ✅ All critical bugs fixed
- ✅ All high priority bugs fixed
- ✅ No data corruption in production
- ✅ Error responses don't leak sensitive info
- ✅ Calculations are correct for all payment frequencies
- ✅ All tests passing
- ✅ No performance degradation

