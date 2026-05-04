

import React from 'react';
import { Product, SortKey } from '../model/types';
import { useTranslation } from 'react-i18next';
import { formatPackage } from '../lib/packageFormatter';
import { TextHighlight } from '@/shared/ui';
import { PriceHighlight } from './PriceHighlight';

interface ProductItemProps {
  product: Product;
  onClick: () => void;
  searchKeywords: string[];
  style?: React.CSSProperties;
  sortKey: SortKey;
}



const ProductItem: React.FC<ProductItemProps> = ({ product, onClick, searchKeywords, style, sortKey }) => {
  const { t } = useTranslation();
  const formattedPrice = `€ ${product.pricing.currentPrice.toFixed(2).replace('.', ',')}`;
  const isRetired = product.lifecycle.status === 'Radiato';
  const isOutOfCatalog = product.lifecycle.status === 'Fuori Catalogo';
  const showEmissions = ['nicotine', 'tar', 'co'].includes(sortKey) && product.emissions;

  const localizedCategory = t(`catalog.categories.${product.identity.category}`, { defaultValue: product.identity.category });
  const localizedPackage = formatPackage(product.identity.package, product.identity.packageInfo, t);


  return (
    <div 
      style={style}
      className={`px-4 py-3 flex justify-between items-center gap-4 cursor-pointer hover:bg-white dark:hover:bg-dark-card-bg/50 transition-colors border-b border-neutral-200 dark:border-dark-border ${isRetired ? 'opacity-60' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={t('product.labels.seeDetails', { name: product.identity.name })}
    >
      <div className="flex-grow min-w-0 flex flex-col">
        <div>
            <h3 className="text-light-text dark:text-dark-text-primary font-semibold text-sm leading-tight flex items-start gap-2">
            <span className="block min-w-0 break-words line-clamp-2">
              <TextHighlight text={product.identity.name} keywords={searchKeywords} />
            </span>
            {isRetired && <span className="text-[10px] font-semibold text-red-100 bg-red-600 dark:bg-red-700 px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">{t('product.status.retired')}</span>}
            {isOutOfCatalog && <span className="text-[10px] font-semibold text-yellow-900 bg-yellow-400 dark:bg-yellow-500 px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">{t('product.status.outOfCatalog')}</span>}
            </h3>
            <p className="text-xs leading-snug text-neutral-600 dark:text-dark-text-primary mt-1">
              <TextHighlight text={localizedCategory} keywords={searchKeywords} isCategory={true} />
            </p>
        </div>
        <p className="text-xs leading-snug text-neutral-500 dark:text-dark-text-secondary mt-1">
          <TextHighlight text={localizedPackage} keywords={searchKeywords} />
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-blue-500 dark:text-blue-400 font-semibold text-lg">
          <PriceHighlight 
            price={product.pricing.currentPrice} 
            formattedPrice={formattedPrice} 
            searchKeywords={searchKeywords} 
          />
        </p>
        <p className="text-neutral-500 dark:text-dark-text-secondary text-xs mt-1">
          <TextHighlight text={product.identity.code} keywords={searchKeywords} />
        </p>
        {showEmissions && (
            <div className="text-[10px] text-neutral-500 dark:text-dark-text-secondary mt-1.5 flex items-center gap-x-1.5 justify-end">
                <span className={sortKey === 'nicotine' ? 'font-bold text-light-text dark:text-dark-text-primary' : ''}>
                    {t('product.emissions.nic')}&nbsp;<span className="tabular-nums">{product.emissions!.nicotine.toFixed(1)}</span>
                </span>
                <span className="text-neutral-400 dark:text-neutral-600" aria-hidden="true">|</span>
                <span className={`${sortKey === 'tar' ? 'font-bold text-light-text dark:text-dark-text-primary' : ''}`}>
                    {t('product.emissions.cat')}&nbsp;
                    <span className="inline-block w-4 tabular-nums">
                        {product.emissions!.tar.toFixed(0)}
                    </span>
                </span>
                <span className="text-neutral-400 dark:text-neutral-600" aria-hidden="true">|</span>
                <span className={`${sortKey === 'co' ? 'font-bold text-light-text dark:text-dark-text-primary' : ''}`}>
                    {t('product.emissions.co')}&nbsp;
                    <span className="inline-block w-4 tabular-nums">
                        {product.emissions!.co.toFixed(0)}
                    </span>
                </span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductItem;

