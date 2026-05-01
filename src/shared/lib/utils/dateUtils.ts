/**
 * Utilities for normalization and comparison of dates
 * from ADM price lists or saved in the system.
 */

/**
 * Transforms a date string into a YYYYMMDD number for fast comparisons.
 * Supports formats: YYYY-MM-DD (ISO) and DD/MM/YYYY (ADM).
 */
export const parseDateToComparableNumber = (dateStr: string): number => {
  if (!dateStr) return 0;
  
  // Handle YYYY-MM-DD format (ISO/Firestore)
  if (dateStr.includes('-')) {
    return parseInt(dateStr.replace(/-/g, ''));
  }
  
  // Handle DD/MM/YYYY format (ADM price lists)
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    // Reorder to YYYYMMDD
    return parseInt(`${parts[2]}${parts[1]}${parts[0]}`);
  }
  
  return 0;
};

/**
 * Checks if the new date is newer than the current one.
 */
export const isDateNewer = (newDate: string, currentDate: string): boolean => {
  return parseDateToComparableNumber(newDate) > parseDateToComparableNumber(currentDate);
};

/**
 * Converts a date string (ISO or ADM) to the display format DD/MM/YYYY.
 */
export const formatToDisplayDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/D';
  
  // If it is already DD/MM/YYYY
  if (dateStr.includes('/') && dateStr.split('/').length === 3) {
    return dateStr;
  }
  
  // If it is YYYY-MM-DD
  if (dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-'); // Handles ISO with time as well
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  
  return dateStr;
};
