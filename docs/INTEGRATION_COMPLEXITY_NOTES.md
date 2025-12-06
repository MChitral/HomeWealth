# Integration Complexity Notes

## Current Situation

The `use-mortgage-tracking-state.ts` hook is 707 lines and exports many things that are still being used in `mortgage-feature.tsx`:

- Dialog states (5 dialogs) - ✅ Can integrate `useMortgageDialogs()`
- Filter state - Keep as is (simple)
- Backfill form state - Keep as is (small form)
- Edit term form state - Still needed
- Term renewal state - Still needed for TermDetailsSection
- Computed values - ✅ Can integrate `useMortgageComputed()`
- Mutations - ✅ Can integrate `useMortgageMutations()`

However, many state variables are **obsolete** because we migrated to React Hook Form:
- Create mortgage form state - Using form hooks now
- Edit mortgage form state - Using form hooks now
- Term renewal form state (first term) - Using form hooks now

---

## Integration Strategy

### Approach: Incremental Integration

Rather than doing everything at once (which could break things), we should:

1. **First:** Integrate hooks alongside existing code (additive, safe)
2. **Then:** Gradually replace inline code with hook calls
3. **Finally:** Remove obsolete code

This maintains backward compatibility while improving code organization.

---

## Complexity Factors

1. **Backward Compatibility** - Feature component still uses many exports
2. **Obsolete State** - Many state variables are no longer needed but still exported
3. **TermDetailsSection** - Still uses old term renewal state (should migrate to form hooks too)
4. **Testing** - Need to verify nothing breaks

---

## Recommendation

Proceed with **careful, incremental integration**:
1. Start with dialog states (safest)
2. Then computed values
3. Then mutations
4. Finally clean up obsolete code

This will take time but ensures stability.

---

**Last Updated:** Just now

