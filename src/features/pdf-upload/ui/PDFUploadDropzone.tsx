import React from 'react';
import { UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PDFUploadDropzoneProps {
  onFileClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const PDFUploadDropzone: React.FC<PDFUploadDropzoneProps> = ({ onFileClick, onFileChange, fileInputRef }) => {
  const { t } = useTranslation();

  return (
    <div 
      onClick={onFileClick}
      className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition duration-200"
    >
      <UploadCloud className="w-8 h-8 text-neutral-400 mb-2" />
      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 text-center">
        {t('admin.manual.dropzoneTitle')}
      </p>
      <p className="text-[10px] text-neutral-400 mt-1">{t('admin.manual.dropzoneSubtitle')}</p>
      <input 
        type="file" 
        multiple
        accept="application/pdf"
        className="hidden" 
        ref={fileInputRef}
        onChange={onFileChange}
      />
    </div>
  );
};
