export const INTEREST_ACCRUAL_BASES = ["canadian-semi-annual", "actual-365"] as const;
export type InterestAccrualBasis = (typeof INTEREST_ACCRUAL_BASES)[number];

export const PAYMENT_CALCULATION_SOURCES = ["calculated", "statement"] as const;
export type PaymentCalculationSource = (typeof PAYMENT_CALCULATION_SOURCES)[number];

export const DOCUMENT_TYPES = [
  "homeline_monthly",
  "cost_of_borrowing",
  "annual_statement",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const STAGED_IMPORT_STATUSES = [
  "staged",
  "confirmed",
  "rejected",
  "failed",
  "superseded",
] as const;
export type StagedImportStatus = (typeof STAGED_IMPORT_STATUSES)[number];

export const PRIVILEGE_TYPES = [
  "lump_sum",
  "double_up",
  "payment_increase",
  "skip_a_payment",
  "frequency",
] as const;
export type PrivilegeType = (typeof PRIVILEGE_TYPES)[number];

export const SNAPSHOT_STATUSES = ["active", "retracted"] as const;
export type SnapshotStatus = (typeof SNAPSHOT_STATUSES)[number];

export const STATEMENT_PERIOD_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
