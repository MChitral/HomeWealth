import type { Mortgage } from "@shared/schema";
import {
  MortgagesRepository,
  MortgageTermsRepository,
  MortgagePaymentsRepository,
} from "@infrastructure/repositories";
import type { MortgageCreateInput, MortgageUpdateInput } from "@domain/models";
import { db } from "@infrastructure/db/connection";
import { validateMortgage, validateAmortizationPeriod, validateLTV } from "@domain/validations/mortgage-validation";

export class MortgageService {
  constructor(
    private readonly mortgages: MortgagesRepository,
    private readonly mortgageTerms: MortgageTermsRepository,
    private readonly mortgagePayments: MortgagePaymentsRepository
  ) {}

  listByUserId(userId: string): Promise<Mortgage[]> {
    return this.mortgages.findByUserId(userId);
  }

  findAll(): Promise<Mortgage[]> {
    return this.mortgages.findAll();
  }

  async getByIdForUser(id: string, userId: string): Promise<Mortgage | undefined> {
    const mortgage = await this.mortgages.findById(id);
    if (!mortgage || mortgage.userId !== userId) {
      return undefined;
    }
    return mortgage;
  }

  async create(userId: string, payload: Omit<MortgageCreateInput, "userId">): Promise<Mortgage> {
    // Validate amortization period
    const amortizationValidation = validateAmortizationPeriod(
      payload.amortizationYears,
      payload.amortizationMonths || 0,
      payload.isHighRatio === 1 || payload.isHighRatio === true
    );
    
    if (!amortizationValidation.valid) {
      throw new Error(amortizationValidation.errors.join("; "));
    }
    
    // Validate LTV
    const ltvValidation = validateLTV(
      Number(payload.originalAmount),
      Number(payload.propertyPrice),
      payload.isHighRatio === 1 || payload.isHighRatio === true
    );
    
    if (!ltvValidation.valid) {
      throw new Error(ltvValidation.errors.join("; "));
    }
    
    return this.mortgages.create({
      ...payload,
      userId,
    });
  }

  async update(
    id: string,
    userId: string,
    payload: Partial<Omit<MortgageUpdateInput, "userId">>
  ): Promise<Mortgage | undefined> {
    const mortgage = await this.getByIdForUser(id, userId);
    if (!mortgage) {
      return undefined;
    }
    
    // Validate amortization if being updated
    if (payload.amortizationYears !== undefined || payload.amortizationMonths !== undefined) {
      const amortizationValidation = validateAmortizationPeriod(
        payload.amortizationYears ?? mortgage.amortizationYears,
        payload.amortizationMonths ?? mortgage.amortizationMonths ?? 0,
        (payload.isHighRatio ?? mortgage.isHighRatio) === 1 || (payload.isHighRatio ?? mortgage.isHighRatio) === true
      );
      
      if (!amortizationValidation.valid) {
        throw new Error(amortizationValidation.errors.join("; "));
      }
    }
    
    // Validate LTV if being updated
    if (payload.originalAmount !== undefined || payload.propertyPrice !== undefined) {
      const ltvValidation = validateLTV(
        Number(payload.originalAmount ?? mortgage.originalAmount),
        Number(payload.propertyPrice ?? mortgage.propertyPrice),
        (payload.isHighRatio ?? mortgage.isHighRatio) === 1 || (payload.isHighRatio ?? mortgage.isHighRatio) === true
      );
      
      if (!ltvValidation.valid) {
        throw new Error(ltvValidation.errors.join("; "));
      }
    }
    
    return this.mortgages.update(id, payload);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const mortgage = await this.getByIdForUser(id, userId);
    if (!mortgage) {
      return false;
    }

    // Use transaction to ensure all-or-nothing deletion
    // If any deletion fails, all changes are rolled back
    return await db.transaction(async (tx) => {
      // Delete child records first (payments, then terms)
      await this.mortgagePayments.deleteByMortgageId(id, tx);
      await this.mortgageTerms.deleteByMortgageId(id, tx);

      // Finally delete the mortgage itself
      const deleted = await this.mortgages.delete(id, tx);

      if (!deleted) {
        throw new Error("Failed to delete mortgage");
      }

      return true;
    });
  }
}
