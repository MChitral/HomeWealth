export interface HealthScoreInput {
  mortgageBalance: number;
  originalBalance: number;
  currentRate: number; // decimal
  marketRate: number; // decimal (best available)
  triggerRate: number | null; // null if fixed
  monthsToRenewal: number;
  annualPrepaymentLimit: number;
  prepaymentUsed: number;
}

export interface HealthScoreResult {
  totalScore: number;
  riskScore: number;
  efficiencyScore: number;
  flexibilityScore: number;
  breakdown: string[];
}

export class HealthScoreEngine {
  public calculate(input: HealthScoreInput): HealthScoreResult {
    const riskScore = this.calculateRiskScore(input);
    const efficiencyScore = this.calculateEfficiencyScore(input);
    const flexibilityScore = this.calculateFlexibilityScore(input);

    // Weighted Total: Risk (40%), Efficiency (30%), Flexibility (30%)
    const totalScore = Math.round(riskScore * 0.4 + efficiencyScore * 0.3 + flexibilityScore * 0.3);

    const breakdown = this.generateBreakdown(input, riskScore, efficiencyScore, flexibilityScore);

    return {
      totalScore,
      riskScore,
      efficiencyScore,
      flexibilityScore,
      breakdown,
    };
  }

  private calculateRiskScore(input: HealthScoreInput): number {
    let score = 100;

    // VRM Risk: Trigger Rate Proximity
    if (input.triggerRate !== null) {
      const spread = input.triggerRate - input.currentRate;
      if (spread <= 0) {
        // Hit trigger rate = High Risk
        score = 0;
      } else if (spread < 0.005) {
        // Within 0.5% = Critical
        score = 25;
      } else if (spread < 0.01) {
        // Within 1.0% = Warning
        score = 50;
      } else if (spread < 0.02) {
        // Within 2.0% = Caution
        score = 75;
      }
    } else {
      // Fixed Rate Risk: Renewal Shock Proximity
      // If renewal is close (< 6 mo) and Current Rate << Market Rate, risk is strictly about the payment shock
      // For MVP, simplify: If < 6 months to renewal, score drops slightly to encourage action
      if (input.monthsToRenewal < 6) {
        score = 80;
      }
    }

    return score;
  }

  private calculateEfficiencyScore(input: HealthScoreInput): number {
    let score = 100;

    // 1. Rate Competitiveness (50% of Efficiency)
    // Compare vs Market Best (e.g. 4.5%)
    // If Current (5.5%) > Market (4.5%) + 1.0%, penalize
    const rateDiff = input.currentRate - input.marketRate;

    if (rateDiff > 0.02)
      score -= 50; // > 2% score drop
    else if (rateDiff > 0.01)
      score -= 25; // > 1% score drop
    else if (rateDiff > 0.005) score -= 10;

    // 2. Amortization Progress (50% of Efficiency)
    // Simple metric: LTV or paid off %.
    // Using Paydown %: (Original - Current) / Original
    const paydownPct = (input.originalBalance - input.mortgageBalance) / input.originalBalance;
    // Reward progress
    if (paydownPct < 0.05) score -= 10; // New mortgage, minor penalty

    return Math.max(0, Math.min(100, score));
  }

  private calculateFlexibilityScore(input: HealthScoreInput): number {
    // 1. Prepayment Utilization
    // If user has used their prepayment privileges, it means they are optimizing -> Higher Score
    // If 0% used, slightly lower score (opportunity cost)

    // Percentage of limit used
    const usedPct = input.prepaymentUsed / Math.max(1, input.annualPrepaymentLimit);

    if (usedPct > 0.1) return 100; // Using it at all is great
    if (usedPct > 0) return 90;

    return 70; // 0 usage is okay, but could be better
  }

  private generateBreakdown(
    input: HealthScoreInput,
    risk: number,
    eff: number,
    flex: number
  ): string[] {
    const tips: string[] = [];

    if (risk < 50 && input.triggerRate) {
      tips.push("Critical: You are very close to your trigger rate.");
    }
    if (eff < 70) {
      tips.push("Your interest rate is significantly higher than market best.");
    }
    if (flex < 80) {
      tips.push("You haven't used any prepayment privileges this year.");
    }
    if (tips.length === 0) {
      tips.push("Great job! Your mortgage health is excellent.");
    }

    return tips;
  }
}
