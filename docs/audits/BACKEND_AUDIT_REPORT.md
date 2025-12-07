# Backend Audit Report
**Date:** 2025-01-27  
**Scope:** Complete backend codebase audit for potential bugs and issues

## Executive Summary

This audit identified **16 potential bugs and issues** across the backend codebase, categorized by severity:
- **Critical (3):** Issues that could cause data corruption or security vulnerabilities
- **High (5):** Issues that could cause incorrect calculations or data inconsistencies
- **Medium (4):** Issues that could cause runtime errors or poor user experience
- **Low (3):** Code quality and maintainability issues

---

## Critical Issues

### 1. **Missing Transaction Support for Cascading Deletes**
**Location:** `server/src/application/services/mortgage.service.ts:47-56`

**Issue:** When deleting a mortgage, payments and terms are deleted sequentially without a transaction. If one deletion fails, the database could be left in an inconsistent state.

```typescript
async delete(id: string, userId: string): Promise<boolean> {
  const mortgage = await this.getByIdForUser(id, userId);
  if (!mortgage) {
    return false;
  }

  await this.mortgagePayments.deleteByMortgageId(id);
  await this.mortgageTerms.deleteByMortgageId(id);

  return this.mortgages.delete(id);
}
```

**Impact:** Partial deletions could leave orphaned records or fail to delete the mortgage if child deletions succeed but parent deletion fails.

**Recommendation:** Wrap in a database transaction or use database-level CASCADE deletes.

---

### 2. **Race Condition in Bulk Payment Creation**
**Location:** `server/src/api/routes/mortgage.routes.ts:288-327`

**Issue:** The bulk payment endpoint creates payments in a loop without transaction support. If payment #5 fails validation, payments #1-4 are already created, leaving inconsistent state.

```typescript
const createdPayments = [];
for (const paymentData of payments) {
  const data = mortgagePaymentCreateSchema.parse({...});
  const payment = await services.mortgagePayments.create(...);
  if (payment) {
    createdPayments.push(payment);
  }
}
```

**Impact:** Partial payment creation could corrupt financial data and make reconciliation difficult.

**Recommendation:** Use a database transaction to ensure all-or-nothing creation, or implement rollback logic.

---

### 3. **Error Information Leakage**
**Location:** Multiple route files (mortgage.routes.ts, scenario.routes.ts, etc.)

**Issue:** Error handlers expose raw error objects to clients, which could leak sensitive information about database structure, internal logic, or stack traces.

```typescript
catch (error) {
  res.status(400).json({ error: "Invalid mortgage data", details: error });
}
```

**Impact:** Security risk - attackers could gain insights into system internals.

**Recommendation:** Sanitize error responses in production, only expose user-friendly messages.

---

## High Priority Issues

### 4. **Effective Rate Calculation Bug in Payment Creation** ✅ FIXED
**Location:** `server/src/application/services/mortgage-payment.service.ts:123-126`

**Issue:** The effective rate calculation had two bugs:
1. Pointless ternary operator - both branches returned the same value
2. Missing percentage conversion - `getTermEffectiveRate()` returns a decimal (0.0549) but the database expects a percentage (5.490)

```typescript
// ❌ BEFORE - Both branches identical, wrong format
effectiveRate: (validation.triggerRateHit
  ? getTermEffectiveRate(term)  // Returns 0.0549
  : getTermEffectiveRate(term)  // Returns 0.0549
).toFixed(3),

// ✅ AFTER - Correct format
effectiveRate: (getTermEffectiveRate(term) * 100).toFixed(3), // Returns "5.490"
```

**Impact:** Effective rates were stored incorrectly (as decimals instead of percentages), causing incorrect rate displays and calculations.

**Status:** ✅ Fixed - Removed pointless ternary and added percentage conversion.

---

### 5. **Incorrect Baseline Balance in Projection Endpoint**
**Location:** `server/src/api/routes/mortgage.routes.ts:652-661`

**Issue:** The baseline schedule calculation uses `data.currentBalance` instead of `lastPaymentBalance`, causing incorrect interest savings calculations when historical payments exist.

```typescript
const baselineSchedule = generateAmortizationSchedule(
  data.currentBalance,  // ❌ Should be lastPaymentBalance
  effectiveRate,
  data.amortizationMonths,
  projectionFrequency,
  new Date(),
  [],
  [],
  360
);
```

**Impact:** Interest savings calculations will be incorrect for mortgages with payment history.

**Recommendation:** Use `lastPaymentBalance` for consistency with the main projection.

---

### 6. **Chart Data Calculation Bug for Non-Monthly Frequencies**
**Location:** `server/src/api/routes/mortgage.routes.ts:620-635`

**Issue:** Chart data points are generated every 24 payments (`i % 24 === 0`), which assumes monthly frequency. For biweekly (26/year) or weekly (52/year) payments, this creates incorrect year intervals.

```typescript
// Add data point every 24 months (2 years)
if (i % 24 === 0) {
  const yearsFromNow = Math.floor(i / 12);  // ❌ Assumes monthly
  chartData.push({...});
}
```

**Impact:** Chart data will show incorrect time intervals for non-monthly payment frequencies.

**Recommendation:** Calculate based on actual payment frequency and target 2-year intervals.

---

### 7. **Year-to-Date Prepayment Race Condition**
**Location:** `server/src/application/services/mortgage-payment.service.ts:65-70`

**Issue:** Year-to-date prepayment calculation reads all payments and filters by year, but if two payments are created simultaneously, both could pass the limit check before either is saved.

```typescript
private async getYearToDatePrepayments(mortgageId: string, year: number): Promise<number> {
  const payments = await this.mortgagePayments.findByMortgageId(mortgageId);
  return payments
    .filter((payment) => new Date(payment.paymentDate).getFullYear() === year)
    .reduce((sum, payment) => sum + Number(payment.prepaymentAmount || 0), 0);
}
```

**Impact:** Prepayment limits could be exceeded if multiple payments are created concurrently.

**Recommendation:** Use database-level constraints or row-level locking for prepayment limit enforcement.

---

### 8. **Potential Array Access Error**
**Location:** `server/src/application/services/mortgage-payment.service.ts:58-63`

**Issue:** `getPreviousPayment` sorts an array but doesn't check if it's empty before accessing `[0]`.

```typescript
private async getPreviousPayment(termId: string): Promise<MortgagePayment | undefined> {
  const payments = await this.mortgagePayments.findByTermId(termId);
  return payments.sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  )[0];  // ❌ Could be undefined if array is empty
}
```

**Impact:** While TypeScript allows this, it's safer to explicitly handle empty arrays.

**Recommendation:** Add explicit check: `return payments.length > 0 ? payments[0] : undefined;`

---

### 9. **Inconsistent Error Response Format**
**Location:** Multiple route files

**Issue:** Some routes return `{ error: string }`, others return `{ error: string, details: any }`. This inconsistency makes error handling on the frontend difficult.

**Impact:** Frontend error handling must account for multiple response formats.

**Recommendation:** Standardize error response format across all routes.

---

## Medium Priority Issues

### 10. **Missing Validation for Prime Rate Fallback**
**Location:** `server/src/api/routes/mortgage.routes.ts:26-36`

**Issue:** If prime rate fetch fails, a hardcoded fallback `"6.450"` is used without logging or alerting. This could mask API issues.

```typescript
try {
  const { primeRate } = await fetchLatestPrimeRate();
  return { ...payload, primeRate: primeRate.toFixed(3) };
} catch {
  return { ...payload, primeRate: "6.450" };  // ❌ Silent fallback
}
```

**Impact:** Users might get incorrect rates without knowing the API failed.

**Recommendation:** Log the error and consider returning an error to the user instead of silent fallback.

---

### 11. **Unsafe Type Assertion in Dev Auth**
**Location:** `server/src/api/middleware/dev-auth.ts:5`

**Issue:** Type assertion bypasses TypeScript's type checking, which could hide type errors.

```typescript
(req as unknown as { user: Express.User }).user = {
  id: "dev-user-123",
  username: "devuser",
};
```

**Impact:** Type safety is compromised, could lead to runtime errors if Express.User type changes.

**Recommendation:** Use proper type guards or extend Express types correctly.

---

### 12. **Missing Input Sanitization**
**Location:** All route handlers

**Issue:** While Zod validation ensures types, there's no sanitization of string inputs (e.g., trimming whitespace, preventing SQL injection patterns). Drizzle ORM provides protection, but defense in depth is recommended.

**Impact:** Potential for data quality issues (leading/trailing spaces, etc.).

**Recommendation:** Add input sanitization layer before validation.

---

### 13. **Error Handler Doesn't Distinguish Error Types**
**Location:** `server/src/api/middleware/error-handler.ts:3-10`

**Issue:** The error handler treats all errors the same way. Zod validation errors should return 400, but database errors might need different handling.

```typescript
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  res.status(status).json({ message });
  // ...
}
```

**Impact:** Validation errors and system errors are handled identically, making debugging harder.

**Recommendation:** Add specific handling for Zod errors, database errors, etc.

---

## Low Priority Issues

### 14. **Hardcoded Maximum Payment Limit**
**Location:** `server/src/api/routes/mortgage.routes.ts:300`

**Issue:** The bulk payment limit of 60 is hardcoded. This should be configurable.

```typescript
if (payments.length > 60) {
  res.status(400).json({ error: "Maximum 60 payments can be created at once" });
  return;
}
```

**Impact:** Limited flexibility for different use cases.

**Recommendation:** Move to environment variable or configuration.

---

### 15. **Missing Index Hints for Performance**
**Location:** Repository queries

**Issue:** While Drizzle ORM should optimize queries, there's no explicit consideration for database indexes on frequently queried fields (userId, mortgageId, paymentDate).

**Impact:** Performance could degrade with large datasets.

**Recommendation:** Ensure database indexes exist and document them.

---

### 16. **Inconsistent Date Handling**
**Location:** Multiple files

**Issue:** Date objects are created in various ways (`new Date()`, `new Date(string)`, etc.) without consistent timezone handling. This could cause issues with date comparisons.

**Impact:** Potential for timezone-related bugs, especially around year boundaries for prepayment calculations.

**Recommendation:** Standardize date creation and use UTC consistently.

---

## Recommendations Summary

### Immediate Actions (Critical)
1. ✅ Implement database transactions for cascading deletes
2. ✅ Add transaction support to bulk payment creation
3. ✅ Sanitize error responses in production

### Short-term (High Priority)
4. ✅ **FIXED** - Effective rate calculation bug in payment creation
5. ✅ Fix baseline balance calculation in projection endpoint
6. ✅ Fix chart data calculation for non-monthly frequencies
7. ✅ Add database constraints or locking for prepayment limits
8. ✅ Add empty array check in `getPreviousPayment`
9. ✅ Standardize error response format

### Medium-term (Medium Priority)
9. ✅ Improve error logging and handling
10. ✅ Fix type safety in dev auth
11. ✅ Add input sanitization
12. ✅ Enhance error handler to distinguish error types

### Long-term (Low Priority)
13. ✅ Make configuration values environment-based
14. ✅ Document and verify database indexes
15. ✅ Standardize date handling across codebase

---

## Testing Recommendations

1. **Add integration tests** for transaction rollback scenarios
2. **Add concurrency tests** for prepayment limit enforcement
3. **Add edge case tests** for empty arrays, null values, boundary conditions
4. **Add performance tests** for bulk operations
5. **Add security tests** for error message sanitization

---

## Conclusion

The backend codebase is generally well-structured with good separation of concerns. The main areas of concern are:
- **Transaction management** for multi-step operations
- **Error handling and information disclosure**
- **Calculation correctness** in projection endpoints
- **Concurrency safety** for financial operations

Addressing the critical and high-priority issues should be the immediate focus to ensure data integrity and security.

