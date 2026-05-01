import { doc, writeBatch, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/shared/api';
import { useCatalogStore, Product } from '@/entities/product';
import { ParsedPDFResult } from './pdfAnalyzer';
import { isDateNewer } from '@/shared/lib';
import { mapParsedProductToFirestore, detectProductVariations } from '../lib/syncUtils';

export const saveParsedDataToFirestore = async (
  parsedData: ParsedPDFResult,
  currentLastUpdateDate: string,
  existingProducts: Product[]
): Promise<{ finalDate: string }> => {
  
  const isNewer = isDateNewer(parsedData.updateDate, currentLastUpdateDate);
  const finalDateToSave = isNewer ? parsedData.updateDate : currentLastUpdateDate;

  const batch = writeBatch(db);
  
  // Prepare statistics and history
  const stats = { new: 0, price: 0, status: 0, emissions: 0 };
  const allVariations: string[] = [];
  
  // Use a Map to merge old products with new ones without losing what we are not updating
  const mergedCatalogMap = new Map<string, any>();
  
  // 1. Identify the relevant categories and whether we have prices or only emissions
  const updatedCategories = new Set<string>();
  const categoriesWithPrices = new Set<string>();
  const categoriesWithActiveProducts = new Set<string>();

  parsedData.products.forEach(p => {
    if (p.category) {
      updatedCategories.add(p.category);
      // If the product has a defined price, then we are loading a PRICE list for this category
      if (p.price !== undefined) {
        categoriesWithPrices.add(p.category);
      }
      if (p.status !== 'Radiato') {
        categoriesWithActiveProducts.add(p.category);
      }
    }
  });

  // 2. Insert ALL existing products into the Map first
  existingProducts.forEach(p => {
    // Mark as "Out of Catalog" only if:
    // 1. It belongs to a category we are updating
    // 2. We are loading a PRICE list (not just emissions)
    // 3. The list contains active products (not just a retired list)
    // 4. The product is not already retired
    const isInCategoryBeingUpdated = updatedCategories.has(p.identity.category);
    const hasFullPriceListInSession = categoriesWithPrices.has(p.identity.category) && categoriesWithActiveProducts.has(p.identity.category);
    
    if (isInCategoryBeingUpdated && hasFullPriceListInSession && p.lifecycle.status === 'Attivo') {
       mergedCatalogMap.set(p.identity.code, {
         ...p,
         lifecycle: {
           ...p.lifecycle,
           status: 'Fuori Catalogo' // Will be overwritten if present in the PDF
         }
       });
    } else {
       mergedCatalogMap.set(p.identity.code, p);
    }
  });
  
  // 3. Detect variations and overwrite/add the updated products in the Map
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
      // If it is an update of emissions only (missing prices in the source)
      const isEmissionOnlyUpdate = product.price === undefined && product.pricePerKg === undefined && mapped.emissions;
      
      if (isEmissionOnlyUpdate) {
        // INCREMENTAL UPDATE: Preserve existing identity and prices
        mergedCatalogMap.set(product.code, {
          ...existing,
          emissions: mapped.emissions // Updates only tar/nicotine/co
        });
      } else {
        // STANDARD UPDATE (Price List)
        mergedCatalogMap.set(product.code, {
          ...mapped,
          // If the new list is missing emissions (common), preserve what we already had
          emissions: mapped.emissions || existing.emissions
        });
      }
    } else {
      // Completely new product
      mergedCatalogMap.set(product.code, mapped);
    }
  });

  // Convert the final Map into our new global array
  const dataToSaveArray = Array.from(mergedCatalogMap.values());

  // 3. Save the entire catalog split into security "Chunks"
  // The Firestore document limit is 1MB. 5000 products weigh ~1.3MB stringified.
  // By splitting the array into 1500-item chunks, we keep each document under 400KB!
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

  // 3. Update global configuration
  const configRef = doc(db, 'system', 'config');
  
  // Prepare category dates update
  const { categoryDates: existingCategoryDates } = useCatalogStore.getState();
  const nextCategoryDates = { ...existingCategoryDates };
  
  updatedCategories.forEach(cat => {
    // Find the date of the listino just processed for this category
    const listinoDate = parsedData.products.find(p => p.category === cat)?.listinoDate || parsedData.updateDate;
    
    if (!nextCategoryDates[cat] || isDateNewer(listinoDate, nextCategoryDates[cat])) {
      nextCategoryDates[cat] = listinoDate;
    }
  });

  const syncPayload: any = { 
    totalChunks: totalChunks,
    syncId: Date.now(), // Always force client refresh
    lastUpdateDate: finalDateToSave, // Ensure the date is always present in the config doc
    categoryDates: nextCategoryDates
  };

  batch.set(configRef, syncPayload, { merge: true });

  // 4. Save update history record (unchanged)
  if (allVariations.length > 0) {
    const historyRef = doc(collection(db, 'update_history'));
    
    // Normalize date for display
    const displayDate = parsedData.updateDate && parsedData.updateDate !== "Not available" 
      ? parsedData.updateDate 
      : "recent (date not detected)";

    batch.set(historyRef, {
      id: historyRef.id,
      title: `ADM Price List Update (${displayDate})`,
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

