const parseLegacyPackageInfo = (info: string): any => {
  if (!info) return undefined;

  const normalized = info.toLowerCase().trim();
  
  const regex = /^(?:(\w+)\s+)?(?:da\s+)?([\d.,]+)\s*(\w*)/i;
  const match = normalized.match(regex);

  if (!match) return undefined;

  const rawType = match[1] || '';
  const rawQty = match[2].replace(',', '.');
  const rawUnit = (match[3] || '').toLowerCase();

  let type = 'GENERIC';
  if (rawType.includes('astuccio')) type = 'ASTUCCIO';
  else if (rawType.includes('cartoccio')) type = 'CARTOCCIO';
  else if (rawType.includes('busta')) type = 'BUSTA';
  else if (rawType.includes('scatola')) type = 'SCATOLA';
  else if (rawType.includes('lattina')) type = 'LATTINA';
  else if (rawType.includes('barattolo')) type = 'BARATTOLO';

  let unit = 'PIECES';
  if (rawUnit.includes('gramm') || rawUnit === 'gr' || rawUnit === 'g') {
    unit = 'GRAMS';
  } else if (rawUnit.includes('ml')) {
    unit = 'ML';
  } else if (rawUnit.includes('pezz') || rawUnit === 'pz') {
    unit = 'PIECES';
  }

  const quantity = parseFloat(rawQty) || 0;

  return { type, quantity, unit };
};

const testCases = [
  "astuccio da 20 pezzi",
  "da 5 pezzi",
  "da 30 grammi",
  "20 pezzi",
  "astuccio 20",
  "cartoccio da 10",
  "1 pezzo"
];

for (const t of testCases) {
  console.log(`Input: "${t}" -> Output:`, parseLegacyPackageInfo(t));
}
