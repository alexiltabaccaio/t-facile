import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SearchBar, useProductSearch } from '@/features/product-search';
import { SortModal } from '@/features/product-sort';
import { useCatalogStore, useCatalogActions, useCatalogUiStore, useCatalogUiActions, Product, ProductList, ProductDetail } from '@/entities/product';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

export const ProductCatalog: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  
  const { 
    searchTerm, 
    sortOption, 
    showRetired, 
    showOutOfCatalog,
    products, 
    listScrollPosition
  } = useCatalogStore(useShallow(state => ({
    searchTerm: state.searchTerm,
    sortOption: state.sortOption,
    showRetired: state.showRetired,
    showOutOfCatalog: state.showOutOfCatalog,
    products: state.products,
    listScrollPosition: state.listScrollPosition
  })));
  
  const { setSelectedProduct, setListScrollPosition } = useCatalogActions();
  const showSortModal = useCatalogUiStore(s => s.showSortModal);
  const { setShowSortModal } = useCatalogUiActions();

  const { displayedProducts, searchKeywords } = useProductSearch({
    products: products,
    searchTerm,
    sortOption,
    showRetired,
    showOutOfCatalog,
  });

  const activeProduct = id ? products.find(p => p.identity.code === id) : null;

  // Synchronize the selected product from the URL
  useEffect(() => {
    if (activeProduct) {
      setSelectedProduct(activeProduct);
    } else {
      setSelectedProduct(null);
    }
  }, [activeProduct, setSelectedProduct]);

  const isDetailView = !!id;

  const onProductClick = (product: Product) => {
    navigate(`/catalog/${product.identity.code}`, { replace: isDetailView });
  };

  return (
    <div className="h-full flex flex-col lg:flex-row relative overflow-hidden min-h-0">
      {/* List Section: Visible on mobile only if not in detail, always on desktop */}
      <div 
        className={`h-full flex-grow flex flex-col min-h-0 min-w-0 overflow-hidden relative ${
          isDetailView ? 'hidden lg:flex lg:w-[65%] xl:w-[70%]' : 'w-full lg:w-[65%] xl:w-[70%]'
        }`}
      >
        <div className="flex-grow relative min-h-0">
          <ProductList 
            products={displayedProducts} 
            onProductClick={onProductClick}
            searchKeywords={searchKeywords}
            sortOption={sortOption}
            initialOffset={listScrollPosition}
            onScrollUpdate={(offset) => { if(!isDetailView) setListScrollPosition(offset); }}
          />
        </div>
        <SearchBar />
        {showSortModal && (
          <SortModal onClose={() => setShowSortModal(false)} />
        )}
      </div>

      {/* Detail Section */}
      <div 
        className={`h-full bg-neutral-50 dark:bg-neutral-900 overflow-y-auto ${
          isDetailView 
            ? 'w-full lg:w-[35%] xl:w-[30%] lg:border-l lg:border-neutral-200 dark:lg:border-neutral-800' 
            : 'hidden lg:block lg:w-[35%] xl:w-[30%] lg:border-l lg:border-neutral-200 dark:lg:border-neutral-800'
        }`}
      >
        {activeProduct && isDetailView ? (
          <ProductDetail product={activeProduct} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400 dark:text-neutral-600">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium">{t('catalog.emptyState')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
