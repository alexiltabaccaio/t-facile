import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatPackage } from '../../index';
import { DiffItem } from '../model/types';
import { DiffStatusBadge } from './DiffStatusBadge';
import { DiffDetails } from './DiffDetails';

interface PDFPreviewRowProps {
  item: DiffItem;
}

export const PDFPreviewRow: React.FC<PDFPreviewRowProps> = ({ item }) => {
  const { t } = useTranslation();

  const localizedCategory = t(`catalog.categories.${item.product.category}`, { defaultValue: item.product.category });
  const localizedPackage = formatPackage(item.product.package, item.product.packageInfo || '', t);

  return (
    <tr className="bg-white dark:bg-neutral-900/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
      <td className="px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex flex-col">
          <span className="font-black text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase truncate max-w-[180px] lg:max-w-xs">
            {item.product.name}
          </span>
          <span className="text-[10px] font-mono text-neutral-500">{t('productDetail.code')}: {item.product.code}</span>
        </div>
      </td>
      <td className="px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase">{localizedCategory}</span>
          <span className="text-[10px] text-neutral-500 truncate max-w-[120px] lg:max-w-xs" title={localizedPackage}>{localizedPackage || '---'}</span>
        </div>
      </td>
      <td className="px-4 py-3 lg:px-6 lg:py-4">
        <DiffStatusBadge item={item} />
      </td>
      <td className="px-4 py-3 lg:px-6 lg:py-4">
        <DiffDetails item={item} />
      </td>
      <td className="px-4 py-3 text-right lg:px-6 lg:py-4">
        <span className="text-neutral-600 dark:text-neutral-400">
          {item.product.pricePerKg ? `€${item.product.pricePerKg.toFixed(2)}` : '---'}
        </span>
      </td>
      <td className="px-4 py-3 text-right lg:px-6 lg:py-4">
        <span className="font-black text-sm lg:text-base text-neutral-900 dark:text-white">€{item.product.price?.toFixed(2) || '---'}</span>
      </td>
    </tr>
  );
};

