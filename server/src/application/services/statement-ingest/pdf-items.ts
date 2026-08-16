import { extractTextItems, getDocumentProxy, type StructuredTextItem } from "unpdf";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const PARSE_TIMEOUT_MS = 15_000;
const MAX_PAGES = 12;

export type PositionedItem = StructuredTextItem & { page: number };

export class PdfExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfExtractError";
  }
}

export function assertPdfBuffer(bytes: Uint8Array): Uint8Array {
  if (bytes.byteLength > MAX_PDF_BYTES) {
    throw new PdfExtractError("PDF is too large (max 10 MB)");
  }
  const header = Buffer.from(bytes.subarray(0, 5)).toString("ascii");
  if (header !== "%PDF-") {
    throw new PdfExtractError("File is not a PDF (%PDF- magic missing)");
  }
  return new Uint8Array(bytes);
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new PdfExtractError("PDF parse timed out")), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function loadPositionedItems(bytes: Uint8Array): Promise<PositionedItem[]> {
  const copy = assertPdfBuffer(bytes);
  try {
    const pdf = await withTimeout(getDocumentProxy(copy), PARSE_TIMEOUT_MS);
    if (pdf.numPages > MAX_PAGES) {
      throw new PdfExtractError("PDF has too many pages");
    }
    const { items } = await withTimeout(extractTextItems(pdf), PARSE_TIMEOUT_MS);
    const positioned: PositionedItem[] = [];
    for (const [pageIndex, pageItems] of items.entries()) {
      for (const item of pageItems) {
        if (!item.str.trim()) continue;
        positioned.push({ ...item, page: pageIndex + 1 });
      }
    }
    if (positioned.length === 0) {
      throw new PdfExtractError("empty text layer or unknown fingerprint");
    }
    return positioned;
  } catch (error) {
    if (error instanceof PdfExtractError) throw error;
    throw new PdfExtractError("unknown fingerprint: unreadable or unsupported PDF");
  }
}
