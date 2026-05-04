import React from 'react';

interface PriceHighlightProps {
  price: number;
  formattedPrice: string;
  searchKeywords: string[];
}

/**
 * Component to handle specialized highlighting of product prices.
 * It matches search keywords against the currency symbol and numeric parts.
 */
export const PriceHighlight: React.FC<PriceHighlightProps> = ({ 
  price, 
  formattedPrice, 
  searchKeywords 
}) => {
  if (searchKeywords.length === 0) {
    return <>{formattedPrice}</>;
  }

  const priceKeywords = searchKeywords.filter(kw => 
    kw === '€' || /^€?\d*[,.]?\d*$/.test(kw)
  );

  if (priceKeywords.length === 0) {
    return <>{formattedPrice}</>;
  }

  const highlightEuro = priceKeywords.some(kw => kw.includes('€'));

  const priceStringWithDot = price.toFixed(2);
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
    return <>{formattedPrice}</>;
  }
  
  const FullHighlight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <mark className="bg-blue-100 dark:bg-blue-500/20 rounded-sm text-inherit">
      {children}
    </mark>
  );
  
  const priceStringWithComma = price.toFixed(2).replace('.', ',');
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

  return <>{formattedPrice}</>;
};
