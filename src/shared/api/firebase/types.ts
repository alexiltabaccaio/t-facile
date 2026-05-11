export interface CatalogConfig {
  lastUpdateDate: string;
  categoryDates?: Record<string, string>;
  syncId: number;
  totalChunks: number;
  backupCreatedAt?: unknown; // Timestamp di Firebase
}

export interface ScheduledUpdate {
  id: string;
  parsedData: string; // I dati del catalogo sono solitamente stringhe JSON compresse
  effectiveDate: string;
  createdAt: unknown; // Timestamp di Firebase
  historyEntry?: UpdateHistoryEntry;
}

export interface SupportTicket {
  userId: string;
  userEmail: string;
  message: string;
  status: 'new' | 'in_progress' | 'closed';
}

export interface UpdateHistoryEntry {
  id?: string;
  title: string;
  date: string;
  summary?: string;
  type?: 'pre-announcement' | 'price' | 'system' | 'news';
  effectiveDate?: string;
  stats: {
    new: number;
    price: number;
    status: number;
    emissions: number;
  };
  variations: string[];
  read: boolean;
}
