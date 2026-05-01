export interface CatalogConfig {
  lastUpdateDate: string;
  categoryDates?: Record<string, string>;
  syncId: number;
  totalChunks: number;
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
  stats: {
    new: number;
    price: number;
    status: number;
    emissions: number;
  };
  variations: string[];
  read: boolean;
}
