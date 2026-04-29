/**
 * Utility per la normalizzazione e comparazione delle date
 * provenienti dai listini ADM o salvate nel sistema.
 */

/**
 * Trasforma una stringa data in un numero YYYYMMDD per comparazioni veloci.
 * Supporta formati: YYYY-MM-DD (ISO) e DD/MM/YYYY (ADM).
 */
export const parseDateToComparableNumber = (dateStr: string): number => {
  if (!dateStr) return 0;
  
  // Gestione formato YYYY-MM-DD (ISO/Firestore)
  if (dateStr.includes('-')) {
    return parseInt(dateStr.replace(/-/g, ''));
  }
  
  // Gestione formato DD/MM/YYYY (Listini ADM)
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    // Riordiniamo in YYYYMMDD
    return parseInt(`${parts[2]}${parts[1]}${parts[0]}`);
  }
  
  return 0;
};

/**
 * Verifica se la nuova data è più recente della corrente.
 */
export const isDateNewer = (newDate: string, currentDate: string): boolean => {
  return parseDateToComparableNumber(newDate) > parseDateToComparableNumber(currentDate);
};

/**
 * Converte una stringa data (ISO o ADM) nel formato di visualizzazione DD/MM/YYYY.
 */
export const formatToDisplayDate = (dateStr: string | undefined): string => {
  if (!dateStr) return 'N/D';
  
  // Se è già DD/MM/YYYY
  if (dateStr.includes('/') && dateStr.split('/').length === 3) {
    return dateStr;
  }
  
  // Se è YYYY-MM-DD
  if (dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-'); // Gestisce anche ISO con tempo
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  
  return dateStr;
};
