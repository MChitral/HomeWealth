import { MortgagesRepository } from "../../infrastructure/repositories/mortgages.repository";
import { MortgageTermsRepository } from "../../infrastructure/repositories/mortgage-terms.repository";
import { calculateStandardPenalty } from "../../domain/calculations/penalty";

export type RenewalStatus = "urgent" | "soon" | "upcoming" | "safe";

export interface RenewalInfo {
  mortgageId: string;
  daysUntilRenewal: number;
  renewalDate: string;
  status: RenewalStatus;
  currentRate: number;
  estimatedPenalty: {
    amount: number;
    method: "IRD" | "3-Month Interest";
  };
}

export class RenewalService {
  constructor(
    private mortgagesRepo: MortgagesRepository,
    private mortgageTermsRepo: MortgageTermsRepository
  ) {}

  async getRenewalStatus(mortgageId: string): Promise<RenewalInfo | null> {
    const mortgage = await this.mortgagesRepo.findById(mortgageId);
    if (!mortgage) return null;

    const terms = await this.mortgageTermsRepo.findByMortgageId(mortgageId);

    // Sort terms to find the active one (start date descending)
    const sortedTerms = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    const activeTerm = sortedTerms[0];

    if (!activeTerm) return null;

    const endDate = new Date(activeTerm.endDate);
    const today = new Date();

    // Calculate days remaining
    const timeDiff = endDate.getTime() - today.getTime();
    const daysUntilRenewal = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Determine status
    let status: RenewalStatus = "safe";
    if (daysUntilRenewal <= 90)
      status = "urgent"; // < 3 months
    else if (daysUntilRenewal <= 180)
      status = "soon"; // < 6 months
    else if (daysUntilRenewal <= 365) status = "upcoming"; // < 1 year

    // Calculate Penalty (Assumption: Breaking today)
    // For MVP, we use the active term's interest rate.
    // If it's a VRM, we should ideally use the current effective rate, but for now we'll use the term's rate or derived.
    // NOTE: In the future, we need to inject Market RateService to get accurate IRD.
    // For now, we assume Market Rate = Current Rate - 1% to simulate an IRD risk, or 0 to be safe.
    // Let's assume Market Rate is SAME as Current Rate for MVP (so IRD is 0, 3-month applies).

    // TODO: Fetch real market rate for IRD
    const currentRate = activeTerm.fixedRate
      ? Number(activeTerm.fixedRate) / 100
      : (Number(activeTerm.primeRate || 0) + Number(activeTerm.lockedSpread || 0)) / 100;
    const marketRate = currentRate; // MVP simplification

    // We need current balance. This is expensive to calc real-time if we don't have it handy.
    // For MVP, we'll use the mortgage's last known balance or original amount as a proxy if payments aren't up to date.
    // Ideally, we'd sum all payments.
    // Let's rely on the simple Term balance logic for now or the mortgage currentBalance field if maintained.
    const currentBalance = Number(mortgage.currentBalance);

    const penalty = calculateStandardPenalty(
      currentBalance,
      currentRate,
      marketRate,
      Math.max(0, daysUntilRenewal / 30) // Remaining months
    );

    return {
      mortgageId,
      daysUntilRenewal,
      renewalDate: activeTerm.endDate,
      status,
      currentRate: currentRate * 100,
      estimatedPenalty: {
        amount: penalty.penalty,
        method: penalty.method,
      },
    };
  }
}
