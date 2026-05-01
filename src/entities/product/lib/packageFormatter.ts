import { TFunction } from 'i18next';
import { PackageType, PackageUnit } from '../model/types';
import { parseLegacyPackageInfo } from './productParser';

export interface PackageData {
  type: PackageType;
  quantity: number;
  unit: PackageUnit;
}

export const formatPackage = (packageData: PackageData | undefined, legacyInfo: string, t: TFunction): string => {
  const dataToUse = packageData || parseLegacyPackageInfo(legacyInfo);
  if (!dataToUse) return legacyInfo || '';

  const { type, quantity, unit } = dataToUse;
  
  const typeStr = type !== 'GENERIC' ? t(`catalog.packageTypes.${type}`) : '';
  const ofStr = t('catalog.common.of');
  
  // Decide singular or plural for unit
  let unitStr = t(`catalog.units.${unit}`);
  if (quantity === 1) {
    if (unit === 'PIECES') unitStr = t('catalog.units.piece');
    if (unit === 'GRAMS') unitStr = t('catalog.units.gram');
  }

  if (typeStr) {
    return `${typeStr} ${ofStr} ${quantity} ${unitStr}`;
  }
  
  return `${ofStr} ${quantity} ${unitStr}`;
};
