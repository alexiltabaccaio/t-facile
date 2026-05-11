export type ChangeType = 'new' | 'price' | 'status' | 'emissions' | 'unchanged';

import { ParsedProduct } from '../api/pdfAnalyzer';

export interface DiffItem {
  product: ParsedProduct;
  type: ChangeType;
  diffData: {
    oldPrice?: number;
    newPrice?: number;
    oldPricePerKg?: number;
    newPricePerKg?: number;
    oldStatus?: string;
    newStatus?: string;
    oldTar?: number;
    newTar?: number;
    oldNicotine?: number;
    newNicotine?: number;
    oldCo?: number;
    newCo?: number;
    reason?: string;
    statusAssigned?: string;
    isSuspicious?: boolean;
    debug?: Record<string, unknown>;
  };
}
