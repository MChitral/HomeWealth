import type { Mortgage } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import type { MortgageCreateInput, MortgageUpdateInput } from "@domain/models";

export class MortgageService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly mortgagePayments: MortgagePaymentsRepository,
  ) {}

  listByUserId(userId: string): Promise<Mortgage[]> {
    return this.mortgages.findByUserId(userId);
  }

  async getByIdForUser(id: string, userId: string): Promise<Mortgage | undefined> {
    const mortgage = await this.mortgages.findById(id);
    if (!mortgage || mortgage.userId !== userId) {
      return undefined;
    }
    return mortgage;
  }

  create(userId: string, payload: Omit<MortgageCreateInput, "userId">): Promise<Mortgage> {
    return this.mortgages.create({
      ...payload,
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    payload: Partial<Omit<MortgageUpdateInput, "userId">>,
  ): Promise<Mortgage | undefined> {
    const mortgage = await this.getByIdForUser(id, userId);
    if (!mortgage) {
      return undefined;
    }
    return this.mortgages.update(id, payload);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const mortgage = await this.getByIdForUser(id, userId);
    if (!mortgage) {
      return false;
    }

    await this.mortgagePayments.deleteByMortgageId(id);
    await this.mortgageTerms.deleteByMortgageId(id);

    return this.mortgages.delete(id);
  }
}

