import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Product, PackageType, PackageUnit } from '@/entities/product';

/**
 * Emergency parser to convert the old packageInfo string into a structured object.
 * Much more flexible for handling varied legacy formats.
 */
export const parseLegacyPackageInfo = (info: string): { type: PackageType; quantity: number; unit: PackageUnit } | undefined => {
  if (!info) return undefined;

  const normalized = info.toLowerCase().trim();
  
  // Flexible Regex: 
  // 1. Optional type (pack, pouch, etc.)
  // 2. Optional word "da" (from/of)
  // 3. Quantity (number with comma or dot)
  // 4. Unit (pieces, pz, grams, gr, g, ml)
  const regex = /^(?:(\w+)\s+)?(?:da\s+)?([\d.,]+)\s*(\w*)/i;
  const match = normalized.match(regex);

  if (!match) return undefined;

  const rawType = match[1] || '';
  const rawQty = match[2].replace(',', '.');
  const rawUnit = (match[3] || '').toLowerCase();

  let type: PackageType = 'GENERIC';
  if (rawType.includes('astuccio')) type = 'ASTUCCIO';
  else if (rawType.includes('cartoccio')) type = 'CARTOCCIO';
  else if (rawType.includes('busta')) type = 'BUSTA';
  else if (rawType.includes('scatola')) type = 'SCATOLA';
  else if (rawType.includes('lattina')) type = 'LATTINA';
  else if (rawType.includes('barattolo')) type = 'BARATTOLO';

  let unit: PackageUnit = 'PIECES';
  if (rawUnit.includes('gramm') || rawUnit === 'gr' || rawUnit === 'g') {
    unit = 'GRAMS';
  } else if (rawUnit.includes('ml')) {
    unit = 'ML';
  } else if (rawUnit.includes('pezz') || rawUnit === 'pz') {
    unit = 'PIECES';
  }

  const quantity = parseFloat(rawQty) || 0;

  return { type, quantity, unit };
};

/**
 * Maps a Firestore document to a typed Product object.
 * Handles both standard nesting and flattened fields (e.g., 'identity.code').
 */
export const mapFirestoreDocToProduct = (snapshot: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = snapshot.data();
  
  const packageInfo = data.identity?.packageInfo || data['identity.packageInfo'] || '';
  const packageData = data.identity?.package || data['identity.package'];

  const product: Product = {
    identity: {
      code: data.identity?.code || data['identity.code'] || snapshot.id,
      name: data.identity?.name || data['identity.name'] || 'Senza nome',
      category: data.identity?.category || data['identity.category'] || 'Varie',
      packageInfo: packageInfo,
      package: packageData || parseLegacyPackageInfo(packageInfo),
    },
    pricing: {
      currentPrice: Number(data.pricing?.currentPrice ?? data['pricing.currentPrice'] ?? 0),
      pricePerKg: Number(data.pricing?.pricePerKg ?? data['pricing.pricePerKg'] ?? 0),
      conventionalPricePerKg: Number(data.pricing?.conventionalPricePerKg ?? data['pricing.conventionalPricePerKg'] ?? undefined),
      fiscalValuePer1000Pieces: Number(data.pricing?.fiscalValuePer1000Pieces ?? data['pricing.fiscalValuePer1000Pieces'] ?? undefined),
    },
    lifecycle: {
      status: data.lifecycle?.status || data['lifecycle.status'] || 'Attivo',
      radiationDate: data.lifecycle?.radiationDate || data['lifecycle.radiationDate'] || undefined,
      retirementDate: data.lifecycle?.retirementDate || data['lifecycle.retirementDate'] || undefined,
    },
  };

  const emissions = data.emissions || {};
  if (emissions.nicotine !== undefined || emissions.tar !== undefined || emissions.co !== undefined ||
      data['emissions.nicotine'] !== undefined || data['emissions.tar'] !== undefined || data['emissions.co'] !== undefined) {
    product.emissions = {
      nicotine: Number(emissions.nicotine ?? data['emissions.nicotine'] ?? 0),
      tar: Number(emissions.tar ?? data['emissions.tar'] ?? 0),
      co: Number(emissions.co ?? data['emissions.co'] ?? 0),
    };
  }

  return product;
};
