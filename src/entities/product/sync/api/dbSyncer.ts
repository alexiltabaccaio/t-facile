import { productRepository } from '@/shared/api';
import { Product } from '../../index';
import { ParsedPDFResult } from './pdfAnalyzer';
import { isDateNewer, chunkArray } from '@/shared/lib';
import { mergeParsedCatalog, calculateNextCategoryDates } from './catalogMergeUtils';
import { formatHistoryEntry } from './syncHistoryUtils';

export const saveParsedDataToFirestore = async (
  parsedData: ParsedPDFResult,
  currentLastUpdateDate: string,
  existingProducts: Product[],
  existingCategoryDates: Record<string, string> = {},
  effectiveDate?: string,
  skipNotifications?: boolean,
  isDeltaUpdate?: boolean
): Promise<{ finalDate: string }> => {
  
  const isNewer = isDateNewer(parsedData.updateDate, currentLastUpdateDate);
  const finalDateToSave = isNewer ? parsedData.updateDate : currentLastUpdateDate;

  // 1. Merge catalog and calculate stats
  const { 
    mergedProducts, 
    stats, 
    allVariations, 
    updatedCategories 
  } = mergeParsedCatalog(parsedData, existingProducts, isDeltaUpdate);

  // 2. Prepare history entry
  const historyEntry = formatHistoryEntry(parsedData.updateDate, stats, allVariations);

  // 3. Logic: Immediate vs Scheduled
  let isScheduled = false;
  let formattedEffectiveDate = effectiveDate;

  if (effectiveDate) {
    // Parse effective date safely regardless of format (YYYY-MM-DD or DD/MM/YYYY)
    let effDateObj: Date;
    if (effectiveDate.includes('/')) {
      const parts = effectiveDate.split('/');
      effDateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      formattedEffectiveDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    } else {
      effDateObj = new Date(effectiveDate);
      formattedEffectiveDate = effectiveDate;
    }

    // Get today's local date at midnight for accurate comparison
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    isScheduled = effDateObj > todayObj;
  }

  if (isScheduled) {
    // SAVE AS SCHEDULED
    const scheduledEntry = historyEntry ? {
      ...historyEntry,
      title: `Imminente: ${historyEntry.title}`,
      summary: `Cambio prezzi previsto per il ${formattedEffectiveDate?.split('-').reverse().join('/')}`,
      type: 'pre-announcement' as any,
      effectiveDate: formattedEffectiveDate
    } : undefined;

    await productRepository.saveScheduledSync({
      parsedData,
      effectiveDate: formattedEffectiveDate!,
      historyEntry: scheduledEntry
    });

    // Also add the notification immediately
    if (scheduledEntry && !skipNotifications) {
      await productRepository.addHistoryEntry(scheduledEntry);
    }

    return { finalDate: currentLastUpdateDate }; // Catalog date doesn't change yet
  }

  // SAVE AS IMMEDIATE (Actual logic)
  // 4. Split catalog into chunks for Firestore
  const CHUNK_SIZE = 1500;
  const chunkedData = chunkArray(mergedProducts, CHUNK_SIZE);
  const chunks = chunkedData.map(chunk => JSON.stringify(chunk));

  // 5. Update category dates
  const nextCategoryDates = calculateNextCategoryDates(
    updatedCategories,
    parsedData.products,
    parsedData.updateDate,
    existingCategoryDates
  );

  const syncConfig = { 
    totalChunks: chunks.length,
    syncId: Date.now(),
    lastUpdateDate: finalDateToSave,
    categoryDates: nextCategoryDates
  };

  // 6. Save everything via Repository
  await productRepository.saveCatalogSync({
    chunks,
    config: syncConfig,
    historyEntry: skipNotifications ? undefined : historyEntry
  });

  return { finalDate: finalDateToSave };
};

