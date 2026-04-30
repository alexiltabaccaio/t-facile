

import { useMemo } from 'react';
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
  const { isRetiredSearch, searchKeywords, emissionFilters } = useMemo(() => {
    return parseSearchQuery(searchTerm, sortOption.key);
  }, [searchTerm, sortOption.key]);

  const displayedProducts = useMemo(() => {
    // 1. Normalizzazione (Nome in Maiuscolo)
    let processed = initialProducts.map(p => ({
      ...p,
      identity: {
        ...p.identity,
        name: (p.identity?.name || 'Senza nome').toUpperCase(),
      }
    }));

    // 2. Filtraggio
    processed = filterProducts(processed, {
      isRetiredSearch,
      showRetired,
      showOutOfCatalog,
      emissionFilters,
      searchKeywords
    });

    // 3. Gestione Match Esatto Codice (priorità assoluta se cercato un solo numero)
    let exactCodeMatchProduct: Product | null = null;
    if (searchKeywords.length === 1 && /^\d+$/.test(searchKeywords[0])) {
      const codeToFind = searchKeywords[0].toUpperCase();
      const exactMatchIndex = processed.findIndex(p => p.identity.code === codeToFind);
      if (exactMatchIndex > -1) {
        exactCodeMatchProduct = processed.splice(exactMatchIndex, 1)[0];
      }
    }

    // 4. Ordinamento
    sortProducts(processed, sortOption, {
      searchKeywords,
      isRetiredSearch,
      emissionFilters
    });

    // 5. Reinserimento match esatto in cima
    if (exactCodeMatchProduct) {
      processed.unshift(exactCodeMatchProduct);
    }
    
    return processed;
  }, [initialProducts, showRetired, showOutOfCatalog, sortOption, isRetiredSearch, searchKeywords, emissionFilters]);

  return { displayedProducts, searchKeywords };
};
