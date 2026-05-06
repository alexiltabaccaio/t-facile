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
 * Converts a date string (ISO or ADM) to the display format DD-MM-YYYY.
 */
export const formatToDisplayDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/D';
  
  try {
    // Check if it's already an ISO string with time or just date
    // Extract just the date part if it has a T
    const datePart = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    
    // If it is DD/MM/YYYY or DD-MM-YYYY
    if (datePart.includes('/')) {
      const parts = datePart.split('/');
      if (parts.length === 3) {
        return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
      }
    }
    
    // If it is YYYY-MM-DD
    if (datePart.includes('-')) {
      const parts = datePart.split('-'); 
      if (parts.length === 3) {
        // If first part is YYYY (length 4)
        if (parts[0].length === 4) {
          return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
        }
        // If it's already DD-MM-YYYY
        return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
      }
    }
    
    // Fallback if we can parse it as a valid date
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
  } catch (e) {
    console.error('Error formatting date:', e);
  }
  
  return dateStr;
};
