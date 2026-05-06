import { ParsedProduct } from '../api/pdfAnalyzer';
import { Product } from '../../index';

/**
 * Normalizes a product name for fuzzy matching
 */
export const normalizeName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // Removes punctuation and special characters
    .replace(/\s+/g, '') // Removes all spaces for a more robust match
    .trim();
};

/**
 * Finds the best matching existing product for a parsed product
 */
export const findMatchingProduct = (
  p: ParsedProduct, 
  products: Product[]
): { existing?: Product, matchMethod: string } => {
  let existing = products.find(sp => sp.identity.code === p.code && p.code !== "");
  let matchMethod = existing ? 'code' : 'none';

  if (!existing && !p.code && p.name) {
    const normPName = normalizeName(p.name);
    const matchesByName = products.filter(sp => normalizeName(sp.identity.name) === normPName);
    
    if (matchesByName.length === 1) {
      const singleDb = matchesByName[0];
      const diffRatio = p.price !== undefined && singleDb.pricing.currentPrice > 0 
           ? Math.abs(p.price - singleDb.pricing.currentPrice) / singleDb.pricing.currentPrice 
           : 0;
           
      if (diffRatio < 0.3 || (p.package?.quantity && singleDb.identity.package?.quantity === p.package?.quantity)) {
        existing = singleDb;
        matchMethod = 'name_exact';
      }
    } else if (matchesByName.length > 1) {
      if (p.package?.quantity) {
         const exactMatch = matchesByName.find(sp => sp.identity.package?.quantity === p.package?.quantity);
         if (exactMatch) {
            existing = exactMatch;
            matchMethod = 'name_and_quantity';
         }
      } 
      
      if (!existing && p.price !== undefined) {
         let closest = matchesByName[0];
         let minDiff = Math.abs(p.price - (closest.pricing.currentPrice || 0));
         
         for (let i = 1; i < matchesByName.length; i++) {
            const dbPrice = matchesByName[i].pricing.currentPrice || 0;
            const diff = Math.abs(p.price - dbPrice);
            if (diff < minDiff) {
               minDiff = diff;
               closest = matchesByName[i];
            }
         }
         
         if (closest.pricing.currentPrice > 0 && (minDiff / closest.pricing.currentPrice) < 0.3) {
            existing = closest;
            matchMethod = 'name_closest_price';
         }
      }
    }
  }

  return { existing, matchMethod };
};

/**
 * Normalizes the category name according to application standards.
 */
export const normalizeCategory = (category: string | undefined): string => {
  if (!category) return 'Altri Tabacchi';
  const c = category.toLowerCase();
  
  // Priority for specific types
  if (c.includes('trinciati')) return 'Trinciati';
  if (c.includes('sigaretti')) return 'Sigaretti';
  if (c.includes('sigari')) return 'Sigari';
  if (c.includes('sigarette')) return 'Sigarette';
  if (c.includes('fiuto') || c.includes('mastico')) return 'Fiuto e Mastico';
  if (c.includes('inalazione') || c.includes('liquidi') || c.includes('senza combustione')) return 'Prodotti da inalazione senza combustione';
  
  return 'Altri Tabacchi';
};

/**
 * Maps a product extracted by the AI into the data structure required by the Firestore Database.
 */
export const mapParsedProductToFirestore = (product: ParsedProduct, isNew: boolean): any => {
  const isEmissionOnly = product.price === undefined && product.pricePerKg === undefined;
  
  const data: any = {
    identity: {
      code: product.code,
      name: product.name || 'Senza Nome',
      category: normalizeCategory(product.category),
      packageInfo: product.packageInfo || '',
    },
    lifecycle: {
      status: product.status || (isNew && isEmissionOnly ? 'Fuori Catalogo' : 'Attivo'),
      radiationDate: product.radiationDate || null
    },
    pricing: {
      currentPrice: product.price || 0,
      pricePerKg: product.pricePerKg || 0,
    }
  };

  if (product.tar !== undefined || product.nicotine !== undefined || product.co !== undefined) {
    data.emissions = {
      nicotine: product.nicotine || 0,
      tar: product.tar || 0,
      co: product.co || 0,
    };
  }

  return data;
};

/**
 * Compares a new product with an existing one and returns the detected variations found.
 */
export const detectProductVariations = (
  newDoc: ParsedProduct,
  existingDoc: Product | undefined
): { variations: string[], type: 'new' | 'update' | 'none' } => {
  if (!existingDoc) {
    return {
      type: 'new',
      variations: [`NUOVO: ${newDoc.name} (€${newDoc.price?.toFixed(2)})`]
    };
  }

  const variations: string[] = [];
  const priceChanged = newDoc.price !== undefined && existingDoc.pricing.currentPrice !== undefined && newDoc.price !== existingDoc.pricing.currentPrice;
  const statusChanged = newDoc.status !== undefined && newDoc.status !== existingDoc.lifecycle.status;
  
  // Detect if emission values have changed
  const emissionsChanged = (newDoc.tar !== undefined && newDoc.tar !== existingDoc.emissions?.tar) ||
                          (newDoc.nicotine !== undefined && newDoc.nicotine !== existingDoc.emissions?.nicotine) ||
                          (newDoc.co !== undefined && newDoc.co !== existingDoc.emissions?.co);

  if (priceChanged) {
    variations.push(`${newDoc.name}: Prezzo €${existingDoc.pricing.currentPrice.toFixed(2)} → €${newDoc.price?.toFixed(2)}`);
  }
  
  if (statusChanged) {
    variations.push(`${newDoc.name}: Stato ${existingDoc.lifecycle.status} → ${newDoc.status}`);
  }

  if (emissionsChanged) {
    const details: string[] = [];
    if (newDoc.tar !== undefined && newDoc.tar !== existingDoc.emissions?.tar) details.push(`CAT: ${existingDoc.emissions?.tar || 0} → ${newDoc.tar}`);
    if (newDoc.nicotine !== undefined && newDoc.nicotine !== existingDoc.emissions?.nicotine) details.push(`NIC: ${existingDoc.emissions?.nicotine || 0} → ${newDoc.nicotine}`);
    if (newDoc.co !== undefined && newDoc.co !== existingDoc.emissions?.co) details.push(`CO: ${existingDoc.emissions?.co || 0} → ${newDoc.co}`);
    
    variations.push(`${newDoc.name}: Emissioni [${details.join(', ')}]`);
  }

  return {
    type: variations.length > 0 ? 'update' : 'none',
    variations
  };
};
