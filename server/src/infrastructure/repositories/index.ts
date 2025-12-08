import { UsersRepository } from "./users.repository";
import { CashFlowRepository } from "./cash-flow.repository";
import { EmergencyFundRepository } from "./emergency-fund.repository";
import { MortgagesRepository } from "./mortgages.repository";
import { MortgageTermsRepository } from "./mortgage-terms.repository";
import { MortgagePaymentsRepository } from "./mortgage-payments.repository";
import { ScenariosRepository } from "./scenarios.repository";
import { PrepaymentEventsRepository } from "./prepayment-events.repository";
import { PrimeRateHistoryRepository } from "./prime-rate-history.repository";

export interface Repositories {
  users: UsersRepository;
  cashFlows: CashFlowRepository;
  emergencyFunds: EmergencyFundRepository;
  mortgages: MortgagesRepository;
  mortgageTerms: MortgageTermsRepository;
  mortgagePayments: MortgagePaymentsRepository;
  scenarios: ScenariosRepository;
  prepaymentEvents: PrepaymentEventsRepository;
  primeRateHistory: PrimeRateHistoryRepository;
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
    primeRateHistory: new PrimeRateHistoryRepository(),
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
  PrimeRateHistoryRepository,
};

