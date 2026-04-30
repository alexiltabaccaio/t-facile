import { 
  doc, 
  getDoc, 
  onSnapshot, 
  FirestoreError
} from 'firebase/firestore';
import { db } from '@/shared/api';
import { Product } from '../model/types';
import { parseLegacyPackageInfo } from '@/features/catalog/lib/productMapper';

export interface CatalogConfig {
  lastUpdateDate: string;
  categoryDates?: Record<string, string>;
  syncId: number;
  totalChunks: number;
}

export const catalogService = {
  /**
   * Sottoscrizione alla configurazione globale del catalogo (data ultimo aggiornamento e syncId)
   */
  subscribeToConfig: (
    onUpdate: (config: CatalogConfig) => void,
    onError: (error: FirestoreError) => void
  ) => {
    const configRef = doc(db, 'system', 'config');
    return onSnapshot(
      configRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onUpdate({
            lastUpdateDate: data.lastUpdateDate || '',
            categoryDates: data.categoryDates || {},
            syncId: data.syncId || 0,
            totalChunks: data.totalChunks || 0
          });
        }
      },
      onError
    );
  },

  /**
   * Scarica i prodotti dal database divisi per chunk
   */
  fetchCatalogInChunks: async (totalChunks: number): Promise<Product[]> => {
    const rawArray: any[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = `catalog_chunk_${i}`;
      const chunkDoc = await getDoc(doc(db, 'system', chunkPath));
      
      if (chunkDoc.exists()) {
        const chunkData = chunkDoc.data();
        if (chunkData.data) {
          try {
            const parsedChunk = JSON.parse(chunkData.data) as any[];
            rawArray.push(...parsedChunk);
          } catch (parseErr) {
            console.error(`Error parsing JSON in chunk ${i}:`, parseErr);
          }
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

