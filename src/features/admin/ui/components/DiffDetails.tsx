import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatToDisplayDate } from '@/shared/lib';
import { DiffItem } from '../../model/types';

interface DiffDetailsProps {
  item: DiffItem;
}

const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const DiffDetails: React.FC<DiffDetailsProps> = ({ item }) => {
  const { t } = useTranslation();

  if (item.type === 'price') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-neutral-400 line-through">€{item.diffData.oldPrice.toFixed(2)}</span>
        <ArrowRight className="w-3 h-3 text-neutral-400" />
        <span className={`font-black ${item.diffData.newPrice > item.diffData.oldPrice ? 'text-red-500' : 'text-green-500'}`}>
          €{item.diffData.newPrice.toFixed(2)}
        </span>
      </div>
    );
  }

  if (item.type === 'status') {
    return (
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
    );
  }

  if (item.type === 'new') {
    return (
      <span className="text-[10px] text-neutral-500 italic">{item.diffData.reason || t('admin.preview.missingInDb')}</span>
    );
  }

  if (item.type === 'emissions') {
    return (
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
    );
  }

  if (item.type === 'unchanged') {
    return (
      <span className="text-[10px] text-neutral-400">{t('admin.preview.noChanges')}</span>
    );
  }

  return null;
};
