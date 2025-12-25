import type { Repositories } from "@infrastructure/repositories";
import { CashFlowService } from "./cash-flow.service";
import { EmergencyFundService } from "./emergency-fund.service";
import { MortgageService } from "./mortgage.service";
import { MortgageTermService } from "./mortgage-term.service";
import { MortgagePaymentService } from "./mortgage-payment.service";
import { ScenarioService } from "./scenario.service";
import { PrepaymentEventService } from "./prepayment-event.service";
import { RefinancingEventService } from "./refinancing-event.service";
import { ScenarioProjectionService } from "./scenario-projection.service";
import { PrimeRateTrackingService } from "./prime-rate-tracking.service";
import { TriggerRateMonitor } from "./trigger-rate-monitor";
import { ImpactCalculator } from "./impact-calculator.service";
import { RenewalService } from "./renewal.service";
import { MarketRateService } from "./market-rate.service";
import { RefinancingService } from "./refinancing.service";
import { PrepaymentService } from "./prepayment.service";
import { SimulationService } from "./simulation.service";
import { HealthScoreService } from "./health-score.service";
import { NotificationService } from "./notification.service";
import { HelocService } from "./heloc.service";
import { HelocCreditLimitService } from "./heloc-credit-limit.service";
import { HelocInterestService } from "./heloc-interest.service";
import { ReAdvanceableMortgageService } from "./re-advanceable-mortgage.service";
import { InvestmentService } from "./investment.service";
import { TaxCalculationService } from "./tax-calculation.service";
import { SmithManeuverService } from "./smith-maneuver.service";

export interface ApplicationServices {
  cashFlows: CashFlowService;
  emergencyFunds: EmergencyFundService;
  mortgages: MortgageService;
  mortgageTerms: MortgageTermService;
  mortgagePayments: MortgagePaymentService;
  scenarios: ScenarioService;
  prepaymentEvents: PrepaymentEventService;
  refinancingEvents: RefinancingEventService;
  scenarioProjections: ScenarioProjectionService;
  primeRateTracking: PrimeRateTrackingService;
  triggerRateMonitor: TriggerRateMonitor;
  impactCalculator: ImpactCalculator;
  renewalService: RenewalService;
  marketRateService: MarketRateService;
  refinancingService: RefinancingService;
  prepaymentService: PrepaymentService;
  simulationService: SimulationService;
  healthScoreService: HealthScoreService;
  notifications: NotificationService;
  heloc: HelocService;
  helocCreditLimit: HelocCreditLimitService;
  helocInterest: HelocInterestService;
  reAdvanceableMortgage: ReAdvanceableMortgageService;
  investments: InvestmentService;
  taxCalculation: TaxCalculationService;
  smithManeuver: SmithManeuverService;
}

export function createServices(repositories: Repositories): ApplicationServices {
  const triggerRateMonitor = new TriggerRateMonitor(
    repositories.mortgages,
    repositories.mortgageTerms,
    repositories.mortgagePayments
  );

  const impactCalculator = new ImpactCalculator(
    repositories.mortgages,
    repositories.mortgagePayments,
    triggerRateMonitor
  );

  const marketRateService = new MarketRateService(repositories.marketRates);

  const renewalService = new RenewalService(
    repositories.mortgages,
    repositories.mortgageTerms,
    marketRateService
  );

  const refinancingService = new RefinancingService(
    repositories.mortgages,
    repositories.mortgageTerms,
    marketRateService
  );

  const taxCalculationService = new TaxCalculationService();

  return {
    cashFlows: new CashFlowService(repositories.cashFlows),
    emergencyFunds: new EmergencyFundService(repositories.emergencyFunds),
    mortgages: new MortgageService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.mortgagePayments
    ),
    mortgageTerms: new MortgageTermService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.mortgagePayments
    ),
    helocCreditLimit: new HelocCreditLimitService(
      repositories.helocAccounts,
      repositories.mortgages
    ),
    helocInterest: new HelocInterestService(),
    mortgagePayments: new MortgagePaymentService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.mortgagePayments,
      new HelocCreditLimitService(repositories.helocAccounts, repositories.mortgages)
    ),
    scenarios: new ScenarioService(repositories.scenarios, repositories.prepaymentEvents),
    prepaymentEvents: new PrepaymentEventService(
      repositories.prepaymentEvents,
      repositories.scenarios
    ),
    refinancingEvents: new RefinancingEventService(
      repositories.refinancingEvents,
      repositories.scenarios
    ),
    scenarioProjections: new ScenarioProjectionService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.cashFlows,
      repositories.emergencyFunds
    ),
    primeRateTracking: new PrimeRateTrackingService(
      repositories.primeRateHistory,
      repositories.mortgageTerms,
      repositories.mortgages,
      impactCalculator
    ),
    triggerRateMonitor,
    impactCalculator,
    renewalService,
    marketRateService,
    refinancingService,
    prepaymentService: new PrepaymentService(
      repositories.cashFlows,
      repositories.mortgages,
      repositories.mortgagePayments
    ),
    simulationService: new SimulationService(repositories.mortgages, repositories.mortgageTerms),
    healthScoreService: new HealthScoreService(
      repositories.mortgages,
      repositories.mortgageTerms,
      marketRateService
    ),
    notifications: new NotificationService(
      repositories.notifications,
      repositories.notificationPreferences
    ),
    heloc: new HelocService(
      repositories.helocAccounts,
      repositories.helocTransactions,
      repositories.mortgages
    ),
    reAdvanceableMortgage: new ReAdvanceableMortgageService(
      repositories.mortgages,
      repositories.helocAccounts,
      repositories.mortgagePayments
    ),
    investments: new InvestmentService(
      repositories.investments,
      repositories.investmentTransactions,
      repositories.investmentIncome
    ),
    taxCalculation: taxCalculationService,
    smithManeuver: new SmithManeuverService(
      repositories.smithManeuver,
      repositories.mortgages,
      repositories.helocAccounts,
      repositories.helocTransactions,
      taxCalculationService
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
export * from "./refinancing-event.service";
export * from "./scenario-projection.service";
export * from "./prime-rate-tracking.service";
export * from "./trigger-rate-monitor";
export * from "./impact-calculator.service";
export * from "./renewal.service";
export * from "./market-rate.service";
export * from "./refinancing.service";
export * from "./prepayment.service";
export * from "./simulation.service";
export * from "./health-score.service";
export * from "./notification.service";
export * from "./heloc.service";
export * from "./heloc-credit-limit.service";
export * from "./heloc-interest.service";
export * from "./re-advanceable-mortgage.service";
export * from "./investment.service";
export * from "./tax-calculation.service";
export * from "./smith-maneuver.service";
