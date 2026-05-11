import { productRepository, CatalogConfig, DbError, ScheduledUpdate, UpdateHistoryEntry } from '@/shared/api';
import { Product } from '../model/types';
import { parseLegacyPackageInfo } from '../lib/productParser';
import { mergeParsedCatalog, calculateNextCategoryDates } from '../sync/api/catalogMergeUtils';
import { chunkArray } from '@/shared/lib';
import { formatHistoryEntry } from '../sync/api/syncHistoryUtils';


export const catalogService = {
  /**
   * Subscription to the global catalog configuration (last update date and syncId)
   */
  subscribeToConfig: (
    onUpdate: (config: CatalogConfig) => void,
    onError: (error: DbError) => void
  ) => {
    return productRepository.subscribeToConfig(onUpdate, onError);
  },

  /**
   * Downloads the products from the database divided by chunks
   */
  fetchCatalogInChunks: async (totalChunks: number): Promise<Product[]> => {
    const rawArray: unknown[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkData = await productRepository.fetchCatalogChunk(i);
      
      if (chunkData) {
        try {
          const parsedChunk = JSON.parse(chunkData) as unknown[];
          rawArray.push(...parsedChunk);
        } catch (parseErr) {
          console.error(`Error parsing JSON in chunk ${i}:`, parseErr);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rawArray as any[]).map(raw => {
      const packageInfo = raw.identity?.packageInfo || '';
      const packageData = raw.identity?.package;

      return {
        identity: {
          code: raw.identity?.code || '',
          name: raw.identity?.name || '',
          category: raw.identity?.category || '',
          packageInfo: packageInfo,
          package: packageData || parseLegacyPackageInfo(packageInfo),
          brand: raw.identity?.brand || undefined,
          manufacturer: raw.identity?.manufacturer || undefined,
        },
      pricing: {
        currentPrice: raw.pricing?.currentPrice || 0,
        pricePerKg: raw.pricing?.pricePerKg,
        conventionalPricePerKg: raw.pricing?.conventionalPricePerKg,
        fiscalValuePer1000Pieces: raw.pricing?.fiscalValuePer1000Pieces,
      },
      lifecycle: {
        status: raw.lifecycle?.status,
        retirementDate: raw.lifecycle?.retirementDate || undefined,
        radiationDate: raw.lifecycle?.radiationDate || undefined,
      },
      emissions: raw.emissions ? {
        tar: raw.emissions.tar,
        nicotine: raw.emissions.nicotine,
        co: raw.emissions.co,
      } : undefined
    };
    });
  },

  /**
   * Logs bot activity for auditing
   */
  logBotActivity: async (userAgent: string) => {
    return productRepository.logBotActivity(userAgent);
  },

  /**
   * Fetches pending scheduled updates
   */
  fetchPendingScheduledSyncs: async (todayStr: string) => {
    return productRepository.fetchPendingScheduledSyncs(todayStr);
  },

  /**
   * Applies a scheduled update to the active catalog
   */
  applyScheduledUpdate: async (scheduledUpdate: ScheduledUpdate, existingProducts: Product[], config: CatalogConfig) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedData = JSON.parse(scheduledUpdate.parsedData) as any;
    const { id } = scheduledUpdate;
    
    // 1. Merge
    const { mergedProducts, stats, allVariations, updatedCategories } = mergeParsedCatalog(parsedData, existingProducts);
    
    // 2. Chunks
    const CHUNK_SIZE = 1500;
    const chunkedData = chunkArray(mergedProducts, CHUNK_SIZE);
    const chunks = chunkedData.map(chunk => JSON.stringify(chunk));

    // 3. Category Dates
    const nextCategoryDates = calculateNextCategoryDates(
      updatedCategories,
      parsedData.products,
      parsedData.updateDate,
      config.categoryDates || {}
    );

    // 4. Config
    const syncConfig = {
      ...config,
      syncId: Date.now(),
      lastUpdateDate: parsedData.updateDate, // We assume the news date is the new catalog date
      categoryDates: nextCategoryDates,
      totalChunks: chunks.length
    };

    // 5. History / Notification
    const historyEntry = formatHistoryEntry(parsedData.updateDate, stats, allVariations);
    if (historyEntry) {
      historyEntry.title = `Effettivo: ${historyEntry.title}`;
      historyEntry.summary = "L'aggiornamento programmato è ora attivo nel catalogo.";
      historyEntry.type = 'price' as UpdateHistoryEntry['type'];
    }

    // 6. Save and Delete
    await productRepository.saveCatalogSync({
      chunks,
      config: syncConfig,
      historyEntry
    });

    await productRepository.deleteScheduledSync(id);
    console.log(`[catalogService] Scheduled update ${id} applied and deleted.`);
  }
};

