export function shouldShowSmithCta(
  helocEffectiveRate?: number | null,
  mortgageEffectiveRate?: number | null
): boolean {
  if (helocEffectiveRate == null || mortgageEffectiveRate == null) return true;
  return helocEffectiveRate <= mortgageEffectiveRate;
}
