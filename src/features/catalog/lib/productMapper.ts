import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Product } from '@/entities/product';

/**
 * Mappa un documento Firestore in un oggetto Product tipizzato.
 * Gestisce sia il nesting standard che eventuali field appiattiti (es. 'identity.code').
 */
export const mapFirestoreDocToProduct = (snapshot: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = snapshot.data();
  
  const product: Product = {
    identity: {
      code: data.identity?.code || data['identity.code'] || snapshot.id,
      name: data.identity?.name || data['identity.name'] || 'Senza nome',
      category: data.identity?.category || data['identity.category'] || 'Varie',
      packageInfo: data.identity?.packageInfo || data['identity.packageInfo'] || '',
    },
    pricing: {
      currentPrice: Number(data.pricing?.currentPrice ?? data['pricing.currentPrice'] ?? 0),
      pricePerKg: Number(data.pricing?.pricePerKg ?? data['pricing.pricePerKg'] ?? 0),
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
