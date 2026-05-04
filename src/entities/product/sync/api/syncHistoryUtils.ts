import { UpdateHistoryEntry } from '@/shared/api';

export interface SyncStats {
  new: number;
  price: number;
  status: number;
  emissions: number;
}

/**
 * Generates a history entry for the catalog update.
 * Returns undefined if there are no variations to report.
 * 
 * @param updateDate The date detected in the price list
 * @param stats Statistics of the changes
 * @param variations List of all detected variations
 * @returns An UpdateHistoryEntry object or undefined
 */
export const formatHistoryEntry = (
  updateDate: string,
  stats: SyncStats,
  variations: string[]
): UpdateHistoryEntry | undefined => {
  if (variations.length === 0) return undefined;

  const displayDate = updateDate && updateDate !== "Not available" 
    ? updateDate 
    : "recent (date not detected)";

  return {
    title: `ADM Price List Update (${displayDate})`,
    date: displayDate,
    stats,
    // Limit variations to prevent huge document size in Firestore
    variations: variations.slice(0, 500),
    read: false
  };
};
