import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatToDisplayDate } from '@/shared/lib';

interface ADMUpdateItemProps {
  listino: any;
  categoryDate: string;
  onToggle: () => void;
}

export const ADMUpdateItem: React.FC<ADMUpdateItemProps> = ({ listino, categoryDate, onToggle }) => {
  const { t } = useTranslation();
  const dTitle = listino.category;

  // Badge colors
  let badgeColor = 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300';
  const status = listino.status?.toLowerCase() || '';
  
  if (status === 'attivo') {
    badgeColor = 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400';
  } else if (status === 'radiato') {
    badgeColor = 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400';
  } else if (status === 'emissione') {
    badgeColor = 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';
  } else if (status === 'novità') {
    badgeColor = 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400';
  }

  return (
    <div 
      onClick={onToggle}
      className={`flex items-center gap-4 bg-white dark:bg-neutral-800 border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
        listino.selected 
          ? 'border-blue-500 ring-2 ring-blue-500/10 bg-blue-50/50 dark:bg-blue-950/40' 
          : 'border-neutral-200 dark:border-neutral-700'
      }`}
    >
      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
        listino.selected ? 'bg-blue-600 border-blue-600' : 'border-neutral-300 dark:border-neutral-600'
      }`}>
        {listino.selected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-sm font-black text-neutral-800 dark:text-neutral-100 truncate">{dTitle}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500 capitalize mt-1">
          <span className="flex items-center gap-1 font-bold">
            <span className="opacity-50">{t('admin.item.pdfDate')}:</span> <span className={listino.date === 'Non disponibile' ? 'text-neutral-400 italic' : 'text-blue-600 dark:text-blue-400'}>{listino.date === 'Non disponibile' ? t('admin.item.notAvailable') : listino.date}</span>
          </span>
          {listino.type !== 'Novità' && (
            <span className="flex items-center gap-1 font-bold">
              <span className="opacity-50">{t('admin.item.inDatabase')}:</span> <span className="text-neutral-400">{categoryDate ? formatToDisplayDate(categoryDate).replace(/-/g, '/') : t('admin.item.neverUpdated')}</span>
            </span>
          )}
          <span className={`font-black px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${badgeColor}`}>
            {listino.status}
          </span>
        </div>
      </div>
    </div>
  );
};
