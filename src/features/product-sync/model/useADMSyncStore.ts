import { create } from 'zustand';
import { ParsedPDFResult } from '@/entities/product/lib/syncUtils';
import { saveParsedDataToFirestore } from '../api/dbSyncer';
import { Product } from '@/entities/product';
import { Listino, fetchListini, fetchNews, markNewsAsAnalyzed, downloadListinoAsFile } from '../api/admApiService';
import { processListiniBatch } from '../api/admProcessor';
import { getErrorMessage } from '@/shared/lib/utils/errorUtils';

interface ADMSyncState {
  aiModel: string;
  isChecking: boolean;
  isProcessing: boolean;
  statusMsg: string;
  availableUpdates: Listino[];
  processedData: ParsedPDFResult | null;
  error: string | null;
  success: boolean;
  abortController: AbortController | null;
  currentNews: Listino | null;
  hasScannedNews: boolean;

  actions: {
    setAiModel: (val: string) => void;
    setIsChecking: (val: boolean) => void;
    setIsProcessing: (val: boolean) => void;
    setStatusMsg: (val: string) => void;
    setAvailableUpdates: (val: Listino[]) => void;
    setProcessedData: (val: ParsedPDFResult | null) => void;
    setError: (val: string | null) => void;
    setSuccess: (val: boolean) => void;
    setAbortController: (val: AbortController | null) => void;

    toggleSelection: (index: number) => void;
    toggleAll: () => void;
    checkUpdates: () => Promise<void>;
    checkNewsUpdates: () => Promise<void>;
    processSelectedListini: () => Promise<void>;
    cancelProcessing: () => void;
    finalSaveToDatabase: (params: { 
      lastUpdateDate: string; 
      products: Product[];
      categoryDates: Record<string, string>;
      onSuccess: (finalDate: string) => void;
      effectiveDate?: string;
      skipNotifications?: boolean;
    }) => Promise<void>;
    cancelStaging: () => void;
    downloadSelectedListini: () => Promise<void>;
  };
}

export const useADMSyncStore = create<ADMSyncState>((set, get) => ({
  aiModel: "gemini-3.1-flash-lite-preview",
  isChecking: false,
  isProcessing: false,
  statusMsg: "",
  availableUpdates: [],
  processedData: null,
  error: null,
  success: false,
  abortController: null,
  currentNews: null,
  hasScannedNews: false,

  actions: {
    setAiModel: (val) => set({ aiModel: val }),
    setIsChecking: (val) => set({ isChecking: val }),
    setIsProcessing: (val) => set({ isProcessing: val }),
    setStatusMsg: (val) => set({ statusMsg: val }),
    setAvailableUpdates: (val) => set({ availableUpdates: val }),
    setProcessedData: (val) => set({ processedData: val }),
    setError: (val) => set({ error: val }),
    setSuccess: (val) => set({ success: val }),
    setAbortController: (val) => set({ abortController: val }),

    toggleSelection: (index) => {
      const list = [...get().availableUpdates];
      list[index] = { ...list[index], selected: !list[index].selected };
      set({ availableUpdates: list });
    },

    toggleAll: () => {
      const list = get().availableUpdates;
      const allSelected = list.every(u => u.selected);
      set({ availableUpdates: list.map(u => ({ ...u, selected: !allSelected })) });
    },

    checkUpdates: async () => {
      set({ isChecking: true, error: null, success: false, hasScannedNews: false, availableUpdates: [], processedData: null, currentNews: null });
      try {
        set({ statusMsg: "admin.sync.contacting" });
        const listini = await fetchListini();
        set({ availableUpdates: listini });
      } catch (err: unknown) {
        console.error(err);
        set({ error: getErrorMessage(err) || "Impossibile leggere il sito dell'Agenzia delle Dogane." });
      } finally {
        set({ isChecking: false });
      }
    },

    checkNewsUpdates: async () => {
      set({ isChecking: true, error: null, success: false, hasScannedNews: true, availableUpdates: [], processedData: null, currentNews: null });
      try {
        set({ statusMsg: "admin.sync.scanningNews" });
        const news = await fetchNews();
        const autoSelectedNews = news.map((item, index) => ({
          ...item,
          selected: index === 0
        }));
        set({ availableUpdates: autoSelectedNews });
      } catch (err: unknown) {
        console.error(err);
        set({ error: getErrorMessage(err) || "Errore durante la scansione delle news." });
      } finally {
        set({ isChecking: false });
      }
    },

    processSelectedListini: async () => {
      const { availableUpdates, aiModel } = get();
      const selected = availableUpdates.filter(u => u.selected);
      if (selected.length === 0) return;

      const controller = new AbortController();
      set({
        isProcessing: true,
        error: null,
        success: false,
        abortController: controller,
        currentNews: selected.length === 1 && selected[0].type === 'Novità' ? selected[0] : null
      });

      try {
        const combinedParsedData = await processListiniBatch(
          selected,
          aiModel,
          {
            setStatus: (status) => set({ statusMsg: status }),
            signal: controller.signal
          }
        );

        set({ 
          processedData: combinedParsedData, 
          availableUpdates: availableUpdates.filter(u => !u.selected) 
        });
      } catch(err: unknown) {
        console.error(err);
        const message = getErrorMessage(err);
        if (message === 'AbortError' || message === 'Operazione annullata dall\'utente.') {
           // Silently cancel without showing error message
           set({ error: null });
        } else {
           set({ error: message || "Errore sincronizzazione IA" });
        }
      } finally {
        set({ isProcessing: false, statusMsg: "", abortController: null });
      }
    },

    cancelProcessing: () => {
      const { abortController } = get();
      if (abortController) {
        abortController.abort();
      }
    },

    finalSaveToDatabase: async ({ lastUpdateDate, products, categoryDates, onSuccess, effectiveDate, skipNotifications }) => {
      const { processedData, currentNews } = get();
      if (!processedData) return;
      set({ isProcessing: true, statusMsg: "admin.sync.savingToDb" });
      try {
        const isDeltaUpdate = currentNews?.type === 'Novità';
        const { finalDate } = await saveParsedDataToFirestore(
          processedData, 
          lastUpdateDate, 
          products, 
          categoryDates,
          effectiveDate,
          skipNotifications,
          isDeltaUpdate
        );
        
        // If it was a news item, mark it as analyzed in the backend
        if (currentNews) {
          await markNewsAsAnalyzed(currentNews.url, currentNews.title);
        }

        onSuccess(finalDate);
        set({ success: true, processedData: null, currentNews: null });
        setTimeout(() => set({ success: false }), 5000);
      } catch (err: unknown) {
         set({ error: getErrorMessage(err) || "Errore durante il salvataggio" });
      } finally {
         set({ isProcessing: false, statusMsg: "" });
      }
    },

    cancelStaging: () => {
      set({ processedData: null, currentNews: null });
    },
    
    downloadSelectedListini: async () => {
      const { availableUpdates } = get();
      const selected = availableUpdates.filter(u => u.selected);
      if (selected.length === 0) return;

      set({ isProcessing: true, statusMsg: "admin.auto.downloading" });
      try {
        for (const listino of selected) {
          const file = await downloadListinoAsFile(listino);
          const url = window.URL.createObjectURL(file);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          // Ritardo di 1.5s tra un download e l'altro per evitare blocchi o limitazioni server (rate limiting)
          if (selected.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
      } catch (err: unknown) {
        console.error(err);
        set({ error: getErrorMessage(err) || "Errore durante il download dei file." });
      } finally {
        set({ isProcessing: false, statusMsg: "" });
      }
    }
  }
}));

export const useADMSyncActions = () => useADMSyncStore((state) => state.actions);
