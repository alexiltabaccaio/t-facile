import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { ParsedPDFResult } from '../api/pdfAnalyzer';
import { useCatalogStore } from '../../index';
import { usePDFDiff } from '../model/usePDFDiff';
import { ChangeType } from '../model/types';
import { PDFPreviewRow } from './PDFPreviewRow';
import { useTranslation } from 'react-i18next';

interface PDFPreviewTableProps {
  parsedData: ParsedPDFResult;
  onCancel: () => void;
  onSave: () => void;
}

export const PDFPreviewTable: React.FC<PDFPreviewTableProps> = ({ parsedData, onCancel, onSave }) => {
  const { t } = useTranslation();
  const products = useCatalogStore((state: any) => state.products);
  const [activeTab, setActiveTab] = useState<ChangeType | 'all'>('all');

  const { diffItems, stats } = usePDFDiff(parsedData, products);

  const filteredItems = activeTab === 'all' 
    ? diffItems 
    : diffItems.filter((i: any) => i.type === activeTab);

  const getTabLabel = (type: ChangeType | 'all') => {
    switch(type) {
      case 'new': return t('admin.preview.tabs.new', { count: stats.new });
      case 'price': return t('admin.preview.tabs.price', { count: stats.price });
      case 'status': return t('admin.preview.tabs.status', { count: stats.status });
      case 'emissions': return t('admin.preview.tabs.emissions', { count: stats.emissions });
      case 'unchanged': return t('admin.preview.tabs.unchanged', { count: stats.unchanged });
      default: return t('admin.preview.tabs.all', { count: stats.total });
    }
  };

  return (
    <div className="mt-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-neutral-900 shadow-2xl w-full">
      <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 border-b border-neutral-200 dark:border-neutral-800 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter flex items-center gap-2 lg:text-base">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 lg:w-5 lg:h-5" />
              {t('admin.preview.title')}
            </h4>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 lg:text-xs">
              {t('admin.preview.subtitle', { date: parsedData.updateDate })}
            </p>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={onCancel} className="px-4 py-2 text-xs font-black text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 border border-neutral-300 dark:border-neutral-700 rounded-full transition-colors uppercase tracking-widest lg:px-6 lg:py-3">
                {t('admin.preview.cancel')}
             </button>
             <button 
               onClick={onSave}
               className="px-6 py-2 bg-blue-600 text-white font-black rounded-full shadow-md hover:bg-blue-700 transition uppercase tracking-widest text-xs lg:text-sm lg:px-8 lg:py-3"
             >
               {t('admin.preview.confirm')}
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 lg:gap-3">
          {(['all', 'new', 'price', 'status', 'emissions', 'unchanged'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all lg:text-xs lg:px-5 lg:py-2.5 ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
              }`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto bg-neutral-50 dark:bg-neutral-950">
        <table className="w-full text-left text-xs min-w-[700px] border-collapse lg:text-sm">
          <thead className="bg-white dark:bg-neutral-900 text-[10px] lg:text-xs uppercase font-black sticky top-0 z-20 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
            <tr>
              <th className="px-4 py-3 lg:px-6 lg:py-4">{t('admin.preview.product')}</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">{t('admin.preview.package')}</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">{t('admin.preview.modType')}</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">{t('admin.preview.details')}</th>
              <th className="px-4 py-3 text-right lg:px-6 lg:py-4">{t('admin.preview.priceKg')}</th>
              <th className="px-4 py-3 text-right font-black text-blue-600 dark:text-blue-400 lg:px-6 lg:py-4">{t('admin.preview.finalPrice')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 italic">{t('admin.preview.noProducts')}</td>
              </tr>
            ) : filteredItems.map((item: any, i: number) => (
              <PDFPreviewRow key={i} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 lg:p-6">
        <div className="text-[10px] text-neutral-500 lg:text-xs">
           {t('admin.preview.checkRows', { count: diffItems.length })}
        </div>
      </div>
    </div>
  );
};

