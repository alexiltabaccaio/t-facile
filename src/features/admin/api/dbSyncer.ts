import { productRepository } from '@/shared/api';
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
    const isInCategoryBeingUpdated = updatedCategories.has(p.identity.category);
    const hasFullPriceListInSession = categoriesWithPrices.has(p.identity.category) && categoriesWithActiveProducts.has(p.identity.category);
    
    if (isInCategoryBeingUpdated && hasFullPriceListInSession && p.lifecycle.status === 'Attivo') {
       mergedCatalogMap.set(p.identity.code, {
         ...p,
         lifecycle: {
           ...p.lifecycle,
           status: 'Fuori Catalogo'
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
      const isEmissionOnlyUpdate = product.price === undefined && product.pricePerKg === undefined && mapped.emissions;
      if (isEmissionOnlyUpdate) {
        mergedCatalogMap.set(product.code, {
          ...existing,
          emissions: mapped.emissions
        });
      } else {
        mergedCatalogMap.set(product.code, {
          ...mapped,
          emissions: mapped.emissions || existing.emissions
        });
      }
    } else {
      mergedCatalogMap.set(product.code, mapped);
    }
  });

  const dataToSaveArray = Array.from(mergedCatalogMap.values());

  // 4. Save the entire catalog split into security "Chunks"
  const CHUNK_SIZE = 1500;
  const totalChunks = Math.ceil(dataToSaveArray.length / CHUNK_SIZE);
  const chunks: string[] = [];
  
  for (let i = 0; i < totalChunks; i++) {
    const chunkData = dataToSaveArray.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    chunks.push(JSON.stringify(chunkData));
  }

  // 5. Update global configuration
  const { categoryDates: existingCategoryDates } = useCatalogStore.getState();
  const nextCategoryDates = { ...existingCategoryDates };
  
  updatedCategories.forEach(cat => {
    const listinoDate = parsedData.products.find(p => p.category === cat)?.listinoDate || parsedData.updateDate;
    if (!nextCategoryDates[cat] || isDateNewer(listinoDate, nextCategoryDates[cat])) {
      nextCategoryDates[cat] = listinoDate;
    }
  });

  const syncConfig = { 
    totalChunks: totalChunks,
    syncId: Date.now(),
    lastUpdateDate: finalDateToSave,
    categoryDates: nextCategoryDates
  };

  // 6. Save update history record
  let historyEntry = undefined;
  if (allVariations.length > 0) {
    const displayDate = parsedData.updateDate && parsedData.updateDate !== "Not available" 
      ? parsedData.updateDate 
      : "recent (date not detected)";

    historyEntry = {
      title: `ADM Price List Update (${displayDate})`,
      date: displayDate,
      stats,
      variations: allVariations.slice(0, 500), 
      read: false
    };
  }

  await productRepository.saveCatalogSync({
    chunks,
    config: syncConfig,
    historyEntry
  });

  return { finalDate: finalDateToSave };
};

