import React from 'react';
import { PlusCircle, MinusCircle, AlertTriangle, Zap, Info } from 'lucide-react';
import { DiffItem } from '../hooks/usePDFDiff';
import { formatToDisplayDate } from '@/shared/lib';
import { useTranslation } from 'react-i18next';
import { formatPackage } from '@/entities/product/lib/packageFormatter';

interface PDFPreviewRowProps {
  item: DiffItem;
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

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
        {item.type === 'new' && item.diffData.statusAssigned === 'Fuori Catalogo' && (
          <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
            <PlusCircle className="w-3 h-3" /> {t('admin.preview.outOfCatalog')}
          </span>
        )}
        {item.type === 'new' && item.diffData.statusAssigned === 'Radiato' && (
          <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
            <MinusCircle className="w-3 h-3" /> {t('admin.preview.newRetired')}
          </span>
        )}
        {item.type === 'new' && item.diffData.statusAssigned !== 'Fuori Catalogo' && item.diffData.statusAssigned !== 'Radiato' && (
          <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
            <PlusCircle className="w-3 h-3" /> {t('admin.preview.newEntry')}
          </span>
        )}
        {item.type === 'price' && (
          <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
            <AlertTriangle className="w-3 h-3" /> {t('admin.preview.priceVariation')}
          </span>
        )}
        {item.type === 'status' && item.diffData.newStatus === 'Radiato' && (
          <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
            <MinusCircle className="w-3 h-3" /> {t('admin.preview.retired')}
          </span>
        )}
        {item.type === 'status' && item.diffData.newStatus !== 'Radiato' && (
          <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
            <AlertTriangle className="w-3 h-3" /> {t('admin.preview.statusLabel', { status: item.diffData.newStatus === 'Attivo' ? t('product.status.active') : item.diffData.newStatus })}
          </span>
        )}
        {item.type === 'emissions' && (
          <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
            <Zap className="w-3 h-3" /> {t('admin.preview.emissionsVariation')}
          </span>
        )}
        {item.type === 'unchanged' && (
          <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 px-2 py-0.5 rounded-full uppercase w-fit">
            <Info className="w-3 h-3" /> {t('admin.preview.unchanged')}
          </span>
        )}
      </td>
      <td className="px-4 py-3 lg:px-6 lg:py-4">
        {item.type === 'price' && (
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 line-through">€{item.diffData.oldPrice.toFixed(2)}</span>
            <ArrowRight className="w-3 h-3 text-neutral-400" />
            <span className={`font-black ${item.diffData.newPrice > item.diffData.oldPrice ? 'text-red-500' : 'text-green-500'}`}>
              €{item.diffData.newPrice.toFixed(2)}
            </span>
          </div>
        )}
        {item.type === 'status' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-neutral-400 line-through">{item.diffData.oldStatus === 'Attivo' ? t('product.status.active') : (item.diffData.oldStatus || t('product.status.active'))}</span>
              <ArrowRight className="w-3 h-3 text-neutral-400" />
              <span className={`font-black ${item.diffData.newStatus === 'Radiato' ? 'text-red-500' : 'text-blue-500'}`}>
                {item.diffData.newStatus === 'Attivo' ? t('product.status.active') : item.diffData.newStatus}
              </span>
            </div>
            {item.diffData.newStatus === 'Radiato' && item.product.radiationDate && (
              <div className="text-[10px] italic text-red-500">
                {t('admin.preview.since', { date: formatToDisplayDate(item.product.radiationDate) })}
              </div>
            )}
          </div>
        )}
        {item.type === 'new' && (
          <span className="text-[10px] text-neutral-500 italic">{item.diffData.reason || t('admin.preview.missingInDb')}</span>
        )}
        {item.type === 'emissions' && (
          <div className="flex flex-col gap-1 text-[10px]">
            {item.diffData.newTar !== item.diffData.oldTar && (
              <div className="flex items-center gap-2">
                <span className="font-bold w-7">{t('product.emissions.cat')}:</span>
                <span className="text-neutral-400 line-through">{item.diffData.oldTar}</span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
                <span className="font-black text-purple-500">{item.diffData.newTar}</span>
              </div>
            )}
            {item.diffData.newNicotine !== item.diffData.oldNicotine && (
              <div className="flex items-center gap-2">
                <span className="font-bold w-7">{t('product.emissions.nic')}:</span>
                <span className="text-neutral-400 line-through">{item.diffData.oldNicotine}</span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
                <span className="font-black text-purple-500">{item.diffData.newNicotine}</span>
              </div>
            )}
            {item.diffData.newCo !== item.diffData.oldCo && (
              <div className="flex items-center gap-2">
                <span className="font-bold w-7">{t('product.emissions.co')}:</span>
                <span className="text-neutral-400 line-through">{item.diffData.oldCo}</span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
                <span className="font-black text-purple-500">{item.diffData.newCo}</span>
              </div>
            )}
          </div>
        )}
        {item.type === 'unchanged' && (
          <span className="text-[10px] text-neutral-400">{t('admin.preview.noChanges')}</span>
        )}
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

