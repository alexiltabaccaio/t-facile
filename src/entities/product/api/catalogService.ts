import { productRepository, CatalogConfig, DbError } from '@/shared/api';
import { Product } from '../model/types';
import { parseLegacyPackageInfo } from '../lib/productParser';


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
    const rawArray: any[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkData = await productRepository.fetchCatalogChunk(i);
      
      if (chunkData) {
        try {
          const parsedChunk = JSON.parse(chunkData) as any[];
          rawArray.push(...parsedChunk);
        } catch (parseErr) {
          console.error(`Error parsing JSON in chunk ${i}:`, parseErr);
        }
      }
    }

    return rawArray.map(raw => {
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
  }
};

