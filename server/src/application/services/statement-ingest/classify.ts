import type { DocumentType } from "@shared/mortgage-ledger";
import { PdfExtractError, type PositionedItem } from "./pdf-items";
import { normalizeLabel } from "./geometry";

export function classifyRbcDocument(items: PositionedItem[]): DocumentType {
  const blob = items.map((item) => normalizeLabel(item.str)).join("\n");

  if (blob.includes("(06/19)") && blob.includes("homeline plan")) {
    return "homeline_monthly";
  }
  if (blob.includes("cd 2402") || blob.includes("cd 2403")) {
    return "cost_of_borrowing";
  }
  if (blob.includes("sm 3001") && blob.includes("annual mortgage statement")) {
    return "annual_statement";
  }

  throw new PdfExtractError("unknown fingerprint");
}
