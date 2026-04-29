import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { ParsedPDFResult } from '../services/pdfAnalyzer';
import { useCatalogStore } from '@/entities/product';
import { usePDFDiff, ChangeType } from '../hooks/usePDFDiff';
import { PDFPreviewRow } from './PDFPreviewRow';

interface PDFPreviewTableProps {
  parsedData: ParsedPDFResult;
  onCancel: () => void;
  onSave: () => void;
}

export const PDFPreviewTable: React.FC<PDFPreviewTableProps> = ({ parsedData, onCancel, onSave }) => {
  const products = useCatalogStore(state => state.products);
  const [activeTab, setActiveTab] = useState<ChangeType | 'all'>('all');

  const { diffItems, stats } = usePDFDiff(parsedData, products);

  const filteredItems = activeTab === 'all' 
    ? diffItems 
    : diffItems.filter(i => i.type === activeTab);

  const getTabLabel = (type: ChangeType | 'all') => {
    switch(type) {
      case 'new': return `Nuovi (${stats.new})`;
      case 'price': return `Prezzi (${stats.price})`;
      case 'status': return `Stati (${stats.status})`;
      case 'emissions': return `Emissioni (${stats.emissions})`;
      case 'unchanged': return `Invariati (${stats.unchanged})`;
      default: return `Tutti (${stats.total})`;
    }
  };

  return (
    <div className="mt-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden flex flex-col bg-white dark:bg-neutral-900 shadow-2xl w-full">
      <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 border-b border-neutral-200 dark:border-neutral-800 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="text-sm font-black text-neutral-800 dark:text-neutral-100 uppercase tracking-tighter flex items-center gap-2 lg:text-base">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 lg:w-5 lg:h-5" />
              Human-in-the-loop: Anteprima Modifiche
            </h4>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 lg:text-xs">
              Confronto dati estratti dall'IA con il catalogo attuale. Data listino: <b>{parsedData.updateDate}</b>
            </p>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={onCancel} className="px-4 py-2 text-xs font-black text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 border border-neutral-300 dark:border-neutral-700 rounded-full transition-colors uppercase tracking-widest lg:px-6 lg:py-3">
                Annulla
             </button>
             <button 
               onClick={onSave}
               className="px-6 py-2 bg-blue-600 text-white font-black rounded-full shadow-md hover:bg-blue-700 transition uppercase tracking-widest text-xs lg:text-sm lg:px-8 lg:py-3"
             >
               Conferma
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
              <th className="px-4 py-3 lg:px-6 lg:py-4">Prodotto</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">Confezione</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">Tipo Modifica</th>
              <th className="px-4 py-3 lg:px-6 lg:py-4">Dettagli Variazione</th>
              <th className="px-4 py-3 text-right lg:px-6 lg:py-4">Prezzo/kg</th>
              <th className="px-4 py-3 text-right font-black text-blue-600 dark:text-blue-400 lg:px-6 lg:py-4">Prezzo Finale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 italic">Nessun prodotto in questa categoria.</td>
              </tr>
            ) : filteredItems.map((item, i) => (
              <PDFPreviewRow key={i} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 lg:p-6">
        <div className="text-[10px] text-neutral-500 lg:text-xs">
           Controlla attentamente queste {diffItems.length} righe prima di confermare.
        </div>
      </div>
    </div>
  );
};

