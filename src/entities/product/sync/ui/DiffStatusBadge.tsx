import React from 'react';
import { PlusCircle, MinusCircle, AlertTriangle, Zap, Info, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatToDisplayDate } from '@/shared/lib';
import { DiffItem } from '../model/types';

interface DiffStatusBadgeProps {
  item: DiffItem;
}

export const DiffStatusBadge: React.FC<DiffStatusBadgeProps> = ({ item }) => {
  const { t } = useTranslation();

  if (item.type === 'new') {
    let badge = null;
    if (item.diffData.statusAssigned === 'Fuori Catalogo') {
      badge = (
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
          <PlusCircle className="w-3 h-3" /> {t('admin.preview.outOfCatalog')}
        </span>
      );
    } else if (item.diffData.statusAssigned === 'Radiato') {
      badge = (
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
          <MinusCircle className="w-3 h-3" /> {t('admin.preview.newRetired')}
        </span>
      );
    } else {
      badge = (
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
          <PlusCircle className="w-3 h-3" /> {t('admin.preview.newEntry')}
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        {badge}
        <span className="text-[10px] text-neutral-500 italic">{item.diffData.reason || t('admin.preview.missingInDb')}</span>
      </div>
    );
  }

  if (item.type === 'price') {
    const oldPrice = item.diffData.oldPrice ?? 0;
    const newPrice = item.diffData.newPrice ?? 0;
    const isIncrease = newPrice > oldPrice;
    
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-[10px] lg:text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase">
          {item.diffData.isSuspicious && <AlertTriangle className="w-3 h-3 text-red-500" />}
          {item.diffData.isSuspicious ? t('admin.preview.priceReview') : t('admin.preview.priceVariation')}
          {isIncrease ? (
            <TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-green-500 ml-1" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-red-500 ml-1" />
          )}
        </div>

        {item.diffData.isSuspicious && (
          <div className="text-[10px] font-bold text-red-500 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded w-fit mt-0.5">
            <AlertTriangle className="w-2.5 h-2.5" />
            {t('admin.preview.anomalous')} ({oldPrice > 0 ? ((Math.abs(newPrice - oldPrice) / oldPrice) * 100).toFixed(0) : '0'}%)
          </div>
        )}
      </div>
    );
  }

  if (item.type === 'status') {
    let badge = null;
    if (item.diffData.newStatus === 'Radiato') {
      badge = (
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
          <MinusCircle className="w-3 h-3" /> {t('admin.preview.retired')}
        </span>
      );
    } else {
      badge = (
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
          <AlertTriangle className="w-3 h-3" /> {t('admin.preview.statusLabel', { status: item.diffData.newStatus === 'Attivo' ? t('product.status.active') : item.diffData.newStatus })}
        </span>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        {badge}
        <div className="flex items-center gap-2 text-[10px] mt-0.5">
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

  if (item.type === 'emissions') {
    return (
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
          <Zap className="w-3 h-3" /> {t('admin.preview.emissionsVariation')}
        </span>
        <div className="flex flex-col gap-1 text-[10px] mt-0.5">
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
      </div>
    );
  }

  if (item.type === 'unchanged') {
    return (
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 px-2 py-0.5 rounded-full uppercase w-fit">
          <Info className="w-3 h-3" /> {t('admin.preview.unchanged')}
        </span>
        <span className="text-[10px] text-neutral-400 mt-0.5">{t('admin.preview.noChanges')}</span>
      </div>
    );
  }

  return null;
};
