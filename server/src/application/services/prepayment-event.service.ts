import type { PrepaymentEvent } from "@shared/schema";
import {
  PrepaymentEventsRepository,
  ScenariosRepository,
} from "@infrastructure/repositories";
import type { PrepaymentEventCreateInput } from "@domain/models";

export class PrepaymentEventService {
  constructor(
    private readonly prepaymentEvents: PrepaymentEventsRepository,
    private readonly scenarios: ScenariosRepository,
  ) {}

  private async authorizeScenario(scenarioId: string, userId: string) {
    const scenario = await this.scenarios.findById(scenarioId);
    if (!scenario || scenario.userId !== userId) {
      return undefined;
    }
    return scenario;
  }

  async list(scenarioId: string, userId: string): Promise<PrepaymentEvent[] | undefined> {
    const scenario = await this.authorizeScenario(scenarioId, userId);
    if (!scenario) {
      return undefined;
    }
    return this.prepaymentEvents.findByScenarioId(scenarioId);
  }

  async create(
    scenarioId: string,
    userId: string,
    payload: Omit<PrepaymentEventCreateInput, "scenarioId">,
  ): Promise<PrepaymentEvent | undefined> {
    const scenario = await this.authorizeScenario(scenarioId, userId);
    if (!scenario) {
      return undefined;
    }
    return this.prepaymentEvents.create({
      ...payload,
      scenarioId,
    });
  }

  async update(
    id: string,
    userId: string,
    payload: Partial<Omit<PrepaymentEventCreateInput, "scenarioId">>,
  ): Promise<PrepaymentEvent | undefined> {
    const event = await this.prepaymentEvents.findById(id);
    if (!event) {
      return undefined;
    }
    const scenario = await this.authorizeScenario(event.scenarioId, userId);
    if (!scenario) {
      return undefined;
    }
    return this.prepaymentEvents.update(id, payload);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const event = await this.prepaymentEvents.findById(id);
    if (!event) {
      return false;
    }
    const scenario = await this.authorizeScenario(event.scenarioId, userId);
    if (!scenario) {
      return false;
    }
    return this.prepaymentEvents.delete(id);
  }
}

