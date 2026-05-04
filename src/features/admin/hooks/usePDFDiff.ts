import { useMemo } from 'react';
import { ParsedPDFResult } from '../api/pdfAnalyzer';
import { Product } from '@/entities/product';

import { ChangeType, DiffItem } from '../model/types';

export function usePDFDiff(parsedData: ParsedPDFResult, products: Product[]) {
  const diffItems = useMemo<DiffItem[]>(() => {
    return parsedData.products.map(p => {
      const existing = products.find(sp => sp.identity.code === p.code);
      
      let type: ChangeType = 'unchanged';
      let diffData: any = {};

      if (!existing) {
        type = 'new';
        const isEmissionOnly = p.price === undefined && p.pricePerKg === undefined;
        if (isEmissionOnly) {
          diffData.reason = 'Manca nel database corrente (File Emissioni)';
          diffData.statusAssigned = 'Fuori Catalogo';
        } else {
          diffData.reason = 'Manca nel database';
          diffData.statusAssigned = p.status || 'Attivo';
        }
      } else {
        const priceChanged = p.price !== undefined && existing.pricing.currentPrice !== undefined && p.price !== existing.pricing.currentPrice;
        const statusChanged = p.status !== undefined && p.status !== existing.lifecycle.status;
        const emissionsChanged = (p.tar !== undefined && p.tar !== existing.emissions?.tar) ||
                                 (p.nicotine !== undefined && p.nicotine !== existing.emissions?.nicotine) ||
                                 (p.co !== undefined && p.co !== existing.emissions?.co);
        
        if (statusChanged) {
          type = 'status';
          diffData.oldStatus = existing.lifecycle.status;
          diffData.newStatus = p.status;
        } else if (priceChanged) {
          type = 'price';
          diffData.oldPrice = existing.pricing.currentPrice;
          diffData.newPrice = p.price;
        } else if (emissionsChanged) {
          type = 'emissions';
          diffData.oldTar = existing.emissions?.tar || 0;
          diffData.newTar = p.tar !== undefined ? p.tar : (existing.emissions?.tar || 0);
          diffData.oldNicotine = existing.emissions?.nicotine || 0;
          diffData.newNicotine = p.nicotine !== undefined ? p.nicotine : (existing.emissions?.nicotine || 0);
          diffData.oldCo = existing.emissions?.co || 0;
          diffData.newCo = p.co !== undefined ? p.co : (existing.emissions?.co || 0);
        }
      }

      return { product: p, type, diffData };
    });
  }, [parsedData.products, products]);

  const stats = useMemo(() => ({
    new: diffItems.filter(i => i.type === 'new').length,
    price: diffItems.filter(i => i.type === 'price').length,
    status: diffItems.filter(i => i.type === 'status').length,
    emissions: diffItems.filter(i => i.type === 'emissions').length,
    unchanged: diffItems.filter(i => i.type === 'unchanged').length,
    total: diffItems.length
  }), [diffItems]);

  return { diffItems, stats };
}
