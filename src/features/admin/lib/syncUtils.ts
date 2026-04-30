import { ParsedProduct } from '../api/pdfAnalyzer';
import { Product } from '@/entities/product';

/**
 * Normalizza il nome della categoria secondo gli standard dell'applicazione.
 */
export const normalizeCategory = (category: string | undefined): string => {
  if (!category) return 'Altri Tabacchi';
  const c = category.toLowerCase();
  
  // Priorità ai tipi specifici
  if (c.includes('trinciati')) return 'Trinciati';
  if (c.includes('sigaretti')) return 'Sigaretti';
  if (c.includes('sigari')) return 'Sigari';
  if (c.includes('sigarette')) return 'Sigarette';
  if (c.includes('fiuto') || c.includes('mastico')) return 'Fiuto e Mastico';
  if (c.includes('inalazione') || c.includes('liquidi') || c.includes('senza combustione')) return 'Prodotti da inalazione senza combustione';
  
  return 'Altri Tabacchi';
};

/**
 * Mappa un prodotto estratto dall'IA nella struttura dati richiesta dal Database Firestore.
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
 * Confronta un prodotto nuovo con uno esistente e restituisce le variazioni trovate.
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
  
  // Rileviamo se i valori delle emissioni sono cambiati
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
