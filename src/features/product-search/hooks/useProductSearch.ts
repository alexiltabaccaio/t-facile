

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Product, SortOption } from '@/entities/product';
import { parseSearchQuery } from '../lib/searchParser';
import { filterProducts } from '../lib/productFilters';
import { sortProducts } from '../lib/productSorter';

interface UseProductSearchProps {
  products: Product[];
  searchTerm: string;
  sortOption: SortOption;
  showRetired: boolean;
  showOutOfCatalog: boolean;
}

export const useProductSearch = ({
  products: initialProducts,
  searchTerm,
  sortOption,
  showRetired,
  showOutOfCatalog,
}: UseProductSearchProps) => {
  const { t } = useTranslation();
  const { isRetiredSearch, searchKeywords, emissionFilters } = useMemo(() => {
    return parseSearchQuery(searchTerm, sortOption.key);
  }, [searchTerm, sortOption.key]);

  const displayedProducts = useMemo(() => {
    // 1. Normalization (Name to Uppercase)
    let processed = initialProducts.map(p => ({
      ...p,
      identity: {
        ...p.identity,
        name: (p.identity?.name || 'Senza nome').toUpperCase(),
      }
    }));

    // 2. Filtering
    processed = filterProducts(processed, {
      isRetiredSearch,
      showRetired,
      showOutOfCatalog,
      emissionFilters,
      searchKeywords,
      t
    });

    // 3. Exact Code Match Handling (absolute priority if a single number is searched)
    let exactCodeMatchProduct: Product | null = null;
    if (searchKeywords.length === 1 && /^\d+$/.test(searchKeywords[0])) {
      const codeToFind = searchKeywords[0].toUpperCase();
      const exactMatchIndex = processed.findIndex(p => p.identity.code === codeToFind);
      if (exactMatchIndex > -1) {
        exactCodeMatchProduct = processed.splice(exactMatchIndex, 1)[0];
      }
    }

    // 4. Sorting
    sortProducts(processed, sortOption, {
      searchKeywords,
      isRetiredSearch,
      emissionFilters
    });

    // 5. Reinsert exact match at the top
    if (exactCodeMatchProduct) {
      processed.unshift(exactCodeMatchProduct);
    }
    
    return processed;
  }, [initialProducts, showRetired, showOutOfCatalog, sortOption, isRetiredSearch, searchKeywords, emissionFilters, t]);

  return { displayedProducts, searchKeywords };
};
