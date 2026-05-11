import { Product, parseLegacyPackageInfo } from '@/entities/product';


/**
 * Maps a Firestore document to a typed Product object.
 * Handles both standard nesting and flattened fields (e.g., 'identity.code').
 */
export const mapFirestoreDocToProduct = (snapshot: { id: string, data: () => Record<string, unknown> }): Product => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = snapshot.data() as Record<string, any>;
  
  const identity = data.identity || {};
  const pricing = data.pricing || {};
  const lifecycle = data.lifecycle || {};
  const emissions = data.emissions || {};

  const packageInfo = identity.packageInfo || data['identity.packageInfo'] || '';
  const packageData = identity.package || data['identity.package'];

  const product: Product = {
    identity: {
      code: identity.code || data['identity.code'] || snapshot.id,
      name: identity.name || data['identity.name'] || 'Senza nome',
      category: identity.category || data['identity.category'] || 'Varie',
      packageInfo: packageInfo,
      package: packageData || parseLegacyPackageInfo(packageInfo),
    },
    pricing: {
      currentPrice: Number(pricing.currentPrice ?? data['pricing.currentPrice'] ?? 0),
      pricePerKg: Number(pricing.pricePerKg ?? data['pricing.pricePerKg'] ?? 0),
      conventionalPricePerKg: Number(pricing.conventionalPricePerKg ?? data['pricing.conventionalPricePerKg'] ?? undefined),
      fiscalValuePer1000Pieces: Number(pricing.fiscalValuePer1000Pieces ?? data['pricing.fiscalValuePer1000Pieces'] ?? undefined),
    },
    lifecycle: {
      status: lifecycle.status || data['lifecycle.status'] || 'Attivo',
      radiationDate: lifecycle.radiationDate || data['lifecycle.radiationDate'] || undefined,
      retirementDate: lifecycle.retirementDate || data['lifecycle.retirementDate'] || undefined,
    },
  };

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
