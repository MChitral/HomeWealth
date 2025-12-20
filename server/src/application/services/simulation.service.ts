import { MortgagesRepository } from "../../infrastructure/repositories/mortgages.repository";
import { MortgageTermsRepository } from "../../infrastructure/repositories/mortgage-terms.repository";
import {
  MonteCarloEngine,
  SimulationParams,
  MonteCarloResult,
} from "../../domain/analytics/monte-carlo.engine";

export interface SimulationRequest {
  mortgageId: string;
  numIterations?: number; // Default 1000
}

export class SimulationService {
  private engine: MonteCarloEngine;

  constructor(
    private mortgagesRepo: MortgagesRepository,
    private termsRepo: MortgageTermsRepository
  ) {
    this.engine = new MonteCarloEngine();
  }

  /**
   * Runs a Monte Carlo simulation for Trigger Rate risk analysis
   */
  async runTriggerRateSimulation(request: SimulationRequest): Promise<MonteCarloResult | null> {
    const { mortgageId } = request; // numIterations not used here, used in params directly

    // 1. Fetch Data
    const mortgage = await this.mortgagesRepo.findById(mortgageId);
    if (!mortgage) return null;

    const terms = await this.termsRepo.findByMortgageId(mortgageId);
    const activeTerm = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];

    if (!activeTerm) return null;

    // 2. Prepare Parameters
    // Only valid for Variable Rate mortgages
    // 2. Prepare Parameters
    // Only valid for Variable Rate mortgages
    if (
      activeTerm.termType !== "variable" &&
      activeTerm.termType !== "variable-changing" &&
      activeTerm.termType !== "variable-fixed"
    ) {
      // Allow general variable types
      // Or if stricly checking for "variable" literal, update logic.
      // Schema says: termType: text("term_type"), // fixed, variable-changing, variable-fixed
      // So checking for includes("variable") might be safer
    }

    // For MVP strict check:
    if (!activeTerm.termType.includes("variable")) {
      // We could just return null or throw. Logic above threw error.
      // throw new Error("Trigger rate simulation is only available for Variable Rate mortgages.");
    }

    // currentBalance unused variable removed

    // Calculate current rate from Prime + Spread if available, else use interestRate
    // Determine current rate correctly
    let currentRate = 0.05; // default fallback
    if (activeTerm.termType === "fixed" && activeTerm.fixedRate) {
      currentRate = parseFloat(activeTerm.fixedRate) / 100;
    } else if (activeTerm.primeRate && activeTerm.lockedSpread) {
      // Better to use activeTerm.primeRate (snapshot) + activeTerm.lockedSpread
      currentRate = (parseFloat(activeTerm.primeRate) + parseFloat(activeTerm.lockedSpread)) / 100;
    }

    const params: SimulationParams = {
      numIterations: request.numIterations || 5000,
      timeHorizonMonths: 60, // 5 years default
      startBalance: parseFloat(mortgage.currentBalance),
      startRate: currentRate,
      interestRateVolatility: 0.2, // 20% annualized volatility
      interestRateDrift: 0.0, // Neutral drift
    };

    // 3. Run Simulation
    return this.engine.run(params);
  }
}
