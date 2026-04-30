
import { Product, SortOption } from '@/entities/product';
import { createWordStartRegex, SYNONYM_MAP, escapeRegExp } from '@/shared/lib';
import { EmissionFilter } from './searchParser';

export const calculateRelevance = (p: Product, kws: string[], emissionFilters: EmissionFilter[]): number => {
  if (kws.length === 0 && emissionFilters.length === 0) return 0;
  let score = 0;
  const lowerCaseName = p.identity.name.toLowerCase();
  const isPriceSearch = kws.some(kw => kw.includes('€'));

  if (emissionFilters.length > 0) score += 5;

  kws.forEach(kw => {
    const regex = createWordStartRegex(kw);
    if (lowerCaseName.startsWith(kw.toLowerCase())) score += 25;
    else if (regex.test(p.identity.name)) score += 10;
    if (p.identity.code.startsWith(kw)) score += 15;

    const isPotentialPriceKeyword = /^€?\d+[,.]?\d*$/.test(kw);
    if (isPotentialPriceKeyword) {
      const priceStr = p.pricing.currentPrice.toFixed(2);
      const valStr = kw.replace('€', '').replace(',', '.');
      const searchPrice = parseFloat(valStr);
      if (!isNaN(searchPrice)) {
        if (isPriceSearch) {
          if (p.pricing.currentPrice === searchPrice) score += 50;
          else if (priceStr.startsWith(valStr)) score += 40;
        } else {
          if (p.pricing.currentPrice === searchPrice) score += 40;
          else if (priceStr.startsWith(valStr)) score += 20;
        }
      }
    }
    if (p.identity.brand && regex.test(p.identity.brand)) score += 10;
    const pluralForm = SYNONYM_MAP[kw.toLowerCase()]?.[0] || '';
    const categoryRegex = new RegExp(`\\b(${escapeRegExp(kw)}${pluralForm ? '|' + escapeRegExp(pluralForm) : ''})`, 'i');
    if (categoryRegex.test(p.identity.category)) score += 5;
    if (regex.test(p.identity.packageInfo)) score += 5;
  });
  return score;
};

export const sortProducts = (
  products: Product[],
  sortOption: SortOption,
  searchOptions: {
    searchKeywords: string[];
    isRetiredSearch: boolean;
    emissionFilters: EmissionFilter[];
  }
) => {
  const { searchKeywords, isRetiredSearch, emissionFilters } = searchOptions;

  if (sortOption.key === 'smart' && (searchKeywords.length > 0 || isRetiredSearch || emissionFilters.length > 0)) {
    const isSingleNumericSearch = searchKeywords.length === 1 && /^\d+$/.test(searchKeywords[0]);

    products.sort((a, b) => {
      if (isSingleNumericSearch) {
        const kw = searchKeywords[0];
        const scoreA = a.identity.code.startsWith(kw) ? 2 : 0;
        const scoreB = b.identity.code.startsWith(kw) ? 2 : 0;
        if (scoreA !== scoreB) return scoreB - scoreA;
        if (scoreA > 0) return parseInt(a.identity.code, 10) - parseInt(b.identity.code, 10);
      }
      
      const relA = calculateRelevance(a, searchKeywords, emissionFilters);
      const relB = calculateRelevance(b, searchKeywords, emissionFilters);
      if (relA !== relB) return relB - relA;
      
      if (isRetiredSearch && a.lifecycle.retirementDate && b.lifecycle.retirementDate) {
        const dateA = a.lifecycle.retirementDate.split('/').reverse().join('');
        const dateB = b.lifecycle.retirementDate.split('/').reverse().join('');
        return dateB.localeCompare(dateA);
      }
      return a.identity.name.localeCompare(b.identity.name);
    });
  } else {
    products.sort((a, b) => {
      const mult = sortOption.order === 'asc' ? 1 : -1;
      const key = sortOption.key;
      
      switch (key) {
        case 'price': return (a.pricing.currentPrice - b.pricing.currentPrice) * mult;
        case 'name': return a.identity.name.localeCompare(b.identity.name) * mult;
        case 'code': return (parseInt(a.identity.code, 10) - parseInt(b.identity.code, 10)) * mult;
        case 'nicotine':
        case 'tar':
        case 'co': {
          const valA = a.emissions?.[key];
          const valB = b.emissions?.[key];
          if (valA === undefined && valB !== undefined) return 1;
          if (valA !== undefined && valB === undefined) return -1;
          if (valA === undefined && valB === undefined) return a.identity.name.localeCompare(b.identity.name);
          if (valA! !== valB!) return (valA! - valB!) * mult;
          return a.identity.name.localeCompare(b.identity.name);
        }
        default: return a.identity.name.localeCompare(b.identity.name);
      }
    });
  }
};

