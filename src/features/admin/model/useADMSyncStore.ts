import { create } from 'zustand';
import { ParsedPDFResult } from '../api/pdfAnalyzer';
import { saveParsedDataToFirestore } from '../api/dbSyncer';
import { Product } from '@/entities/product';
import { Listino, fetchListini } from '../api/admApiService';
import { processListiniBatch } from '../api/admProcessor';

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
    processSelectedListini: () => Promise<void>;
    cancelProcessing: () => void;
    finalSaveToDatabase: (params: { 
      lastUpdateDate: string; 
      products: Product[];
      categoryDates: Record<string, string>;
      onSuccess: (finalDate: string) => void;
    }) => Promise<void>;
    cancelStaging: () => void;
  };
}

export const useADMSyncStore = create<ADMSyncState>((set, get) => ({
  aiModel: "gemini-3-flash-preview",
  isChecking: false,
  isProcessing: false,
  statusMsg: "",
  availableUpdates: [],
  processedData: null,
  error: null,
  success: false,
  abortController: null,

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
      set({ isChecking: true, error: null, availableUpdates: [], processedData: null });
      try {
        set({ statusMsg: "Contatto i server ADM..." });
        const listini = await fetchListini();
        set({ availableUpdates: listini });
      } catch (err: any) {
        console.error(err);
        set({ error: err.message || "Impossibile leggere il sito dell'Agenzia delle Dogane." });
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
        abortController: controller
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
      } catch(err: any) {
        console.error(err);
        if (err.name === 'AbortError' || err.message === 'Operazione annullata dall\'utente.') {
           // Silently cancel without showing error message
           set({ error: null });
        } else {
           set({ error: err.message || "Errore sincronizzazione IA" });
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

    finalSaveToDatabase: async ({ lastUpdateDate, products, categoryDates, onSuccess }) => {
      const { processedData } = get();
      if (!processedData) return;
      set({ isProcessing: true, statusMsg: "Salvataggio definitivo nel Database cloud..." });
      try {
        const { finalDate } = await saveParsedDataToFirestore(
          processedData, 
          lastUpdateDate, 
          products, 
          categoryDates
        );
        onSuccess(finalDate);
        set({ success: true, processedData: null });
        setTimeout(() => set({ success: false }), 5000);
      } catch (err: any) {
         set({ error: err.message || "Errore durante il salvataggio" });
      } finally {
         set({ isProcessing: false, statusMsg: "" });
      }
    },

    cancelStaging: () => {
      set({ processedData: null });
    }
  }
}));

export const useADMSyncActions = () => useADMSyncStore((state) => state.actions);
