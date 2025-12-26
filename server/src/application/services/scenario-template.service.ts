import type { InsertScenario } from "@shared/schema";

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  payload: Omit<InsertScenario, "name" | "description" | "userId">;
}

export class ScenarioTemplateService {
  /**
   * Get all available scenario templates
   */
  getTemplates(): ScenarioTemplate[] {
    return [
      {
        id: "aggressive-prepayment",
        name: "Aggressive Prepayment",
        description:
          "Focus on paying down mortgage quickly by allocating most surplus to prepayments. Minimal investment.",
        payload: {
          prepaymentMonthlyPercent: 90,
          investmentMonthlyPercent: 10,
          expectedReturnRate: "0.060",
          efPriorityPercent: 0,
        },
      },
      {
        id: "smith-maneuver",
        name: "Smith Maneuver",
        description:
          "Maximize investment returns while maintaining mortgage. Allocate surplus to investments, use HELOC for tax-deductible interest.",
        payload: {
          prepaymentMonthlyPercent: 0,
          investmentMonthlyPercent: 100,
          expectedReturnRate: "0.070",
          efPriorityPercent: 0,
        },
      },
      {
        id: "status-quo",
        name: "Status Quo",
        description:
          "Maintain current strategy with balanced approach between prepayments and investments.",
        payload: {
          prepaymentMonthlyPercent: 50,
          investmentMonthlyPercent: 50,
          expectedReturnRate: "0.060",
          efPriorityPercent: 0,
        },
      },
      {
        id: "renewal-optimization",
        name: "Renewal Optimization",
        description:
          "Prepare for mortgage renewal by building emergency fund and moderate prepayments. Focus on flexibility.",
        payload: {
          prepaymentMonthlyPercent: 40,
          investmentMonthlyPercent: 40,
          expectedReturnRate: "0.050",
          efPriorityPercent: 20,
        },
      },
      {
        id: "balanced-growth",
        name: "Balanced Growth",
        description:
          "Balanced approach with equal focus on prepayments and investments, with emergency fund priority.",
        payload: {
          prepaymentMonthlyPercent: 40,
          investmentMonthlyPercent: 40,
          expectedReturnRate: "0.065",
          efPriorityPercent: 20,
        },
      },
      {
        id: "conservative-prepayment",
        name: "Conservative Prepayment",
        description:
          "Moderate prepayments with focus on building emergency fund and maintaining investments.",
        payload: {
          prepaymentMonthlyPercent: 30,
          investmentMonthlyPercent: 50,
          expectedReturnRate: "0.060",
          efPriorityPercent: 20,
        },
      },
    ];
  }

  /**
   * Get a specific template by ID
   */
  getTemplateById(id: string): ScenarioTemplate | undefined {
    return this.getTemplates().find((template) => template.id === id);
  }

  /**
   * Create a scenario payload from a template
   */
  createFromTemplate(
    templateId: string,
    name?: string,
    description?: string
  ): Omit<InsertScenario, "userId"> | null {
    const template = this.getTemplateById(templateId);
    if (!template) {
      return null;
    }

    return {
      name: name || template.name,
      description: description || template.description,
      ...template.payload,
    };
  }
}
