import type { ReactNode } from "react";
import { shouldShowSmithCta } from "../utils/smith-cta";

type SmithCtaProps = {
  helocEffectiveRate?: number | null;
  mortgageEffectiveRate?: number | null;
  children: ReactNode;
};

export function SmithCta({
  helocEffectiveRate,
  mortgageEffectiveRate,
  children,
}: SmithCtaProps) {
  if (!shouldShowSmithCta(helocEffectiveRate, mortgageEffectiveRate)) {
    return null;
  }
  return <>{children}</>;
}
