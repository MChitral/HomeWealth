# Full Integration Plan - Option 1

## Strategy

Given the complexity (707 lines) and need for backward compatibility, we'll:

1. **Integrate hooks internally** - Use extracted hooks but maintain all exports
2. **Remove duplicate code** - Delete inline implementations now in hooks
3. **Keep obsolete exports** - For backward compatibility (can clean up later)
4. **Test incrementally** - Verify each integration step

---

## Integration Steps

### Step 1: Import and Use Dialog Hook
- Replace dialog state management with `useMortgageDialogs()`
- Keep exports for backward compatibility

### Step 2: Import and Use Computed Hook
- Replace computed values with `useMortgageComputed()`
- Keep exports for backward compatibility

### Step 3: Import and Use Mutations Hook
- Replace mutations with `useMortgageMutations()`
- Keep exports for backward compatibility

### Step 4: Remove Duplicate Code
- Delete inline implementations now in hooks
- Clean up unused imports

### Step 5: Clean Up Obsolete State (Optional)
- Remove obsolete state variables (if safe)
- Or keep them for backward compatibility

---

## Expected Result

- **Current:** 707 lines
- **After Integration:** ~400-450 lines (removing duplicate code)
- **Final (with cleanup):** ~250-300 lines (removing obsolete code)

---

## Notes

- All exports maintained for backward compatibility
- Internal implementation uses extracted hooks
- Can clean up obsolete exports in a separate step

---

**Status:** Ready to proceed!

---

**Last Updated:** Just now

