import type { DocumentType } from "@shared/mortgage-ledger";
import type { StatementFacts } from "@shared/statement-facts";
import { classifyRbcDocument } from "./classify";
import { extractAnnualStatement } from "./extractors/annual-statement";
import { extractCostOfBorrowing } from "./extractors/cost-of-borrowing";
import { extractHomelineMonthly } from "./extractors/homeline-monthly";
import { loadPositionedItems } from "./pdf-items";

export const EXTRACTOR_VERSION = "1";

export type ExtractedRbcDocument = {
  documentType: DocumentType;
  templateId: string;
  extractorVersion: string;
  facts: StatementFacts;
};

const TEMPLATE_IDS: Record<DocumentType, string> = {
  homeline_monthly: "rbc-homeline-0619",
  cost_of_borrowing: "rbc-cd-2402",
  annual_statement: "rbc-sm-3001",
};

export async function extractRbcDocument(bytes: Uint8Array): Promise<ExtractedRbcDocument> {
  const items = await loadPositionedItems(bytes);
  const documentType = classifyRbcDocument(items);
  const facts =
    documentType === "homeline_monthly"
      ? extractHomelineMonthly(items)
      : documentType === "cost_of_borrowing"
        ? extractCostOfBorrowing(items)
        : extractAnnualStatement(items);

  return {
    documentType,
    templateId: TEMPLATE_IDS[documentType],
    extractorVersion: EXTRACTOR_VERSION,
    facts,
  };
}
