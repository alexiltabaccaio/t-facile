import { Product } from '@/entities/product';
import { ParsedPDFResult, ParsedProduct } from '../api/pdfAnalyzer';
import { mapParsedProductToFirestore, detectProductVariations } from './syncUtils';
import { isDateNewer } from '@/shared/lib';
import { SyncStats } from './syncHistoryUtils';

export interface MergeResult {
  mergedProducts: Product[];
  stats: SyncStats;
  allVariations: string[];
  updatedCategories: Set<string>;
}

/**
 * Merges the parsed products from ADM with the existing local products.
 * Handles product lifecycle (e.g. marking products as 'Fuori Catalogo' if they are missing from active lists).
 */
export const mergeParsedCatalog = (
  parsedData: ParsedPDFResult,
  existingProducts: Product[]
): MergeResult => {
  const stats: SyncStats = { new: 0, price: 0, status: 0, emissions: 0 };
  const allVariations: string[] = [];
  const mergedCatalogMap = new Map<string, any>();
  
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

  // 1. Initial pass: Mark products in updated categories as 'Fuori Catalogo' if we are doing a full update
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
  
  // 2. Overwrite/Add updated products
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

  return {
    mergedProducts: Array.from(mergedCatalogMap.values()),
    stats,
    allVariations,
    updatedCategories
  };
};

/**
 * Calculates the next set of category update dates.
 */
export const calculateNextCategoryDates = (
  updatedCategories: Set<string>,
  parsedProducts: ParsedProduct[],
  defaultUpdateDate: string,
  existingCategoryDates: Record<string, string> = {}
): Record<string, string> => {
  const nextCategoryDates = { ...existingCategoryDates };
  
  updatedCategories.forEach(cat => {
    const listinoDate = parsedProducts.find(p => p.category === cat)?.listinoDate || defaultUpdateDate;
    if (!nextCategoryDates[cat] || isDateNewer(listinoDate, nextCategoryDates[cat])) {
      nextCategoryDates[cat] = listinoDate;
    }
  });

  return nextCategoryDates;
};
