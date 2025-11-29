import type { Scenario } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  CashFlowRepository,
  EmergencyFundRepository,
} from "@infrastructure/repositories";
import {
  calculateScenarioMetrics,
  generateProjections,
  type ScenarioMetrics,
  type YearlyProjection,
} from "@server-shared/calculations/projections";
import { getTermEffectiveRate } from "@server-shared/calculations/term-helpers";

export interface ScenarioWithAnalytics extends Scenario {
  metrics: ScenarioMetrics | null;
  projections: YearlyProjection[] | null;
}

export class ScenarioProjectionService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly cashFlows: CashFlowRepository,
    private readonly emergencyFunds: EmergencyFundRepository,
  ) {}

  async buildForUser(userId: string, scenarios: Scenario[]): Promise<ScenarioWithAnalytics[]> {
    const mortgages = await this.mortgages.findByUserId(userId);
    if (mortgages.length === 0) {
      return scenarios.map((scenario) => ({
        ...scenario,
        metrics: null,
        projections: null,
      }));
    }

    const mortgage = mortgages[0];
    const cashFlow = await this.cashFlows.findByUserId(userId);
    const emergencyFund = await this.emergencyFunds.findByUserId(userId);
    const terms = await this.mortgageTerms.findByMortgageId(mortgage.id);
    const currentTerm = terms
      .slice()
      .sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      )[0];

    const currentRate = currentTerm
      ? getTermEffectiveRate(currentTerm)
      : 0.0549;

    return scenarios.map((scenario) => {
      const metrics = calculateScenarioMetrics(
        {
          scenario,
          mortgage,
          cashFlow: cashFlow ?? undefined,
          emergencyFund: emergencyFund ?? undefined,
        },
        currentRate,
      );

      const projections = generateProjections(
        {
          scenario,
          mortgage,
          cashFlow: cashFlow ?? undefined,
          emergencyFund: emergencyFund ?? undefined,
        },
        30,
        currentRate,
      );

      return {
        ...scenario,
        metrics,
        projections,
      };
    });
  }
}

