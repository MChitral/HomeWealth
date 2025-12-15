import type { Scenario } from "@shared/schema";
import { ScenariosRepository, PrepaymentEventsRepository } from "@infrastructure/repositories";
import type { ScenarioCreateInput } from "@domain/models";

export class ScenarioService {
  constructor(
    private readonly scenarios: ScenariosRepository,
    private readonly prepaymentEvents: PrepaymentEventsRepository
  ) {}

  listByUserId(userId: string): Promise<Scenario[]> {
    return this.scenarios.findByUserId(userId);
  }

  async getByIdForUser(id: string, userId: string): Promise<Scenario | undefined> {
    const scenario = await this.scenarios.findById(id);
    if (!scenario || scenario.userId !== userId) {
      return undefined;
    }
    return scenario;
  }

  create(userId: string, payload: Omit<ScenarioCreateInput, "userId">): Promise<Scenario> {
    return this.scenarios.create({
      ...payload,
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    payload: Partial<Omit<ScenarioCreateInput, "userId">>
  ): Promise<Scenario | undefined> {
    const scenario = await this.getByIdForUser(id, userId);
    if (!scenario) {
      return undefined;
    }
    return this.scenarios.update(id, payload);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const scenario = await this.getByIdForUser(id, userId);
    if (!scenario) {
      return false;
    }
    await this.prepaymentEvents.deleteByScenarioId(id);
    return this.scenarios.delete(id);
  }
}
