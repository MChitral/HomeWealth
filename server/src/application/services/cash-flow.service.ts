import type { CashFlow } from "@shared/schema";
import { CashFlowRepository } from "@infrastructure/repositories/cash-flow.repository";
import type { CashFlowCreateInput, CashFlowUpdateInput } from "@domain/models";

export class CashFlowService {
  constructor(private readonly repository: CashFlowRepository) {}

  getByUserId(userId: string): Promise<CashFlow | undefined> {
    return this.repository.findByUserId(userId);
  }

  create(userId: string, payload: Omit<CashFlowCreateInput, "userId">): Promise<CashFlow> {
    return this.repository.create({
      ...payload,
      userId,
    });
  }

  async update(
    userId: string,
    id: string,
    payload: Partial<Omit<CashFlowUpdateInput, "userId">>,
  ): Promise<CashFlow | undefined> {
    const existing = await this.repository.findByUserId(userId);
    if (!existing || existing.id !== id) {
      return undefined;
    }

    return this.repository.update(id, payload);
  }
}

