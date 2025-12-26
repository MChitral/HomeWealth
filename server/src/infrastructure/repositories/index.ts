import { UsersRepository } from "./users.repository";
import { CashFlowRepository } from "./cash-flow.repository";
import { EmergencyFundRepository } from "./emergency-fund.repository";
import { MortgagesRepository } from "./mortgages.repository";
import { MortgageTermsRepository } from "./mortgage-terms.repository";
import { MortgagePaymentsRepository } from "./mortgage-payments.repository";
import { ScenariosRepository } from "./scenarios.repository";
import { PrepaymentEventsRepository } from "./prepayment-events.repository";
import { RefinancingEventsRepository } from "./refinancing-events.repository";
import { PrimeRateHistoryRepository } from "./prime-rate-history.repository";
import { MarketRatesRepository } from "./market-rates.repository";
import { NotificationRepository } from "./notification.repository";
import { NotificationPreferencesRepository } from "./notification-preferences.repository";
import { HelocAccountRepository } from "./heloc-account.repository";
import { HelocTransactionRepository } from "./heloc-transaction.repository";
import { InvestmentRepository } from "./investment.repository";
import { InvestmentTransactionRepository } from "./investment-transaction.repository";
import { InvestmentIncomeRepository } from "./investment-income.repository";
import { SmithManeuverRepository } from "./smith-maneuver.repository";
import { RecastEventsRepository } from "./recast-events.repository";
import { PaymentFrequencyChangeEventsRepository } from "./payment-frequency-change-events.repository";
import { MortgagePortabilityRepository } from "./mortgage-portability.repository";
import { RenewalNegotiationsRepository } from "./renewal-negotiations.repository";
import { RenewalHistoryRepository } from "./renewal-history.repository";
import { PropertyValueHistoryRepository } from "./property-value-history.repository";
import { PaymentCorrectionsRepository } from "./payment-corrections.repository";
import { PaymentAmountChangeEventsRepository } from "./payment-amount-change-events.repository";
import { MortgagePayoffRepository } from "./mortgage-payoff.repository";

export interface Repositories {
  users: UsersRepository;
  cashFlows: CashFlowRepository;
  emergencyFunds: EmergencyFundRepository;
  mortgages: MortgagesRepository;
  mortgageTerms: MortgageTermsRepository;
  mortgagePayments: MortgagePaymentsRepository;
  scenarios: ScenariosRepository;
  prepaymentEvents: PrepaymentEventsRepository;
  refinancingEvents: RefinancingEventsRepository;
  primeRateHistory: PrimeRateHistoryRepository;
  marketRates: MarketRatesRepository;
  notifications: NotificationRepository;
  notificationPreferences: NotificationPreferencesRepository;
  helocAccounts: HelocAccountRepository;
  helocTransactions: HelocTransactionRepository;
  investments: InvestmentRepository;
  investmentTransactions: InvestmentTransactionRepository;
  investmentIncome: InvestmentIncomeRepository;
  smithManeuver: SmithManeuverRepository;
  recastEvents: RecastEventsRepository;
  paymentFrequencyChangeEvents: PaymentFrequencyChangeEventsRepository;
  mortgagePortability: MortgagePortabilityRepository;
  renewalNegotiations: RenewalNegotiationsRepository;
  renewalHistory: RenewalHistoryRepository;
  propertyValueHistory: PropertyValueHistoryRepository;
  paymentCorrections: PaymentCorrectionsRepository;
  paymentAmountChangeEvents: PaymentAmountChangeEventsRepository;
  mortgagePayoff: MortgagePayoffRepository;
}

export function createRepositories(): Repositories {
  return {
    users: new UsersRepository(),
    cashFlows: new CashFlowRepository(),
    emergencyFunds: new EmergencyFundRepository(),
    mortgages: new MortgagesRepository(),
    mortgageTerms: new MortgageTermsRepository(),
    mortgagePayments: new MortgagePaymentsRepository(),
    scenarios: new ScenariosRepository(),
    prepaymentEvents: new PrepaymentEventsRepository(),
    refinancingEvents: new RefinancingEventsRepository(),
    primeRateHistory: new PrimeRateHistoryRepository(),
    marketRates: new MarketRatesRepository(),
    notifications: new NotificationRepository(),
    notificationPreferences: new NotificationPreferencesRepository(),
    helocAccounts: new HelocAccountRepository(),
    helocTransactions: new HelocTransactionRepository(),
    investments: new InvestmentRepository(),
    investmentTransactions: new InvestmentTransactionRepository(),
    investmentIncome: new InvestmentIncomeRepository(),
    smithManeuver: new SmithManeuverRepository(),
    recastEvents: new RecastEventsRepository(),
    paymentFrequencyChangeEvents: new PaymentFrequencyChangeEventsRepository(),
    mortgagePortability: new MortgagePortabilityRepository(),
    renewalNegotiations: new RenewalNegotiationsRepository(),
    renewalHistory: new RenewalHistoryRepository(),
    propertyValueHistory: new PropertyValueHistoryRepository(),
    paymentCorrections: new PaymentCorrectionsRepository(),
    paymentAmountChangeEvents: new PaymentAmountChangeEventsRepository(),
    mortgagePayoff: new MortgagePayoffRepository(),
  };
}

export type RepositoryFactory = ReturnType<typeof createRepositories>;

export {
  UsersRepository,
  CashFlowRepository,
  EmergencyFundRepository,
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
  ScenariosRepository,
  PrepaymentEventsRepository,
  RefinancingEventsRepository,
  PrimeRateHistoryRepository,
  MarketRatesRepository,
  NotificationRepository,
  NotificationPreferencesRepository,
  HelocAccountRepository,
  HelocTransactionRepository,
  InvestmentRepository,
  InvestmentTransactionRepository,
  InvestmentIncomeRepository,
  SmithManeuverRepository,
  RecastEventsRepository,
  PaymentFrequencyChangeEventsRepository,
  MortgagePortabilityRepository,
  RenewalNegotiationsRepository,
  RenewalHistoryRepository,
  PropertyValueHistoryRepository,
  PaymentCorrectionsRepository,
  PaymentAmountChangeEventsRepository,
  MortgagePayoffRepository,
};
