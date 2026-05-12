

import React, { memo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Product, SortOption } from '../model/types';
import ProductItem from './ProductItem';
import { FixedSizeList as List, FixedSizeGrid as Grid } from 'react-window';

interface ProductListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  searchKeywords: string[];
  sortOption: SortOption;
  initialOffset?: number;
  onScrollUpdate?: (offset: number) => void;
  isLoading?: boolean;
  showEmissions: boolean;
}

const NoResults: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="text-center py-20 px-4">
            <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-light-text tracking-tight">{t('common.noResults')}</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-xs mx-auto">
                {t('common.noResultsDesc')}
            </p>
        </div>
    );
};

const LoadingState: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 h-full">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">{t('common.loading')}</p>
        </div>
    );
};


const ITEM_HEIGHT = 88;

interface ProductListData {
    products: Product[];
    onProductClick: (product: Product) => void;
    searchKeywords: string[];
    sortOption: SortOption;
    showEmissions: boolean;
    columnCount?: number;
}

// Row rendering for the single list (mobile)
const ListRow = memo(({ index, style, data }: { index: number, style: React.CSSProperties, data: ProductListData }) => {
    const { products, onProductClick, searchKeywords, sortOption, showEmissions } = data;
    const product = products[index];
    if (!product) return null;
    return (
        <ProductItem
            style={style}
            product={product}
            onClick={() => onProductClick(product)}
            searchKeywords={searchKeywords}
            sortKey={sortOption.key}
            showEmissions={showEmissions}
        />
    );
});

// Cell rendering for the grid (desktop)
const GridCell = memo(({ columnIndex, rowIndex, style, data }: { columnIndex: number, rowIndex: number, style: React.CSSProperties, data: ProductListData }) => {
    const { products, onProductClick, searchKeywords, sortOption, showEmissions, columnCount = 1 } = data;
    const index = rowIndex * columnCount + columnIndex;
    const product = products[index];
    
    if (!product) return null;

    return (
        <ProductItem
            style={{
                ...style,
                width: Number(style.width) - 20, // Add padding between columns
                left: Number(style.left) + 10,
            }}
            product={product}
            onClick={() => onProductClick(product)}
            searchKeywords={searchKeywords}
            sortKey={sortOption.key}
            showEmissions={showEmissions}
        />
    );
});

// We will use a custom hook to measure the container size synchronously before paint

const ProductList: React.FC<ProductListProps> = ({ products, onProductClick, searchKeywords, sortOption, initialOffset = 0, onScrollUpdate, isLoading = false, showEmissions }) => {
  const listRef = useRef<List<ProductListData> | Grid<ProductListData>>(null);
  const scrollUpdateRef = useRef(onScrollUpdate);
  const searchKey = searchKeywords.join(' ');
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      
      if (el.clientWidth > 0 && el.clientHeight > 0) {
        setContainerSize({
          width: el.clientWidth,
          height: el.clientHeight
        });
      }

      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            setContainerSize(prev => {
              if (prev.width === width && prev.height === height) return prev;
              return { width, height };
            });
          }
        }
      });
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    scrollUpdateRef.current = onScrollUpdate;
  }, [onScrollUpdate]);

  useEffect(() => {
    if (listRef.current) {
      if ('columnCount' in listRef.current) {
        (listRef.current as Grid<ProductListData>).scrollTo({ scrollTop: 0 });
      } else {
        (listRef.current as List<ProductListData>).scrollTo(0);
      }
      if (scrollUpdateRef.current) {
        scrollUpdateRef.current(0);
      }
    }
  }, [searchKey, sortOption]);

  const handleScroll = (scrollProps: { scrollOffset?: number; scrollTop?: number; scrollLeft?: number }) => {
    const offset = scrollProps.scrollOffset !== undefined ? scrollProps.scrollOffset : scrollProps.scrollTop;
    if (offset !== undefined && onScrollUpdate) {
        onScrollUpdate(offset);
    }
  };

  return (
    <div className="h-full w-full overflow-hidden" ref={containerRef}>
        {isLoading ? (
            <LoadingState />
        ) : products.length === 0 ? (
            <NoResults />
        ) : (
            containerSize.width > 0 && containerSize.height > 0 && (() => {
                const h = containerSize.height;
                const w = containerSize.width;
                
                // Determine the number of columns based on width
                let columnCount = 1;
                if (w > 800) {
                  columnCount = 3;
                } else if (w > 500) {
                  columnCount = 2;
                }

                if (columnCount === 1) {
                  return (
                      <List
                          ref={listRef as React.RefObject<List<ProductListData>>}
                          height={h}
                          itemCount={products.length}
                          itemSize={ITEM_HEIGHT}
                          width={w}
                          itemData={{ products, onProductClick, searchKeywords, sortOption, showEmissions }}
                          initialScrollOffset={initialOffset}
                          onScroll={handleScroll}
                          overscanCount={15}
                      >
                          {ListRow}
                      </List>
                  );
                } else {
                  const rowCount = Math.ceil(products.length / columnCount);
                  return (
                    <Grid
                      ref={listRef as React.RefObject<Grid<ProductListData>>}
                      columnCount={columnCount}
                      columnWidth={w / columnCount}
                      height={h}
                      rowCount={rowCount}
                      rowHeight={ITEM_HEIGHT}
                      width={w}
                      itemData={{ products, onProductClick, searchKeywords, sortOption, showEmissions, columnCount }}
                      initialScrollTop={initialOffset}
                      onScroll={handleScroll}
                      overscanRowCount={15}
                    >
                      {GridCell}
                    </Grid>
                  );
                }
            })()
        )}
    </div>
  );
};

export default ProductList;
