import { RefinancingEventsRepository, ScenariosRepository } from "@infrastructure/repositories";
import type { InsertRefinancingEvent } from "@shared/schema";

export class RefinancingEventService {
  constructor(
    private readonly refinancingEvents: RefinancingEventsRepository,
    private readonly scenarios: ScenariosRepository
  ) {}

  async list(scenarioId: string, userId: string): Promise<any[] | null> {
    // Verify scenario belongs to user
    const scenario = await this.scenarios.findById(scenarioId);
    if (!scenario || scenario.userId !== userId) {
      return null;
    }

    return this.refinancingEvents.findByScenarioId(scenarioId);
  }

  async create(
    scenarioId: string,
    userId: string,
    payload: Omit<InsertRefinancingEvent, "scenarioId">
  ): Promise<any | null> {
    // Verify scenario belongs to user
    const scenario = await this.scenarios.findById(scenarioId);
    if (!scenario || scenario.userId !== userId) {
      return null;
    }

    return this.refinancingEvents.create({
      ...payload,
      scenarioId,
    });
  }

  async update(
    id: string,
    userId: string,
    payload: Partial<InsertRefinancingEvent>
  ): Promise<any | null> {
    const event = await this.refinancingEvents.findById(id);
    if (!event) {
      return null;
    }

    // Verify scenario belongs to user
    const scenario = await this.scenarios.findById(event.scenarioId);
    if (!scenario || scenario.userId !== userId) {
      return null;
    }

    return this.refinancingEvents.update(id, payload);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const event = await this.refinancingEvents.findById(id);
    if (!event) {
      return false;
    }

    // Verify scenario belongs to user
    const scenario = await this.scenarios.findById(event.scenarioId);
    if (!scenario || scenario.userId !== userId) {
      return false;
    }

    return this.refinancingEvents.delete(id);
  }
}
