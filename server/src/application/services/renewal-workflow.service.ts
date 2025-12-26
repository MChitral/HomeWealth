import type { Mortgage, MortgageTerm } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  RenewalNegotiationsRepository,
} from "@infrastructure/repositories";
import { MarketRateService } from "./market-rate.service";
import { RenewalService } from "./renewal.service";

export interface RenewalNegotiationInput {
  mortgageId: string;
  termId: string;
  negotiationDate?: string;
  offeredRate?: number;
  negotiatedRate?: number;
  status: "pending" | "accepted" | "rejected" | "counter_offered";
  notes?: string;
}

export interface RenewalOptions {
  stayWithCurrentLender: {
    estimatedRate: number;
    estimatedPenalty: number;
  };
  switchLender: {
    estimatedRate: number;
    estimatedPenalty: number;
    estimatedClosingCosts: number;
  };
}

export class RenewalWorkflowService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly renewalNegotiations: RenewalNegotiationsRepository,
    private readonly marketRateService: MarketRateService,
    private readonly renewalService: RenewalService
  ) {}

  private async authorizeMortgage(mortgageId: string, userId: string) {
    const mortgage = await this.mortgages.findById(mortgageId);
    if (!mortgage || mortgage.userId !== userId) {
      return undefined;
    }
    return mortgage;
  }

  /**
   * Start renewal workflow
   */
  async startRenewalWorkflow(mortgageId: string, userId: string): Promise<{
    mortgage: Mortgage;
    currentTerm: MortgageTerm | undefined;
    renewalStatus: any;
  } | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    const terms = await this.mortgageTerms.findByMortgageId(mortgageId);
    const currentTerm = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];

    const renewalStatus = await this.renewalService.getRenewalStatus(mortgageId);

    return {
      mortgage,
      currentTerm,
      renewalStatus,
    };
  }

  /**
   * Track rate negotiation
   */
  async trackNegotiation(
    mortgageId: string,
    userId: string,
    input: RenewalNegotiationInput
  ): Promise<any | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    const negotiationDate = input.negotiationDate || new Date().toISOString().split("T")[0];

    const negotiation = await this.renewalNegotiations.create({
      mortgageId,
      termId: input.termId,
      negotiationDate,
      offeredRate: input.offeredRate ? (input.offeredRate / 100).toFixed(3) : undefined,
      negotiatedRate: input.negotiatedRate ? (input.negotiatedRate / 100).toFixed(3) : undefined,
      status: input.status,
      notes: input.notes,
    });

    return negotiation;
  }

  /**
   * Compare renewal options (stay vs switch)
   */
  async compareRenewalOptions(
    mortgageId: string,
    userId: string
  ): Promise<RenewalOptions | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    const terms = await this.mortgageTerms.findByMortgageId(mortgageId);
    const currentTerm = terms.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];

    if (!currentTerm) {
      return undefined;
    }

    // Get market rates for comparison
    const termType = currentTerm.termType as "fixed" | "variable-changing" | "variable-fixed";
    const termYears = currentTerm.termYears;
    const marketRate = (await this.marketRateService.getMarketRate(termType, termYears)) ?? 0.05;

    // Get renewal status for penalty estimate
    const renewalStatus = await this.renewalService.getRenewalStatus(mortgageId);

    return {
      stayWithCurrentLender: {
        estimatedRate: marketRate * 100, // Return as percentage
        estimatedPenalty: renewalStatus?.estimatedPenalty?.amount || 0,
      },
      switchLender: {
        estimatedRate: marketRate * 100, // Return as percentage
        estimatedPenalty: renewalStatus?.estimatedPenalty?.amount || 0,
        estimatedClosingCosts: 1500, // Default estimate
      },
    };
  }

  /**
   * Get negotiation history for a mortgage
   */
  async getNegotiationHistory(
    mortgageId: string,
    userId: string
  ): Promise<any[] | undefined> {
    const mortgage = await this.authorizeMortgage(mortgageId, userId);
    if (!mortgage) {
      return undefined;
    }

    return this.renewalNegotiations.findByMortgageId(mortgageId);
  }
}

