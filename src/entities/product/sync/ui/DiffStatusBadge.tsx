import React from 'react';
import { PlusCircle, MinusCircle, AlertTriangle, Zap, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DiffItem } from '../model/types';

interface DiffStatusBadgeProps {
  item: DiffItem;
}

export const DiffStatusBadge: React.FC<DiffStatusBadgeProps> = ({ item }) => {
  const { t } = useTranslation();

  if (item.type === 'new') {
    if (item.diffData.statusAssigned === 'Fuori Catalogo') {
      return (
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
          <PlusCircle className="w-3 h-3" /> {t('admin.preview.outOfCatalog')}
        </span>
      );
    }
    if (item.diffData.statusAssigned === 'Radiato') {
      return (
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
          <MinusCircle className="w-3 h-3" /> {t('admin.preview.newRetired')}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
        <PlusCircle className="w-3 h-3" /> {t('admin.preview.newEntry')}
      </span>
    );
  }

  if (item.type === 'price') {
    return (
      <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
        <AlertTriangle className="w-3 h-3" /> {t('admin.preview.priceVariation')}
      </span>
    );
  }

  if (item.type === 'status') {
    if (item.diffData.newStatus === 'Radiato') {
      return (
        <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
          <MinusCircle className="w-3 h-3" /> {t('admin.preview.retired')}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
        <AlertTriangle className="w-3 h-3" /> {t('admin.preview.statusLabel', { status: item.diffData.newStatus === 'Attivo' ? t('product.status.active') : item.diffData.newStatus })}
      </span>
    );
  }

  if (item.type === 'emissions') {
    return (
      <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-black text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full uppercase w-fit">
        <Zap className="w-3 h-3" /> {t('admin.preview.emissionsVariation')}
      </span>
    );
  }

  if (item.type === 'unchanged') {
    return (
      <span className="flex items-center gap-1 text-[9px] lg:text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800/50 px-2 py-0.5 rounded-full uppercase w-fit">
        <Info className="w-3 h-3" /> {t('admin.preview.unchanged')}
      </span>
    );
  }

  return null;
};
