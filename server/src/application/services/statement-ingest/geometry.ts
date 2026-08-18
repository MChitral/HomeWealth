import type { PositionedItem } from "./pdf-items";

export type { PositionedItem };

const Y_BAND = 12;

export function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/[®™*]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function findByIncludes(
  items: PositionedItem[],
  needle: string,
  page?: number
): PositionedItem | undefined {
  const target = normalizeLabel(needle);
  return items.find(
    (item) =>
      (page == null || item.page === page) && normalizeLabel(item.str).includes(target)
  );
}

export function nearestRight(
  items: PositionedItem[],
  label: PositionedItem,
  matches: (item: PositionedItem) => boolean = () => true
): PositionedItem | undefined {
  return items
    .filter(
      (item) =>
        item.page === label.page &&
        item !== label &&
        item.x > label.x + 6 &&
        Math.abs(item.y - label.y) <= Y_BAND &&
        matches(item)
    )
    .sort((left, right) => left.x - right.x)[0];
}

export function nearestBelow(
  items: PositionedItem[],
  label: PositionedItem,
  matches: (item: PositionedItem) => boolean = () => true
): PositionedItem | undefined {
  return items
    .filter(
      (item) =>
        item.page === label.page &&
        item !== label &&
        item.y < label.y - 2 &&
        Math.abs(item.x - label.x) <= 50 &&
        matches(item)
    )
    .sort((left, right) => right.y - left.y)[0];
}

export function parseMoney(value: string): string | undefined {
  const match = value.replace(/[()]/g, "").match(/-?\$?([\d,]+\.\d{2})/);
  if (!match) return undefined;
  return Number(match[1].replace(/,/g, "")).toFixed(2);
}

export function parsePercent(value: string): string | undefined {
  const match = value.match(/(\d+\.\d{2,3})\s*%/);
  if (!match) return undefined;
  return Number(match[1]).toFixed(3);
}

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

export function parseLongDate(value: string): string | undefined {
  const match = value.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s+(\d{4})\b/i
  );
  if (!match) return undefined;
  const month = MONTHS[match[1].toLowerCase()];
  if (!month) return undefined;
  return `${match[3]}-${month}-${match[2].padStart(2, "0")}`;
}

export function isMoneyItem(item: PositionedItem): boolean {
  return parseMoney(item.str) != null;
}
