import React, { useState, useRef } from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { auth, handleFirestoreError } from '@/shared/api/firebase/firebase';
import { useCatalogStore } from '@/entities/product';
import { analyzePdfChunks, ParsedPDFResult } from '../services/pdfAnalyzer';
import { saveParsedDataToFirestore } from '../services/dbSyncer';
import { PDFPreviewTable } from './PDFPreviewTable';
import { PDFUploadDropzone } from './PDFUploadDropzone';
import { PDFFileList } from './PDFFileList';
import { useTranslation } from 'react-i18next';

import { useADMSyncStore } from '../store/useADMSyncStore';

export const PDFUploader: React.FC = () => {
  const { t } = useTranslation();
  const aiModel = useADMSyncStore(s => s.aiModel);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedPDFResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processSuccess, setProcessSuccess] = useState(false);
  const [processStatus, setProcessStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfs = selectedFiles.filter(f => f.type === 'application/pdf');
    
    if (pdfs.length > 0) {
      setFiles(pdfs);
      setParsedData(null);
      setError(null);
      setProcessSuccess(false);
    } else if (selectedFiles.length > 0) {
      setError(t('admin.manual.invalidFile'));
    }
  };

  const handleProcessPDF = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setParsedData(null);
    setProcessSuccess(false);
    
    try {
      if (!auth.currentUser) throw new Error(t('admin.manual.unauthenticated'));

      // Chiama il servizio di analisi che astrae PDF.js e l'AI
      const result = await analyzePdfChunks(files, setProcessStatus, undefined, aiModel);
      
      setParsedData(result);
      setProcessStatus("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('admin.manual.errorProcessing'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToDB = async () => {
    if (!parsedData) return;
    setIsProcessing(true);
    
    try {
      const lastUpdateDate = useCatalogStore.getState().lastUpdateDate;
      const products = useCatalogStore.getState().products;
      const { setLastUpdateDate } = useCatalogStore.getState().actions;
      
      // Chiama il servizio DB di sincronizzazione Firebase
      const { finalDate } = await saveParsedDataToFirestore(parsedData, lastUpdateDate, products);
      
      setLastUpdateDate(finalDate);
      setProcessSuccess(true);
      setParsedData(null);
    } catch (err: any) {
      console.error("Errore salvataggio:", err);
      handleFirestoreError(err, 'write', 'system/catalog_chunks');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 lg:p-8 shadow-xl w-full">
      {/* Upload Area */}
      {files.length === 0 && (
        <PDFUploadDropzone 
          onFileClick={() => fileInputRef.current?.click()} 
          onFileChange={handleFileChange} 
          fileInputRef={fileInputRef} 
        />
      )}

      {/* File Selected State */}
      {files.length > 0 && !parsedData && !isProcessing && !processSuccess && (
        <PDFFileList 
          files={files} 
          onCancel={() => setFiles([])} 
          onProcess={handleProcessPDF} 
        />
      )}

      {/* Process Success State */}
      {processSuccess && !isProcessing && (
        <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50">
          <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
          <p className="text-sm font-bold text-green-800 dark:text-green-200">{t('admin.manual.successTitle')}</p>
          <p className="text-xs text-green-600 dark:text-green-400 text-center mt-1 mb-4">
            {t('admin.manual.successDesc')}
          </p>
          
          <button 
            onClick={() => { setFiles([]); setProcessSuccess(false); }}
            className="w-full py-2 bg-green-600 text-white rounded font-bold shadow hover:bg-green-700"
          >
            {t('admin.manual.closeButton')}
          </button>
        </div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-900/40 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
          <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{t('admin.manual.processingTitle')}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">{processStatus}</p>
          <p className="text-xs text-neutral-500 text-center mt-3 max-w-xs">
            {t('admin.manual.processingDesc')}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isProcessing && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-3 relative group">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-grow pr-8 overflow-hidden">
            <p className="text-sm font-bold text-red-800 dark:text-red-200">{t('admin.manual.errorOccurred')}</p>
            <p className="text-xs text-red-600 dark:text-red-400 break-words">{error}</p>
            <button onClick={() => setError(null)} className="mt-2 text-xs font-medium text-red-700 underline">{t('admin.table.retry')}</button>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(error!).then(() => {
                const btn = document.getElementById('copy-btn-pdf');
                if (btn) btn.innerText = t('admin.auto.copied') as string;
                setTimeout(() => { if(btn) btn.innerText = t('admin.auto.copy') as string; }, 2000);
              });
            }}
            id="copy-btn-pdf"
            className="absolute top-4 right-4 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] uppercase font-black px-2 py-1 rounded border border-red-200 dark:border-red-700 hover:bg-red-200 transition-colors"
          >
            {t('admin.auto.copy')}
          </button>
        </div>
      )}

      {/* Success State - Preview */}
      {parsedData && (
        <PDFPreviewTable 
          parsedData={parsedData} 
          onCancel={() => { setFiles([]); setParsedData(null); }} 
          onSave={handleSaveToDB} 
        />
      )}
    </div>
  );
};
