/**
 * Utilities for ADM file naming conventions.
 * Aligns generated filenames with the standards in /data folder.
 */

/**
 * Maps original ADM categories to compact slugs used in filenames.
 */
export const getCategorySlug = (category: string): string => {
  const c = category.toLowerCase();
  if (c.includes('fiuto') || c.includes('mastico')) return 'fiutoemastico';
  if (c.includes('trinciati')) return 'trinciati';
  if (c.includes('sigaretti')) return 'sigaretti';
  if (c.includes('sigari')) return 'sigari';
  if (c.includes('sigarette')) return 'sigarette';
  if (c.includes('inalazione') || c.includes('combustione')) return 'nocombustione';
  if (c.includes('variazione') || c.includes('prezzi')) return 'priceChange';
  if (c.includes('altri')) return 'altri';
  return c.replace(/\s+/g, '');
};

/**
 * Formats a date string (DD/MM/YYYY) to compact format (DDMMYY).
 * If date is missing or invalid, returns 'nodata'.
 */
export const formatDateToCompact = (dateStr: string | undefined): string => {
  if (!dateStr || dateStr === 'Non disponibile' || dateStr.toLowerCase() === 'nodata') {
    return 'nodata';
  }

  // Handle DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2].slice(-2);
    return `${day}${month}${year}`;
  }

  // Handle YYYY-MM-DD
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0].slice(-2);
      const month = parts[1];
      const day = parts[2].substring(0, 2);
      return `${day}${month}${year}`;
    }
  }

  return 'nodata';
};
