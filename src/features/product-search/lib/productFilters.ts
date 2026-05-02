
import { Product } from '@/entities/product';
import { SYNONYM_MAP, escapeRegExp, createWordStartRegex } from '@/shared/lib';
import { EmissionFilter } from './searchParser';

export const checkTextMatch = (p: Product, keyword: string, t?: any): boolean => {
  const regex = createWordStartRegex(keyword);
  const inName = regex.test(p.identity.name);
  const inCode = p.identity.code.startsWith(keyword);

  const pluralForm = SYNONYM_MAP[keyword.toLowerCase()]?.[0] || '';
  const categoryRegex = new RegExp(`\\b(${escapeRegExp(keyword)}${pluralForm ? '|' + escapeRegExp(pluralForm) : ''})`, 'i');
  
  let inCategory = categoryRegex.test(p.identity.category);
  
  // Language aware search for categories and package types
  if (t) {
    const translatedCategory = t(`catalog.categories.${p.identity.category}`, { defaultValue: p.identity.category });
    inCategory = inCategory || categoryRegex.test(translatedCategory);

    if (p.identity.package?.type) {
      const translatedPackage = t(`catalog.packageTypes.${p.identity.package.type}`, { defaultValue: '' });
      if (translatedPackage && categoryRegex.test(translatedPackage)) {
        return true;
      }
    }
  }

  const inBrand = !!p.identity.brand && regex.test(p.identity.brand);
  const inPackageInfo = regex.test(p.identity.packageInfo);
  
  return inName || inCode || inCategory || inBrand || inPackageInfo;
};

export const filterProducts = (
  products: Product[],
  options: {
    isRetiredSearch: boolean;
    showRetired: boolean;
    showOutOfCatalog: boolean;
    emissionFilters: EmissionFilter[];
    searchKeywords: string[];
    t?: any;
  }
) => {
  let filtered = products;
  const { isRetiredSearch, showRetired, showOutOfCatalog, emissionFilters, searchKeywords, t } = options;

  // 1. Status Filter
  if (isRetiredSearch) {
    filtered = filtered.filter(p => p.lifecycle.status === 'Radiato');
  } else {
    if (!showRetired) {
      filtered = filtered.filter(p => p.lifecycle.status !== 'Radiato');
    }
    if (!showOutOfCatalog) {
      filtered = filtered.filter(p => p.lifecycle.status !== 'Fuori Catalogo');
    }
  }

  // 2. Emission Filter
  if (emissionFilters.length > 0) {
    filtered = filtered.filter(p => {
      if (!p.emissions) return false;
      return emissionFilters.every(f => {
        const val = p.emissions![f.key];
        if (val === undefined) return false;
        if (f.operator === '>') return val > f.value;
        if (f.operator === '<') return val < f.value;
        return val === f.value;
      });
    });
  }

  // 3. Keyword Filter
  if (searchKeywords.length > 0) {
    const isExplicitPriceSearch = searchKeywords.some(kw => kw.includes('€'));

    if (isExplicitPriceSearch) {
      const priceValues = searchKeywords
        .map(kw => kw.replace('€', '').replace(',', '.'))
        .filter(kw => kw && !isNaN(parseFloat(kw)));
      
      const textValues = searchKeywords.filter(kw => {
        return !(kw.includes('€') || (kw && !isNaN(parseFloat(kw))));
      });

      filtered = filtered.filter(p => {
        const textMatch = textValues.every(kw => checkTextMatch(p, kw, t));
        if (!textMatch) return false;

        if (priceValues.length > 0) {
          const priceStr = p.pricing.currentPrice.toFixed(2);
          return priceValues.some(val => priceStr.startsWith(val));
        }
        return true;
      });
    } else {
      filtered = filtered.filter(p => {
        return searchKeywords.every(kw => {
          const textMatch = checkTextMatch(p, kw, t);
          if (/^\d+[,.]?\d*$/.test(kw)) {
            const priceStr = p.pricing.currentPrice.toFixed(2);
            return textMatch || priceStr.startsWith(kw.replace(',', '.'));
          }
          return textMatch;
        });
      });
    }
  }

  return filtered;
};

