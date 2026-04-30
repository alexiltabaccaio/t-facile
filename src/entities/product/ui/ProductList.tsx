

import React, { memo, useRef, useEffect } from 'react';
import { Product, SortOption } from '@/entities/product';
import ProductItem from './ProductItem';
import { FixedSizeList as List, FixedSizeGrid as Grid } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';

interface ProductListProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  searchKeywords: string[];
  sortOption: SortOption;
  initialOffset?: number;
  onScrollUpdate?: (offset: number) => void;
}

const NoResults: React.FC = () => (
    <div className="text-center py-20 px-4">
        <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-light-text tracking-tight">Nessun prodotto trovato</h3>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-xs mx-auto">Prova a modificare i termini di ricerca o a resettare i filtri.</p>
    </div>
);

const ITEM_HEIGHT = 88;

// Rendering riga per la lista singola (mobile)
const ListRow = memo(({ index, style, data }: { index: number, style: React.CSSProperties, data: any }) => {
    const { products, onProductClick, searchKeywords, sortOption } = data;
    const product = products[index];
    if (!product) return null;
    return (
        <ProductItem
            style={style}
            product={product}
            onClick={() => onProductClick(product)}
            searchKeywords={searchKeywords}
            sortKey={sortOption.key}
        />
    );
});

// Rendering cella per la griglia (desktop)
const GridCell = memo(({ columnIndex, rowIndex, style, data }: { columnIndex: number, rowIndex: number, style: React.CSSProperties, data: any }) => {
    const { products, onProductClick, searchKeywords, sortOption, columnCount } = data;
    const index = rowIndex * columnCount + columnIndex;
    const product = products[index];
    
    if (!product) return null;

    return (
        <ProductItem
            style={{
                ...style,
                width: Number(style.width) - 20, // Aggiungi padding tra le colonne
                left: Number(style.left) + 10,
            }}
            product={product}
            onClick={() => onProductClick(product)}
            searchKeywords={searchKeywords}
            sortKey={sortOption.key}
        />
    );
});

let cachedContainerWidth = 400;
let cachedContainerHeight = 800;
if (typeof window !== 'undefined') {
  const innerW = window.innerWidth;
  const innerH = window.innerHeight;
  
  if (innerW >= 1024) { // Desktop
    const mainAreaWidth = innerW - 288;
    cachedContainerWidth = Math.floor(innerW >= 1280 ? mainAreaWidth * 0.70 : mainAreaWidth * 0.65);
    cachedContainerHeight = innerH - 120; // Subtract estimated SearchBar height
  } else { // Mobile
    cachedContainerWidth = innerW;
    cachedContainerHeight = innerH;
  }
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductClick, searchKeywords, sortOption, initialOffset = 0, onScrollUpdate }) => {
  const listRef = useRef<any>(null);
  const scrollUpdateRef = useRef(onScrollUpdate);
  const searchKey = searchKeywords.join(' ');

  useEffect(() => {
    scrollUpdateRef.current = onScrollUpdate;
  }, [onScrollUpdate]);

  useEffect(() => {
    if (listRef.current) {
      if (listRef.current.scrollTo) {
        listRef.current.scrollTo(0);
      } else if (listRef.current.scrollToPosition) {
        listRef.current.scrollToPosition(0);
      }
      if (scrollUpdateRef.current) {
        scrollUpdateRef.current(0);
      }
    }
  }, [searchKey, sortOption]);

  if (products.length === 0) {
    return <NoResults />;
  }
  
  const handleScroll = (scrollProps: any) => {
    const offset = scrollProps.scrollOffset !== undefined ? scrollProps.scrollOffset : scrollProps.scrollTop;
    if (onScrollUpdate) {
        onScrollUpdate(offset);
    }
  };

  return (
    <div className="h-full w-full">
        <AutoSizer renderProp={( { height, width }: { height: number | undefined; width: number | undefined } ) => {
            if (width && width > 0) cachedContainerWidth = width;
            if (height && height > 0) cachedContainerHeight = height;

            const h = height || cachedContainerHeight;
            const w = width || cachedContainerWidth;
            
            // Determina il numero di colonne in base alla larghezza
            let columnCount = 1;
            if (w > 800) {
              columnCount = 3;
            } else if (w > 500) {
              columnCount = 2;
            }

            if (columnCount === 1) {
              return (
                  <List
                      ref={listRef}
                      height={h}
                      itemCount={products.length}
                      itemSize={ITEM_HEIGHT}
                      width={w}
                      itemData={{ products, onProductClick, searchKeywords, sortOption }}
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
                  ref={listRef}
                  columnCount={columnCount}
                  columnWidth={w / columnCount}
                  height={h}
                  rowCount={rowCount}
                  rowHeight={ITEM_HEIGHT}
                  width={w}
                  itemData={{ products, onProductClick, searchKeywords, sortOption, columnCount }}
                  initialScrollTop={initialOffset}
                  onScroll={handleScroll}
                  overscanRowCount={15}
                >
                  {GridCell}
                </Grid>
              );
            }
          }} />
    </div>
  );
};

export default ProductList;
