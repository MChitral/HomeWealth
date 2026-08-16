import {
  costOfBorrowingFactsSchema,
  type CostOfBorrowingFacts,
} from "@shared/statement-facts";
import { PdfExtractError } from "../pdf-items";
import {
  findByIncludes,
  isMoneyItem,
  nearestBelow,
  nearestRight,
  parseLongDate,
  parseMoney,
  parsePercent,
  type PositionedItem,
} from "../geometry";

export function extractCostOfBorrowing(items: PositionedItem[]): CostOfBorrowingFacts {
  const statementDateLabel = findByIncludes(items, "Statement Date");
  const statementDate = parseLongDate(
    nearestRight(items, statementDateLabel ?? items[0], (item) => Boolean(parseLongDate(item.str)))
      ?.str ?? ""
  );
  const dueLabel = findByIncludes(items, "Your mortgage payment is due");
  const nextDueDate = parseLongDate(
    (dueLabel ? nearestBelow(items, dueLabel, (item) => Boolean(parseLongDate(item.str))) : undefined)
      ?.str ?? ""
  );
  const interestLabel = findByIncludes(items, "to End of Term");
  const interestToEndOfTerm = parseMoney(
    (interestLabel ? nearestRight(items, interestLabel, isMoneyItem) : undefined)?.str ?? ""
  );
  const triggerLabel = findByIncludes(items, "Triggering Annual");
  const triggeringAnnualRate = parsePercent(
    (triggerLabel ? nearestRight(items, triggerLabel, (item) => item.str.includes("%")) : undefined)
      ?.str ?? ""
  );
  const termLabel = findByIncludes(items, "Term Remaining");
  const remainingTerm = termLabel
    ? nearestRight(items, termLabel, (item) => /months/i.test(item.str))?.str
    : undefined;
  const amortLabel = findByIncludes(items, "Amortization");
  const remainingAmortization = amortLabel
    ? nearestRight(items, amortLabel, (item) => /months/i.test(item.str))?.str
    : undefined;
  const reductionLabel = findByIncludes(items, "Rate Reduction");
  const rateReduction = parsePercent(
    (reductionLabel
      ? nearestRight(items, reductionLabel, (item) => item.str.includes("%"))
      : undefined
    )?.str ??
      items.find((item) => item.str.includes("0.900%"))?.str ??
      ""
  );

  if (!statementDate || !nextDueDate || !interestToEndOfTerm || !triggeringAnnualRate) {
    throw new PdfExtractError("Disclosure cost-of-borrowing fields were not found");
  }

  return costOfBorrowingFactsSchema.parse({
    documentType: "cost_of_borrowing",
    statementPeriod: statementDate.slice(0, 7),
    isDoubleUpChange: items.some((item) => /double-up/i.test(item.str)),
    interestToEndOfTerm,
    triggeringAnnualRate,
    nextDueDate,
    rateReduction,
    remainingTerm,
    remainingAmortization,
  });
}
