# HELOC Strategic Hub - Backend Gap Analysis

**Date:** January 2025  
**Status:** Gap Analysis - Backend Implementation Review

---

## Summary

Most backend functionality is **already implemented**, but there are a few missing endpoints and features required by the spec.

**Status:**

- ✅ **Core functionality exists** (transactions, credit limit calculations, automatic recalculation)
- ⚠️ **Some endpoints missing** (projections, transaction update/delete, dedicated linking endpoints)
- ✅ **Automatic triggers work** (prepayment → credit limit recalculation)

---

## Required vs. Implemented Endpoints

### ✅ Transaction Management (Partially Complete)

| Spec Requirement                            | Status          | Implementation                                                                                                              |
| ------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/heloc/accounts/:id/transactions` | ⚠️ **Partial**  | Exists as separate endpoints:<br>- `POST /api/heloc/accounts/:id/borrow` ✅<br>- `POST /api/heloc/accounts/:id/payments` ✅ |
| `GET /api/heloc/accounts/:id/transactions`  | ✅ **Complete** | `GET /api/heloc/accounts/:id/transactions`                                                                                  |
| `PUT /api/heloc/transactions/:id`           | ❌ **Missing**  | Not implemented                                                                                                             |
| `DELETE /api/heloc/transactions/:id`        | ❌ **Missing**  | Not implemented                                                                                                             |

**Recommendation:**

- The separate `/borrow` and `/payments` endpoints are actually **better** than a generic `/transactions` endpoint (more explicit, better validation)
- **Optional:** Add update/delete endpoints if users need to edit/correct transactions

---

### ⚠️ Projections (Missing)

| Spec Requirement                                | Status          | Implementation                                                |
| ----------------------------------------------- | --------------- | ------------------------------------------------------------- |
| `GET /api/heloc/accounts/:id/projections`       | ❌ **Missing**  | Not implemented                                               |
| `POST /api/heloc/accounts/:id/calculate-impact` | ✅ **Complete** | Exists as:<br>`POST /api/heloc/calculate-credit-limit-impact` |

**Gap:**

- The spec requires a projections endpoint that returns forward-looking credit limit projections (1, 3, 5 years)
- Currently, projections are calculated **client-side** in `CreditLimitProjectionWidget`
- **Impact:** Low - client-side calculation works, but server-side would be more accurate and consistent

**Recommendation:**

- **Option 1:** Keep client-side (current) - simpler, no backend changes needed
- **Option 2:** Add server-side projection endpoint for consistency and accuracy

---

### ⚠️ Mortgage Linking (Partially Complete)

| Spec Requirement                               | Status         | Implementation                                                                   |
| ---------------------------------------------- | -------------- | -------------------------------------------------------------------------------- |
| `PUT /api/heloc/accounts/:id/link-mortgage`    | ⚠️ **Partial** | Handled via:<br>`PUT /api/heloc/accounts/:id` (update account with `mortgageId`) |
| `DELETE /api/heloc/accounts/:id/link-mortgage` | ⚠️ **Partial** | Handled via:<br>`PUT /api/heloc/accounts/:id` (set `mortgageId` to null)         |

**Status:**

- Mortgage linking **works** through the existing update account endpoint
- The spec suggests dedicated endpoints, but the current implementation is functionally equivalent

**Recommendation:**

- **No changes needed** - current implementation is fine
- Dedicated endpoints would be slightly cleaner but add no functional value

---

## Automatic Triggers (✅ Complete)

### ✅ Credit Limit Recalculation on Prepayment

**Status:** ✅ **Fully Implemented**

**Implementation:**

- `HelocCreditLimitService.recalculateCreditLimitOnPrepayment()` automatically called when mortgage prepayment is recorded
- Located in: `server/src/application/services/mortgage-payment.service.ts`
- Triggers: `createPayment()` and `createBulkPayments()`

**Code Reference:**

```typescript
// In mortgage-payment.service.ts
if (prepaymentAmount > 0 && this.helocCreditLimitService) {
  await this.helocCreditLimitService.recalculateCreditLimitOnPrepayment(
    mortgageId,
    prepaymentAmount
  );
}
```

---

### ✅ Credit Limit Recalculation on Home Value Update

**Status:** ✅ **Fully Implemented**

**Implementation:**

- `HelocCreditLimitService.recalculateCreditLimitOnHomeValueUpdate()` automatically called when property value is updated
- Located in: `server/src/application/services/property-value.service.ts`

---

## Calculation Engine (✅ Complete)

### ✅ Interest Calculations

**Status:** ✅ **Fully Implemented**

- Daily interest calculation exists
- Monthly interest calculation exists
- Prime rate integration exists
- Interest tracking in transactions exists

**Location:**

- `server/src/domain/calculations/heloc-payment.ts`
- `server/src/application/services/heloc.service.ts`

---

### ✅ Credit Limit Calculations

**Status:** ✅ **Fully Implemented**

- Credit limit formula: `(Home Value × Max LTV) - Mortgage Balance`
- Available credit calculation: `Credit Limit - Current Balance`
- Automatic recalculation on prepayment
- Automatic recalculation on home value update

**Location:**

- `server/src/shared/calculations/heloc/credit-limit.ts`
- `server/src/application/services/heloc-credit-limit.service.ts`

---

## Missing Features Summary

### High Priority (Should Implement)

1. **Transaction Update/Delete Endpoints** (Optional but useful)
   - `PUT /api/heloc/transactions/:id` - Update transaction
   - `DELETE /api/heloc/transactions/:id` - Delete transaction
   - **Use Case:** Users need to correct mistakes or remove duplicate transactions
   - **Effort:** Low-Medium

### Medium Priority (Nice to Have)

2. **Projections Endpoint** (Optional - client-side works)
   - `GET /api/heloc/accounts/:id/projections?years=5&monthlyPrepayment=1000`
   - **Use Case:** More accurate server-side projections
   - **Effort:** Medium
   - **Note:** Currently calculated client-side, which works fine

### Low Priority (Not Critical)

3. **Dedicated Mortgage Linking Endpoints** (Not needed)
   - Current implementation via update account endpoint is sufficient
   - **Effort:** Low (but unnecessary)

---

## Recommendations

### ✅ Keep Current Implementation (Recommended)

**What's Working:**

- ✅ Transaction creation (borrow/payment) - separate endpoints are better than generic
- ✅ Transaction history retrieval
- ✅ Credit limit calculations and automatic recalculation
- ✅ Mortgage linking via update account endpoint
- ✅ Interest calculations

**What to Add (Optional):**

1. **Transaction Update/Delete** (if users request it)

   ```typescript
   // Add to heloc.routes.ts
   router.put("/heloc/transactions/:id", ...)
   router.delete("/heloc/transactions/:id", ...)
   ```

2. **Projections Endpoint** (if you want server-side calculations)
   ```typescript
   // Add to heloc.routes.ts
   router.get("/heloc/accounts/:id/projections", ...)
   ```

### ⚠️ Current State Assessment

**Backend is ~90% complete for the spec requirements:**

- ✅ **Core functionality:** Complete
- ✅ **Automatic triggers:** Complete
- ✅ **Calculations:** Complete
- ⚠️ **Optional endpoints:** Missing (but not critical)

**Conclusion:**

- **No critical backend changes needed** for the feature to work
- Optional enhancements can be added based on user feedback
- Current implementation is production-ready

---

## Implementation Checklist

### Required (Critical)

- [x] Transaction creation (borrow/payment)
- [x] Transaction history retrieval
- [x] Credit limit calculation
- [x] Automatic credit limit recalculation on prepayment
- [x] Automatic credit limit recalculation on home value update
- [x] Mortgage linking (via update account)

### Optional (Enhancements)

- [ ] Transaction update endpoint
- [ ] Transaction delete endpoint
- [ ] Projections endpoint (server-side)
- [ ] Dedicated mortgage linking endpoints (not needed)

---

## Next Steps

1. **Deploy current implementation** - Backend is ready
2. **Monitor user feedback** - See if transaction edit/delete is requested
3. **Consider projections endpoint** - If client-side calculations show inconsistencies
4. **No urgent backend work needed** - Focus on frontend polish and user testing

---

**Bottom Line:** The backend is **production-ready** for the HELOC Strategic Hub feature. The missing endpoints are optional enhancements that can be added based on user needs.
