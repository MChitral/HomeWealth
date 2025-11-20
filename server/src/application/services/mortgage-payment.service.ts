import type { MortgagePayment } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import type { MortgagePaymentCreateInput } from "@domain/models";

export class MortgagePaymentService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly mortgagePayments: MortgagePaymentsRepository,
  ) {}

  private async authorizeMortgage(mortgageId: string, userId: string) {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || mortgage.userId !== userId) {
      return undefined;
    }
    return mortgage;
  }

  private async authorizeTerm(termId: string, userId: string) {
    const term = await this.mortgageTerms.findById(termId);
    if (!term) {
      return undefined;
    }
    return (await this.authorizeMortgage(term.mortgageId, userId)) ? term : undefined;
  }

  async listByMortgage(mortgageId: string, userId: string): Promise<MortgagePayment[] | undefined> {
    const authorized = await this.authorizeMortgage(mortgageId, userId);
    if (!authorized) {
      return undefined;
    }
    return this.mortgagePayments.findByMortgageId(mortgageId);
  }

  async listByTerm(termId: string, userId: string): Promise<MortgagePayment[] | undefined> {
    const term = await this.authorizeTerm(termId, userId);
    if (!term) {
      return undefined;
    }
    return this.mortgagePayments.findByTermId(termId);
  }

  async create(
    mortgageId: string,
    userId: string,
    payload: Omit<MortgagePaymentCreateInput, "mortgageId">,
  ): Promise<MortgagePayment | undefined> {
    const authorized = await this.authorizeMortgage(mortgageId, userId);
    if (!authorized) {
      return undefined;
    }
    return this.mortgagePayments.create({
      ...payload,
      mortgageId,
    });
  }
}

