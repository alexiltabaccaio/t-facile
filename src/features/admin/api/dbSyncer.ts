import { productRepository } from '@/shared/api';
import { Product } from '@/entities/product';
import { ParsedPDFResult } from './pdfAnalyzer';
import { isDateNewer, chunkArray } from '@/shared/lib';
import { mergeParsedCatalog, calculateNextCategoryDates } from '../lib/catalogMergeUtils';
import { formatHistoryEntry } from '../lib/syncHistoryUtils';

export const saveParsedDataToFirestore = async (
  parsedData: ParsedPDFResult,
  currentLastUpdateDate: string,
  existingProducts: Product[],
  existingCategoryDates: Record<string, string> = {}
): Promise<{ finalDate: string }> => {
  
  const isNewer = isDateNewer(parsedData.updateDate, currentLastUpdateDate);
  const finalDateToSave = isNewer ? parsedData.updateDate : currentLastUpdateDate;

  // 1. Merge catalog and calculate stats
  const { 
    mergedProducts, 
    stats, 
    allVariations, 
    updatedCategories 
  } = mergeParsedCatalog(parsedData, existingProducts);

  // 2. Split catalog into chunks for Firestore
  const CHUNK_SIZE = 1500;
  const chunkedData = chunkArray(mergedProducts, CHUNK_SIZE);
  const chunks = chunkedData.map(chunk => JSON.stringify(chunk));

  // 3. Update category dates
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

  // 4. Prepare history entry
  const historyEntry = formatHistoryEntry(parsedData.updateDate, stats, allVariations);

  // 5. Save everything via Repository
  await productRepository.saveCatalogSync({
    chunks,
    config: syncConfig,
    historyEntry
  });

  return { finalDate: finalDateToSave };
};

