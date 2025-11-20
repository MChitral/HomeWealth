import {
  type InsertScenario,
  type Scenario,
  insertScenarioSchema,
} from "@shared/schema";

export type ScenarioEntity = Scenario;
export type ScenarioCreateInput = InsertScenario;

export const scenarioCreateSchema = insertScenarioSchema;

