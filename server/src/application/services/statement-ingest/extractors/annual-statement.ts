import {
  annualStatementFactsSchema,
  type AnnualStatementFacts,
} from "@shared/statement-facts";
import { PdfExtractError } from "../pdf-items";
import {
  findByIncludes,
  isMoneyItem,
  nearestRight,
  parseLongDate,
  parseMoney,
  type PositionedItem,
} from "../geometry";

function moneyOnSameItemOrRight(items: PositionedItem[], needle: string): string | undefined {
  const label = findByIncludes(items, needle);
  if (!label) return undefined;
  return parseMoney(label.str) ?? parseMoney(nearestRight(items, label, isMoneyItem)?.str ?? "");
}

export function extractAnnualStatement(items: PositionedItem[]): AnnualStatementFacts {
  const header = findByIncludes(items, "For January");
  const statementAsOf = header
    ? parseLongDate(header.str.slice(header.str.lastIndexOf("-") + 1))
    : parseLongDate(findByIncludes(items, "December 31")?.str ?? "");

  const iadItem = findByIncludes(items, "Your Interest Adjustment Date is");
  const interestAdjustmentDate = iadItem
    ? parseLongDate(iadItem.str)
    : undefined;
  const lumpSumItem = findByIncludes(items, "The amount that you can pay each year is");
  const lumpSumRoom = lumpSumItem ? parseMoney(lumpSumItem.str) : undefined;
  const skipAPaymentYtd = moneyOnSameItemOrRight(items, "Skip-a-Payment");
  const arrearsLabel = findByIncludes(items, "Interest in Arrears");
  const interestInArrears = arrearsLabel
    ? parseMoney(nearestRight(items, arrearsLabel, isMoneyItem)?.str ?? "")
    : undefined;
  const accruedLabel = findByIncludes(items, "Accrued Interest");
  const accruedInterest = accruedLabel
    ? parseMoney(nearestRight(items, accruedLabel, isMoneyItem)?.str ?? "")
    : undefined;
  const switchItem = findByIncludes(items, "Switch out Fee");
  const dischargeItem = findByIncludes(items, "Discharge Fee");

  if (!statementAsOf || !interestAdjustmentDate || !lumpSumRoom || skipAPaymentYtd == null) {
    throw new PdfExtractError("Annual statement privilege fields were not found");
  }

  return annualStatementFactsSchema.parse({
    documentType: "annual_statement",
    statementPeriod: statementAsOf.slice(0, 7),
    statementAsOf,
    interestAdjustmentDate,
    lumpSumRoom,
    annualLumpSumLimitPercent: 10,
    skipAPaymentYtd,
    interestInArrears,
    accruedInterest,
    penaltyMethod: items.some((item) => /3 months/i.test(item.str))
      ? "3_month_interest"
      : undefined,
    switchOutFee: switchItem ? parseMoney(switchItem.str) : undefined,
    dischargeFee: dischargeItem ? parseMoney(dischargeItem.str) : undefined,
  });
}
