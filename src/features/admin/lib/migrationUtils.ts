import { productRepository } from '@/shared/api';
import { PackageType, PackageUnit } from '@/entities/product';

/**
 * Parser identical to the Mapper one for consistency
 */
const parseLegacyPackageInfo = (info: string): { type: PackageType; quantity: number; unit: PackageUnit } | undefined => {
  if (!info) return undefined;
  const normalized = info.toLowerCase().trim();
  
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

export const migratePackageData = async (): Promise<{ success: boolean; migratedCount: number; error?: string }> => {
  try {
    const configData = await productRepository.getGlobalConfig();
    if (!configData) return { success: false, migratedCount: 0, error: 'Config not found' };
    
    const totalChunks = configData.totalChunks || 0;
    let migratedCount = 0;

    await productRepository.executeBatch(async (batch) => {
      for (let i = 0; i < totalChunks; i++) {
        const rawData = await productRepository.fetchCatalogChunk(i);
        if (!rawData) continue;
        
        const products = JSON.parse(rawData);
        let chunkChanged = false;
        
        const updatedProducts = products.map((p: any) => {
          if (p.identity && p.identity.packageInfo && !p.identity.package) {
            const parsed = parseLegacyPackageInfo(p.identity.packageInfo);
            if (parsed) {
              migratedCount++;
              chunkChanged = true;
              return {
                ...p,
                identity: {
                  ...p.identity,
                  package: parsed
                }
              };
            }
          }
          return p;
        });
        
        if (chunkChanged) {
          batch.update(['system', `catalog_chunk_${i}`], { data: JSON.stringify(updatedProducts) });
        }
      }

      // Force a sync update
      batch.update(['system', 'config'], { syncId: Date.now() });
    });

    return { success: true, migratedCount };
  } catch (e: any) {
    console.error('Migration failed:', e);
    return { success: false, migratedCount: 0, error: e.message };
  }
};
