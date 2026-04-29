
export interface EmissionFilter {
  key: 'nicotine' | 'tar' | 'co';
  operator: '>' | '<' | '=';
  value: number;
}

const emissionKeywordMap: { [key: string]: 'nicotine' | 'tar' | 'co' } = {
  nicotina: 'nicotine',
  nic: 'nicotine',
  catrame: 'tar',
  tar: 'tar',
  cat: 'tar',
  co: 'co',
};

export const parseSearchQuery = (term: string, sortKey: string) => {
  const trimmedTerm = term.trim();
  const isEmissionSort = ['nicotine', 'tar', 'co'].includes(sortKey);
  
  const emissionFilters: EmissionFilter[] = [];
  let textKeywords: string[] = [];

  if (isEmissionSort) {
    const parts = trimmedTerm.split(/\s+/).filter(Boolean);
    const potentialFilterKeywords = Object.keys(emissionKeywordMap);

    parts.forEach(part => {
      const lowerPart = part.toLowerCase();
      const completeFilterRegex = /^(nicotina|nic|catrame|tar|cat|co)([<>=])(\d+([,.]\d*)?|\d*([,.]\d+))$/i;
      const match = lowerPart.match(completeFilterRegex);

      if (match) {
        const key = emissionKeywordMap[match[1].toLowerCase()];
        const valueString = match[3].replace(',', '.');
        const parsedValue = parseFloat(valueString);
        if (key && !isNaN(parsedValue)) {
          emissionFilters.push({
            key,
            operator: match[2] as '>' | '<' | '=',
            value: parsedValue,
          });
        }
      } else {
        const isKeywordPrefix = potentialFilterKeywords.some(kw => kw.startsWith(lowerPart));
        const startsWithKeyword = potentialFilterKeywords.some(kw => lowerPart.startsWith(kw));

        if (!(isKeywordPrefix || startsWithKeyword)) {
          textKeywords.push(lowerPart);
        }
      }
    });
  } else {
    textKeywords = trimmedTerm.toLowerCase().split(/\s+/).filter(Boolean);
  }
  
  const retiredMagicWords = ['radiato', 'radiati'];
  const retiredQueryTerms = textKeywords.filter(kw => 
    retiredMagicWords.some(magicWord => magicWord.startsWith(kw))
  );
  
  const isRetiredSearch = retiredQueryTerms.length > 0;
  const searchKeywords = textKeywords.filter(kw => !retiredQueryTerms.includes(kw));
  
  return { isRetiredSearch, searchKeywords, emissionFilters };
};
