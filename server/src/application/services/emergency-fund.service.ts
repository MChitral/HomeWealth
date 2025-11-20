import type { EmergencyFund } from "@shared/schema";
import { EmergencyFundRepository } from "@infrastructure/repositories/emergency-fund.repository";
import type {
  EmergencyFundCreateInput,
  EmergencyFundUpdateInput,
} from "@domain/models";

export class EmergencyFundService {
  constructor(private readonly repository: EmergencyFundRepository) {}

  getByUserId(userId: string): Promise<EmergencyFund | undefined> {
    return this.repository.findByUserId(userId);
  }

  create(
    userId: string,
    payload: Omit<EmergencyFundCreateInput, "userId">,
  ): Promise<EmergencyFund> {
    return this.repository.create({
      ...payload,
      userId,
    });
  }

  async update(
    userId: string,
    id: string,
    payload: Partial<Omit<EmergencyFundUpdateInput, "userId">>,
  ): Promise<EmergencyFund | undefined> {
    const existing = await this.repository.findByUserId(userId);
    if (!existing || existing.id !== id) {
      return undefined;
    }

    return this.repository.update(id, payload);
  }
}

