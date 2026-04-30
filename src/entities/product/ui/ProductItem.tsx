


import React from 'react';
import { Product, SortKey } from '../model/types';
import { escapeRegExp, SYNONYM_MAP } from '@/shared/lib';

interface ProductItemProps {
  product: Product;
  onClick: () => void;
  searchKeywords: string[];
  style?: React.CSSProperties;
  sortKey: SortKey;
}

const Highlight: React.FC<{ text: string | undefined; keywords: string[]; isCategory?: boolean }> = ({ text, keywords, isCategory = false }) => {
    if (!keywords || keywords.length === 0 || !text) {
        return <>{text}</>;
    }

    const effectiveKeywords = isCategory
      ? [...new Set(keywords.flatMap(kw => [kw, ...(SYNONYM_MAP[kw.toLowerCase()] || [])]))]
      : keywords;
    
    const regex = new RegExp(`\\b(${effectiveKeywords.map(escapeRegExp).join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return (
        <>
            {parts.filter(part => part).map((part, index) => {
                const isHighlight = effectiveKeywords.some(kw => kw.toLowerCase() === part.toLowerCase());
                return isHighlight ? (
                    <mark key={index} className="bg-transparent text-blue-600 dark:text-blue-400 font-bold">
                        {part}
                    </mark>
                ) : (
                    <React.Fragment key={index}>{part}</React.Fragment>
                );
            })}
        </>
    );
};


const ProductItem: React.FC<ProductItemProps> = ({ product, onClick, searchKeywords, style, sortKey }) => {
  const formattedPrice = `€ ${product.pricing.currentPrice.toFixed(2).replace('.', ',')}`;
  const isRetired = product.lifecycle.status === 'Radiato';
  const isOutOfCatalog = product.lifecycle.status === 'Fuori Catalogo';
  const shouldHighlightText = searchKeywords.length > 0;
  const showEmissions = ['nicotine', 'tar', 'co'].includes(sortKey) && product.emissions;

  const renderPriceWithHighlight = () => {
    if (searchKeywords.length === 0) {
      return formattedPrice;
    }
  
    const priceKeywords = searchKeywords.filter(kw => 
      kw === '€' || /^€?\d*[,.]?\d*$/.test(kw)
    );
  
    if (priceKeywords.length === 0) {
      return formattedPrice;
    }
  
    const highlightEuro = priceKeywords.some(kw => kw.includes('€'));
  
    const priceStringWithDot = product.pricing.currentPrice.toFixed(2);
    let numericMatchWithDot = '';
    priceKeywords.forEach(kw => {
      let normalizedKwWithDot = kw.replace('€', '').replace(',', '.');
      if (normalizedKwWithDot && priceStringWithDot.startsWith(normalizedKwWithDot)) {
        if (normalizedKwWithDot.length > numericMatchWithDot.length) {
          numericMatchWithDot = normalizedKwWithDot;
        }
      }
    });

    const numericMatchWithComma = numericMatchWithDot.replace('.', ',');
    const highlightNumber = numericMatchWithComma.length > 0;
  
    if (!highlightEuro && !highlightNumber) {
      return formattedPrice;
    }
    
    const FullHighlight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <mark className="bg-blue-100 dark:bg-blue-500/20 rounded-sm text-inherit">
        {children}
      </mark>
    );
    
    const priceStringWithComma = product.pricing.currentPrice.toFixed(2).replace('.', ',');
    const remainingPart = highlightNumber ? priceStringWithComma.substring(numericMatchWithComma.length) : '';
  
    if (highlightEuro && highlightNumber) {
      return (
        <>
          <FullHighlight>€&nbsp;{numericMatchWithComma}</FullHighlight>
          {remainingPart}
        </>
      );
    } 
    else if (highlightNumber) {
      return (
        <>
          €&nbsp;
          <FullHighlight>{numericMatchWithComma}</FullHighlight>
          {remainingPart}
        </>
      );
    } 
    else if (highlightEuro) {
      return (
        <>
          <FullHighlight>€</FullHighlight>
          &nbsp;{priceStringWithComma}
        </>
      );
    }
  
    return formattedPrice;
  };

  return (
    <div 
      style={style}
      className={`px-4 py-3 flex justify-between items-center gap-4 cursor-pointer hover:bg-white dark:hover:bg-dark-card-bg/50 transition-colors border-b border-neutral-200 dark:border-dark-border ${isRetired ? 'opacity-60' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`Vedi dettagli per ${product.identity.name}`}
    >
      <div className="flex-grow min-w-0 flex flex-col">
        <div>
            <h3 className="text-light-text dark:text-dark-text-primary font-semibold text-sm leading-tight flex items-start gap-2">
            <span className="block min-w-0 break-words line-clamp-2">{shouldHighlightText ? <Highlight text={product.identity.name} keywords={searchKeywords} /> : product.identity.name}</span>
            {isRetired && <span className="text-[10px] font-semibold text-red-100 bg-red-600 dark:bg-red-700 px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">RADIATO</span>}
            {isOutOfCatalog && <span className="text-[10px] font-semibold text-yellow-900 bg-yellow-400 dark:bg-yellow-500 px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5">FUORI CATALOGO</span>}
            </h3>
            <p className="text-xs leading-snug text-neutral-600 dark:text-dark-text-primary mt-1">
            {shouldHighlightText ? <Highlight text={product.identity.category} keywords={searchKeywords} isCategory={true} /> : product.identity.category}
            </p>
        </div>
        <p className="text-xs leading-snug text-neutral-500 dark:text-dark-text-secondary mt-1">
          {shouldHighlightText ? <Highlight text={product.identity.packageInfo} keywords={searchKeywords} /> : product.identity.packageInfo}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-blue-500 dark:text-blue-400 font-semibold text-lg">
          {renderPriceWithHighlight()}
        </p>
        <p className="text-neutral-500 dark:text-dark-text-secondary text-xs mt-1">
          {shouldHighlightText ? <Highlight text={product.identity.code} keywords={searchKeywords} /> : product.identity.code}
        </p>
        {showEmissions && (
            <div className="text-[10px] text-neutral-500 dark:text-dark-text-secondary mt-1.5 flex items-center gap-x-1.5 justify-end">
                <span className={sortKey === 'nicotine' ? 'font-bold text-light-text dark:text-dark-text-primary' : ''}>
                    NIC&nbsp;<span className="tabular-nums">{product.emissions!.nicotine.toFixed(1)}</span>
                </span>
                <span className="text-neutral-400 dark:text-neutral-600" aria-hidden="true">|</span>
                <span className={`${sortKey === 'tar' ? 'font-bold text-light-text dark:text-dark-text-primary' : ''}`}>
                    CAT&nbsp;
                    <span className="inline-block w-4 tabular-nums">
                        {product.emissions!.tar.toFixed(0)}
                    </span>
                </span>
                <span className="text-neutral-400 dark:text-neutral-600" aria-hidden="true">|</span>
                <span className={`${sortKey === 'co' ? 'font-bold text-light-text dark:text-dark-text-primary' : ''}`}>
                    CO&nbsp;
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

