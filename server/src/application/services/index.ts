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
import { RenewalRecommendationService } from "./renewal-recommendation.service";
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
import { RecastService } from "./recast.service";
import { PaymentFrequencyService } from "./payment-frequency.service";
import { PortabilityService } from "./portability.service";
import { PropertyValueService } from "./property-value.service";
import { RenewalWorkflowService } from "./renewal-workflow.service";
import { PaymentCorrectionsService } from "./payment-corrections.service";
import { PaymentAmountChangeService } from "./payment-amount-change.service";
import { MortgagePayoffService } from "./mortgage-payoff.service";

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
  renewalRecommendationService: RenewalRecommendationService;
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
  recast: RecastService;
  paymentFrequency: PaymentFrequencyService;
  portability: PortabilityService;
  propertyValue: PropertyValueService;
  renewalWorkflow: RenewalWorkflowService;
  paymentCorrections: PaymentCorrectionsService;
  paymentAmountChange: PaymentAmountChangeService;
  mortgagePayoff: MortgagePayoffService;
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
    repositories.renewalHistory,
    marketRateService
  );

  const refinancingService = new RefinancingService(
    repositories.mortgages,
    repositories.mortgageTerms,
    marketRateService
  );

  const renewalRecommendationService = new RenewalRecommendationService(
    repositories.mortgages,
    repositories.mortgageTerms,
    renewalService,
    refinancingService,
    marketRateService
  );

  const taxCalculationService = new TaxCalculationService();

  // Create payment amount change service for prime rate tracking
  const paymentAmountChangeService = new PaymentAmountChangeService(
    repositories.paymentAmountChangeEvents,
    repositories.mortgageTerms
  );

  const helocCreditLimitService = new HelocCreditLimitService(
    repositories.helocAccounts,
    repositories.mortgages
  );

  const propertyValueService = new PropertyValueService(
    repositories.mortgages,
    repositories.propertyValueHistory,
    helocCreditLimitService,
    repositories.helocAccounts
  );

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
    helocCreditLimit: helocCreditLimitService,
    helocInterest: new HelocInterestService(),
    mortgagePayments: new MortgagePaymentService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.mortgagePayments,
      helocCreditLimitService
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
      repositories.emergencyFunds,
      repositories.scenarios
    ),
    primeRateTracking: new PrimeRateTrackingService(
      repositories.primeRateHistory,
      repositories.mortgageTerms,
      repositories.mortgages,
      impactCalculator,
      repositories.mortgagePayments,
      paymentAmountChangeService
    ),
    triggerRateMonitor,
    impactCalculator,
    renewalService,
    renewalRecommendationService,
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
    recast: new RecastService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.mortgagePayments,
      repositories.recastEvents
    ),
    paymentFrequency: new PaymentFrequencyService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.paymentFrequencyChangeEvents
    ),
    portability: new PortabilityService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.mortgagePortability
    ),
    propertyValue: propertyValueService,
    renewalWorkflow: new RenewalWorkflowService(
      repositories.mortgages,
      repositories.mortgageTerms,
      repositories.renewalNegotiations,
      marketRateService,
      renewalService,
      renewalRecommendationService
    ),
    paymentCorrections: new PaymentCorrectionsService(
      repositories.paymentCorrections,
      repositories.mortgagePayments
    ),
    paymentAmountChange: new PaymentAmountChangeService(
      repositories.paymentAmountChangeEvents,
      repositories.mortgageTerms
    ),
    mortgagePayoff: new MortgagePayoffService(
      repositories.mortgagePayoff,
      repositories.mortgages,
      repositories.mortgagePayments
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
export * from "./renewal-recommendation.service";
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
export * from "./recast.service";
export * from "./payment-frequency.service";
export * from "./portability.service";
export * from "./property-value.service";
export * from "./renewal-workflow.service";
export * from "./payment-corrections.service";
export * from "./payment-amount-change.service";
export * from "./mortgage-payoff.service";
