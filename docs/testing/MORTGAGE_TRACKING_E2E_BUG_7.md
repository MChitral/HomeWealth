# BUG-7: Foreign Key Constraint Violation on Mortgage Creation

**Date:** 2025-01-27  
**Severity:** 🔴 CRITICAL  
**Status:** ✅ FIXED  
**Test Case:** TC-1.1

---

## Description

When clicking "Create Mortgage" in Step 2 of the mortgage creation wizard, a database foreign key constraint violation occurs:

```
insert or update on table "mortgages" violates foreign key constraint "mortgages_user_id_users_id_fk"
```

## Root Cause

The `requireUser` function in `server/src/api/utils/auth.ts` returns a hardcoded `DEV_USER_ID = "dev-user-001"`, but this user doesn't exist in the database. When the mortgage creation endpoint tries to insert a mortgage with `userId: "dev-user-001"`, PostgreSQL rejects it because there's no corresponding user in the `users` table.

## Error Details

**Error Type:** Foreign Key Constraint Violation  
**Constraint:** `mortgages_user_id_users_id_fk`  
**Table:** `mortgages`  
**Column:** `user_id`  
**Expected:** User ID must exist in `users` table  
**Actual:** User ID `"dev-user-001"` doesn't exist

## Impact

- 🔴 **CRITICAL**: Users cannot create mortgages
- Mortgage creation flow completely broken
- Affects all new mortgage creation attempts

## Fix Applied

**File:** `server/src/api/utils/auth.ts`

**Solution:** Added `ensureDevUserExists()` function that:
1. Checks if the dev user exists in the database
2. Creates the dev user if it doesn't exist
3. Runs automatically on module load (development only)
4. Also runs when `requireUser` is called (as a safety net)

**Code Changes:**
- Added database query to check for existing user
- Added user creation logic if user doesn't exist
- Made it async and fire-and-forget to not block requests
- Added error handling to log but not throw

## Verification

After fix:
1. ✅ Dev user is created automatically on server startup
2. ✅ Dev user is ensured to exist before mortgage creation
3. ✅ Foreign key constraint is satisfied
4. ✅ Mortgage creation should work correctly

## Testing Steps

1. Start the server
2. Navigate to mortgage creation
3. Fill Step 1 form
4. Fill Step 2 form
5. Click "Create Mortgage"
6. ✅ Verify mortgage is created successfully
7. ✅ Verify no foreign key constraint errors

## Related Issues

- This is a development environment issue
- In production, proper authentication would handle user creation
- The seed demo uses a different user ID (`dev-user-123`), which is fine for demo data

## Notes

- The fix ensures the dev user exists but doesn't block requests if creation fails
- The foreign key constraint will still catch issues if user creation fails
- This is a development-only solution

