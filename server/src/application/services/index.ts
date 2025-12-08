import type { Repositories } from "@infrastructure/repositories";
import { CashFlowService } from "./cash-flow.service";
import { EmergencyFundService } from "./emergency-fund.service";
import { MortgageService } from "./mortgage.service";
import { MortgageTermService } from "./mortgage-term.service";
import { MortgagePaymentService } from "./mortgage-payment.service";
import { ScenarioService } from "./scenario.service";
import { PrepaymentEventService } from "./prepayment-event.service";
import { ScenarioProjectionService } from "./scenario-projection.service";
import { PrimeRateTrackingService } from "./prime-rate-tracking.service";

export interface ApplicationServices {
  cashFlows: CashFlowService;
  emergencyFunds: EmergencyFundService;
  mortgages: MortgageService;
  mortgageTerms: MortgageTermService;
  mortgagePayments: MortgagePaymentService;
  scenarios: ScenarioService;
  prepaymentEvents: PrepaymentEventService;
  scenarioProjections: ScenarioProjectionService;
  primeRateTracking: PrimeRateTrackingService;
}

export function createServices(repositories: Repositories): ApplicationServices {
  return {
    cashFlows: new CashFlowService(repositories.cashFlows),
    emergencyFunds: new EmergencyFundService(repositories.emergencyFunds),
    mortgages: new MortgageService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.mortgagePayments,
    ),
    mortgageTerms: new MortgageTermService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.mortgagePayments,
    ),
    mortgagePayments: new MortgagePaymentService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.mortgagePayments,
    ),
    scenarios: new ScenarioService(repositories.scenarios, repositories.prepaymentEvents),
    prepaymentEvents: new PrepaymentEventService(
      repositories.prepaymentEvents,
      repositories.scenarios,
    ),
    scenarioProjections: new ScenarioProjectionService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.cashFlows,
      repositories.emergencyFunds,
    ),
    primeRateTracking: new PrimeRateTrackingService(
      repositories.primeRateHistory,
      repositories.mortgageTerms,
      repositories.mortgages,
    ),
  };
}

export * from "./cash-flow.service";
export * from "./emergency-fund.service";
export * from "./mortgage.service";
export * from "./mortgage-term.service";
export * from "./mortgage-payment.service";
export * from "./scenario.service";
export * from "./prepayment-event.service";
export * from "./scenario-projection.service";
export * from "./prime-rate-tracking.service";

