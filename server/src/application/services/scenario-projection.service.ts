import type { Scenario } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  CashFlowRepository,
  EmergencyFundRepository,
  ScenariosRepository,
} from "@infrastructure/repositories";
import {
  calculateScenarioMetrics,
  generateProjections,
  type ScenarioMetrics,
  type YearlyProjection,
} from "@server-shared/calculations/projections";
import { getTermEffectiveRate } from "@server-shared/calculations/term-helpers";
import {
  MonteCarloEngine,
  type SimulationParams,
  type MonteCarloResult,
} from "@domain/analytics/monte-carlo.engine";

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
    private readonly scenarios: ScenariosRepository
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
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

    const currentRate = currentTerm ? getTermEffectiveRate(currentTerm) : 0.0549;

    return scenarios.map((scenario) => {
      const metrics = calculateScenarioMetrics(
        {
          scenario,
          mortgage,
          cashFlow: cashFlow ?? undefined,
          emergencyFund: emergencyFund ?? undefined,
        },
        currentRate
      );

      const projections = generateProjections(
        {
          scenario,
          mortgage,
          cashFlow: cashFlow ?? undefined,
          emergencyFund: emergencyFund ?? undefined,
        },
        30,
        currentRate
      );

      return {
        ...scenario,
        metrics,
        projections,
      };
    });
  }

  /**
   * Run a Monte Carlo simulation for rate uncertainty analysis
   */
  async runMonteCarloSimulation(
    userId: string,
    params: {
      scenarioId?: string;
      timeHorizonMonths: number;
      numIterations?: number;
      rateModel?: "gbm" | "vasicek";
      interestRateVolatility?: number;
      interestRateDrift?: number;
      meanReversionSpeed?: number;
      longTermMeanRate?: number;
      rateCap?: number;
      rateFloor?: number;
      useHistoricalVolatility?: boolean;
      historicalRates?: number[];
    }
  ): Promise<MonteCarloResult | null> {
    const mortgages = await this.mortgages.findByUserId(userId);
    if (mortgages.length === 0) {
      return null;
    }

    const mortgage = mortgages[0];
    const terms = await this.mortgageTerms.findByMortgageId(mortgage.id);
    const currentTerm = terms
      .slice()
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

    if (!currentTerm) {
      return null;
    }

    const currentRate = getTermEffectiveRate(currentTerm);
    const currentBalance = parseFloat(mortgage.currentBalance);
    const monthlyPayment = parseFloat(currentTerm.regularPaymentAmount);

    // Calculate remaining amortization
    const startDate = new Date(mortgage.startDate);
    const totalAmortizationMonths = mortgage.amortizationMonths || mortgage.amortizationYears * 12;
    const monthsElapsed = Math.floor(
      (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );
    const remainingAmortizationMonths = Math.max(1, totalAmortizationMonths - monthsElapsed);

    // Apply rate cap/floor from term if variable
    const rateCap = currentTerm.variableRateCap
      ? parseFloat(currentTerm.variableRateCap)
      : params.rateCap;
    const rateFloor = currentTerm.variableRateFloor
      ? parseFloat(currentTerm.variableRateFloor)
      : params.rateFloor;

    const simulationParams: SimulationParams = {
      numIterations: params.numIterations ?? 1000,
      timeHorizonMonths: params.timeHorizonMonths,
      startBalance: currentBalance,
      startRate: currentRate,
      monthlyPayment,
      remainingAmortizationMonths,
      rateModel: params.rateModel ?? "gbm",
      interestRateVolatility: params.interestRateVolatility ?? 0.15,
      interestRateDrift: params.interestRateDrift ?? 0.0,
      meanReversionSpeed: params.meanReversionSpeed ?? 0.1,
      longTermMeanRate: params.longTermMeanRate,
      rateCap,
      rateFloor,
      useHistoricalVolatility: params.useHistoricalVolatility ?? false,
      historicalRates: params.historicalRates,
    };

    const engine = new MonteCarloEngine();
    return engine.run(simulationParams);
  }

  /**
   * Analyze what-if rate change scenarios
   * Compares baseline scenario with different rate assumptions
   */
  async analyzeRateChangeScenarios(
    userId: string,
    params: {
      scenarioId?: string;
      rateChanges: number[]; // Array of rate changes in percentage points (e.g., [-0.5, 0, 0.5, 1.0] for -0.5%, 0%, +0.5%, +1.0%)
      timeHorizonYears?: number;
    }
  ): Promise<{
    baseline: {
      rate: number;
      metrics: ScenarioMetrics;
      projections: YearlyProjection[];
    };
    scenarios: Array<{
      rateChange: number;
      newRate: number;
      metrics: ScenarioMetrics;
      projections: YearlyProjection[];
      impact: {
        netWorthChange: number;
        interestPaidChange: number;
        payoffYearChange: number;
        monthlyPaymentChange: number;
      };
    }>;
  } | null> {
    const mortgages = await this.mortgages.findByUserId(userId);
    if (mortgages.length === 0) {
      return null;
    }

    const mortgage = mortgages[0];
    const cashFlow = await this.cashFlows.findByUserId(userId);
    const emergencyFund = await this.emergencyFunds.findByUserId(userId);
    const terms = await this.mortgageTerms.findByMortgageId(mortgage.id);
    const currentTerm = terms
      .slice()
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

    if (!currentTerm) {
      return null;
    }

    const baselineRate = getTermEffectiveRate(currentTerm);
    const timeHorizon = params.timeHorizonYears ?? 30;

    // Get scenario if provided, otherwise use default
    let scenario: Scenario | null = null;
    if (params.scenarioId) {
      scenario = await this.scenarios.findById(params.scenarioId);
    }

    // Calculate baseline metrics
    const baselineMetrics = calculateScenarioMetrics(
      {
        scenario: scenario ?? undefined,
        mortgage,
        cashFlow: cashFlow ?? undefined,
        emergencyFund: emergencyFund ?? undefined,
      },
      baselineRate
    );

    const baselineProjections = generateProjections(
      {
        scenario: scenario ?? undefined,
        mortgage,
        cashFlow: cashFlow ?? undefined,
        emergencyFund: emergencyFund ?? undefined,
      },
      timeHorizon,
      baselineRate
    );

    // Calculate scenarios for each rate change
    const rateChangeScenarios = params.rateChanges.map((rateChange) => {
      const newRate = baselineRate + rateChange / 100; // Convert percentage points to decimal
      const metrics = calculateScenarioMetrics(
        {
          scenario: scenario ?? undefined,
          mortgage,
          cashFlow: cashFlow ?? undefined,
          emergencyFund: emergencyFund ?? undefined,
        },
        newRate
      );

      const projections = generateProjections(
        {
          scenario: scenario ?? undefined,
          mortgage,
          cashFlow: cashFlow ?? undefined,
          emergencyFund: emergencyFund ?? undefined,
        },
        timeHorizon,
        newRate
      );

      // Calculate impact vs baseline
      const netWorthChange = metrics.netWorth[timeHorizon] - baselineMetrics.netWorth[timeHorizon];
      const interestPaidChange = metrics.totalInterestPaid - baselineMetrics.totalInterestPaid;
      const payoffYearChange = metrics.mortgagePayoffYear - baselineMetrics.mortgagePayoffYear;

      // Calculate monthly payment change (simplified - would need actual payment calculation)
      const monthlyPaymentChange = 0; // Placeholder - would calculate actual payment difference

      return {
        rateChange,
        newRate,
        metrics,
        projections,
        impact: {
          netWorthChange,
          interestPaidChange,
          payoffYearChange,
          monthlyPaymentChange,
        },
      };
    });

    return {
      baseline: {
        rate: baselineRate,
        metrics: baselineMetrics,
        projections: baselineProjections,
      },
      scenarios: rateChangeScenarios,
    };
  }
}
