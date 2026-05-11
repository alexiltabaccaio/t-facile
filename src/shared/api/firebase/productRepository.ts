import { 
  doc, 
  getDoc, 
  getDocs,
  onSnapshot, 
  writeBatch, 
  serverTimestamp,
  collection,
  query,
  where,
  deleteDoc,
  addDoc,
  FirestoreError
} from 'firebase/firestore';
import { db } from './firebase';
import { CatalogConfig, UpdateHistoryEntry, ScheduledUpdate } from './types';

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
    // Automatically create a backup of current state before overwriting
    try {
      await productRepository.createCatalogBackup();
    } catch (err) {
      console.warn("Failed to create backup before sync, proceeding anyway:", err);
    }

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
    update: (path: string[], data: Record<string, unknown>) => void;
    set: (path: string[], data: Record<string, unknown>, options?: { merge?: boolean }) => void;
    delete: (path: string[]) => void;
  }) => void) => {
    const batch = writeBatch(db);
    action({
      update: (path, data) => {
        const ref = doc(db, path[0], ...path.slice(1));
        // @ts-expect-error - Firestore update expects specific nested types that are hard to satisfy with generic data
        batch.update(ref, data); 
      },
      set: (path, data, options) => {
        const ref = doc(db, path[0], ...path.slice(1));
        batch.set(ref, data, options || {});
      },
      delete: (path: string[]) => {
        const ref = doc(db, path[0], ...path.slice(1));
        batch.delete(ref);
      }
    });
    await batch.commit();
  },

  /**
   * Logs bot/crawler detection activity for monitoring
   */
  logBotActivity: async (userAgent: string) => {
    try {
      const logRef = doc(collection(db, 'bot_logs'));
      await writeBatch(db).set(logRef, {
        userAgent,
        timestamp: serverTimestamp(),
        path: window.location.pathname
      }).commit();
    } catch (err) {
      console.error("Failed to log bot activity:", err);
    }
  },

  /**
   * Saves a scheduled catalog update
   */
  saveScheduledSync: async (params: {
    parsedData: string;
    effectiveDate: string;
    historyEntry?: UpdateHistoryEntry;
  }) => {
    const scheduledRef = collection(db, 'scheduled_updates');
    await addDoc(scheduledRef, {
      ...params,
      createdAt: serverTimestamp()
    });
  },

  /**
   * Fetches all pending scheduled syncs that should be applied
   */
  fetchPendingScheduledSyncs: async (todayStr: string): Promise<ScheduledUpdate[]> => {
    const q = query(
      collection(db, 'scheduled_updates'),
      where('effectiveDate', '<=', todayStr)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...(doc.data() as Omit<ScheduledUpdate, 'id'>),
      id: doc.id
    }));
  },

  /**
   * Deletes a scheduled sync after application
   */
  deleteScheduledSync: async (id: string) => {
    await deleteDoc(doc(db, 'scheduled_updates', id));
  },

  /**
   * Adds a generic history entry (notification)
   */
  addHistoryEntry: async (entry: UpdateHistoryEntry) => {
    const historyRef = collection(db, 'update_history');
    const docRef = doc(historyRef);
    await writeBatch(db).set(docRef, {
      ...entry,
      id: docRef.id,
      timestamp: serverTimestamp()
    }).commit();
  },

  /**
   * Creates a backup of the current catalog
   */
  createCatalogBackup: async () => {
    const batch = writeBatch(db);
    
    // 1. Get current config
    const configDoc = await getDoc(doc(db, 'system', 'config'));
    if (!configDoc.exists()) return;
    const config = configDoc.data();

    // 2. Save config backup
    const backupConfigRef = doc(db, 'system', 'backup_config');
    batch.set(backupConfigRef, {
      ...config,
      backupCreatedAt: serverTimestamp()
    });

    // 3. Save chunks backup
    const totalChunks = config.totalChunks || 0;
    for (let i = 0; i < totalChunks; i++) {
      const chunkDoc = await getDoc(doc(db, 'system', `catalog_chunk_${i}`));
      if (chunkDoc.exists()) {
        const backupChunkRef = doc(db, 'system', `backup_catalog_chunk_${i}`);
        batch.set(backupChunkRef, {
          ...chunkDoc.data(),
          backupCreatedAt: serverTimestamp()
        });
      }
    }

    await batch.commit();
  },

  /**
   * Restores the catalog from the last backup
   */
  restoreCatalogBackup: async () => {
    const batch = writeBatch(db);

    // 1. Get backup config
    const backupConfigDoc = await getDoc(doc(db, 'system', 'backup_config'));
    if (!backupConfigDoc.exists()) throw new Error("Nessun backup trovato.");
    const config = backupConfigDoc.data() as CatalogConfig;
    delete config.backupCreatedAt;

    // 2. Restore main config
    const configRef = doc(db, 'system', 'config');
    batch.set(configRef, config, { merge: true });

    // 3. Restore chunks
    const totalChunks = config.totalChunks || 0;
    for (let i = 0; i < totalChunks; i++) {
      const backupChunkDoc = await getDoc(doc(db, 'system', `backup_catalog_chunk_${i}`));
      if (backupChunkDoc.exists()) {
        const chunkData = backupChunkDoc.data() as { data: string; backupCreatedAt?: unknown };
        delete chunkData.backupCreatedAt;
        
        const chunkRef = doc(db, 'system', `catalog_chunk_${i}`);
        batch.set(chunkRef, chunkData);
      }
    }

    await batch.commit();
  }
};
