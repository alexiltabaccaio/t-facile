import { PackageType, PackageUnit } from '../model/types';

/**
 * Emergency parser to convert the old packageInfo string into a structured object.
 * Much more flexible for handling varied legacy formats.
 */
export const parseLegacyPackageInfo = (info: string): { type: PackageType; quantity: number; unit: PackageUnit } | undefined => {
  if (!info) return undefined;

  const normalized = info.toLowerCase().trim();
  
  // Flexible Regex: 
  // 1. Optional type (pack, pouch, etc.)
  // 2. Optional word "da" (from/of)
  // 3. Quantity (number with comma or dot)
  // 4. Unit (pieces, pz, grams, gr, g, ml)
  const regex = /^(?:(\w+)\s+)?(?:da\s+)?([\d.,]+)\s*(\w*)/i;
  const match = normalized.match(regex);

  if (!match) return undefined;

  const rawType = match[1] || '';
  const rawQty = match[2].replace(',', '.');
  const rawUnit = (match[3] || '').toLowerCase();

  let type: PackageType = 'GENERIC';
  if (rawType.includes('astuccio')) type = 'ASTUCCIO';
  else if (rawType.includes('cartoccio')) type = 'CARTOCCIO';
  else if (rawType.includes('busta')) type = 'BUSTA';
  else if (rawType.includes('scatola')) type = 'SCATOLA';
  else if (rawType.includes('lattina')) type = 'LATTINA';
  else if (rawType.includes('barattolo')) type = 'BARATTOLO';

  let unit: PackageUnit = 'PIECES';
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
