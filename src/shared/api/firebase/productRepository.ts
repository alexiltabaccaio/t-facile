import { 
  doc, 
  getDoc, 
  onSnapshot, 
  writeBatch, 
  serverTimestamp,
  collection,
  FirestoreError
} from 'firebase/firestore';
import { db } from './firebase';
import { CatalogConfig, UpdateHistoryEntry } from './types';

export const productRepository = {
  /**
   * Retrieves the global configuration
   */
  getGlobalConfig: async (): Promise<CatalogConfig | null> => {
    const configDoc = await getDoc(doc(db, 'system', 'config'));
    if (configDoc.exists()) {
      const data = configDoc.data();
      return {
        lastUpdateDate: data.lastUpdateDate || '',
        categoryDates: data.categoryDates || {},
        syncId: data.syncId || 0,
        totalChunks: data.totalChunks || 0
      };
    }
    return null;
  },

  /**
   * Updates the global configuration
   */
  updateGlobalConfig: async (config: Partial<CatalogConfig>) => {
    const configRef = doc(db, 'system', 'config');
    await writeBatch(db).set(configRef, config, { merge: true }).commit();
  },

  /**
   * Subscription to the global catalog configuration
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
   * Retrieves a catalog chunk
   */
  fetchCatalogChunk: async (chunkIndex: number): Promise<string | null> => {
    const chunkDoc = await getDoc(doc(db, 'system', `catalog_chunk_${chunkIndex}`));
    if (chunkDoc.exists()) {
      return chunkDoc.data().data || null;
    }
    return null;
  },

  /**
   * Saves the catalog synchronization in batch
   */
  saveCatalogSync: async (params: {
    chunks: string[];
    config: CatalogConfig;
    historyEntry?: UpdateHistoryEntry;
  }) => {
    const batch = writeBatch(db);
    
    // 1. Save chunks
    params.chunks.forEach((chunkData, i) => {
      const chunkRef = doc(db, 'system', `catalog_chunk_${i}`);
      batch.set(chunkRef, {
        data: chunkData,
        updatedAt: serverTimestamp()
      });
    });

    // 2. Update global configuration
    const configRef = doc(db, 'system', 'config');
    batch.set(configRef, params.config, { merge: true });

    // 3. Save history if present
    if (params.historyEntry) {
      const historyRef = doc(collection(db, 'update_history'));
      batch.set(historyRef, {
        ...params.historyEntry,
        id: historyRef.id,
        timestamp: serverTimestamp()
      });
    }

    await batch.commit();
  },

  /**
   * Executes a generic batch update
   */
  executeBatch: async (action: (batch: { 
    update: (path: string[], data: any) => void;
    set: (path: string[], data: any, options?: any) => void;
    delete: (path: string[]) => void;
  }) => void) => {
    const batch = writeBatch(db);
    action({
      update: (path: string[], data: any) => {
        const ref = doc(db, path[0], ...path.slice(1));
        batch.update(ref, data);
      },
      set: (path: string[], data: any, options?: any) => {
        const ref = doc(db, path[0], ...path.slice(1));
        batch.set(ref, data, options);
      },
      delete: (path: string[]) => {
        const ref = doc(db, path[0], ...path.slice(1));
        batch.delete(ref);
      }
    });
    await batch.commit();
  }
};
