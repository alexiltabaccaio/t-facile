import React from 'react';
import { FileText } from 'lucide-react';

interface PDFFileListProps {
  files: File[];
  onCancel: () => void;
  onProcess: () => void;
}

export const PDFFileList: React.FC<PDFFileListProps> = ({ files, onCancel, onProcess }) => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex flex-col border border-blue-100 dark:border-blue-900/50">
      <div className="mb-4">
        <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          {files.length} {files.length === 1 ? 'file pronto' : 'file pronti'} per l'analisi
        </p>
        <ul className="space-y-1">
          {files.slice(0, 5).map((f, i) => (
            <li key={i} className="text-[10px] text-blue-700 dark:text-blue-400 truncate flex items-center gap-2">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              {f.name}
            </li>
          ))}
          {files.length > 5 && (
            <li className="text-[10px] text-blue-500 italic">...e altri {files.length - 5} file</li>
          )}
        </ul>
      </div>
      
      <div className="flex gap-2 w-full mt-2">
        <button 
          onClick={onCancel}
          className="px-4 py-2 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded shadow-sm text-sm font-medium w-32"
        >
          Annulla
        </button>
        <button 
          onClick={onProcess}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm text-sm font-medium flex-grow hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          Analizza {files.length === 1 ? 'il file' : 'tutti i file insieme'}
        </button>
      </div>
    </div>
  );
};
