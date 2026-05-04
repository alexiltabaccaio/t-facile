import React from 'react';
import { Cpu } from 'lucide-react';
import { useADMSyncStore, useADMSyncActions } from '@/features/admin';

export const AIModelSelector: React.FC = () => {
  const aiModel = useADMSyncStore(s => s.aiModel);
  const { setAiModel } = useADMSyncActions();

  return (
    <div className="absolute left-full ml-3 flex items-center gap-1 bg-white dark:bg-neutral-800/80 backdrop-blur-sm rounded-full px-2 py-0.5 border border-neutral-200 dark:border-neutral-700 shadow-sm z-[100] cursor-pointer">
      <Cpu className="w-2.5 h-2.5 text-blue-500" />
      <select 
        value={aiModel} 
        onChange={(e) => setAiModel(e.target.value)}
        className="text-[8px] font-extrabold text-neutral-600 dark:text-neutral-300 uppercase tracking-widest bg-transparent border-none focus:ring-0 p-0 outline-none cursor-pointer pr-1"
      >
        <option value="gemini-3-flash-preview">FLASH</option>
        <option value="gemini-3.1-flash-lite-preview">FLASH-LITE</option>
      </select>
    </div>
  );
};
