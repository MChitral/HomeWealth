import { apiRequest } from "@/shared/api/query-client";

export interface PropertyValueHistoryEntry {
  id: string;
  mortgageId: string;
  valueDate: string;
  propertyValue: string;
  source: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PropertyValueTrend {
  history: PropertyValueHistoryEntry[];
  averageGrowthRate: number; // Annual percentage
  trendDirection: "increasing" | "decreasing" | "stable";
  projectedValue?: number;
  growthRatePercent: number;
}

export interface PropertyValueProjection {
  projectedValue: number;
  monthsAhead: number;
}

export const propertyValueApi = {
  getValueHistory: (mortgageId: string) =>
    apiRequest<PropertyValueHistoryEntry[]>(
      "GET",
      `/api/mortgages/${mortgageId}/property-value/history`
    ),

  getTrend: (mortgageId: string, timeRangeMonths?: number) => {
    const params = timeRangeMonths ? `?timeRangeMonths=${timeRangeMonths}` : "";
    return apiRequest<PropertyValueTrend>(
      "GET",
      `/api/mortgages/${mortgageId}/property-value/trend${params}`
    );
  },

  getProjections: (mortgageId: string, monthsAhead?: number) => {
    const params = monthsAhead ? `?monthsAhead=${monthsAhead}` : "";
    return apiRequest<PropertyValueProjection>(
      "GET",
      `/api/mortgages/${mortgageId}/property-value/projection${params}`
    );
  },

  updateValue: (
    mortgageId: string,
    value: number,
    valueDate?: string,
    source?: string,
    notes?: string
  ) =>
    apiRequest<any>("POST", `/api/mortgages/${mortgageId}/property-value`, {
      propertyValue: value,
      valueDate,
      source,
      notes,
    }),
};
