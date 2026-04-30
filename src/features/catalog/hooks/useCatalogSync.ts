import { useEffect, useRef } from 'react';
import { testConnection } from '@/shared/api';
import { useCatalogStore, useCatalogActions, catalogService } from '@/entities/product';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook dedicato alla sincronizzazione intelligente del catalogo prodotti.
 * Sfrutta il Caching (Zustand persist) e 1 singola lettura globale
 * per minimizzare il consumo della quota di Firestore.
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
  const stateRef = useRef({ persistedDate, persistedSyncId, productsCount: persistedProducts?.length || 0 });
  
  useEffect(() => {
    stateRef.current = { 
      persistedDate, 
      persistedSyncId, 
      productsCount: persistedProducts?.length || 0 
    };
  }, [persistedDate, persistedSyncId, persistedProducts]);

  useEffect(() => {
    // 1. Test iniziale di connessione
    testConnection();

    // Se abbiamo già dati in locale all'avvio, l'interfaccia può sbloccarsi immediatamente
    if (persistedProducts && persistedProducts.length > 0) {
      setIsInitialLoading(false);
      setIsOnline(true);
    }

    // 2. Sincronizzazione Leggera usando il servizio
    const unsubscribeConfig = catalogService.subscribeToConfig(
      async (config) => {
        setIsOnline(true);
        setSyncError(null);

        const serverUpdateDate = config.lastUpdateDate;
        const serverSyncId = config.syncId;
        const totalChunks = config.totalChunks;
        
        const { persistedDate: pDate, persistedSyncId: pSyncId, productsCount } = stateRef.current;

        if (serverUpdateDate || totalChunks > 0) {
          if (serverUpdateDate) setLastUpdateDate(serverUpdateDate);
          if (config.categoryDates) setCategoryDates(config.categoryDates);
          
          const shouldSync = (serverUpdateDate && serverUpdateDate !== pDate) || 
                             serverSyncId !== pSyncId || 
                             productsCount === 0;

          if (shouldSync && totalChunks > 0) {
            if (isFetchingRef.current) return;
            isFetchingRef.current = true;
            setIsInitialLoading(true);

            try {
              console.log("[useCatalogSync] Rilevato aggiornamento. Scaricamento tramite servizio...");
              const products = await catalogService.fetchCatalogInChunks(totalChunks);
              
              if (products.length > 0) {
                console.log(`[useCatalogSync] Sincronizzazione completata: ${products.length} prodotti.`);
                setLastSyncId(serverSyncId);
                setProducts(products);
                setIsOnline(true);
                setSyncError(null);
              } else {
                console.error("[useCatalogSync] Nessun prodotto trovato nei chunk scaricati.");
                setSyncError("Errore integrità dati: i cataloghi risultano vuoti.");
              }
            } catch (error: any) {
              console.error("[useCatalogSync] Errore durante il fetch dei chunk:", error);
              setSyncError("Errore di sincronizzazione dati.");
            } finally {
               setIsInitialLoading(false);
               isFetchingRef.current = false;
            }
          } else {
            console.log("[useCatalogSync] Cache Locale già aggiornata.");
            setIsInitialLoading(false);
            setIsOnline(true);
          }
        } else {
          setIsInitialLoading(false);
          setIsOnline(true);
        }
      },
      (err) => {
        console.error("[useCatalogSync] Errore connessione Firestore:", err);
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

