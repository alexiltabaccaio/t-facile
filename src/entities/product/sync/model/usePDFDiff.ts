import { useMemo } from 'react';
import { ParsedPDFResult } from '../api/pdfAnalyzer';
import { Product } from '../../index';

import { ChangeType, DiffItem } from '../model/types';
import { findMatchingProduct } from '../api/syncUtils';

export function usePDFDiff(parsedData: ParsedPDFResult, products: Product[]) {
  const diffItems = useMemo<DiffItem[]>(() => {
    return parsedData.products.map(p => {
      const { existing, matchMethod } = findMatchingProduct(p, products);
      
      // Inherit code and potentially other metadata from existing product if missing
      const finalProduct = { ...p };
      if (existing && !finalProduct.code) {
        finalProduct.code = existing.identity.code;
      }

      let type: ChangeType = 'unchanged';
      let diffData: DiffItem['diffData'] = {};
      
      // Inject debugging info to help developers trace how products were mapped
      if (existing) {
        diffData.debug = {
          matchMethod,
          dbProductCode: existing.identity.code,
          dbProductName: existing.identity.name,
          dbProductQuantity: existing.identity.package?.quantity
        };
      }

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
          
          if (p.oldPricePerKg !== undefined) {
            diffData.oldPricePerKg = p.oldPricePerKg;
          } else if (existing.pricing.pricePerKg !== undefined) {
            diffData.oldPricePerKg = existing.pricing.pricePerKg;
          }
          
          if (p.pricePerKg !== undefined) {
            diffData.newPricePerKg = p.pricePerKg;
          }
          
          const priceDiff = Math.abs(p.price! - existing.pricing.currentPrice);
          const diffRatio = existing.pricing.currentPrice > 0 ? priceDiff / existing.pricing.currentPrice : 0;
          const isSuspicious = diffRatio > 0.40; // Oltre 40% di variazione è sempre anomalo
          if (isSuspicious) {
             diffData.isSuspicious = true;
          }
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

      return { product: finalProduct, type, diffData };
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
