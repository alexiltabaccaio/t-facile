
export interface ProductEmissions {
  tar: number;
  nicotine: number;
  co: number;
}

export interface ProductIdentity {
  code: string;
  name: string;
  category: string;
  packageInfo: string;
  brand?: string;
  manufacturer?: string;
}

export interface ProductPricing {
  currentPrice: number;
  pricePerKg?: number;
  conventionalPricePerKg?: number;
  fiscalValuePer1000Pieces?: number;
}

export interface ProductLifecycle {
  status?: 'Attivo' | 'Radiato' | 'Fuori Catalogo';
  retirementDate?: string;
  radiationDate?: string;
}

export interface Product {
  identity: ProductIdentity;
  pricing: ProductPricing;
  lifecycle: ProductLifecycle;
  emissions?: ProductEmissions;
}

export type SortKey = 'smart' | 'name' | 'price' | 'code' | 'nicotine' | 'tar' | 'co';

export type SortOrder = 'asc' | 'desc';

export interface SortOption {
  key: SortKey;
  order: SortOrder;
}
