import { Product, parseLegacyPackageInfo } from '@/entities/product';


/**
 * Maps a Firestore document to a typed Product object.
 * Handles both standard nesting and flattened fields (e.g., 'identity.code').
 */
export const mapFirestoreDocToProduct = (snapshot: { id: string, data: () => any }): Product => {
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
