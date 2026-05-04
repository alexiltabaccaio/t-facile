import { useEffect, useRef } from 'react';
import { testConnection } from '@/shared/api';
import { useCatalogStore, useCatalogActions, catalogService } from '@/entities/product';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook dedicated to the intelligent synchronization of the product catalog.
 * Leverages Caching (Zustand persist) and 1 single global read
 * to minimize Firestore quota consumption.
 */
export const useCatalogSync = () => {
  const { 
    lastUpdateDate: persistedDate,
    lastSyncId: persistedSyncId,
    products: persistedProducts
  } = useCatalogStore(useShallow(state => ({
    lastUpdateDate: state.lastUpdateDate,
    lastSyncId: state.lastSyncId,
    products: state.products
  })));
  const {
    setProducts, 
    setIsOnline, 
    setSyncError, 
    setLastUpdateDate, 
    setCategoryDates,
    setIsInitialLoading,
    setLastSyncId
  } = useCatalogActions();

  const isFetchingRef = useRef(false);
  const hasLoggedBotRef = useRef(false);
  const stateRef = useRef({ persistedDate, persistedSyncId, productsCount: persistedProducts?.length || 0 });
  
  useEffect(() => {
    stateRef.current = { 
      persistedDate, 
      persistedSyncId, 
      productsCount: persistedProducts?.length || 0 
    };
  }, [persistedDate, persistedSyncId, persistedProducts]);

  useEffect(() => {
    // 1. Initial connection test
    testConnection();

    // If we already have local data at startup, the interface can unlock immediately
    if (persistedProducts && persistedProducts.length > 0) {
      setIsInitialLoading(false);
      setIsOnline(true);
    }

    // 2. Lightweight Synchronization using the service
    const unsubscribeConfig = catalogService.subscribeToConfig(
      async (config) => {
        setIsOnline(true);
        setSyncError(null);

        const serverUpdateDate = config.lastUpdateDate;
        const serverSyncId = config.syncId;
        const totalChunks = config.totalChunks;
        
        const { persistedDate: pDate, persistedSyncId: pSyncId, productsCount } = stateRef.current;


        const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(navigator.userAgent);

        if (serverUpdateDate || totalChunks > 0) {
          if (serverUpdateDate) setLastUpdateDate(serverUpdateDate);
          if (config.categoryDates) setCategoryDates(config.categoryDates);
          
          const shouldSync = (serverUpdateDate && serverUpdateDate !== pDate) || 
                             serverSyncId !== pSyncId || 
                             productsCount === 0;

          if (shouldSync && totalChunks > 0) {
            if (isBot) {
              if (!hasLoggedBotRef.current) {
                hasLoggedBotRef.current = true;
                console.info("[useCatalogSync] Bot detected, skipping heavy sync to save quota.");
                catalogService.logBotActivity(navigator.userAgent);
              }
              setIsInitialLoading(false);
              setIsOnline(true);
              return;
            }

            if (isFetchingRef.current) return;
            isFetchingRef.current = true;
            setIsInitialLoading(true);

            try {
              console.log("[useCatalogSync] Update detected. Downloading via service...");
              const products = await catalogService.fetchCatalogInChunks(totalChunks);
              
              if (products.length > 0) {
                console.log(`[useCatalogSync] Synchronization complete: ${products.length} products.`);
                setLastSyncId(serverSyncId);
                setProducts(products);
                setIsOnline(true);
                setSyncError(null);
              } else {
                console.error("[useCatalogSync] No products found in downloaded chunks.");
                setSyncError("Errore integrità dati: i cataloghi risultano vuoti.");
              }
            } catch (error: any) {
              console.error("[useCatalogSync] Error during chunk fetch:", error);
              setSyncError("Errore di sincronizzazione dati.");
            } finally {
               setIsInitialLoading(false);
               isFetchingRef.current = false;
            }
          } else {
            console.log("[useCatalogSync] Local Cache already up to date.");
            setIsInitialLoading(false);
            setIsOnline(true);
          }
        } else {
          setIsInitialLoading(false);
          setIsOnline(true);
        }
      },
      (err) => {
        console.error("[useCatalogSync] Firestore connection error:", err);
        setIsOnline(false);
        setIsInitialLoading(false);
        setSyncError("Connessione assente o limitata.");
      }
    );

    return () => {
      unsubscribeConfig();
    };
  }, [setProducts, setIsOnline, setSyncError, setLastUpdateDate, setIsInitialLoading, setLastSyncId]);
};

