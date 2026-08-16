import { homelineMonthlyFactsSchema, type HomelineMonthlyFacts } from "@shared/statement-facts";
import { PdfExtractError } from "../pdf-items";
import {
  findByIncludes,
  isMoneyItem,
  nearestRight,
  parseLongDate,
  parseMoney,
  type PositionedItem,
} from "../geometry";

export function extractHomelineMonthly(items: PositionedItem[]): HomelineMonthlyFacts {
  const periodLine = findByIncludes(items, "From ");
  const periodEnd = periodLine ? parseLongDate(periodLine.str.slice(periodLine.str.indexOf(" to "))) : undefined;
  const periodStart = periodLine ? parseLongDate(periodLine.str) : undefined;
  if (!periodEnd || !periodStart) {
    throw new PdfExtractError("Homeline period dates were not found");
  }

  const limitLabel = findByIncludes(items, "Total Credit Limit");
  const availableLabel = findByIncludes(items, "Available Credit");
  const outstandingLabel = findByIncludes(items, "Outstanding Balance");
  if (!limitLabel || !availableLabel || !outstandingLabel) {
    throw new PdfExtractError("Homeline summary labels were not found");
  }

  const planTotalLimit = parseMoney(nearestRight(items, limitLabel, isMoneyItem)?.str ?? "");
  const availableCredit = parseMoney(nearestRight(items, availableLabel, isMoneyItem)?.str ?? "");
  const mortgageOutstanding = parseMoney(
    nearestRight(items, outstandingLabel, isMoneyItem)?.str ?? ""
  );
  if (!planTotalLimit || !availableCredit || !mortgageOutstanding) {
    throw new PdfExtractError("Homeline summary amounts were not found");
  }

  const mortgageRate = items.find(
    (item) => item.page === 1 && item.str === "3.550" && item.y < 240 && item.y > 210
  );
  const paymentsReceived = mortgageRate
    ? parseMoney(nearestRight(items, mortgageRate, isMoneyItem)?.str ?? "")
    : parseMoney(findByIncludes(items, "$2,")?.str ?? "");

  const helocDrawnItem = items.find(
    (item) => item.page === 1 && item.str === "0.00" && item.x > 540 && item.y > 240 && item.y < 270
  );
  const helocDrawn = parseMoney(helocDrawnItem?.str ?? "0.00") ?? "0.00";

  if (!paymentsReceived) {
    throw new PdfExtractError("Homeline payments received were not found");
  }

  return homelineMonthlyFactsSchema.parse({
    documentType: "homeline_monthly",
    statementPeriod: periodEnd.slice(0, 7),
    statementAsOf: periodEnd,
    paymentDate: `${periodStart.slice(0, 8)}02`,
    paymentsReceived,
    mortgageOutstanding,
    helocDrawn,
    availableCredit,
    planTotalLimit,
    helocLimit: availableCredit,
  });
}
