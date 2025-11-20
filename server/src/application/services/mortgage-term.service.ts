import type { MortgageTerm } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import type { MortgageTermCreateInput, MortgageTermUpdateInput } from "@domain/models";

export class MortgageTermService {
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

  async listForMortgage(mortgageId: string, userId: string): Promise<MortgageTerm[] | undefined> {
    const authorized = await this.authorizeMortgage(mortgageId, userId);
    if (!authorized) {
      return undefined;
    }
    return this.mortgageTerms.findByMortgageId(mortgageId);
  }

  async create(
    mortgageId: string,
    userId: string,
    payload: Omit<MortgageTermCreateInput, "mortgageId">,
  ): Promise<MortgageTerm | undefined> {
    const authorized = await this.authorizeMortgage(mortgageId, userId);
    if (!authorized) {
      return undefined;
    }
    return this.mortgageTerms.create({
      ...payload,
      mortgageId,
    });
  }

  async update(
    termId: string,
    userId: string,
    payload: Partial<Omit<MortgageTermUpdateInput, "mortgageId">>,
  ): Promise<MortgageTerm | undefined> {
    const term = await this.authorizeTerm(termId, userId);
    if (!term) {
      return undefined;
    }
    return this.mortgageTerms.update(termId, payload);
  }

  async delete(termId: string, userId: string): Promise<boolean> {
    const term = await this.authorizeTerm(termId, userId);
    if (!term) {
      return false;
    }
    await this.mortgagePayments.deleteByTermId(termId);
    return this.mortgageTerms.delete(termId);
  }
}

