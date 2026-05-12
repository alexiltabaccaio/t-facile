import { ParsedProduct } from '@/entities/product/lib/syncUtils';

/**
 * Extracts a date from a filename following the pattern _DDMMYY.
 * Example: "file_200524.pdf" -> "2024-05-20"
 */
export const extractDateFromFilename = (fileName: string): string | null => {
  if (fileName.includes('_nodata')) return null;

  const match = fileName.match(/_(\d{2})(\d{2})(\d{2})(?:_|\.pdf$)/);
  if (match) {
    const day = match[1];
    const month = match[2];
    const year = `20${match[3]}`;
    return `${year}-${month}-${day}`;
  }
  return null;
};

/**
 * Validates and normalizes an update date to ISO format YYYY-MM-DD.
 * Returns empty string if invalid.
 */
export const normalizeUpdateDate = (date: string | null): string => {
  if (!date || date === "Non disponibile" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return "";
  }
  return date;
};

/**
 * Merges products extracted in the same session, de-duplicating by code.
 * If code is missing, products are kept separate.
 */
export const mergeSessionProducts = (products: ParsedProduct[]): ParsedProduct[] => {
  const mergedMap = new Map<string, ParsedProduct>();
  let noCodeCounter = 0;

  products.forEach(p => {
    const code = p.code ? p.code.trim() : "";
    if (code) {
      const existing = mergedMap.get(code);
      mergedMap.set(code, existing ? { ...existing, ...p } : p);
    } else {
      noCodeCounter++;
      mergedMap.set(`NO_CODE_${noCodeCounter}`, { ...p, code: "" });
    }
  });

  return Array.from(mergedMap.values());
};
