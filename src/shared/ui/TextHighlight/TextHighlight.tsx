import React from 'react';
import { escapeRegExp, SYNONYM_MAP } from '@/shared/lib';

interface TextHighlightProps {
  text: string | undefined;
  keywords: string[];
  isCategory?: boolean;
}

/**
 * Component to highlight specific keywords within a text string.
 * Supports synonym mapping for categories.
 */
export const TextHighlight: React.FC<TextHighlightProps> = ({ 
  text, 
  keywords, 
  isCategory = false 
}) => {
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
