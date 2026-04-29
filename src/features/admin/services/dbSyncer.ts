import { doc, writeBatch, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/shared/api/firebase/firebase';
import { useCatalogStore, Product } from '@/entities/product';
import { ParsedPDFResult } from './pdfAnalyzer';
import { isDateNewer } from '../utils/dateUtils';
import { mapParsedProductToFirestore, detectProductVariations } from '../utils/syncUtils';

export const saveParsedDataToFirestore = async (
  parsedData: ParsedPDFResult,
  currentLastUpdateDate: string,
  existingProducts: Product[]
): Promise<{ finalDate: string }> => {
  
  const isNewer = isDateNewer(parsedData.updateDate, currentLastUpdateDate);
  const finalDateToSave = isNewer ? parsedData.updateDate : currentLastUpdateDate;

  const batch = writeBatch(db);
  
  // Prepariamo le statistiche e lo storico
  const stats = { new: 0, price: 0, status: 0, emissions: 0 };
  const allVariations: string[] = [];
  
  // Utilizziamo una Map per unire i prodotti vecchi con i nuovi senza perdere quello che non stiamo aggiornando
  const mergedCatalogMap = new Map<string, any>();
  
  // 1. Identifichiamo le categorie interessate e se abbiamo prezzi o solo emissioni
  const updatedCategories = new Set<string>();
  const categoriesWithPrices = new Set<string>();
  const categoriesWithActiveProducts = new Set<string>();

  parsedData.products.forEach(p => {
    if (p.category) {
      updatedCategories.add(p.category);
      // Se il prodotto ha un prezzo definito, allora stiamo caricando un listino PREZZI per questa categoria
      if (p.price !== undefined) {
        categoriesWithPrices.add(p.category);
      }
      if (p.status !== 'Radiato') {
        categoriesWithActiveProducts.add(p.category);
      }
    }
  });

  // 2. Inseriamo prima TUTTI i prodotti esistenti nella Map
  existingProducts.forEach(p => {
    // Segniamo come "Fuori Catalogo" solo se:
    // 1. Appartiene a una categoria che stiamo aggiornando
    // 2. Stiamo caricando un listino PREZZI (non solo emissioni)
    // 3. Il listino contiene prodotti attivi (non è un listino solo radiati)
    // 4. Il prodotto non è già radiato
    const isInCategoryBeingUpdated = updatedCategories.has(p.identity.category);
    const hasFullPriceListInSession = categoriesWithPrices.has(p.identity.category) && categoriesWithActiveProducts.has(p.identity.category);
    
    if (isInCategoryBeingUpdated && hasFullPriceListInSession && p.lifecycle.status === 'Attivo') {
       mergedCatalogMap.set(p.identity.code, {
         ...p,
         lifecycle: {
           ...p.lifecycle,
           status: 'Fuori Catalogo' // Verrà sovrascritto se presente nel PDF
         }
       });
    } else {
       mergedCatalogMap.set(p.identity.code, p);
    }
  });
  
  // 3. Rileviamo le variazioni e sovrascriviamo/aggiungiamo nella Map i prodotti aggiornati
  parsedData.products.forEach((product) => {
    const existing = existingProducts.find(p => p.identity.code === product.code);
    
    const { type, variations } = detectProductVariations(product, existing);
    if (type === 'new') stats.new++;
    
    variations.forEach(v => {
      if (v.includes('Prezzo')) stats.price++;
      if (v.includes('Stato')) stats.status++;
      if (v.includes('emissioni')) stats.emissions++;
    });

    allVariations.push(...variations);

    const mapped = mapParsedProductToFirestore(product, !existing);

    if (existing) {
      // Se è un aggiornamento di sole emissioni (prezzi mancanti nel sorgente)
      const isEmissionOnlyUpdate = product.price === undefined && product.pricePerKg === undefined && mapped.emissions;
      
      if (isEmissionOnlyUpdate) {
        // AGGIORNAMENTO INCREMENTALE: Preserviamo l'identità e i prezzi esistenti
        mergedCatalogMap.set(product.code, {
          ...existing,
          emissions: mapped.emissions // Aggiorna solo catrame/nicotina/co
        });
      } else {
        // AGGIORNAMENTO STANDARD (Listino Prezzi)
        mergedCatalogMap.set(product.code, {
          ...mapped,
          // Se nel nuovo listino mancano le emissioni (comune), preserviamo quelle che avevamo già
          emissions: mapped.emissions || existing.emissions
        });
      }
    } else {
      // Prodotto totalmente nuovo
      mergedCatalogMap.set(product.code, mapped);
    }
  });

  // Convertiamo la Map finale nel nostro nuovo array globale
  const dataToSaveArray = Array.from(mergedCatalogMap.values());

  // 3. Salvataggio dell'intero catalogo spezzettato in "Chunks" di sicurezza
  // Il limite documentale Firestore è 1MB. 5000 prodotti pesano ~1.3MB stringificati.
  // Suddividendo array in pacchetti da 1500 ci teniamo sotto i 400KB per documento!
  const CHUNK_SIZE = 1500;
  const totalChunks = Math.ceil(dataToSaveArray.length / CHUNK_SIZE);
  
  for (let i = 0; i < totalChunks; i++) {
    const chunkData = dataToSaveArray.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const chunkRef = doc(db, 'system', `catalog_chunk_${i}`);
    batch.set(chunkRef, {
        data: JSON.stringify(chunkData),
        updatedAt: serverTimestamp()
    });
  }

  // 3. Aggiorniamo la configurazione globale
  const configRef = doc(db, 'system', 'config');
  
  // Prepariamo l'aggiornamento delle date per categoria
  const { categoryDates: existingCategoryDates } = useCatalogStore.getState();
  const nextCategoryDates = { ...existingCategoryDates };
  
  updatedCategories.forEach(cat => {
    // Troviamo la data del listino appena processato per questa categoria
    const listinoDate = parsedData.products.find(p => p.category === cat)?.listinoDate || parsedData.updateDate;
    
    if (!nextCategoryDates[cat] || isDateNewer(listinoDate, nextCategoryDates[cat])) {
      nextCategoryDates[cat] = listinoDate;
    }
  });

  const syncPayload: any = { 
    totalChunks: totalChunks,
    syncId: Date.now(), // Forza sempre il refresh del client
    lastUpdateDate: finalDateToSave, // Assicuriamo che la data sia sempre presente nel doc config
    categoryDates: nextCategoryDates
  };

  batch.set(configRef, syncPayload, { merge: true });

  // 4. Salvataggio record storico notifiche (invariato)
  if (allVariations.length > 0) {
    const historyRef = doc(collection(db, 'update_history'));
    
    // Normalizziamo la data per la visualizzazione
    const displayDate = parsedData.updateDate && parsedData.updateDate !== "Non disponibile" 
      ? parsedData.updateDate 
      : "recente (data non rilevata)";

    batch.set(historyRef, {
      id: historyRef.id,
      title: `Aggiornamento Listino ADM (${displayDate})`,
      date: displayDate,
      timestamp: serverTimestamp(),
      stats,
      variations: allVariations.slice(0, 500), 
      read: false
    });
  }

  await batch.commit();

  return { finalDate: finalDateToSave };
};
